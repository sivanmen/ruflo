const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:8765/reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
for(const t of process.argv.slice(2).map(Number)){await p.evaluate(t=>render(t),t);await p.screenshot({path:`snaps/t${t.toFixed(2)}.jpg`,type:'jpeg',quality:80});}
console.log(errs.join('\n')||'no errors');await b.close();})();
