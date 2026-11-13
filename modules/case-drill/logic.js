(function (root) {
  const CASES = ["Nominativ", "Akkusativ", "Dativ"];
  const GENDERS = ["m", "f", "n"];
  // der-word endings: [nom, akk, dat]
  const DEF = { m: ["der", "den", "dem"], f: ["die", "die", "der"], n: ["das", "das", "dem"] };
  // ein-word endings
  const END = { m: ["", "en", "em"], f: ["e", "e", "er"], n: ["", "", "em"] };
  const DETS = [
    { id: "the",  stem: null,    label: "the" },
    { id: "a",    stem: "ein",   label: "a" },
    { id: "no",   stem: "kein",  label: "no / not a" },
    { id: "my",   stem: "mein",  label: "my" },
    { id: "your", stem: "dein",  label: "your (du)" },
    { id: "his",  stem: "sein",  label: "his / its" },
    { id: "her",  stem: "ihr",   label: "her / their" },
    { id: "our",  stem: "unser", label: "our" },
    { id: "yall", stem: "euer",  label: "your (ihr, plural)" },
    { id: "Sie",  stem: "Ihr",   label: "your (Sie, formal)" },
  ];
  function form(det, gender, caseIdx) {
    if (det.stem === null) return DEF[gender][caseIdx];
    const e = END[gender][caseIdx];
    if (det.stem === "euer" && e) return "eur" + e;   // euer -> eure/euren/eurem/eurer
    return det.stem + e;
  }
  // Accept the bare determiner, or determiner + the noun typed after it.
  function check(input, expected, noun) {
    let s = String(input).trim().replace(/\s+/g, " ").toLowerCase();
    const n = noun.toLowerCase();
    if (s.endsWith(" " + n)) s = s.slice(0, -n.length - 1).trim();
    return s === expected.toLowerCase();
  }
  // Extra accepted English answers (US spellings, synonyms)
  const ALT = { Flugzeug:["airplane","plane"], Wohnung:["apartment"], Pullover:["sweater","sweatshirt"], Urlaub:["vacation"],
    Hose:["pants","trousers"], Nachbar:["neighbor"], Farbe:["color"], Theater:["theater"], Kühlschrank:["refrigerator"],
    Fernseher:["tv","television"], Stadtplan:["map"], Ausweis:["id","identity card"], Unterricht:["lesson","class","teaching"],
    Handy:["cell phone","phone","mobile","cellphone"], Gepäck:["baggage"], Telefon:["phone"], Heft:["notebook"], Gleis:["platform","track","rail"],
    Beruf:["job","occupation"], Chef:["boss","manager"], Café:["cafe","coffee shop"], Mädchen:["girl"], Geschäft:["store","shop","business"],
    Fußball:["soccer"], Post:["mail","post"], Essen:["meal","food"], Gemüse:["veg","vegetable"], Brille:["glasses","spectacles"],
    Lehrer:["teacher"], Lehrerin:["teacher"], Arzt:["doctor"], Ärztin:["doctor"], Freund:["friend","boyfriend"], Freundin:["friend","girlfriend"],
    Kollege:["colleague"], Bäcker:["baker"] };
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function englishAnswers(noun, english) {
    const base = english.replace(/\([^)]*\)/g, " ").split("/").map(x => x.trim().toLowerCase()).filter(Boolean);
    return base.concat((ALT[noun] || []).map(x => x.toLowerCase()));
  }
  // Accept any listed meaning, optional leading the/a/an, tiny typos on words >= 6 letters
  function checkEnglish(input, noun, english) {
    const s = String(input).trim().toLowerCase().replace(/^(the|a|an|to)\s+/, "").replace(/\s+/g, " ");
    if (!s) return false;
    return englishAnswers(noun, english).some(a => a === s || (a.length >= 6 && lev(a, s) <= 1));
  }
  // ---- plurals ----
  const PL = typeof module !== "undefined" ? require("./plurals.js") : root.PLURALS;
  const plurals = noun => PL[noun] || null;
  const normPl = s => String(s).toLowerCase().replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
  function checkPlural(input, noun) {
    const p = plurals(noun); if (!p) return false;
    const s = normPl(String(input).trim().replace(/\s+/g, " ")).replace(/^die /, "");
    return p.some(x => normPl(x) === s);
  }
  const deUml = s => s.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/Ä/g, "A").replace(/Ö/g, "O").replace(/Ü/g, "U");
  function pluralHint(noun) {
    const p = plurals(noun); if (!p) return ""; const pl = p[0], base = deUml(pl), um = pl !== base;
    if (base === noun) return um ? "just an umlaut, no ending" : "same as the singular";
    if (base.startsWith(noun)) return "add -" + base.slice(noun.length) + (um ? " and an umlaut" : "");
    return "a slightly irregular plural";
  }
  function shuffle(a, rnd) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function makeSession(words, n, rnd) {
    rnd = rnd || Math.random;
    return shuffle(words, rnd).slice(0, n).map(w => {
      const det = DETS[Math.floor(rnd() * DETS.length)];
      const caseIdx = Math.floor(rnd() * 3);
      return { noun: w[0], gender: w[1], english: w[2], det, caseIdx, answer: form(det, w[1], caseIdx) };
    });
  }
  const api = { plurals, checkPlural, pluralHint, CASES, GENDERS, DETS, form, check, checkEnglish, englishAnswers, makeSession };
  if (typeof module !== "undefined") module.exports = api; else root.Drill = api;
})(this);
