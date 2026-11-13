(function(){
const $=id=>document.getElementById(id), N=10, MODULE="cafe", MAXQ=Cafe.MAX, MAX=N*MAXQ, D=window.CAFE;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const fmt=n=>String(Number(n.toFixed(2)));
const KEY="cafeTop", URL_=(window.LEADERBOARD_URL||"").trim();
let player="",sess,qi,cur,tries,gaveUp,wrongs,log,peeked;
const show=id=>{["s-intro","s-q","s-done"].forEach(s=>$(s).classList.toggle("hidden",s!==id));window.scrollTo(0,0);};
// ---- audio (optional) ----
const SYN=window.speechSynthesis; let voice=null;
const store=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}}, load=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
function pickVoice(){ if(!SYN) return; const vs=SYN.getVoices()||[]; voice=vs.find(v=>/^de[-_]DE/i.test(v.lang))||vs.find(v=>/^de/i.test(v.lang))||null;
  $("voiceInfo").textContent=!SYN?"This browser can’t speak, so audio is unavailable.":voice?"German voice found: "+voice.name+".":"No German voice found on this device — it will use the default voice and may sound wrong."; }
function speak(t){ if(!SYN||!t) return; try{ SYN.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang="de-DE"; if(voice) u.voice=voice; u.rate=0.9; SYN.speak(u);}catch(e){} }
if(!SYN){ $("optAudio").disabled=true; $("optListen").disabled=true; } else { SYN.onvoiceschanged=pickVoice; }
$("optAudio").checked=!!SYN&&load("cafeAudio")!=="0"; $("optListen").checked=!!SYN&&load("cafeListen")==="1";
const audioOn=()=>$("optAudio").checked, listenOn=()=>$("optListen").checked&&audioOn();
$("optAudio").addEventListener("change",()=>{store("cafeAudio",audioOn()?"1":"0"); if(!audioOn()){$("optListen").checked=false;store("cafeListen","0");}});
$("optListen").addEventListener("change",()=>{ if($("optListen").checked) $("optAudio").checked=true; store("cafeListen",$("optListen").checked?"1":"0"); store("cafeAudio",audioOn()?"1":"0"); });
pickVoice();
// ---- reference tables ----
$("pb").innerHTML=D.ask.map(p=>"<tr><td>"+esc(p.en)+"</td><td>"+esc(p.a[0])+"</td></tr>").join("")+D.reply.map(p=>"<tr><td>“"+esc(p.q)+"” → "+esc(p.en.replace(/^Say: /,""))+"</td><td>"+esc(p.a[0])+"</td></tr>").join("");
$("menu").innerHTML=D.menuRef.map(c=>"<div class='sec' style='font-size:.9rem'>"+esc(c.cat)+"</div><table class='mn lb' style='width:100%;border-collapse:collapse'>"+c.items.map(i=>"<tr><td>"+esc(i[0])+"</td><td>"+esc(i[1])+"</td></tr>").join("")+"</table>").join("");
// ---- leaderboard ----
const top10=a=>a.slice().sort((x,y)=>y.pct-x.pct||y.score-x.score||x.t-y.t).slice(0,10);
function localBoard(){try{return top10(JSON.parse(localStorage.getItem(KEY))||[]);}catch(e){return [];}}
async function getBoard(){ if(!URL_) return localBoard(); const r=await fetch(URL_+"?module="+MODULE+"&_="+Date.now()); if(!r.ok) throw new Error("http"); return top10(await r.json()); }
async function submitScore(e){
  if(!URL_){ try{localStorage.setItem(KEY,JSON.stringify(top10(localBoard().concat(e))));}catch(x){} return; }
  const r=await fetch(URL_,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({module:MODULE},e))}); let j=null; try{j=await r.json();}catch(x){} if(j&&j.ok===false) throw new Error("rejected"); }
async function renderBoard(id,hl,mine){
  const el=$(id); el.innerHTML="<div class='lbempty'>Loading…</div>"; let b;
  try{ b=await getBoard(); }catch(e){ el.innerHTML="<div class='lbempty'>Leaderboard offline — try again later.</div>"; return; }
  const isMe=r=>hl&&r.t===hl;
  let h=b.length?"<table class='lb'><tr><th>#</th><th>Name</th><th>Score</th><th style='text-align:right'>%</th></tr>"+b.map((r,k)=>"<tr"+(isMe(r)?" class='me'":"")+"><td>"+(k+1)+"</td><td>"+esc(r.name)+"</td><td>"+fmt(r.score)+"/"+(r.max||MAX)+"</td><td class='pc'>"+r.pct+"%</td></tr>").join("")+"</table>":"<div class='lbempty'>Nobody yet — be the first!</div>";
  if(mine) h+=b.some(isMe)?"<div class='small'>🎉 You’re on the board!</div>":"<div class='small'>Your run: "+fmt(mine.score)+"/"+mine.max+" — not in the top 10 this time.</div>";
  el.innerHTML=h; }
