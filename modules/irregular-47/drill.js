(function(){
const $=id=>document.getElementById(id), N=10, MODULE="irregular47", V=window.VERBS;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const fmt=n=>String(Number(n.toFixed(2)));
const KEY="irr47Top", URL_=(window.LEADERBOARD_URL||"").trim();
let player="",sess,vi,steps,si,tries,gaveUp,wrongs,log,cur;
const show=id=>{["s-intro","s-verb","s-done"].forEach(s=>$(s).classList.toggle("hidden",s!==id));window.scrollTo(0,0);};
// reference table
$("vt").innerHTML="<tr><th>Verb</th><th>English</th><th>Präsens<br><small>present</small></th><th>Präteritum<br><small>simple past</small></th><th>Perfekt<br><small>pres. perfect</small></th></tr>"+V.map((v,k)=>
 "<tr><td class='iv'>"+v[0]+"</td><td class='en'>"+esc(v[1])+"</td><td class='p1'>"+v[2]+"</td><td class='p2'>"+(v[3]||"–")+"</td><td class='p3'>"+(v[4]?v[4].join(" / "):"–")+"</td></tr>").join("");
// leaderboard (shared via Apps Script, or local fallback)
const top10=a=>a.slice().sort((x,y)=>y.pct-x.pct||y.score-x.score||x.t-y.t).slice(0,10);
function localBoard(){try{return top10(JSON.parse(localStorage.getItem(KEY))||[]);}catch(e){return [];}}
async function getBoard(){ if(!URL_) return localBoard();
  const r=await fetch(URL_+"?module="+MODULE+"&_="+Date.now()); if(!r.ok) throw new Error("http"); return top10(await r.json()); }
async function submitScore(e){
  if(!URL_){ try{localStorage.setItem(KEY,JSON.stringify(top10(localBoard().concat(e))));}catch(x){} return; }
  await fetch(URL_,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({module:MODULE},e))});
}
async function renderBoard(id,hl,mine){
  const el=$(id); el.innerHTML="<div class='lbempty'>Loading…</div>"; let b;
  try{ b=await getBoard(); }catch(e){ el.innerHTML="<div class='lbempty'>Leaderboard offline — try again later.</div>"; return; }
  const isMe=r=>hl&&r.t===hl;
  let h=b.length?"<table class='lb'><tr><th>#</th><th>Name</th><th>Score</th><th style='text-align:right'>%</th></tr>"+
   b.map((r,k)=>"<tr"+(isMe(r)?" class='me'":"")+"><td>"+(k+1)+"</td><td>"+esc(r.name)+"</td><td>"+fmt(r.score)+"/"+(r.max||100)+"</td><td class='pc'>"+r.pct+"%</td></tr>").join("")+"</table>"
   :"<div class='lbempty'>Nobody yet — be the first!</div>";
  if(mine) h+=b.some(isMe)?"<div class='small'>🎉 You’re on the board!</div>":"<div class='small'>Your run: "+fmt(mine.score)+"/"+mine.max+" — not in the top 10 this time.</div>";
  el.innerHTML=h;
}
// name + start
const GO=document.querySelectorAll(".go"), nameOk=()=>$("name").value.trim().length>0, setGo=()=>GO.forEach(b=>b.disabled=!nameOk());
$("name").addEventListener("input",setGo);
$("name").addEventListener("keydown",e=>{ if(e.key==="Enter"&&nameOk()){e.preventDefault();begin();} });
try{ $("name").value=localStorage.getItem("caseDrillName")||""; }catch(e){}
setGo();
function begin(){ player=$("name").value.trim(); try{localStorage.setItem("caseDrillName",player);}catch(e){} start(); }
GO.forEach(b=>b.addEventListener("click",()=>{ if(nameOk()) begin(); }));
// session
function start(){ sess=Irr.makeSession(V,N); vi=0; log=[]; verb(); }
function verb(){
  cur=sess[vi]; steps=Irr.steps(cur); si=0; cur._res=[];
  $("count").textContent=(vi+1)+"/"+N; $("bar").style.width=(vi/N*100)+"%"; $("vn").textContent=(vi+1)+" of "+N;
  $("inf").textContent=cur[0]; $("doneRows").innerHTML=""; $("next").classList.add("hidden"); $("active").classList.remove("hidden");
  show("s-verb"); openStep();
}
function openStep(){
  const s=steps[si]; tries=0; gaveUp=false; wrongs=[];
  $("slab").textContent=s.k==="en"?"What does it mean in English?":s.label+" →";
  $("ans").placeholder=s.k==="en"?"type the English":s.k==="pf"?"e.g. hat gemacht":"type the German form";
  $("ans").value=""; $("ans").disabled=false; $("check").classList.remove("hidden"); $("fb").innerHTML=""; $("ans").focus();
}
$("form").addEventListener("submit",e=>{
  e.preventDefault(); const s=steps[si], v=$("ans").value; if(!v.trim()) return;
  tries++;
  if(!Irr.check(cur,s,v)){
    wrongs.push(v.trim());
    const inp=$("ans"); inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
    let m="<span class='bad'>Nicht ganz ✘ – try again</span>";
    if(gaveUp) m+="<br>Answer: <b class='ok'>"+esc(s.show)+"</b> <span class='small'>— type it in to continue</span>";
    else if(tries>=5) m+="<br><button class='btn' type='button' id='giveup'>Give up – show me the answer</button>";
    else if(tries>=3) m+="<br><span class='small'>Clue:</span> <span class='cl'>"+esc(Irr.clue(cur,s))+"</span>";
    $("fb").innerHTML=m; inp.select(); return;
  }
  const pts=Irr.points(s.base,tries,gaveUp);
  cur._res.push({k:s.k,label:s.label,base:s.base,pts,tries,gaveUp,wrongs:wrongs.slice(),show:s.show});
  $("doneRows").insertAdjacentHTML("beforeend","<div class='done-row'><div><small>"+esc(s.k==="en"?"English":s.label)+"</small>"+esc(s.k==="en"?v.trim():s.show)+"</div><div>+"+fmt(pts)+"<small>/ "+s.base+"</small></div></div>");
  si++;
  if(si<steps.length){ openStep(); }
  else{ log.push(cur); $("active").classList.add("hidden"); $("next").classList.remove("hidden"); $("next").textContent=vi===N-1?"Ergebnis →":"Weiter →"; $("next").focus(); }
});
$("fb").addEventListener("click",e=>{ if(e.target.id==="giveup"){ gaveUp=true; const s=steps[si];
  $("fb").innerHTML="<span class='bad'>Aufgegeben</span><br>Answer: <b class='ok'>"+esc(s.show)+"</b> <span class='small'>— type it in to continue (no points)</span>"; $("ans").value=""; $("ans").focus(); } });
