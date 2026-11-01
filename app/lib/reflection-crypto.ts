export type EncryptedReflection = {
  iv: string;
  wrappedKey: string;
  ciphertext: string;
};
const encode = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)));
const decode = (value: string) =>
  Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
export async function createRecoveryKeys() {
  const pair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );
  return {
    publicKey: JSON.stringify(
      await crypto.subtle.exportKey("jwk", pair.publicKey),
    ),
    privateKey: JSON.stringify(
      await crypto.subtle.exportKey("jwk", pair.privateKey),
    ),
  };
}
export async function encryptReflection(
  content: unknown,
  publicKey: string,
): Promise<EncryptedReflection> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const rsa = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(publicKey),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
  return {
    iv: encode(iv.buffer),
    wrappedKey: encode(
      await crypto.subtle.encrypt(
        "RSA-OAEP",
        rsa,
        await crypto.subtle.exportKey("raw", key),
      ),
    ),
    ciphertext: encode(
      await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(JSON.stringify(content)),
      ),
    ),
  };
}
export async function decryptReflection(
  envelope: EncryptedReflection,
  privateKey: string,
): Promise<unknown> {
  const rsa = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(privateKey),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"],
  );
  const raw = await crypto.subtle.decrypt(
    "RSA-OAEP",
    rsa,
    decode(envelope.wrappedKey),
  );
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "decrypt",
  ]);
  return JSON.parse(
    new TextDecoder().decode(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: decode(envelope.iv) },
        key,
        decode(envelope.ciphertext),
      ),
    ),
  );
}