// ---- start ----
const GO=document.querySelectorAll(".go"), nameOk=()=>$("name").value.trim().length>0, setGo=()=>GO.forEach(b=>b.disabled=!nameOk());
$("name").addEventListener("input",setGo);
$("name").addEventListener("keydown",e=>{ if(e.key==="Enter"&&nameOk()){e.preventDefault();begin();} });
try{ $("name").value=localStorage.getItem("caseDrillName")||""; }catch(e){}
setGo();
function begin(){ player=$("name").value.trim(); store("caseDrillName",player); start(); }
GO.forEach(b=>b.addEventListener("click",()=>{ if(nameOk()) begin(); }));
function start(){ sess=Cafe.makeSession(); qi=0; log=[]; question(); }
// ---- question ----
let built=[], fix=null;
function setBubble(reveal){ const t=$("btx"); const hide=listenOn()&&!reveal&&!peeked; t.textContent=hide?"🎧 ••• listen •••":cur.de; t.classList.toggle("hid",hide); $("peek").classList.toggle("hidden",!hide); }
function question(){
  cur=sess[qi]; tries=0; gaveUp=false; wrongs=[]; peeked=false; built=[]; fix=null; slots=null;
  $("count").textContent=(qi+1)+"/"+N; $("bar").style.width=(qi/N*100)+"%"; $("vn").textContent=(qi+1)+" of "+N; $("chip").textContent=cur.label;
  $("doneRows").innerHTML=""; $("next").classList.add("hidden"); $("fb").innerHTML="";
  const hasDe=!!cur.de; $("bub").classList.toggle("hidden",!hasDe);
  if(hasDe){ $("who").textContent=cur.who||"Customer"; $("play").classList.toggle("hidden",!SYN||!cur.speak); setBubble(false); }
  $("prompt").textContent=cur.prompt;
  const k=cur.kind; $("opts").classList.toggle("hidden",k!=="mc"); $("tilesBox").classList.toggle("hidden",k!=="tiles"); $("active").classList.toggle("hidden",k!=="text");
  $("fixer").classList.add("hidden"); $("ans").classList.remove("hidden");
  if(k==="mc") $("opts").innerHTML=cur.options.map((o,i)=>"<button class='btn opt' data-i='"+i+"'>"+esc(o)+"</button>").join("");
  else if(k==="tiles") renderTiles();
  else { $("ans").value=""; $("ans").disabled=false; $("ans").placeholder="write it in German"; }
  show("s-q"); if(k==="text") $("ans").focus();
  if(cur.de&&cur.speak&&audioOn()) setTimeout(()=>speak(cur.de),150);
}
let slots=null;
function renderTiles(){
  const inUse=new Set(slots?slots.filter(x=>x.idx!==null).map(x=>x.idx):built);
  $("built").innerHTML=slots?slots.map((x,k)=>x.idx===null?"<span class='tile slot'>&nbsp;&nbsp;&nbsp;&nbsp;</span>":"<button type='button' class='tile"+(x.locked?" lock":"")+"' "+(x.locked?"disabled":"data-s='"+k+"'")+">"+esc(cur.tiles[x.idx])+"</button>").join("")
    :built.map((i,k)=>"<button type='button' class='tile' data-b='"+k+"'>"+esc(cur.tiles[i])+"</button>").join("");
  $("bank").innerHTML=cur.tiles.map((w,i)=>"<button type='button' class='tile"+(inUse.has(i)?" used":"")+"' data-t='"+i+"'>"+esc(w)+"</button>").join("");
  $("tcheck").disabled=slots?slots.some(x=>x.idx===null):!built.length;
}
$("bank").addEventListener("click",e=>{ const b=e.target.closest("[data-t]"); if(!b) return; const i=+b.dataset.t;
  if(slots){ const f=slots.find(x=>x.idx===null); if(f&&!slots.some(x=>x.idx===i)){ f.idx=i; renderTiles(); } }
  else if(!built.includes(i)){ built.push(i); renderTiles(); } });