$("next").addEventListener("click",()=>{ vi++; vi<N?verb():finish(); });
function finish(){
  $("bar").style.width="100%"; $("count").textContent=N+"/"+N;
  const all=log.flatMap(v=>v._res), score=all.reduce((a,r)=>a+r.pts,0), max=log.reduce((a,v)=>a+Irr.maxFor(v),0), pct=Math.round(score/max*100);
  const col=pct>=80?"#2e7d32":pct>=50?"#e09b00":"#d62b2b";
  $("ring").style.setProperty("--p",pct); $("ring").style.setProperty("--col",col);
  $("pct").textContent=pct+"%"; $("pct").style.color=col; $("frac").textContent=fmt(score)+" / "+max;
  $("verdict").textContent=(player?player+": ":"")+(pct===100?"Perfekt! Samurai-Meister! ⚔️🍺":pct>=80?"Sehr gut! Prost! 🍺":pct>=60?"Gut – weiter so! 🥨":pct>=40?"Geht so… noch eine Brezn?":"Oje. Zurück in die Schule! 📚");
  let best=0; try{best=+localStorage.getItem("irr47BestPct")||0; if(pct>best){best=pct;localStorage.setItem("irr47BestPct",best);}}catch(e){}
  $("best").textContent=best?"Best on this device: "+best+"%":"";
  ["en","pr","pa","pf"].forEach((k,i)=>{ const R=all.filter(r=>r.k===k); $("n"+i).textContent=fmt(R.reduce((a,r)=>a+r.pts,0)); $("m"+i).innerHTML=["English","Präsens (present)","Präteritum (simple past)","Perfekt (present perfect)"][i]+"<br>/ "+R.reduce((a,r)=>a+r.base,0); });
  $("review").innerHTML=log.map(v=>{ const p=v._res.reduce((a,r)=>a+r.pts,0), m=Irr.maxFor(v), c=p===m?1:p>=m/2?2:3;
    return "<div class='row r"+c+"'><span class='pts'>"+fmt(p)+"/"+m+"</span><b style='color:#b00020'>"+v[0]+"</b> <i>("+esc(v[1])+")</i><br>"+
     v._res.map(r=>"<span class='small'>"+(r.k==="en"?"EN":r.k==="pr"?"Präs":r.k==="pa"?"Prät":"Perf")+": <b>"+esc(r.show)+"</b> "+(r.pts===r.base?"✔":"+"+fmt(r.pts))+(r.gaveUp?" (gave up)":"")+"</span>").join("<br>")+
     (v._res.some(r=>r.wrongs.length)?"<br><i class='small'>you typed: "+v._res.flatMap(r=>r.wrongs).map(esc).join(", ")+"</i>":"")+"</div>"; }).join("");
  const t=Date.now(), entry={name:player,score,max,pct,t};
  show("s-done"); $("lb1").innerHTML="<div class='lbempty'>Saving…</div>";
  submitScore(entry).catch(()=>{}).then(()=>renderBoard("lb1",t,entry));
}
$("again").addEventListener("click",()=>{renderBoard("lb0");start();});
renderBoard("lb0"); show("s-intro");
})();
