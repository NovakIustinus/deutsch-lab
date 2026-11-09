const assert = require("assert");
global.window = {}; require("../modules/irregular-47/verbs.js");
const I = require("../modules/irregular-47/logic.js");
const V = window.VERBS, by = n => V.find(v => v[0] === n);
assert.strictEqual(V.length, 47); assert.strictEqual(new Set(V.map(v => v[0])).size, 47);
assert(I.checkEnglish("eat", by("essen")) && I.checkEnglish("To Eat", by("essen")));
assert(I.checkEnglish("allowed", by("dürfen")) && I.checkEnglish("be able to", by("können")) && I.checkEnglish("have to", by("müssen")));
assert(I.checkEnglish("know", by("wissen")) && I.checkEnglish("know", by("kennen")));
assert(!I.checkEnglish("drink", by("essen")) && !I.checkEnglish("", by("essen")));
assert(I.checkForm("isst", ["isst"]) && I.checkForm("er isst", ["isst"]) && I.checkForm("ass", ["aß"]) && I.checkForm("AUSS", ["auß"]));
assert(I.checkForm("faehrt", ["fährt"]) && !I.checkForm("fahrt", ["fährt"]));
assert(I.checkForm("ist gezogen", by("ziehen")[4]) && I.checkForm("hat gezogen", by("ziehen")[4]) && !I.checkForm("gezogen", by("ziehen")[4]));
assert(!I.checkForm("ist gegessen", by("essen")[4]));
// steps and points
assert.strictEqual(I.steps(by("essen")).length, 4); assert.strictEqual(I.maxFor(by("essen")), 10);
assert.strictEqual(I.steps(by("möchten")).length, 2); assert.strictEqual(I.maxFor(by("möchten")), 4);
assert.deepStrictEqual([1,2,3,4].map(t => I.points(3, t, false)), [3, 1.5, 0.75, 0]); assert.strictEqual(I.points(3, 1, true), 0);
assert.strictEqual(I.clue(by("essen"), I.steps(by("essen"))[3]), "h__  g_______");
// every verb answers itself
for (const v of V) for (const s of I.steps(v)) assert(I.check(v, s, s.k === "en" ? I.englishAnswers(v)[0] : s.answers[0]), v[0] + s.k);
assert.strictEqual(new Set(I.makeSession(V, 10).map(v => v[0])).size, 10);
console.log("irregular tests passed");
