import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecoveryKeys,encryptReflection,decryptReflection} from '../app/lib/reflection-crypto.ts';
import {composeReflection,parseSelection} from '../app/lib/reflection-policy.ts';
import {parseReflectionContent} from '../app/lib/reflection.ts';
test('untrusted model strings and out-of-policy steps cannot become displayed explanations',()=>{
 for(const value of [{opening:'You have depression',steps:[0]},{opening:0,steps:[4]},{opening:0,steps:[0,0]},{opening:0,steps:[0,1,2]},null])assert.equal(parseSelection(value),null);
 for(const score of [0,10,14,28,42])for(let opening=0;opening<3;opening++)for(let step=0;step<4;step++){
  const content=composeReflection({depression:score,anxiety:score,stress:score},{opening,steps:[step]});assert.ok(parseReflectionContent(content));
  assert.ok(content.en.depression.includes(String(score)));assert.ok(content.fil.depression.includes(String(score)));
  assert.doesNotMatch(JSON.stringify(content),/You are suffering from|Mayroon kang depresyon/i);
 }
});
test('reload recovery envelope decrypts only with the original browser key and rejects tampering',async()=>{
 const keys=await createRecoveryKeys(),other=await createRecoveryKeys();const content=composeReflection({depression:14,anxiety:10,stress:0},{opening:1,steps:[0,2]});
 const envelope=await encryptReflection(content,keys.publicKey);
 assert.equal(JSON.stringify(envelope).includes('Depression'),false);
 assert.deepEqual(await decryptReflection(envelope,keys.privateKey),content);
 await assert.rejects(decryptReflection(envelope,other.privateKey));
 await assert.rejects(decryptReflection({...envelope,ciphertext:'AAAA'},keys.privateKey));
});
