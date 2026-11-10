(function(){
const $=id=>document.getElementById(id), N=10, MODULE="regular-verbs", V=window.RVERBS, MAXQ=Reg.MAX, MAX=N*MAXQ;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const fmt=n=>String(Number(n.toFixed(2)));
const KEY="regVerbsTop", URL_=(window.LEADERBOARD_URL||"").trim();
const TL={pra:"Präteritum (simple past)",perf:"Perfekt (present perfect)"};
let player="",sess,qi,cur,si,tries,gaveUp,wrongs,log,steps;
const show=id=>{["s-intro","s-q","s-done"].forEach(s=>$(s).classList.toggle("hidden",s!==id));window.scrollTo(0,0);};
$("vt").innerHTML="<tr><th>Verb</th><th>English</th><th>Präteritum<br><small>er/sie/es</small></th><th>Perfekt<br><small>er/sie/es</small></th></tr>"+V.map(v=>{
  const p=Reg.PERSONS[2]; return "<tr><td class='iv'>"+v[0]+"</td><td class='en'>"+esc(v[1])+"</td><td class='p2'>"+Reg.pra(v,p)+"</td><td class='p3'>"+Reg.perf(v,p)+"</td></tr>"; }).join("");
// leaderboard
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
   b.map((r,k)=>"<tr"+(isMe(r)?" class='me'":"")+"><td>"+(k+1)+"</td><td>"+esc(r.name)+"</td><td>"+fmt(r.score)+"/"+(r.max||MAX)+"</td><td class='pc'>"+r.pct+"%</td></tr>").join("")+"</table>"
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
function start(){ sess=Reg.makeSession(V,N); qi=0; log=[]; question(); }
function question(){
  cur=sess[qi]; cur.res=[]; si=0;
  steps=[{k:"en",base:1,show:cur.v[1]},{k:"form",base:3,show:Reg.answer(cur.v,cur.p,cur.tense)}];
  $("count").textContent=(qi+1)+"/"+N; $("bar").style.width=(qi/N*100)+"%"; $("vn").textContent=(qi+1)+" of "+N;
  $("inf").textContent=cur.v[0]; $("pp").textContent=cur.p.label; const tp=$("tp"); tp.textContent=TL[cur.tense]; tp.className="pp "+(cur.tense==="pra"?"t1":"t2");
  $("doneRows").innerHTML=""; $("next").classList.add("hidden"); $("active").classList.remove("hidden");
  show("s-q"); openStep();
}
function openStep(){
  const s=steps[si]; tries=0; gaveUp=false; wrongs=[];
  $("slab").textContent=s.k==="en"?"What does it mean in English?":"Write the "+(cur.tense==="pra"?"Präteritum":"Perfekt")+" for “"+cur.p.label+"” →";
  $("ans").placeholder=s.k==="en"?"type the English":cur.tense==="pra"?"type the Präteritum form":"type the Perfekt (haben/sein + participle)";
  $("ans").value=""; $("ans").disabled=false; $("check").classList.remove("hidden"); $("fb").innerHTML=""; $("ans").focus();
}
const okStep=(s,v)=>s.k==="en"?Reg.checkEnglish(v,cur.v):Reg.checkForm(v,cur.v,cur.p,cur.tense);
const clueFor=s=>Reg.clue(s.k==="en"?Reg.englishAnswers(cur.v)[0]:s.show);
$("form").addEventListener("submit",e=>{
  e.preventDefault(); const s=steps[si], v=$("ans").value; if(!v.trim()) return;
  tries++;
  if(!okStep(s,v)){
    wrongs.push(v.trim());
    const inp=$("ans"); inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
    let m="<span class='bad'>Nicht ganz ✘ – try again</span>";
    if(gaveUp) m+="<br>Answer: <b class='ok'>"+esc(s.show)+"</b> <span class='small'>— type it in to continue</span>";
    else if(tries>=5) m+="<br><button class='btn' type='button' id='giveup'>Give up – show me the answer</button>";
    else if(tries>=3) m+="<br><span class='small'>Clue:</span> <span class='cl'>"+esc(clueFor(s))+"</span>";
    $("fb").innerHTML=m; inp.select(); return;
  }
  const pts=s.k==="en"?Reg.pointsEn(tries,gaveUp):Reg.pointsForm(tries,gaveUp);
  cur.res.push({k:s.k,base:s.base,pts,tries,gaveUp,wrongs:wrongs.slice(),show:s.show});
  $("doneRows").insertAdjacentHTML("beforeend","<div class='done-row'><div><small>"+(s.k==="en"?"English":cur.tense==="pra"?"Präteritum":"Perfekt")+"</small>"+esc(s.k==="en"?v.trim():cur.p.pron+" "+s.show)+"</div><div>+"+fmt(pts)+"<small>/ "+s.base+"</small></div></div>");
  si++;
  if(si<steps.length) openStep();
  else{ log.push(cur); $("active").classList.add("hidden"); $("next").classList.remove("hidden"); $("next").textContent=qi===N-1?"Ergebnis →":"Weiter →"; $("next").focus(); }
});
$("fb").addEventListener("click",e=>{ if(e.target.id==="giveup"){ gaveUp=true; const s=steps[si];
  $("fb").innerHTML="<span class='bad'>Aufgegeben</span><br>Answer: <b class='ok'>"+esc(s.show)+"</b> <span class='small'>— type it in to continue (no points)</span>"; $("ans").value=""; $("ans").focus(); } });
$("next").addEventListener("click",()=>{ qi++; qi<N?question():finish(); });
function finish(){
  $("bar").style.width="100%"; $("count").textContent=N+"/"+N;
  const all=log.flatMap(q=>q.res), score=all.reduce((a,r)=>a+r.pts,0), pct=Math.round(score/MAX*100);
  const col=pct>=80?"#2e7d32":pct>=50?"#e09b00":"#d62b2b";
  $("ring").style.setProperty("--p",pct); $("ring").style.setProperty("--col",col);
  $("pct").textContent=pct+"%"; $("pct").style.color=col; $("frac").textContent=fmt(score)+" / "+MAX;
  $("verdict").textContent=(player?player+": ":"")+(pct===100?"Perfekt! Verb-Meister! 🛠️🍺":pct>=80?"Sehr gut! Prost! 🍺":pct>=60?"Gut – weiter so! 🥨":pct>=40?"Geht so… noch eine Brezn?":"Oje. Zurück in die Schule! 📚");
  let best=0; try{best=+localStorage.getItem("regVerbsBestPct")||0; if(pct>best){best=pct;localStorage.setItem("regVerbsBestPct",best);}}catch(e){}
  $("best").textContent=best?"Best on this device: "+best+"%":"";
  const sum=f=>log.filter(f).flatMap(q=>q.res).reduce((a,r)=>a+r.pts,0), cnt=f=>log.filter(f).length;
  $("n0").textContent=fmt(sum(()=>true)-0-log.reduce((a,q)=>a+q.res.filter(r=>r.k==="form").reduce((b,r)=>b+r.pts,0),0));
  $("m0").innerHTML="English<br>/ "+N;
  $("n1").textContent=fmt(log.filter(q=>q.tense==="pra").reduce((a,q)=>a+q.res.filter(r=>r.k==="form").reduce((b,r)=>b+r.pts,0),0));
  $("m1").innerHTML="Präteritum<br>/ "+cnt(q=>q.tense==="pra")*3;
  $("n2").textContent=fmt(log.filter(q=>q.tense==="perf").reduce((a,q)=>a+q.res.filter(r=>r.k==="form").reduce((b,r)=>b+r.pts,0),0));
  $("m2").innerHTML="Perfekt<br>/ "+cnt(q=>q.tense==="perf")*3;
  $("review").innerHTML=log.map(q=>{ const p=q.res.reduce((a,r)=>a+r.pts,0), c=p===MAXQ?1:p>=MAXQ/2?2:3, en=q.res[0], fm=q.res[1];
    return "<div class='row r"+c+"'><span class='pts'>"+fmt(p)+"/"+MAXQ+"</span><b style='color:#b00020'>"+q.v[0]+"</b> <i>("+esc(q.v[1])+")</i><br>"+
     "<span class='small'>"+esc(q.p.label)+" · "+(q.tense==="pra"?"Präteritum":"Perfekt")+": <b>"+esc(q.p.pron+" "+fm.show)+"</b> "+(fm.pts===fm.base?"✔":"+"+fmt(fm.pts))+(fm.gaveUp?" (gave up)":"")+"</span>"+
     (en.pts<en.base?"<br><span class='small'>English +"+fmt(en.pts)+(en.gaveUp?" (gave up)":"")+"</span>":"")+
     ((en.wrongs.length||fm.wrongs.length)?"<br><i class='small'>you typed: "+en.wrongs.concat(fm.wrongs).map(esc).join(", ")+"</i>":"")+"</div>"; }).join("");
  const t=Date.now(), entry={name:player,score,max:MAX,pct,t};
  show("s-done"); $("lb1").innerHTML="<div class='lbempty'>Saving…</div>";
  submitScore(entry).catch(()=>{}).then(()=>renderBoard("lb1",t,entry));
}
$("again").addEventListener("click",()=>{renderBoard("lb0");start();});
renderBoard("lb0"); show("s-intro");
})();
