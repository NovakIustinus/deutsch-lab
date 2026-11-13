const C=require("../modules/cafe/logic.js"), D=require("../modules/cafe/menu.js");
let f=0; const ok=(c,m)=>{ if(!c){f++;console.log("FAIL",m);} };
ok(C.num(21)==="einundzwanzig","21"); ok(C.num(1,true)==="eins","1s"); ok(C.num(30)==="dreißig","30");
ok(C.priceShow(490)==="vier Euro neunzig","490"); ok(C.priceShow(100)==="ein Euro","100"); ok(C.priceShow(1280)==="zwölf Euro achtzig","1280");
ok(C.checkPrice("Das macht vier Euro neunzig.",490),"p1"); ok(C.checkPrice("vier neunzig",490),"p2"); ok(C.checkPrice("vier Euro und neunzig Cent",490),"p3");
ok(C.checkPrice("sechs Euro dreissig",630),"ss"); ok(!C.checkPrice("vier Euro achtzig",490),"neg"); ok(C.checkPrice("fünf Euro",500),"whole");
ok(C.checkPrice("einundzwanzig Euro zehn",2110),"21"); ok(C.checkPrice("fuenf euro",500),"ue");
ok(C.checkDigits("4,90",490)&&C.checkDigits("4.90 €",490)&&C.checkDigits("12,8",1280)&&!C.checkDigits("abc",1),"digits");
const asks=D.ask[0]; ok(C.check({mode:"phrase",answers:asks.a},"was darf es sein")&&C.check({mode:"phrase",answers:asks.a},"Was möchten Sie??")&&!C.check({mode:"phrase",answers:asks.a},"hallo"),"phrase");
ok(C.check({mode:"phrase",answers:D.ask[12].a},"Danke, schoenen Tag noch"),"ae");
ok(C.check({mode:"english",answers:["scrambled eggs"]},"scrambled egs"),"lev"); ok(!C.check({mode:"english",answers:["cheese"]},"chese x"),"neg en");
ok(C.points(1,false)===4&&C.points(2,false)===2&&C.points(3,false)===1&&C.points(4,false)===0&&C.points(1,true)===0,"pts");
// sessions: 500 random rounds
let seed=1; const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
for(let i=0;i<500;i++){ const s=C.makeSession(rnd); ok(s.length===10,"len");
 s.forEach(q=>{ ok(q.prompt&&q.show,"q "+q.type);
  if(q.kind==="mc"){ ok(q.options.length===4&&new Set(q.options).size===4&&q.options[q.correct]===q.show,"mc "+JSON.stringify(q)); ok(/[A-ZÄ]/.test(q.de[0]),"cap"); }
  else { ok(C.check(q,q.show),"self "+q.type+" "+q.show);
    if(q.mode==="price"){ ok(q.cents>0&&q.cents%10===0,"cents "+q.cents); } } });
 const by=t=>s.filter(q=>q.type===t).length; ok(by("order")===2&&by("ask")===2&&by("vocab")===2,"mix");
 ok(new Set(s.filter(q=>q.type==="vocab").map(q=>q.de)).size===2,"dupe vocab");
}
// change math
for(let i=0;i<200;i++){ const q=C.priceQuestion("change",rnd); const m=q.prompt.match(/order is ([\d,]+) €/); const t=Math.round(parseFloat(m[1].replace(",","."))*100); const pay=q.de.match(/sind (\S+) Euro/)[1]; const P={fünf:500,zehn:1000,zwanzig:2000,fünfzig:5000}[pay]; ok(P&&P-t===q.cents&&q.cents>0,"change "+q.prompt+q.de); }
// sample lines
for(let i=0;i<6;i++){ const q=C.orderQuestion(rnd); console.log(q.de," => ",q.show); }
console.log(f?f+" FAILURES":"cafe logic OK");
process.exit(f?1:0);
