(function (root) {
  const ALT = { dürfen:["may","allowed","be allowed to"], können:["can","able to","be able to"], mögen:["like"], möchten:["would like","want","want to"],
    müssen:["must","have to"], sollen:["should","ought to","supposed to"], wollen:["want","want to"], beginnen:["begin","start"],
    bleiben:["stay","remain"], bringen:["bring","take","fetch"], empfehlen:["recommend"], fahren:["drive","ride","go","travel"],
    gehen:["go","walk"], halten:["hold","stop"], kennen:["know","be familiar with","know someone"], lassen:["let","allow","have done","leave"],
    laufen:["run","walk"], liegen:["lie","be lying","lie down"], rufen:["call","call out","shout"], schließen:["close","shut"],
    steigen:["climb","rise"], tragen:["carry","wear"], tun:["do"], ziehen:["pull","move"], wissen:["know"], haben:["have"], sein:["be"],
    werden:["become","get"], schlafen:["sleep"], schreiben:["write"], sprechen:["speak","talk"], treffen:["meet"], trinken:["drink"] };
  const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, " ").replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
  const stripPron = s => s.replace(/^(er\/sie\/es|er|sie|es)\s+/, "");
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const stripTo = s => s.replace(/^(to|the|a)\s+/, "");
  function englishAnswers(verb) {
    const base = [];
    verb[1].split(/,|\//).map(x => x.trim().toLowerCase()).filter(Boolean).forEach(p => {
      const q = stripTo(p); base.push(q); if (q.startsWith("be ")) base.push(q.slice(3));
    });
    return Array.from(new Set(base.concat((ALT[verb[0]] || []).map(x => x.toLowerCase()))));
  }
  function checkEnglish(input, verb) {
    const s = stripTo(String(input).trim().toLowerCase().replace(/\s+/g, " "));
    if (!s) return false;
    return englishAnswers(verb).some(a => a === s || (a.length >= 6 && lev(a, s) <= 1));
  }
  function checkForm(input, answers) {
    const s = stripPron(norm(input)); if (!s) return false;
    return answers.some(a => norm(a) === s);
  }
  // steps for one verb: English (1 pt) + up to 3 forms (3 pts each)
  function steps(v) {
    const st = [{ k: "en", label: "English", base: 1, show: v[1] }];
    st.push({ k: "pr", label: "er/sie/es — Präsens", base: 3, answers: [v[2]], show: v[2] });
    if (v[3]) st.push({ k: "pa", label: "er/sie/es — Präteritum", base: 3, answers: [v[3]], show: v[3] });
    if (v[4]) st.push({ k: "pf", label: "er/sie/es — Perfekt (hat/ist …)", base: 3, answers: v[4], show: v[4].join(" / ") });
    return st;
  }
  const check = (v, step, input) => step.k === "en" ? checkEnglish(input, v) : checkForm(input, step.answers);
  function clue(v, step) {
    const a = step.k === "en" ? englishAnswers(v)[0] : step.answers[0];
    return a.split(" ").map(w => w[0] + "_".repeat(Math.max(0, w.length - 1))).join("  ");
  }
  const TRY_FACTOR = [1, 0.5, 0.25];
  const points = (base, tries, gaveUp) => gaveUp ? 0 : base * (TRY_FACTOR[tries - 1] || 0);
  const maxFor = v => steps(v).reduce((a, s) => a + s.base, 0);
  function shuffle(a, rnd) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const makeSession = (verbs, n, rnd) => shuffle(verbs, rnd || Math.random).slice(0, n);
  const api = { norm, checkEnglish, englishAnswers, checkForm, steps, check, clue, points, maxFor, makeSession };
  if (typeof module !== "undefined") module.exports = api; else root.Irr = api;
})(this);
