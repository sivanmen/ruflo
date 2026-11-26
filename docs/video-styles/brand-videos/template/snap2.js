// usage: node snap2.js timings.json t1 t2 ...  -> snaps/oNN.png (overlay only)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [TJ,...ts]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(`window.T=${fs.readFileSync(TJ,'utf8')}`);
await p.goto('http://127.0.0.1:8766/ov.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
for(const t of ts){await p.evaluate(t=>render(t),+t);await p.screenshot({path:`snaps/o${(+t).toFixed(2)}.png`,omitBackground:true});}
console.log(errs.join('\n')||'no errors');await b.close();})();
