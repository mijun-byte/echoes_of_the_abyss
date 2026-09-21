// Optional live browser checks: install Playwright, then node tests/browser.cjs.
// ABYSS_CHROMIUM_PATH may point to a local Chromium executable.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{let content=fs.readFileSync(file);if(file.endsWith('game.js'))content=content.toString().replace(/\}\)\(\);\s*$/,`window.__test={get game(){return game},Enemy,Boss,Weapon,PASSIVES,CURSES,pickup,inventory,saveRun,updateHud,get look(){return {...playerLook}}};})();`);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(content);}catch{res.writeHead(404).end();}});

(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.ABYSS_CHROMIUM_PATH?{executablePath:process.env.ABYSS_CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--single-process','--disable-dev-shm-usage']}: {})});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);
 await page.locator('[data-action=shop]').click();await page.locator('#cheatCode').fill('ABYSSE10M');await page.locator('#cheatForm button').click();await page.locator('#shopBack').click();await page.locator('[data-action=roulette]').click();
 await page.locator('[data-stake="1000"]').click();assert.equal(await page.locator('#rouletteStake').inputValue(),'1000');await page.locator('#rouletteBet').selectOption('number');await page.locator('#rouletteNumber').fill('0');
 await page.locator('#rouletteSpin').click();assert.ok(await page.locator('#rouletteSpin').isDisabled());assert.ok(await page.locator('#rouletteBack').isDisabled());
 const snapshot=await page.evaluate(()=>Object.values(localStorage).map(v=>{try{return JSON.parse(v)}catch{return null}}).find(v=>v?.rouletteLast));assert.equal(snapshot.rouletteLast.stake,1000);
 await page.waitForFunction(()=>!document.querySelector('#rouletteSpin').disabled);assert.match(await page.locator('#rouletteStatus').innerText(),/Versement|Perdu/);
 await page.screenshot({path:'/tmp/abyss-review/roulette.png'});await page.locator('#rouletteBet').selectOption('rouge');await page.locator('#rouletteStake').fill('100');await page.locator('#rouletteSpin').click();
 const saved=await page.evaluate(()=>Object.values(localStorage).map(v=>{try{return JSON.parse(v)}catch{return null}}).find(v=>v?.rouletteLast));await page.reload();await page.locator('[data-action=roulette]').click();assert.match(await page.locator('#rouletteStatus').innerText(),/Dernier tirage/);const after=await page.evaluate(()=>Object.values(localStorage).map(v=>{try{return JSON.parse(v)}catch{return null}}).find(v=>v?.rouletteLast));assert.deepEqual(after,saved);
 await page.locator('#rouletteStake').fill('999999999');await page.locator('#rouletteSpin').click();assert.match(await page.locator('#rouletteStatus').innerText(),/assez/);
 await page.setViewportSize({width:1000,height:650});await page.locator('#rouletteBack').click();await page.locator('[data-action=roulette]').click();await page.setViewportSize({width:390,height:740});await page.locator('#rouletteSpin').scrollIntoViewIfNeeded();assert.ok(await page.locator('#rouletteSpin').isVisible());assert.deepEqual(errors,[]);
 console.log('Roulette browser checks passed: presets, exact bet, animation lock, payout, reload mid-spin, insufficient funds and compact layouts.');
 }finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
