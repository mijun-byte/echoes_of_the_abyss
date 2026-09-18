// Optional live browser checks: install Playwright, then node tests/browser.cjs.
// ABYSS_CHROMIUM_PATH may point to a local Chromium executable.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{let content=fs.readFileSync(file);if(file.endsWith('game.js'))content=content.toString().replace(/\}\)\(\);\s*$/,`window.__test={get game(){return game},Enemy,Weapon,PASSIVES,pickup,inventory,saveRun};})();`);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(content);}catch{res.writeHead(404).end();}});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,...(process.env.ABYSS_CHROMIUM_PATH?{executablePath:process.env.ABYSS_CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--single-process','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-action=shop]').click();
 await page.locator('#cheatCode').fill('ABYSSE10M');await page.locator('#cheatForm button').click();assert.match(await page.locator('.bank-balance').innerText(),/10.*000.*000 PO/);
 assert.equal(await page.locator('.shop-item').count(),14);
 await page.locator('[data-shop=unlock_laser]').click();await page.locator('[data-shop=unlock_axe]').click();await page.locator('#startingWeapon').selectOption('laser');
 const assets=await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));return [...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)});assert.deepEqual(assets,[]);
 const screenshots=process.env.ABYSS_SCREENSHOTS;if(screenshots){fs.mkdirSync(screenshots,{recursive:true});await page.locator('#modalCard').evaluate(e=>e.scrollTop=0);await page.screenshot({path:path.join(screenshots,'shop.png')});}
 await page.locator('#shopBack').click();await page.locator('[data-action=new]').click();assert.equal(await page.evaluate(()=>__test.game.player.weapon.type),'laser');
 await page.evaluate(()=>{const g=__test.game;g.player.x=400;g.player.y=300;g.player.maxHp=g.player.hp=10000;g.player.crit=0;g.player.weapon.extra=null;g.player.weapon.bonus=1;g.enemies=[550,750].map(x=>{const e=new __test.Enemy('tank',x,300);e.maxHp=e.hp=10000;e.speed=0;e.cool=999;return e;});});
 const box=await page.locator('#game').boundingBox();await page.mouse.move(box.x+900/1280*box.width,box.y+300/720*box.height);await page.mouse.down();
 await page.waitForFunction(()=>__test.game.player.laserCharge>.45);assert.equal(await page.evaluate(()=>__test.game.enemies[0].hp),10000);
 if(screenshots)await page.screenshot({path:path.join(screenshots,'laser-charge.png')});
 await page.waitForFunction(()=>{if(__test.game.enemies[0].hp<10000){__test.game.paused=true;return true;}return false;});await page.mouse.up();assert.equal(await page.evaluate(()=>__test.game.enemies[1].hp),9760);
 if(screenshots)await page.screenshot({path:path.join(screenshots,'laser-beam.png')});
 await page.evaluate(()=>{const g=__test.game;g.paused=false;g.enemies=[];g.player.passives=__test.PASSIVES.map(p=>p[0]);__test.inventory();});
 assert.equal(await page.locator('.inventory .item-icon').count(),15);
 await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
 assert.equal(await page.locator('#modalCard').evaluate(e=>e.scrollTop),0);if(screenshots)await page.screenshot({path:path.join(screenshots,'inventory.png')});
 await page.locator('#invClose').click();await page.evaluate(()=>{const g=__test.game;__test.pickup({type:'weapon',weapon:new __test.Weapon('axe'),x:400,y:300});g.player.weapon.bonus=1;g.player.weapon.extra=null;g.player.cool=0;g.player.need=100000;g.player.x=400;g.player.y=300;g.drops=__test.PASSIVES.map((item,i)=>({type:'passive',item,x:320+(i%5)*115,y:230+Math.floor(i/5)*110,rarity:i%5}));});
 if(screenshots){await page.waitForTimeout(150);await page.screenshot({path:path.join(screenshots,'loot.png')});}
 await page.keyboard.press('i');assert.match(await page.locator('#modalCard').innerText(),/−25%/);await page.locator('#invClose').click();
 await page.evaluate(()=>__test.saveRun());await page.reload();await page.locator('[data-action=continue]').click();assert.equal(await page.evaluate(()=>__test.game.player.weapon.type),'axe');
 await page.keyboard.press('Escape');await page.locator('[data-p=menu]').click();await page.setViewportSize({width:1000,height:650});await page.locator('[data-action=shop]').click();await page.locator('[data-shop=earth]').scrollIntoViewIfNeeded();assert.ok(await page.locator('[data-shop=earth]').isVisible());
 assert.deepEqual(errors,[]);console.log('Live browser checks passed: bank, 14 shop cards, purchases, starting weapon, all displayed assets, charged laser piercing, inventory, loot, save/reload and smaller viewport.');
 }finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
