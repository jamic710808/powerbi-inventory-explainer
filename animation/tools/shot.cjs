// 開發用：快速看單格。node tools/shot.cjs . s01-monday@3.5 s02-calendar@10 ... [--out dev]
// 場景名@場景內秒數；也可以給純數字＝全片影格。輸出到 dev/ 資料夾（不是交付物）。
const fs=require('fs'),path=require('path'),http=require('http');
const root=path.resolve(process.argv[2]||'.');
const args=process.argv.slice(3).filter(a=>!a.startsWith('--'));
const outDir=path.join(root,(process.argv.find(a=>a.startsWith('--out='))||'--out=dev').slice(6));
fs.mkdirSync(outDir,{recursive:true});
const t=JSON.parse(fs.readFileSync(path.join(root,'timeline.json')));
const pw=require(process.env.PLAYWRIGHT_MODULE);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.wav':'audio/wav'};
const server=http.createServer((req,res)=>{const n=decodeURIComponent(new URL(req.url,'http://x').pathname);const f=path.join(root,n==='/'?'index.html':n);if(!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const b=await pw.chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
  const p=await b.newPage({viewport:{width:t.width,height:t.height},deviceScaleFactor:1});
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${server.address().port}/?export=1`,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__ready===true,null,{timeout:30000});
  for(const a of args){
    let f;
    if(a.includes('@')){const [id,sec]=a.split('@');const s=t.scenes.find(x=>x.id===id);if(!s)throw Error('no scene '+id);f=Math.min(s.endFrame-1,s.startFrame+Math.round(parseFloat(sec)*t.fps));}
    else f=parseInt(a,10);
    await p.evaluate(async f=>{await window.renderFrame(f);},f);
    const name=a.replace('@','_t')+'.png';
    await p.locator('#stage').screenshot({path:path.join(outDir,name)});
    console.log('ok',name,'frame',f);
  }
  if(errs.length)console.log('ERRORS',errs.slice(0,5));
  await b.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