$("built").addEventListener("click",e=>{ const b=e.target.closest("[data-b],[data-s]"); if(!b) return;
  if(b.dataset.s!==undefined){ slots[+b.dataset.s].idx=null; } else built.splice(+b.dataset.b,1); renderTiles(); });
$("play").addEventListener("click",()=>speak(cur.de));
$("peek").addEventListener("click",()=>{ peeked=true; setBubble(false); });
function finishQ(pts){
  cur.pts=pts; cur.tries=tries; cur.gaveUp=gaveUp; cur.wrongs=wrongs.slice(); log.push(cur);
  if(cur.de) setBubble(true);
  $("active").classList.add("hidden"); $("tilesBox").classList.add("hidden"); $("fb").innerHTML="";
  $("doneRows").innerHTML="<div class='done-row'><div><small>Answer</small>"+esc(cur.show)+"</div><div>+"+fmt(pts)+"<small>/ "+MAXQ+"</small></div></div>";
  if(audioOn()&&cur.kind!=="mc"&&cur.type!=="reply") setTimeout(()=>speak(cur.show),200);
  $("next").classList.remove("hidden"); $("next").textContent=qi===N-1?"Ergebnis →":"Weiter →"; $("next").focus();
}
$("opts").addEventListener("click",e=>{ const b=e.target.closest(".opt"); if(!b||b.disabled) return;
  tries++; const i=+b.dataset.i;
  if(i===cur.correct){ b.classList.add("good"); $("opts").querySelectorAll(".opt").forEach(x=>x.disabled=true); finishQ(Cafe.points(tries,false)); return; }
  wrongs.push(cur.options[i]); b.classList.add("x"); b.disabled=true;
  if(tries>=3){ gaveUp=true; $("opts").querySelectorAll(".opt")[cur.correct].classList.add("good"); $("opts").querySelectorAll(".opt").forEach(x=>x.disabled=true); finishQ(0); }
});
// shared wrong/right handling for tiles + written answers
function attempt(text, shakeEl){
  tries++;
  if(Cafe.check(cur,text)){ finishQ(Cafe.points(tries,gaveUp)); return true; }
  wrongs.push(text.trim());
  shakeEl.classList.remove("shake"); void shakeEl.offsetWidth; shakeEl.classList.add("shake");
  let m="<span class='bad'>Nicht ganz ✘ – try again</span>";
  if(gaveUp) m+="<br>Answer: <b class='ok'>"+esc(cur.show)+"</b> <span class='small'>— "+(cur.kind==="tiles"?"build it":"type it")+" to continue</span>";
  else if(tries>=5) m+="<br><button class='btn' type='button' id='giveup'>Give up – show me the answer</button>";
  else if(tries>=3) m+="<br><span class='small'>Clue:</span> <span class='cl'>"+esc(Cafe.clue(cur.show))+"</span>";
  $("fb").innerHTML=m; return false;
}
$("tcheck").addEventListener("click",()=>{
  const idxs=slots?slots.map(x=>x.idx):built, text=idxs.map(i=>cur.tiles[i]).join(" ");
  if(attempt(text,$("built"))) return;
  const d=Cafe.diagnose(text,cur.answers);
  if(d.okCount>0&&!gaveUp){ slots=d.ops.map(o=>o.s==="ok"?{locked:true,idx:idxs[o.j]}:{locked:false,idx:null}); }
  else { slots=null; built=[]; }
  renderTiles(); });
