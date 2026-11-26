// usage: node render2.js <duration> <timings.json> <bg.mp4> <out.mp4>
const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs');
(async()=>{const [D,TJ,BG,OUT]=process.argv.slice(2);const FPS=30,N=Math.round(FPS*+D);
const ff=spawn('ffmpeg',['-v','error','-y','-i',BG,'-f','image2pipe','-framerate',String(FPS),'-c:v','png','-i','-','-filter_complex','[0:v][1:v]overlay=0:0:format=auto,format=yuv420p','-t',D,'-c:v','libx264','-preset','medium','-crf','17',OUT],{stdio:['pipe','inherit','inherit']});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.addInitScript(`window.T=${fs.readFileSync(TJ,'utf8')}`);
await p.goto('http://127.0.0.1:8766/ov.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/FPS);const buf=await p.screenshot({type:'png',omitBackground:true});
 if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150==0)console.log('frame',i,'/',N);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done');})();
