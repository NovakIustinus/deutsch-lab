(function(){
const $=id=>document.getElementById(id), N=10, ART={m:"der",f:"die",n:"das"};
const NOTE=["Nominativ = the subject: who/what does the verb.",
 "Akkusativ = the direct object: who/what gets acted on (I see the dog → den Hund). Only masculine changes: der→den, ein→einen.",
 "Dativ = the indirect object: to/for whom (I give the dog a bone → dem Hund). Feminine → der, masc/neut → dem."];
const PTS=[1,0.5];
let gaveUp=false,gaveUpE=false,player="",sess,i,log,gOk,eOk,tries,engTries,wrongTaps,wrongTyped;
function show(id){["s-intro","s-gender","s-case","s-done"].forEach(s=>$(s).classList.toggle("hidden",s!==id));window.scrollTo(0,0);}
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1);
const KEY="caseDrillBoard";
function loadBoard(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
function saveBoard(b){try{localStorage.setItem(KEY,JSON.stringify(b));}catch(e){}}
function renderBoard(id,hl){
  const b=loadBoard().slice().reverse();
  $(id).innerHTML=b.length?"<table class='lb'><tr><th>#</th><th>Name</th><th>Score</th><th style='text-align:right'>%</th></tr>"+
    b.map((r,k)=>"<tr"+(r.t===hl?" class='me'":"")+"><td>"+(k+1)+"</td><td>"+esc(r.name)+"</td><td>"+fmt(r.score)+"/"+N+"</td><td class='pc'>"+r.pct+"%</td></tr>").join("")+"</table>"
    :"<div class='lbempty'>Nobody yet — be the first!</div>";
}
function nameOk(){ return $("name").value.trim().length>0; }
$("name").addEventListener("input",()=>{ $("go").disabled=!nameOk(); });
$("name").addEventListener("keydown",e=>{ if(e.key==="Enter"&&nameOk()){e.preventDefault();begin();} });
try{ $("name").value=localStorage.getItem("caseDrillName")||""; }catch(e){}
$("go").disabled=!nameOk();
function begin(){ player=$("name").value.trim(); try{localStorage.setItem("caseDrillName",player);}catch(e){} start(); }
function start(){sess=Drill.makeSession(window.WORDS,N);i=0;log=[];round();}
function round(){
  const q=sess[i]; wrongTaps=0; gOk=false; eOk=false; engTries=0; gaveUpE=false;
  $("count").textContent=(i+1)+"/"+N; $("bar").style.width=(i/N*100)+"%";
  $("noun1").textContent=q.noun; $("gtip").textContent=""; $("etip").textContent="";
  $("eng").value=""; $("eng").disabled=false; $("engbtn").disabled=false;
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
  if(Drill.checkEnglish(v,q.noun,q.english)){ eOk=true; $("eng").disabled=true; $("engbtn").disabled=true; $("etip").textContent="✔ "+q.english; maybeGo(); }
  else{ engTries++; const e=$("eng"); e.classList.remove("shake"); void e.offsetWidth; e.classList.add("shake");
    if(gaveUpE) $("etip").innerHTML="Not quite — answer: <b>"+esc(q.english)+"</b>, type it in";
    else if(engTries>=5) $("etip").innerHTML="Not quite. <button class='btn' type='button' id='giveupE' style='padding:.3em .8em;font-size:.85rem'>Give up – show me</button>";
    else $("etip").textContent="Not quite – try again"+(engTries>=2?" (starts with “"+Drill.englishAnswers(q.noun,q.english)[0].slice(0,engTries>=4?3:1)+"…”)":""); }
}
$("engbtn").addEventListener("click",checkEng);
$("eng").addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault();checkEng();} });
function maybeGo(){ if(gOk&&eOk) setTimeout(toCase,700); else if(gOk) $("eng").focus(); }
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
  const pts=PTS[tries-1]||0;
  log.push({q,tries,pts,wrong:wrongTyped.slice()});
  $("ans").disabled=true; $("check").classList.add("hidden");
  $("resline").innerHTML="<span class='ok'>Richtig! ✔ "+q.answer+" "+q.noun+"</span><br><span class='small'>"+(pts===1?"+1 point":pts?"+½ point (second try)":"no point")+"</span>";
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
  const score=log.reduce((a,l)=>a+l.pts,0), pct=Math.round(score/N*100);
  const col=pct>=80?"#2e7d32":pct>=50?"#e09b00":"#d62b2b";
  $("ring").style.setProperty("--p",pct); $("ring").style.setProperty("--col",col);
  $("pct").textContent=pct+"%"; $("pct").style.color=col; $("frac").textContent=fmt(score)+" / "+N;
  $("verdict").textContent=(player?player+": ":"")+pct===100?"Perfekt! Du bist ein echter Bayer! 🥨🍺":pct>=80?"Sehr gut! Prost! 🍺":pct>=60?"Gut – weiter so! 🥨":pct>=40?"Geht so… noch eine Brezn?":"Oje. Zurück in die Schule! 📚";
  let best=0; try{best=+localStorage.getItem("caseDrillBestPct")||0; if(pct>best){best=pct;localStorage.setItem("caseDrillBestPct",best);}}catch(e){}
  $("best").textContent=best?"Best on this device: "+best+"%":"";
  $("n1").textContent=log.filter(l=>l.tries===1).length; $("n2").textContent=log.filter(l=>l.tries===2).length; $("n3").textContent=log.filter(l=>l.tries>2).length;
  $("cs").innerHTML=Drill.CASES.map((c,k)=>{const L=log.filter(l=>l.q.caseIdx===k);
    return "<div class='c"+k+"'><b>"+(L.length?fmt(L.reduce((a,l)=>a+l.pts,0))+"/"+L.length:"–")+"</b><span>"+c+"</span></div>";}).join("");
  $("review").innerHTML=log.map(l=>{const q=l.q, r=l.tries===1?1:l.tries===2?2:3;
    return "<div class='row r"+r+"'><span class='pts'>"+(l.pts===1?"+1":l.pts?"+½":"0")+"</span>"
     +"<b>"+Drill.CASES[q.caseIdx]+"</b> · <span style='color:var(--"+q.gender+");font-weight:800'>"+ART[q.gender]+" "+q.noun+"</span> <i>("+esc(q.english)+")</i><br>"
     +"“"+q.det.label+" "+q.english+"” → <b>"+q.answer+" "+q.noun+"</b>"
     +(l.wrong.length?"<br><i>you typed: "+l.wrong.map(esc).join(", ")+"</i>":"")+"</div>";}).join("");
  const t=Date.now(), board=loadBoard(); board.push({name:player,score,pct,t}); saveBoard(board.slice(-10));
  renderBoard("lb1",t);
  show("s-done");
}
$("go").addEventListener("click",begin);
$("again").addEventListener("click",()=>{renderBoard("lb0");start();});
$("count").textContent="–"; renderBoard("lb0"); show("s-intro");
})();