// written answer with per-word marking
function showFixer(d){
  fix=d; const el=$("fixer");
  el.innerHTML=d.ops.map((o,i)=>o.s==="ok"?"<span class='w okw' data-k='"+i+"'>"+esc(o.w)+"</span>":"<input class='w "+(o.s==="sub"?"sub":"miss")+"' data-k='"+i+"' value='"+esc(o.s==="sub"?o.typed:"")+"' size='"+Math.max(4,o.w.length)+"' placeholder='…' autocapitalize='off' autocorrect='off' spellcheck='false'>").join("");
  el.classList.remove("hidden"); $("ans").classList.add("hidden");
  const f=el.querySelector("input"); if(f){ f.focus(); f.select(); }
  let note=""; if(d.extra.length) note="<div class='small'>Extra word"+(d.extra.length>1?"s":"")+" removed: <b>"+d.extra.map(esc).join(", ")+"</b></div>";
  const nb=d.ops.filter(o=>o.s!=="ok").length; el.insertAdjacentHTML("beforeend","<div style='width:100%' class='small'>🟢 correct · "+nb+" word"+(nb>1?"s":"")+" to fix"+"</div>"+note);
}
$("form").addEventListener("submit",e=>{
  e.preventDefault(); let text;
  if(fix){ text=fix.ops.map((o,i)=>{ if(o.s==="ok") return o.w; const inp=$("fixer").querySelector("[data-k='"+i+"']"); return inp.value.trim(); }).filter(Boolean).join(" "); }
  else text=$("ans").value;
  if(!text.trim()) return;
  if(!attempt(text, fix?$("fixer"):$("ans"))){
    if(gaveUp){ fix=null; $("fixer").classList.add("hidden"); $("ans").classList.remove("hidden"); $("ans").value=""; $("ans").focus(); return; }
    const d=Cafe.diagnose(text,cur.answers);
    if(d.okCount>0&&d.ops.length) showFixer(d); else { fix=null; $("fixer").classList.add("hidden"); $("ans").classList.remove("hidden"); $("ans").select(); }
  }
});
$("fb").addEventListener("click",e=>{ if(e.target.id==="giveup"){ gaveUp=true;
  $("fb").innerHTML="<span class='bad'>Aufgegeben</span><br>Answer: <b class='ok'>"+esc(cur.show)+"</b> <span class='small'>— "+(cur.kind==="tiles"?"build it":"type it")+" to continue (no points)</span>";
  if(cur.kind==="tiles"){ built=[]; slots=null; renderTiles(); } else { fix=null; $("fixer").classList.add("hidden"); $("ans").classList.remove("hidden"); $("ans").value=""; $("ans").focus(); } } });
$("next").addEventListener("click",()=>{ qi++; qi<N?question():finish(); });
function finish(){
  $("bar").style.width="100%"; $("count").textContent=N+"/"+N;
  const score=log.reduce((a,q)=>a+q.pts,0), pct=Math.round(score/MAX*100), col=pct>=80?"#2e7d32":pct>=50?"#e09b00":"#d62b2b";
  $("ring").style.setProperty("--p",pct); $("ring").style.setProperty("--col",col);
  $("pct").textContent=pct+"%"; $("pct").style.color=col; $("frac").textContent=fmt(score)+" / "+MAX;
  $("verdict").textContent=(player?player+": ":"")+(pct===100?"Perfekt! Barista-Meister! ☕🍺":pct>=80?"Sehr gut! Ein Kaffee aufs Haus ☕":pct>=60?"Gut – weiter so! 🥨":pct>=40?"Geht so… noch einen Espresso?":"Oje. Zurück in die Schule! 📚");
  let best=0; try{best=+localStorage.getItem("cafeBestPct")||0; if(pct>best){best=pct;localStorage.setItem("cafeBestPct",best);}}catch(e){}
  $("best").textContent=best?"Best on this device: "+best+"%":"";
  $("review").innerHTML=log.map(q=>{ const c=q.pts===MAXQ?1:q.pts>=MAXQ/2?2:3;
    return "<div class='row r"+c+"'><span class='pts'>"+fmt(q.pts)+"/"+MAXQ+"</span><b>"+esc(q.label)+"</b>"+(q.de?" · <i>“"+esc(q.de)+"”</i>":"")+"<br><span class='small'>"+esc(q.prompt)+"</span><br><span class='small'>→ <b>"+esc(q.show)+"</b>"+(q.gaveUp?" (gave up)":"")+"</span>"+(q.wrongs.length?"<br><i class='small'>you tried: "+q.wrongs.map(esc).join(", ")+"</i>":"")+"</div>"; }).join("");
  const t=Date.now(), entry={name:player,score,max:MAX,pct,t};
  show("s-done"); $("lb1").innerHTML="<div class='lbempty'>Saving…</div>";
  submitScore(entry).then(()=>0,()=>1).then(bad=>renderBoard("lb1",t,entry).then(()=>{ if(bad) $("lb1").insertAdjacentHTML("beforeend","<div class='small bad' style='margin-top:6px'>⚠️ The leaderboard script rejected this score (it probably needs the latest Code.gs deployed as a New version).</div>"); }));
}
$("again").addEventListener("click",()=>{renderBoard("lb0");start();});
window.__cur=()=>cur; // test hook
renderBoard("lb0"); show("s-intro");
})();
