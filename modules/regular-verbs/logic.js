(function (root) {
  const PERSONS = [
    { id: "ich", pron: "ich", label: "ich", end: "te",  h: "habe",  s: "bin" },
    { id: "du",  pron: "du",  label: "du",  end: "test", h: "hast", s: "bist" },
    { id: "er",  pron: "er",  label: "er",  end: "te",  h: "hat",   s: "ist" },
    { id: "sie1",pron: "sie", label: "sie (she)", end: "te", h: "hat", s: "ist" },
    { id: "es",  pron: "es",  label: "es",  end: "te",  h: "hat",   s: "ist" },
    { id: "wir", pron: "wir", label: "wir", end: "ten", h: "haben", s: "sind" },
    { id: "ihr", pron: "ihr", label: "ihr", end: "tet", h: "habt",  s: "seid" },
    { id: "sie2",pron: "sie", label: "sie (they)", end: "ten", h: "haben", s: "sind" },
    { id: "Sie", pron: "sie", label: "Sie (formal you)", end: "ten", h: "haben", s: "sind" }
  ];
  const TENSES = [{ id: "pra", label: "Präteritum (simple past)" }, { id: "perf", label: "Perfekt (present perfect)" }];
  const ALT = { machen:["do","make"], wohnen:["live","reside"], leben:["live","be alive"], stellen:["put","place","stand"], legen:["lay","put","place"],
    setzen:["put","set","seat","sit down"], suchen:["look for","search","search for"], glauben:["believe","think"], hören:["hear","listen"],
    reisen:["travel"], wandern:["hike","walk"], antworten:["answer","reply"], baden:["bathe","swim","have a bath"], studieren:["study"],
    probieren:["try","taste","try out"], reparieren:["repair","fix"], erzählen:["tell","narrate"], telefonieren:["phone","call","call someone","telephone"],
    duschen:["shower","have a shower"], bestellen:["order"], bezahlen:["pay"], besuchen:["visit"], erklären:["explain"], verkaufen:["sell"] };
  const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, " ").replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
  const stripTo = s => s.replace(/^(to|the|a)\s+/, "");
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function englishAnswers(v) {
    const base = [];
    v[1].replace(/\([^)]*\)/g, " ").split(/,|\//).map(x => x.trim().toLowerCase()).filter(Boolean).forEach(p => base.push(stripTo(p)));
    return Array.from(new Set(base.concat((ALT[v[0]] || []).map(x => x.toLowerCase()))));
  }
  function checkEnglish(input, v) {
    const s = stripTo(String(input).trim().toLowerCase().replace(/\s+/g, " ")); if (!s) return false;
    return englishAnswers(v).some(a => a === s || (a.length >= 6 && lev(a, s) <= 1));
  }
  function pra(v, p) { return v[2] + (v[5] ? "e" : "") + p.end; }
  function perf(v, p) { return (v[4] === "s" ? p.s : p.h) + " " + v[3]; }
  const answer = (v, p, tense) => tense === "pra" ? pra(v, p) : perf(v, p);
  function checkForm(input, v, p, tense) {
    let s = norm(input).replace(/\s+/g, " "); if (!s) return false;
    s = s.replace(new RegExp("^" + p.pron + "\\s+"), "");
    return s === norm(answer(v, p, tense));
  }
  function clue(text) { return text.split(" ").map(w => w[0] + "_".repeat(Math.max(0, w.length - 1))).join("  "); }
  const EN_F = [1, 0.5], FORM_F = [1, 0.5, 0.25];
  const pointsEn = (tries, gave) => gave ? 0 : (EN_F[tries - 1] || 0) * 1;
  const pointsForm = (tries, gave) => gave ? 0 : (FORM_F[tries - 1] || 0) * 3;
  function shuffle(a, rnd) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function makeSession(verbs, n, rnd, tense) {
    rnd = rnd || Math.random;
    return shuffle(verbs, rnd).slice(0, n).map(v => ({ v, p: PERSONS[Math.floor(rnd() * PERSONS.length)], tense: tense || (rnd() < 0.5 ? "pra" : "perf") }));
  }
  const api = { PERSONS, TENSES, norm, englishAnswers, checkEnglish, checkForm, answer, pra, perf, clue, pointsEn, pointsForm, makeSession, MAX: 4 };
  if (typeof module !== "undefined") module.exports = api; else root.Reg = api;
})(this);
