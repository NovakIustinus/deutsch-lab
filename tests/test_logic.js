const assert = require("assert");
const D = require("../modules/case-drill/logic.js");
global.window = {}; require("../modules/case-drill/words.js");
const det = id => D.DETS.find(d => d.id === id);
const f = (id, g, c) => D.form(det(id), g, c);
// Full tables from the user's reference sheets
const T = {
  the:  { m: ["der","den","dem"], f: ["die","die","der"], n: ["das","das","dem"] },
  a:    { m: ["ein","einen","einem"], f: ["eine","eine","einer"], n: ["ein","ein","einem"] },
  no:   { m: ["kein","keinen","keinem"], f: ["keine","keine","keiner"], n: ["kein","kein","keinem"] },
  my:   { m: ["mein","meinen","meinem"], f: ["meine","meine","meiner"], n: ["mein","mein","meinem"] },
  your: { m: ["dein","deinen","deinem"], f: ["deine","deine","deiner"], n: ["dein","dein","deinem"] },
  his:  { m: ["sein","seinen","seinem"], f: ["seine","seine","seiner"], n: ["sein","sein","seinem"] },
  her:  { m: ["ihr","ihren","ihrem"], f: ["ihre","ihre","ihrer"], n: ["ihr","ihr","ihrem"] },
  our:  { m: ["unser","unseren","unserem"], f: ["unsere","unsere","unserer"], n: ["unser","unser","unserem"] },
  yall: { m: ["euer","euren","eurem"], f: ["eure","eure","eurer"], n: ["euer","euer","eurem"] },
  Sie:  { m: ["Ihr","Ihren","Ihrem"], f: ["Ihre","Ihre","Ihrer"], n: ["Ihr","Ihr","Ihrem"] },
};
for (const id in T) for (const g in T[id]) for (let c = 0; c < 3; c++)
  assert.strictEqual(f(id, g, c), T[id][g][c], `${id} ${g} ${c}`);
assert(D.check("EINEN", "einen", "Tisch"));
assert(D.check(" einen Tisch ", "einen", "Tisch"));
assert(!D.check("ein", "einen", "Tisch"));
assert(D.check("ihren", "Ihren", "Hund")); // case-insensitive
// word list sanity
const W = window.WORDS;
assert(W.length >= 200 && new Set(W.map(w => w[0])).size === W.length);
assert(W.every(w => "mfn".includes(w[1]) && w[2]));
// english checking
assert(D.checkEnglish("The Station","Bahnhof","station"));
assert(D.checkEnglish("path","Weg","way / path"));
assert(D.checkEnglish("friend","Freund","friend (male)"));
assert(D.checkEnglish("airplane","Flugzeug","aeroplane"));
assert(D.checkEnglish("umbrela","Regenschirm","umbrella"));
assert(!D.checkEnglish("cat","Hund","dog"));
assert(!D.checkEnglish("","Hund","dog"));
assert(!D.checkEnglish("(male)","Freund","friend (male)"));
for (const w of W) assert(D.englishAnswers(w[0], w[2]).length && D.englishAnswers(w[0], w[2]).every(a => a), w[0]);
// session
for (let i = 0; i < 500; i++) {
  const s = D.makeSession(W, 10);
  assert.strictEqual(s.length, 10);
  assert.strictEqual(new Set(s.map(q => q.noun)).size, 10);
}
const seen = new Set(); for (let i = 0; i < 300; i++) D.makeSession(W, 10).forEach(q => seen.add(q.det.id + q.caseIdx));
assert.strictEqual(seen.size, 30);
console.log("all tests passed");
