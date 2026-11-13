(function(){
const $=id=>document.getElementById(id), N=10, ART={m:"der",f:"die",n:"das"};
const NOTE=["Nominativ = the subject: who/what does the verb.",
 "Akkusativ = the direct object: who/what gets acted on (I see the dog → den Hund). Only masculine changes: der→den, ein→einen.",
 "Dativ = the indirect object: to/for whom (I give the dog a bone → dem Hund). Feminine → der, masc/neut → dem."];
const PTS=[5,3,1], PPTS=[2,1,0.5], BASE=7;
let MAX=N*BASE;
let gaveUp=false,gaveUpE=false,gaveUpP=false,pOk=true,plTries=0,player="",sess,i,log,gOk,eOk,tries,engTries,wrongTaps,wrongTyped;
function show(id){["s-intro","s-gender","s-case","s-done"].forEach(s=>$(s).classList.toggle("hidden",s!==id));window.scrollTo(0,0);}
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const fmt=n=>String(Number(n.toFixed(2)));
const KEY="caseDrillTop70", URL_=(window.LEADERBOARD_URL||"").trim();
const top10=a=>a.slice().sort((x,y)=>y.pct-x.pct||y.score-x.score||x.t-y.t).slice(0,10);
function localBoard(){try{return top10(JSON.parse(localStorage.getItem(KEY))||[]);}catch(e){return [];}}
async function getBoard(){
  if(!URL_) return localBoard();
  const r=await fetch(URL_+"?module=case-drill&_="+Date.now()); if(!r.ok) throw new Error("http"); return top10(await r.json());
}
async function submitScore(entry){
  if(!URL_){ try{localStorage.setItem(KEY,JSON.stringify(top10(localBoard().concat(entry))));}catch(e){} return; }
  const r=await fetch(URL_,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({module:"case-drill"},entry))}); let j=null; try{j=await r.json();}catch(x){} if(j&&j.ok===false) throw new Error("rejected");
}
async function renderBoard(id,hl,mine){
  const el=$(id); el.innerHTML="<div class='lbempty'>Loading…</div>";
  let b; try{ b=await getBoard(); }catch(e){ el.innerHTML="<div class='lbempty'>Leaderboard offline — try again later.</div>"; return; }
  const isMe=r=>hl&&r.t===hl;
  let html=b.length?"<table class='lb'><tr><th>#</th><th>Name</th><th>Score</th><th style='text-align:right'>%</th></tr>"+
    b.map((r,k)=>"<tr"+(isMe(r)?" class='me'":"")+"><td>"+(k+1)+"</td><td>"+esc(r.name)+"</td><td>"+fmt(r.score)+"/"+(r.max||30)+"</td><td class='pc'>"+r.pct+"%</td></tr>").join("")+"</table>"
    :"<div class='lbempty'>Nobody yet — be the first!</div>";
  if(mine){ html+= b.some(isMe)?"<div class='small'>🎉 You’re on the board!</div>":"<div class='small'>Your run: "+fmt(mine.score)+"/"+MAX+" — not in the top 10 this time.</div>"; }
  el.innerHTML=html;
}
function nameOk(){ return $("name").value.trim().length>0; }
const GO=document.querySelectorAll(".go"); const setGo=()=>GO.forEach(b=>b.disabled=!nameOk());
$("name").addEventListener("input",setGo);
$("name").addEventListener("keydown",e=>{ if(e.key==="Enter"&&nameOk()){e.preventDefault();begin();} });
try{ $("name").value=localStorage.getItem("caseDrillName")||""; }catch(e){}
setGo();
function begin(){ player=$("name").value.trim(); try{localStorage.setItem("caseDrillName",player);}catch(e){} start(); }
function start(){sess=Drill.makeSession(window.WORDS,N);i=0;log=[];sess.forEach(q=>{q.hasPl=!!Drill.plurals(q.noun);q.per=BASE+(q.hasPl?PPTS[0]:0);});MAX=sess.reduce((a,q)=>a+q.per,0);round();}
function round(){
  const q=sess[i]; wrongTaps=0; gOk=false; eOk=false; engTries=0; gaveUpE=false;
  $("count").textContent=(i+1)+"/"+N; $("bar").style.width=(i/N*100)+"%";
  $("noun1").textContent=q.noun; $("gtip").textContent=""; $("etip").textContent="";
  $("eng").value=""; $("eng").disabled=false; $("engbtn").disabled=false;
  pOk=!q.hasPl; plTries=0; gaveUpP=false; $("ptip").textContent=""; $("plu").value=""; $("plu").disabled=false; $("plu").classList.toggle("hidden",!q.hasPl);
  $("gtitle").textContent=q.hasPl?"Gender + English + plural (all needed to continue)":"Gender + English (both needed to continue)";
  document.querySelectorAll(".g").forEach(b=>{b.disabled=false;b.classList.remove("done","dim");});
  show("s-gender");
}
document.querySelectorAll(".g").forEach(b=>b.addEventListener("click",()=>{
  const q=sess[i]; if(gOk)return;
  if(b.dataset.g===q.gender){ gOk=true; document.querySelectorAll(".g").forEach(x=>{x.classList.add(x===b?"done":"dim");x.disabled=true;});
    $("gtip").textContent="✔ "+ART[q.gender]+" "+q.noun; maybeGo(); }
  else{ wrongTaps++; b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
    b.disabled=true; $("gtip").textContent="Nee! Nochmal… ("+wrongTaps+" daneben)"; }
}));
function checkEng(){
  const q=sess[i]; if(eOk)return; const v=$("eng").value; if(!v.trim())return;
  if(Drill.checkEnglish(v,q.noun,q.english)){ eOk=true; $("eng").disabled=true; $("engbtn").disabled=pOk; $("etip").textContent="✔ "+q.english; maybeGo(); }
  else{ engTries++; const e=$("eng"); e.classList.remove("shake"); void e.offsetWidth; e.classList.add("shake");
    if(gaveUpE) $("etip").innerHTML="Not quite — answer: <b>"+esc(q.english)+"</b>, type it in";
    else if(engTries>=5) $("etip").innerHTML="Not quite. <button class='btn' type='button' id='giveupE' style='padding:.3em .8em;font-size:.85rem'>Give up – show me</button>";
    else $("etip").textContent="Not quite – try again"+(engTries>=2?" (starts with “"+Drill.englishAnswers(q.noun,q.english)[0].slice(0,engTries>=4?3:1)+"…”)":""); }
}
$("engbtn").addEventListener("click",()=>{ if(eOk||document.activeElement===$("plu")) checkPlu(); else checkEng(); });
$("eng").addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault();checkEng();} });
function checkPlu(){
  const q=sess[i]; if(pOk) return; const v=$("plu").value; if(!v.trim()) return;
  if(Drill.checkPlural(v,q.noun)){ pOk=true; $("plu").disabled=true; $("ptip").textContent="✔ die "+Drill.plurals(q.noun)[0]+(Drill.plurals(q.noun).length>1?" (also: "+Drill.plurals(q.noun).slice(1).join(", ")+")":""); maybeGo(); return; }
  plTries++; const e=$("plu"); e.classList.remove("shake"); void e.offsetWidth; e.classList.add("shake"); const ans=Drill.plurals(q.noun)[0];
  if(gaveUpP) $("ptip").innerHTML="Not quite — answer: <b>die "+esc(ans)+"</b>, type it in";
  else if(plTries>=5) $("ptip").innerHTML="Not quite. <button class='btn' type='button' id='giveupP' style='padding:.3em .8em;font-size:.85rem'>Give up – show me</button>";
  else if(plTries>=3) $("ptip").innerHTML="Not quite. Clue: <b>die "+esc(ans[0]+"_".repeat(ans.length-1))+"</b> <span class='small'>("+esc(Drill.pluralHint(q.noun))+")</span>";
  else if(plTries>=2) $("ptip").innerHTML="Not quite – hint: "+esc(Drill.pluralHint(q.noun));
  else $("ptip").textContent="Not quite – try again";
}
$("plu").addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault();checkPlu();} });
$("ptip").addEventListener("click",e=>{ if(e.target.id==="giveupP"){ gaveUpP=true; const q=sess[i]; $("ptip").innerHTML="Answer: <b>die "+esc(Drill.plurals(q.noun)[0])+"</b> — type it in to continue"; $("plu").value=""; $("plu").focus(); } });
function maybeGo(){ if(gOk&&eOk&&pOk) setTimeout(toCase,700); else if(gOk&&!eOk) $("eng").focus(); else if(gOk&&eOk&&!pOk) $("plu").focus(); }
function toCase(){
  tries=0; wrongTyped=[]; gaveUp=false;
  const q=sess[i], gp=$("gpill"); gp.textContent=ART[q.gender]+" "+q.noun; gp.style.background="var(--"+q.gender+")";
  const cp=$("casepill"); cp.textContent=Drill.CASES[q.caseIdx]; cp.className="pill c"+q.caseIdx;
  $("engbig").innerHTML="<b>"+q.det.label+"</b> "+q.english;
  $("casenote").textContent=NOTE[q.caseIdx];
  $("prompt").innerHTML="“<span class='blank'>&nbsp;?&nbsp;</span> "+q.noun+"”";
  $("ans").value=""; $("ans").disabled=false; $("check").classList.remove("hidden"); $("result").classList.add("hidden"); $("next").classList.remove("hidden");
  show("s-case"); $("ans").focus();
}
function hint(q){ // light nudge: the stem, so only the ending is left to work out
  return q.det.stem===null ? "Hint: it’s a der/die/das word — it starts with “d”."
   : "Hint: it’s the “"+q.det.stem+"” family — the stem is right, so what ending does "+ART[q.gender]+" take in "+Drill.CASES[q.caseIdx]+"?";
}
$("form").addEventListener("submit",e=>{
  e.preventDefault(); const q=sess[i], v=$("ans").value; if(!v.trim())return;
  tries++;
  if(!Drill.check(v,q.answer,q.noun)){
    wrongTyped.push(v.trim());
    const inp=$("ans"); inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
    let msg="<span class='bad'>Nicht ganz ✘ – try again</span>";
    if(gaveUp) msg+="<br>Answer: <b class='ok'>"+q.answer+"</b> <span class='small'>— type it in to continue</span>";
    else if(tries>=5) msg+="<br><button class='btn' type='button' id='giveup'>Give up – show me the answer</button>";
    else if(tries>=2) msg+="<br><span class='small'>"+hint(q)+"</span>";
    $("resline").innerHTML=msg; $("result").classList.remove("hidden"); $("next").classList.add("hidden");
    inp.select(); return;
  }
  const cp=PTS[tries-1]||0, gp=wrongTaps===0?1:0, ep=engTries===0?1:0, pp=!q.hasPl||gaveUpP?0:(PPTS[plTries]||0), pts=gp+ep+cp+pp;
  log.push({q,tries,cp,gp,ep,pp,plTries,pts,wrong:wrongTyped.slice()});
  $("ans").disabled=true; $("check").classList.add("hidden");
  $("resline").innerHTML="<span class='ok'>Richtig! ✔ "+q.answer+" "+q.noun+"</span><br><span class='small'>"+"Gender +"+fmt(gp)+" · English +"+fmt(ep)+(q.hasPl?" · Plural +"+fmt(pp):"")+" · Case +"+fmt(cp)+" = <b>"+fmt(pts)+"</b> / "+q.per+"</span>";
  $("next").classList.remove("hidden"); $("next").textContent=i===N-1?"Ergebnis →":"Weiter →";
  $("result").classList.remove("hidden"); $("next").focus();
});
$("resline").addEventListener("click",e=>{ if(e.target.id==="giveup"){ gaveUp=true; const q=sess[i];
  $("resline").innerHTML="<span class='bad'>Aufgegeben</span><br>Answer: <b class='ok'>"+q.answer+"</b> <span class='small'>— type it in to continue (no point)</span>"; $("ans").value=""; $("ans").focus(); } });
