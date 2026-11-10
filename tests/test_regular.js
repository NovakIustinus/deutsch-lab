const assert = require("assert");
global.window = {}; require("../modules/regular-verbs/verbs.js");
const R = require("../modules/regular-verbs/logic.js");
const V = window.RVERBS, by = n => V.find(v => v[0] === n), P = id => R.PERSONS.find(p => p.id === id);
const A = (v, p, t) => R.answer(by(v), P(p), t);
// Präteritum
assert.strictEqual(A("machen","ich","pra"),"machte"); assert.strictEqual(A("machen","du","pra"),"machtest"); assert.strictEqual(A("machen","er","pra"),"machte");
assert.strictEqual(A("machen","wir","pra"),"machten"); assert.strictEqual(A("machen","ihr","pra"),"machtet"); assert.strictEqual(A("machen","Sie","pra"),"machten");
assert.strictEqual(A("arbeiten","er","pra"),"arbeitete"); assert.strictEqual(A("arbeiten","du","pra"),"arbeitetest"); assert.strictEqual(A("öffnen","ihr","pra"),"öffnetet");
assert.strictEqual(A("wandern","ich","pra"),"wanderte"); assert.strictEqual(A("telefonieren","wir","pra"),"telefonierten");
// Perfekt
assert.strictEqual(A("machen","ich","perf"),"habe gemacht"); assert.strictEqual(A("machen","es","perf"),"hat gemacht"); assert.strictEqual(A("machen","ihr","perf"),"habt gemacht");
assert.strictEqual(A("reisen","ich","perf"),"bin gereist"); assert.strictEqual(A("reisen","ihr","perf"),"seid gereist"); assert.strictEqual(A("reisen","sie2","perf"),"sind gereist");
assert.strictEqual(A("telefonieren","du","perf"),"hast telefoniert"); assert.strictEqual(A("besuchen","wir","perf"),"haben besucht");
// checking
const c = (i, v, p, t) => R.checkForm(i, by(v), P(p), t);
assert(c("machte","machen","ich","pra") && c("ich machte","machen","ich","pra") && c("Ich Machte","machen","ich","pra"));
assert(!c("er machte","machen","ich","pra") && !c("machtest","machen","ich","pra"));
assert(c("habe gemacht","machen","ich","perf") && c("ich habe gemacht","machen","ich","perf") && !c("habe gemacht","machen","du","perf"));
assert(c("oeffnete","öffnen","er","pra") && c("ist gereist","reisen","er","perf") && !c("hat gereist","reisen","er","perf"));
assert(c("sie machten","machen","sie2","pra") && c("Sie machten","machen","Sie","pra"));
// English + points + clue + session
assert(R.checkEnglish("cook", by("kochen")) && R.checkEnglish("To Make", by("machen")) && R.checkEnglish("put", by("stellen")) && !R.checkEnglish("buy", by("machen")));
assert.deepStrictEqual([1,2,3].map(t => R.pointsEn(t,false)), [1,0.5,0]); assert.deepStrictEqual([1,2,3,4].map(t => R.pointsForm(t,false)), [3,1.5,0.75,0]);
assert.strictEqual(R.pointsForm(1,true),0); assert.strictEqual(R.clue("habe gemacht"), "h___  g______");
assert(V.length >= 35 && new Set(V.map(v=>v[0])).size === V.length);
for (let i = 0; i < 300; i++) { const s = R.makeSession(V,10); assert.strictEqual(s.length,10); assert.strictEqual(new Set(s.map(q=>q.v[0])).size,10); }
const seen = new Set(); for (let i = 0; i < 200; i++) R.makeSession(V,10).forEach(q => seen.add(q.p.id + q.tense)); assert.strictEqual(seen.size, 18);
// every verb/person/tense answers itself
for (const v of V) for (const p of R.PERSONS) for (const t of ["pra","perf"]) assert(R.checkForm(R.answer(v,p,t), v, p, t), v[0]);
for (const v of V) assert(R.checkEnglish(R.englishAnswers(v)[0], v), v[0]);
console.log("regular tests passed");
