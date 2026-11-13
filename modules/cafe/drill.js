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
function setBubble(reveal){ const t=$("btx"); const hide=listenOn()&&!reveal&&!peeked; t.textContent=hide?"🎧 ••• listen •••":cur.de; t.classList.toggle("hid",hide); $("peek").classList.toggle("hidden",!hide); }
function question(){
  cur=sess[qi]; tries=0; gaveUp=false; wrongs=[]; peeked=false;
  $("count").textContent=(qi+1)+"/"+N; $("bar").style.width=(qi/N*100)+"%"; $("vn").textContent=(qi+1)+" of "+N; $("chip").textContent=cur.label;
  $("doneRows").innerHTML=""; $("next").classList.add("hidden"); $("fb").innerHTML="";
  const hasDe=!!cur.de; $("bub").classList.toggle("hidden",!hasDe);
  if(hasDe){ $("who").textContent=cur.who||"Customer"; $("play").classList.toggle("hidden",!SYN||!cur.speak); setBubble(false); }
  $("prompt").textContent=cur.prompt;
  const mc=cur.kind==="mc"; $("opts").classList.toggle("hidden",!mc); $("active").classList.toggle("hidden",mc);
  if(mc){ $("opts").innerHTML=cur.options.map((o,i)=>"<button class='btn opt' data-i='"+i+"'>"+esc(o)+"</button>").join(""); }
  else{ $("ans").value=""; $("ans").disabled=false; $("ans").placeholder=cur.mode==="digits"?"e.g. 4,90":cur.mode==="english"?"type the English":cur.mode==="article"?"einen / eine / ein":"type it in German"; }
  show("s-q"); if(!mc) $("ans").focus();
  if(cur.de&&cur.speak&&audioOn()) setTimeout(()=>speak(cur.de),150);
}
$("play").addEventListener("click",()=>speak(cur.de));
$("peek").addEventListener("click",()=>{ peeked=true; setBubble(false); });
function finishQ(pts){
  cur.pts=pts; cur.tries=tries; cur.gaveUp=gaveUp; cur.wrongs=wrongs.slice(); log.push(cur);
  if(cur.de) setBubble(true);
  $("active").classList.add("hidden");
  $("doneRows").innerHTML="<div class='done-row'><div><small>Answer</small>"+esc(cur.show)+"</div><div>+"+fmt(pts)+"<small>/ "+MAXQ+"</small></div></div>"+(cur.type==="order"&&cur.de?"":"");
  $("next").classList.remove("hidden"); $("next").textContent=qi===N-1?"Ergebnis →":"Weiter →"; $("next").focus();
}
$("opts").addEventListener("click",e=>{ const b=e.target.closest(".opt"); if(!b||b.disabled) return;
  tries++; const i=+b.dataset.i;
  if(i===cur.correct){ b.classList.add("good"); wrongs.length&&0; $("opts").querySelectorAll(".opt").forEach(x=>x.disabled=true); finishQ(Cafe.points(tries,false)); return; }
  wrongs.push(cur.options[i]); b.classList.add("x"); b.disabled=true;
  if(tries>=3){ gaveUp=true; const g=$("opts").querySelectorAll(".opt")[cur.correct]; g.classList.add("good"); $("opts").querySelectorAll(".opt").forEach(x=>x.disabled=true); finishQ(0); }
});
$("form").addEventListener("submit",e=>{
  e.preventDefault(); const v=$("ans").value; if(!v.trim()) return; tries++;
  if(!Cafe.check(cur,v)){
    wrongs.push(v.trim()); const inp=$("ans"); inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
    let m="<span class='bad'>Nicht ganz ✘ – try again</span>";
    if(gaveUp) m+="<br>Answer: <b class='ok'>"+esc(cur.show)+"</b> <span class='small'>— type it in to continue</span>";
    else if(tries>=5) m+="<br><button class='btn' type='button' id='giveup'>Give up – show me the answer</button>";
    else if(tries>=3) m+="<br><span class='small'>Clue:</span> <span class='cl'>"+esc(Cafe.clue(cur.show))+"</span>";
    $("fb").innerHTML=m; inp.select(); return; }
  finishQ(Cafe.points(tries,gaveUp));
});
$("fb").addEventListener("click",e=>{ if(e.target.id==="giveup"){ gaveUp=true;
  $("fb").innerHTML="<span class='bad'>Aufgegeben</span><br>Answer: <b class='ok'>"+esc(cur.show)+"</b> <span class='small'>— type it in to continue (no points)</span>"; $("ans").value=""; $("ans").focus(); } });
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
renderBoard("lb0"); show("s-intro");
})();
