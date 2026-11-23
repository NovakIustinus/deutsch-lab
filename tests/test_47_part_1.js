const assert=require("assert"); global.window={}; require("../modules/47-part-1/verbs.js"); const I=require("../modules/47-part-1/logic.js"); const V=window.VERBS;
assert.strictEqual(V.length,23); assert.deepStrictEqual(V.map(v=>v[0]).slice(0,12),["haben","sein","werden","dürfen","können","mögen","müssen","sollen","wollen","beginnen","bleiben","bringen"]); assert.strictEqual(V[22][0],"helfen");
V.forEach(v=>{ const st=I.steps(v); assert.deepStrictEqual(st.map(s=>s.k),["en","pf"]); assert.strictEqual(I.maxFor(v),4); assert.ok(I.check(v,st[1],v[4][0])); assert.ok(I.check(v,st[1],"er "+v[4][0])); assert.ok(I.check(v,st[0],v[1].replace(/^to /,"").split(",")[0])); });
const g=(n)=>V.find(v=>v[0]===n); const pf=n=>I.steps(g(n))[1];
assert.ok(I.check(g("sein"),pf("sein"),"ist gewesen")&&!I.check(g("sein"),pf("sein"),"hat gewesen")); assert.ok(I.check(g("werden"),pf("werden"),"ist geworden")); assert.ok(I.check(g("beginnen"),pf("beginnen"),"hat begonnen")); assert.ok(I.check(g("dürfen"),pf("dürfen"),"hat gedurft"));
assert.strictEqual(I.makeSession(V,23).length,23); assert.strictEqual(new Set(I.makeSession(V,23).map(v=>v[0])).size,23);
// persons
const mk=(n,p)=>{const v=g(n).slice(); v._p=p; return v;}; const ok=(n,p,ans)=>I.check(mk(n,p),I.steps(mk(n,p))[1],ans);
assert.ok(ok("haben",0,"habe gehabt")&&ok("haben",1,"ich hast gehabt".replace("ich ","du "))&&ok("haben",3,"wir haben gehabt")&&ok("haben",4,"habt gehabt")&&ok("haben",5,"sie/Sie haben gehabt")&&ok("haben",2,"hat gehabt"));
assert.ok(ok("sein",0,"bin gewesen")&&ok("sein",1,"bist gewesen")&&ok("sein",4,"seid gewesen")&&ok("sein",3,"sind gewesen")&&!ok("sein",0,"ist gewesen")&&!ok("sein",0,"habe gewesen"));
assert.ok(ok("werden",0,"bin geworden")&&ok("beginnen",1,"hast begonnen")&&!ok("beginnen",1,"hat begonnen"));
assert.strictEqual(I.steps(mk("sein",4))[1].show,"ihr seid gewesen");
for(let r=0;r<50;r++){ const s=I.makeSession(V,23); assert.strictEqual(new Set(s.slice(0,6).map(v=>v._p)).size,6); assert.ok(new Set(s.map(v=>v._p)).size===6); }
console.log("47-part-1 ok");
