const assert=require("assert"); global.window={}; require("../modules/samurai-perfekt/verbs.js"); const I=require("../modules/samurai-perfekt/logic.js"); const V=window.VERBS;
assert.strictEqual(V.length,10); assert.deepStrictEqual(V.map(v=>v[0]),["haben","sein","werden","dürfen","können","mögen","müssen","sollen","wollen","beginnen"]);
V.forEach(v=>{ const st=I.steps(v); assert.deepStrictEqual(st.map(s=>s.k),["en","pf"]); assert.strictEqual(I.maxFor(v),4); assert.ok(I.check(v,st[1],v[4][0])); assert.ok(I.check(v,st[1],"er "+v[4][0])); assert.ok(I.check(v,st[0],v[1].replace(/^to /,"").split(",")[0])); });
const g=(n)=>V.find(v=>v[0]===n); const pf=n=>I.steps(g(n))[1];
assert.ok(I.check(g("sein"),pf("sein"),"ist gewesen")&&!I.check(g("sein"),pf("sein"),"hat gewesen")); assert.ok(I.check(g("werden"),pf("werden"),"ist geworden")); assert.ok(I.check(g("beginnen"),pf("beginnen"),"hat begonnen")); assert.ok(I.check(g("dürfen"),pf("dürfen"),"hat gedurft"));
assert.strictEqual(I.makeSession(V,10).length,10); assert.strictEqual(new Set(I.makeSession(V,10).map(v=>v[0])).size,10);
console.log("samurai-perfekt ok");