$("etip").addEventListener("click",e=>{ if(e.target.id==="giveupE"){ gaveUpE=true; const q=sess[i];
  $("etip").innerHTML="Answer: <b>"+esc(q.english)+"</b> — type it in to continue"; $("eng").value=""; $("eng").focus(); } });
$("next").addEventListener("click",()=>{ i++; i<N?round():done(); });
function done(){
  $("bar").style.width="100%"; $("count").textContent=N+"/"+N;
  const score=log.reduce((a,l)=>a+l.pts,0), pct=Math.round(score/MAX*100);
  const col=pct>=80?"#2e7d32":pct>=50?"#e09b00":"#d62b2b";
  $("ring").style.setProperty("--p",pct); $("ring").style.setProperty("--col",col);
  $("pct").textContent=pct+"%"; $("pct").style.color=col; $("frac").textContent=fmt(score)+" / "+MAX;
  $("verdict").textContent=(player?player+": ":"")+(pct===100?"Perfekt! Du bist ein echter Bayer! 🥨🍺":pct>=80?"Sehr gut! Prost! 🍺":pct>=60?"Gut – weiter so! 🥨":pct>=40?"Geht so… noch eine Brezn?":"Oje. Zurück in die Schule! 📚");
  let best=0; try{best=+localStorage.getItem("caseDrillBestPct")||0; if(pct>best){best=pct;localStorage.setItem("caseDrillBestPct",best);}}catch(e){}
  $("best").textContent=best?"Best on this device: "+best+"%":"";
  const sum=k=>fmt(log.reduce((a,l)=>a+l[k],0));
  $("n1").textContent=sum("gp"); $("n2").textContent=sum("ep"); $("n3").textContent=sum("cp"); $("n4").textContent=sum("pp"); $("m4").innerHTML="Plural<br>/ "+log.filter(l=>l.q.hasPl).length*PPTS[0];
  const cnt=f=>log.filter(f).length;
  $("tryline").textContent="Case answers — 1st try: "+cnt(l=>l.tries===1)+" · 2nd: "+cnt(l=>l.tries===2)+" · 3rd: "+cnt(l=>l.tries===3)+" · 4+: "+cnt(l=>l.tries>3);
  $("cs").innerHTML=Drill.CASES.map((c,k)=>{const L=log.filter(l=>l.q.caseIdx===k);
    return "<div class='c"+k+"'><b>"+(L.length?fmt(L.reduce((a,l)=>a+l.pts,0))+"/"+L.reduce((a,l)=>a+l.q.per,0):"–")+"</b><span>"+c+"</span></div>";}).join("");
  $("review").innerHTML=log.map(l=>{const q=l.q, PER=q.per, r=l.pts===PER?1:l.pts>=PER/2?2:3;
    return "<div class='row r"+r+"'><span class='pts'>"+fmt(l.pts)+"/"+PER+"</span>"
     +"<b>"+Drill.CASES[q.caseIdx]+"</b> · <span style='color:var(--"+q.gender+");font-weight:800'>"+ART[q.gender]+" "+q.noun+"</span> <i>("+esc(q.english)+")</i><br>"
     +"“"+q.det.label+" "+q.english+"” → <b>"+q.answer+" "+q.noun+"</b><br><span class='small'>G "+fmt(l.gp)+" · E "+fmt(l.ep)+(q.hasPl?" · P "+fmt(l.pp)+" (die "+Drill.plurals(q.noun)[0]+")":"")+" · C "+fmt(l.cp)+"</span>"
     +(l.wrong.length?"<br><i>you typed: "+l.wrong.map(esc).join(", ")+"</i>":"")+"</div>";}).join("");
  const t=Date.now(), entry={name:player,score,max:MAX,pct,t};
  show("s-done"); $("lb1").innerHTML="<div class='lbempty'>Saving…</div>";
  submitScore(entry).then(()=>0,()=>1).then(bad=>renderBoard("lb1",t,entry).then(()=>{ if(bad) $("lb1").insertAdjacentHTML("beforeend","<div class='small bad' style='margin-top:6px'>⚠️ The leaderboard script rejected this score (it probably needs the latest Code.gs deployed as a New version).</div>"); }));
}
GO.forEach(b=>b.addEventListener("click",()=>{ if(nameOk()) begin(); }));
$("again").addEventListener("click",()=>{renderBoard("lb0");start();});
$("count").textContent="–"; renderBoard("lb0"); show("s-intro");
})();
