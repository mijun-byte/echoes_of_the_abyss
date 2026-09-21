// Optional live browser checks: install Playwright, then node tests/browser.cjs.
// ABYSS_CHROMIUM_PATH may point to a local Chromium executable.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{let content=fs.readFileSync(file);if(file.endsWith('game.js'))content=content.toString().replace(/\}\)\(\);\s*$/,`window.__test={get game(){return game},Enemy,Weapon,PASSIVES,pickup,inventory,saveRun,get look(){return {...playerLook}}};})();`);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(content);}catch{res.writeHead(404).end();}});

(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,...(process.env.ABYSS_CHROMIUM_PATH?{executablePath:process.env.ABYSS_CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--single-process','--disable-dev-shm-usage']}: {})});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-action=customize]').click();
 assert.equal(await page.locator('[data-part=head]').count(),10);assert.equal(await page.locator('[data-part=body]').count(),10);
 const initial=await page.locator('#characterPreview').evaluate(c=>c.toDataURL());
 await page.locator('[data-part=head][data-color=red]').click();const red=await page.locator('#characterPreview').evaluate(c=>c.toDataURL());assert.notEqual(red,initial);
 await page.locator('[data-part=body][data-color=blue]').click();assert.notEqual(await page.locator('#characterPreview').evaluate(c=>c.toDataURL()),red);
 assert.equal(await page.locator('[data-color][aria-pressed=true]').count(),2);
 if(process.env.ABYSS_SCREENSHOTS){fs.mkdirSync(process.env.ABYSS_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.ABYSS_SCREENSHOTS,'customization.png')});}
 await page.locator('#lookSave').click();assert.deepEqual(await page.evaluate(()=>__test.look),{head:'red',body:'blue'});
 await page.reload();await page.locator('[data-action=customize]').click();assert.equal(await page.locator('[data-part=head][data-color=red]').getAttribute('aria-pressed'),'true');
 await page.locator('#lookReset').click();assert.equal(await page.locator('[data-part=head][data-color=mint]').getAttribute('aria-pressed'),'true');await page.locator('#lookCancel').click();assert.deepEqual(await page.evaluate(()=>__test.look),{head:'red',body:'blue'});
 await page.locator('[data-action=new]').click();const stats=await page.evaluate(()=>({hp:__test.game.player.maxHp,damage:__test.game.player.damageMul,gold:__test.game.player.gold}));
 await page.keyboard.press('Escape');await page.locator('[data-p=customize]').click();await page.locator('[data-part=head][data-color=gold]').click();await page.locator('[data-part=body][data-color=green]').click();await page.locator('#lookSave').click();await page.locator('[data-p=resume]').click();
 assert.deepEqual(await page.evaluate(()=>__test.look),{head:'gold',body:'green'});assert.deepEqual(await page.evaluate(()=>({hp:__test.game.player.maxHp,damage:__test.game.player.damageMul,gold:__test.game.player.gold})),stats);
 await page.evaluate(()=>__test.saveRun());await page.reload();await page.locator('[data-action=continue]').click();assert.deepEqual(await page.evaluate(()=>__test.look),{head:'gold',body:'green'});
 await page.keyboard.press('Escape');await page.locator('[data-p=customize]').click();await page.setViewportSize({width:1000,height:650});await page.locator('#lookSave').scrollIntoViewIfNeeded();assert.ok(await page.locator('#lookSave').isVisible());assert.deepEqual(errors,[]);
 console.log('Customization browser checks passed: 20 swatches, distinct live preview changes, save, reload, cancel, reset, pause, resumed game, unchanged stats and smaller viewport.');
 }finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
