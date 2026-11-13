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

  // ---------- other question types ----------
  const askQ = p => ({ type: "ask", label: "You ask", kind: "text", mode: "phrase", de: null, prompt: p.en, answers: p.a, show: p.a[0] });
  const replyQ = p => ({ type: "reply", label: "You answer", kind: "text", mode: "phrase", de: p.q, speak: true, prompt: p.en, answers: p.a, show: p.a[0], who: "Customer" });
  const articleQ = p => ({ type: "article", label: "Akkusativ", kind: "text", mode: "article", de: null, prompt: "Fill the gap: “Ich hätte gern ___ " + p[0] + ", bitte.”", answers: [p[1]], show: p[1] });
  const vocabQ = p => ({ type: "vocab", label: "Menu word", kind: "text", mode: "english", de: p[0], speak: true, prompt: "What does it mean in English?", answers: p[1], show: p[1][0], who: "Menu" });
  function priceQuestion(kind, r) {
    if (kind === "total") {
      const n = r() < 0.5 ? 1 : 2, items = shuffle(D.priced, r).slice(0, n), cents = items.reduce((a, i) => a + i.price, 0);
      return { type: "total", label: "Say the total", kind: "text", mode: "price", cents, de: null,
        prompt: "Customer orders " + items.map(i => i.en + " (" + fmtEUR(i.price) + ")").join(" + ") + ". Say the total in words, e.g. “drei Euro achtzig”.",
        answers: [priceShow(cents)], show: priceShow(cents) };
    }
    if (kind === "hear") {
      const cents = pick(D.priced, r).price + (r() < 0.6 ? pick(D.priced, r).price : 0), say = priceShow(cents);
      return { type: "hear", label: "Hear the price", kind: "text", mode: "digits", cents, de: "Das macht " + say + ".", speak: true, who: "Price",
        prompt: "Type the amount in figures, e.g. 4,90", answers: [fmtEUR(cents).replace(" €", "")], show: fmtEUR(cents).replace(" €", "") };
    }
    const total = pick(D.priced, r).price + (r() < 0.5 ? pick(D.priced, r).price : 0), pay = [500, 1000, 2000].find(p => p > total) || 5000, change = pay - total;
    return { type: "change", label: "Give change", kind: "text", mode: "price", cents: change, de: "Hier sind " + num(pay / 100) + " Euro.", speak: true, who: "Customer",
      prompt: "The order is " + fmtEUR(total) + ". Give them their change (Rückgeld) – type it in words.", answers: [priceShow(change)], show: priceShow(change) };
  }

  const SLOTS = ["order", "order", "ask", "ask", "reply", "price", "price", "article", "vocab", "vocab"];
  function makeSession(r) {
    r = r || Math.random;
    const asks = shuffle(D.ask, r), replies = shuffle(D.reply, r), arts = shuffle(D.article, r), vocs = shuffle(D.vocab, r), kinds = shuffle(["total", "hear", "change"], r);
    const q = [];
    for (const s of shuffle(SLOTS, r)) {
      if (s === "order") q.push(orderQuestion(r));
      else if (s === "ask") q.push(askQ(asks.pop()));
      else if (s === "reply") q.push(replyQ(replies.pop()));
      else if (s === "price") q.push(priceQuestion(kinds.pop(), r));
      else if (s === "article") q.push(articleQ(arts.pop()));
      else q.push(vocabQ(vocs.pop()));
    }
    return q;
  }
  const api = { norm, num, priceShow, priceVariants, checkPrice, parseDigits, checkDigits, checkEnglish, check, clue, points, fmtEUR, orderDE, orderEN, orderQuestion, priceQuestion, makeSession, MAX, SLOTS };
  if (typeof module !== "undefined") module.exports = api; else root.Cafe = api;
})(this);
