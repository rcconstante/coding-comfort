import assert from 'node:assert/strict';
const base = process.env.NAVIGATION_TEST_URL ?? 'http://localhost:3000';
for(const path of ['/?lang=en','/dashboard?lang=fil','/screening?lang=en','/self-care?activity=breathing&lang=en','/support?lang=fil','/contact?lang=en']) {
 const response=await fetch(base+path);
 const html=await response.text();
 assert.equal(response.status,200,path);
 assert.match(html,/<header[^>]*class="site-header"/,path);
 assert.match(html,/<main[^>]*id="main-content"/,path);
 assert.ok(!/<template id="B:|<div hidden id="S:/.test(html),`empty shell streamed in ${path}`);
 assert.ok(!html.includes('Coding Comfort…'));
 console.log(`PASS full HTML without an empty streaming shell: ${path}`);
}
