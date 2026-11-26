const assert=require("assert"); const SRS=require("../srs.js");
const mk=()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=v,removeItem:k=>delete m[k]};};
let t=1e12; const S=SRS.make("x",mk(),()=>t); const items=Array.from({length:30},(_,i)=>"w"+i);
assert.strictEqual(S.pick(items,10).length,10);
// missed words come back first
["w1","w2","w3"].forEach(w=>S.record(w,"bad")); ["w4","w5"].forEach(w=>S.record(w,"good"));
for(let r=0;r<30;r++){const p=S.pick(items,10); ["w1","w2","w3"].forEach(w=>assert.ok(p.includes(w))); assert.ok(!p.includes("w4")&&!p.includes("w5"));}
// good words wait; after their interval they are due again, and more overdue beats new
t+=48*3600e3; let p=S.pick(items,10); assert.ok(p.includes("w4")&&p.includes("w5"));
// boxes climb and cap
for(let i=0;i<10;i++){t+=1e10;S.record("w9","good");} assert.strictEqual(S.stats(["w9"]).strong,1);
S.record("w9","bad"); assert.strictEqual(S.stats(["w9"]).due,1);
// ok keeps box
S.record("w10","good"); S.record("w10","ok"); t+=5*3600e3; assert.strictEqual(S.stats(["w10"]).due,1);
assert.strictEqual(S.grade(4,4),"good"); assert.strictEqual(S.grade(3.5,4),"good"); assert.strictEqual(S.grade(2.5,4),"ok"); assert.strictEqual(S.grade(1.75,4),"bad"); assert.strictEqual(S.grade(0,4),"bad");
// persistence
const st=mk(); const A=SRS.make("y",st,()=>t); A.record("a","bad"); const B=SRS.make("y",st,()=>t); assert.strictEqual(B.stats(["a"]).due,1); B.reset(); assert.strictEqual(SRS.make("y",st,()=>t).stats(["a"]).fresh,1);
// works without storage
const N=SRS.make("z",null,()=>t); N.record("a","good"); assert.strictEqual(N.pick(["a","b"],2).length,2);
console.log("srs ok");
