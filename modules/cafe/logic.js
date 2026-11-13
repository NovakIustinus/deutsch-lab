(function (root) {
  const D = typeof module !== "undefined" ? require("./menu.js") : root.CAFE;
  const norm = s => String(s).toLowerCase().replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/[.,!?;:"'„“”‚‘’()]/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim();
  const MAX = 4, FACT = [1, 0.5, 0.25];
  const points = (tries, gave) => gave ? 0 : (FACT[tries - 1] || 0) * MAX;
  const fmtEUR = c => (c / 100).toFixed(2).replace(".", ",") + " €";
  const pick = (a, r) => a[Math.floor(r() * a.length)];
  function shuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ---------- German number words (0-99) and prices ----------
  const ONES = ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
  const TENS = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
  function num(n, standalone) {
    if (n < 20) return n === 1 && standalone ? "eins" : ONES[n];
    const t = Math.floor(n / 10), o = n % 10;
    return o === 0 ? TENS[t] : (o === 1 ? "ein" : ONES[o]) + "und" + TENS[t];
  }
  function priceShow(c) { const e = Math.floor(c / 100), ct = c % 100; return num(e) + " Euro" + (ct ? " " + num(ct, true) : ""); }
  function priceVariants(c) {
    const e = Math.floor(c / 100), ct = c % 100, ew = num(e), es = num(e, true);
    if (!ct) return [ew + " Euro", es];
    const cw = num(ct, true);
    return [ew + " Euro " + cw, es + " " + cw, ew + " Euro und " + cw + " Cent", ew + " Euro " + cw + " Cent"];
  }
  const PREFIX = /^(das (macht|sind|kostet|ist)|ihr rueckgeld (ist|sind)|das rueckgeld (ist|sind)|rueckgeld|macht|sind|kostet|zurueck)\s+/;
  function checkPrice(input, c) {
    const n = norm(input).replace(PREFIX, ""); if (!n) return false;
    return priceVariants(c).some(v => norm(v) === n);
  }
  function parseDigits(input) {
    const s = String(input).replace(/€|euro/gi, "").replace(/\s+/g, "");
    if (!/^\d{1,3}([.,]\d{1,2})?$/.test(s)) return null;
    return Math.round(parseFloat(s.replace(",", ".")) * 100);
  }
  const checkDigits = (input, c) => parseDigits(input) === c;

  // ---------- English (vocab) ----------
  const stripTo = s => s.replace(/^(to|the|a|an)\s+/, "");
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function checkEnglish(input, answers) {
    const s = stripTo(String(input).trim().toLowerCase().replace(/\s+/g, " ")); if (!s) return false;
    return answers.some(a => { a = a.toLowerCase(); return a === s || stripTo(a) === s || (a.length >= 6 && lev(a, s) <= 1); });
  }

  // ---------- generic checker ----------
  function check(q, input) {
    switch (q.mode) {
      case "phrase": { const n = norm(input); return !!n && q.answers.some(a => norm(a) === n); }
      case "article": return norm(input) === norm(q.answers[0]);
      case "english": return checkEnglish(input, q.answers);
      case "price": return checkPrice(input, q.cents);
      case "digits": return checkDigits(input, q.cents);
    }
    return false;
  }
  function clue(text) { return text.replace(/[.,!?]/g, "").split(" ").map(w => w[0] + "_".repeat(Math.max(0, w.length - 1))).join("  "); }

  // ---------- customer orders (multiple choice) ----------
  const an = s => (/^[aeiou]/.test(s) ? "an " : "a ") + s;
  function makeOrder(r) {
    const d = pick(D.drinks, r), o = { drink: d, size: null, milk: null, food: null, togo: r() < 0.5 };
    if (d.sizes.length && r() < 0.4) o.size = d.sizes[0];
    if (d.milk && r() < 0.5) o.milk = pick(D.milks, r);
    if (r() < 0.4) o.food = pick(D.foods, r);
    return o;
  }
  function orderDE(o, r) {
    const d = o.drink;
    let np = d.art + (o.size ? " " + D.sizes[o.size].de : "") + " " + d.de + (o.milk ? " mit " + o.milk.de : "") + (o.food ? " und " + o.food.de : "");
    const tail = o.togo ? ", zum Mitnehmen" : "";
    const t = Math.floor(r() * 4);
    return [`Ich hätte gern ${np}${tail}, bitte.`, `${np[0].toUpperCase() + np.slice(1)}${tail}, bitte.`, `Ich nehme ${np}${tail}.`, `Für mich ${np}${tail}, bitte.`][t];
  }
  function orderEN(o) {
    const d = o.drink, core = (o.size ? D.sizes[o.size].en + " " : "") + d.en;
    const s = an(core) + (o.milk ? " with " + o.milk.en : "") + (o.food ? " and " + o.food.en : "") + (o.togo ? ", to go" : "");
    return s[0].toUpperCase() + s.slice(1) + ".";
  }
  function mutations(o, r) {
    const out = [], c = () => Object.assign({}, o);
    const others = D.drinks.filter(x => x !== o.drink);
    { const x = c(); x.drink = pick(others, r); x.size = x.drink.sizes.includes(o.size) ? o.size : null; x.milk = x.drink.milk ? o.milk : null; out.push(x); }
    if (o.drink.sizes.length) { const x = c(); x.size = o.size ? null : o.drink.sizes[0]; out.push(x); }
    if (o.drink.milk) { const x = c(); const alt = D.milks.filter(m => m !== o.milk); x.milk = o.milk && r() < 0.4 ? null : pick(alt, r); out.push(x); }
    { const x = c(); const alt = D.foods.filter(f => f !== o.food); x.food = o.food && r() < 0.3 ? null : pick(alt, r); out.push(x); }
    { const x = c(); x.togo = !o.togo; out.push(x); }
    return out;
  }
  function orderQuestion(r) {
    const o = makeOrder(r), correct = orderEN(o), set = [correct];
    for (const m of shuffle(mutations(o, r), r)) { const s = orderEN(m); if (!set.includes(s)) set.push(s); if (set.length === 4) break; }
    const options = shuffle(set, r);
    return { type: "order", label: "Customer order", kind: "mc", de: orderDE(o, r), speak: true, prompt: "What does the customer want?", options, correct: options.indexOf(correct), show: correct };
  }

  // ---------- tiles (Duolingo style) ----------
  const CAP = new Set(["Ich", "Sie", "Ihr", "Ihre", "Ihren", "Ihnen", "Ihrem", "Euro", "Cent", "Hafermilch", "Sojamilch", "Mandelmilch"]);
  const tokens = text => String(text).replace(/[.,!?;:"„“”()]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const dispTokens = text => tokens(text).map((w, i) => i === 0 && !CAP.has(w) ? w[0].toLowerCase() + w.slice(1) : w);
  const POOL = (() => { const out = new Set(); D.ask.concat(D.reply).forEach(p => dispTokens(p.a[0]).forEach(w => out.add(w))); return Array.from(out); })();
  const NUMW = ["eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "zwölf", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig", "hundert"];
  function addTiles(q, words, extras, r) {
    const have = new Set(words.map(w => w.toLowerCase()));
    const dis = shuffle(extras.filter(w => !have.has(w.toLowerCase())), r);
    const out = []; for (const w of dis) { if (!out.some(x => x.toLowerCase() === w.toLowerCase())) out.push(w); if (out.length === 4) break; }
    q.tiles = shuffle(words.concat(out), r); q.kind = "tiles"; return q;
  }

  // ---------- other question types ----------
  const askQ = (p, r) => addTiles({ type: "ask", label: "You ask", mode: "phrase", de: null, prompt: "Say in German: " + p.en.replace(/^Say: /, ""), answers: p.a, show: p.a[0] }, dispTokens(p.a[0]), POOL, r);
  const replyQ = (p, r, write) => {
    const q = { type: "reply", label: write ? "Write your answer" : "You answer", mode: "phrase", de: p.q, speak: true, prompt: p.en, answers: p.a, show: p.a[0], who: "Customer" };
    if (write) { q.kind = "text"; q.write = true; return q; }
    return addTiles(q, dispTokens(p.a[0]), POOL, r);
  };
  function orderBuildQuestion(r) {
    const o = makeOrder(r), d = o.drink;
    const np = d.art + (o.size ? " " + D.sizes[o.size].de : "") + " " + d.de + (o.milk ? " mit " + o.milk.de : "") + (o.food ? " und " + o.food.de : ""), tail = o.togo ? ", zum Mitnehmen" : "";
    const v = [`Ich hätte gern ${np}${tail}, bitte.`, `${np[0].toUpperCase() + np.slice(1)}${tail}, bitte.`, `Ich nehme ${np}${tail}.`, `Für mich ${np}${tail}, bitte.`];
    const extras = D.drinks.map(x => x.de).concat(D.milks.map(m => m.de), ["ohne", "hier", "doppelten", "großen", "kleinen", "und", "für", "nehme", "Bagel", "Brot", "Omelette"]);
    return addTiles({ type: "orderbuild", label: "Take the order", mode: "phrase", de: null, prompt: "The customer says: “" + orderEN(o) + "” — build the German sentence.", answers: v, show: v[0] }, dispTokens(v[0]), extras, r);
  }
  const articleQ = (p, r) => ({ type: "article", label: "Akkusativ", kind: "mc", de: null, prompt: "Ich hätte gern ___ " + p[0] + ", bitte.", options: ["einen", "eine", "ein"], correct: ["einen", "eine", "ein"].indexOf(p[1]), show: p[1] });
  function vocabQ(p, all, r) {
    const wrong = []; for (const x of shuffle(all.filter(x => x[0] !== p[0] && !x[1].some(a => p[1].includes(a))), r)) { if (!wrong.includes(x[1][0])) wrong.push(x[1][0]); if (wrong.length === 3) break; }
    const options = shuffle([p[1][0]].concat(wrong), r);
    return { type: "vocab", label: "Menu word", kind: "mc", de: p[0], speak: true, who: "Menu", prompt: "What does it mean?", options, correct: options.indexOf(p[1][0]), show: p[1][0] };
  }
  function priceQuestion(kind, r) {
    if (kind === "total") {
      const n = r() < 0.5 ? 1 : 2, items = shuffle(D.priced, r).slice(0, n), cents = items.reduce((a, i) => a + i.price, 0);
      const q = { type: "total", label: "Say the total", mode: "price", cents, de: null,
        prompt: "Customer orders " + items.map(i => i.en + " (" + fmtEUR(i.price) + ")").join(" + ") + ". Say the total.", answers: [priceShow(cents)], show: priceShow(cents) };
      return addTiles(q, priceShow(cents).split(" "), NUMW.concat(["Cent", "und"]), r);
    }
    if (kind === "hear") {
      const cents = pick(D.priced, r).price + (r() < 0.6 ? pick(D.priced, r).price : 0), say = priceShow(cents), set = [cents];
      for (const d of shuffle([10, -10, 20, -20, 50, -50, 100, -100, 90, -90], r)) { const c = cents + d; if (c > 0 && !set.includes(c)) set.push(c); if (set.length === 4) break; }
      const options = shuffle(set, r).map(fmtEUR);
      return { type: "hear", label: "Hear the price", kind: "mc", de: "Das macht " + say + ".", speak: true, who: "Price", prompt: "How much is it?", options, correct: options.indexOf(fmtEUR(cents)), show: fmtEUR(cents) };
    }
    const total = pick(D.priced, r).price + (r() < 0.5 ? pick(D.priced, r).price : 0), pay = [500, 1000, 2000].find(p => p > total) || 5000, change = pay - total;
    const q = { type: "change", label: "Give change", mode: "price", cents: change, de: "Hier sind " + num(pay / 100) + " Euro.", speak: true, who: "Customer",
      prompt: "The order is " + fmtEUR(total) + ". Give them their change (Rückgeld).", answers: [priceShow(change)], show: priceShow(change) };
    return addTiles(q, priceShow(change).split(" "), NUMW.concat(["Cent", "und"]), r);
  }

  // ---------- word-level diagnosis for written answers ----------
  function diagnose(input, variants) {
    const typedRaw = tokens(input), typed = typedRaw.map(norm);
    let best = null;
    for (const v of variants) {
      const tv = tokens(v), tn = tv.map(norm), n = tv.length, m = typed.length;
      const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
      for (let i = 0; i <= n; i++) d[i][0] = i; for (let j = 0; j <= m; j++) d[0][j] = j;
      for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (tn[i - 1] === typed[j - 1] ? 0 : 1));
      if (!best || d[n][m] < best.dist) best = { dist: d[n][m], tv, tn, d, n, m };
    }
    const { tv, tn, d } = best; let i = best.n, j = best.m; const ops = [], extra = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && tn[i - 1] === typed[j - 1] && d[i][j] === d[i - 1][j - 1]) { ops.unshift({ s: "ok", w: tv[i - 1], j: j - 1 }); i--; j--; }
      else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) { ops.unshift({ s: "sub", w: tv[i - 1], typed: typedRaw[j - 1] }); i--; j--; }
      else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { ops.unshift({ s: "miss", w: tv[i - 1] }); i--; }
      else { extra.unshift(typedRaw[j - 1]); j--; }
    }
    return { ops, extra, okCount: ops.filter(o => o.s === "ok").length };
  }

  const SLOTS = ["orderlisten", "orderbuild", "ask", "ask", "reply", "write", "price", "hear", "article", "vocab"];
  function makeSession(r) {
    r = r || Math.random;
    const asks = shuffle(D.ask, r), replies = shuffle(D.reply, r), arts = shuffle(D.article, r), vocs = shuffle(D.vocab, r);
    const q = [];
    for (const s of shuffle(SLOTS, r)) {
      if (s === "orderlisten") q.push(orderQuestion(r));
      else if (s === "orderbuild") q.push(orderBuildQuestion(r));
      else if (s === "ask") q.push(askQ(asks.pop(), r));
      else if (s === "reply") q.push(replyQ(replies.pop(), r, false));
      else if (s === "write") q.push(replyQ(replies.pop(), r, true));
      else if (s === "price") q.push(priceQuestion(r() < 0.5 ? "total" : "change", r));
      else if (s === "hear") q.push(priceQuestion("hear", r));
      else if (s === "article") q.push(articleQ(arts.pop(), r));
      else q.push(vocabQ(vocs.pop(), D.vocab, r));
    }
    return q;
  }
  const api = { diagnose, tokens, norm, num, priceShow, priceVariants, checkPrice, parseDigits, checkDigits, checkEnglish, check, clue, points, fmtEUR, orderDE, orderEN, orderQuestion, orderBuildQuestion, priceQuestion, makeSession, MAX, SLOTS };
  if (typeof module !== "undefined") module.exports = api; else root.Cafe = api;
})(this);
