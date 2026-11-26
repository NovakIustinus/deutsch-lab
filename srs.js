// Spaced repetition shared by all drills (Leitner boxes, saved per module in localStorage on this device).
// Box 0 = missed last time (comes back at once) ... box 5 = well known (comes back after ~16 days).
(function (root) {
  const H = 3600e3, IV = [0, 4 * H, 24 * H, 72 * H, 168 * H, 384 * H], MAXBOX = IV.length - 1;
  function make(ns, store, nowFn) {
    const KEY = "srs:" + ns, now = nowFn || Date.now;
    try { store = store || root.localStorage; } catch (e) { store = null; }
    let mem = null;
    const load = () => { if (mem) return mem; try { mem = JSON.parse(store.getItem(KEY)) || {}; } catch (e) { mem = {}; } return mem; };
    const save = () => { try { store.setItem(KEY, JSON.stringify(mem)); } catch (e) {} };
    const prio = (id, rnd) => {
      const e = load()[id], j = rnd() * 0.3;
      if (!e) return 1.2 + j;                                  // never seen: after anything overdue, before things not yet due
      if (e[0] === 0) return 100 + j;                          // missed last time: first
      return (now() - e[1]) / IV[e[0]] + j;                    // >=1 means due; the more overdue, the earlier
    };
    // all items, best candidates first
    function rank(items, idFn, rnd) {
      rnd = rnd || Math.random; idFn = idFn || (x => x);
      return items.map(x => ({ x, p: prio(idFn(x), rnd) })).sort((a, b) => b.p - a.p).map(o => o.x);
    }
    function shuffle(a, rnd) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    // n items to practise now, in random order
    const pick = (items, n, idFn, rnd) => shuffle(rank(items, idFn, rnd).slice(0, n), rnd || Math.random);
    // good (>=85% of the points): up a box; ok (>=50%): stays; bad: back to box 0
    const grade = (pts, max) => { const f = max > 0 ? pts / max : 0; return f >= 0.85 ? "good" : f >= 0.5 ? "ok" : "bad"; };
    function record(id, g) {
      const d = load(), e = d[id] || [0, 0];
      d[id] = [g === "good" ? Math.min(e[0] + 1, MAXBOX) : g === "ok" ? e[0] : 0, now()];
      save();
    }
    function stats(ids) {
      const d = load(), s = { total: ids.length, fresh: 0, learning: 0, strong: 0, due: 0 };
      ids.forEach(id => { const e = d[id]; if (!e) { s.fresh++; return; } if (e[0] >= 4) s.strong++; else s.learning++; if (e[0] === 0 || now() - e[1] >= IV[e[0]]) s.due++; });
      return s;
    }
    const reset = () => { mem = {}; try { store.removeItem(KEY); } catch (e) {} };
    return { rank, pick, grade, record, stats, reset };
  }
  // small status line in a module's start screen
  function badge(S, ids, host) {
    if (!host || typeof document === "undefined") return;
    const render = () => { const s = S.stats(ids);
      host.innerHTML = "🧠 <b>Smart practice</b> — each round picks the words you need most; ones you miss come back sooner, ones you know come back later (saved on this device).<br>"
        + s.fresh + " new · " + s.learning + " learning · " + s.strong + " strong · " + s.due + " due now · <a href='#' id='srsreset'>reset</a>";
      host.querySelector("#srsreset").onclick = e => { e.preventDefault(); if (confirm("Forget your progress on this module?")) { S.reset(); render(); } }; };
    render();
  }
  const api = { make, badge };
  if (typeof module !== "undefined") module.exports = api; else root.SRS = api;
})(this);
