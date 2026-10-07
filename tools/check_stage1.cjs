const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('assert');
(async () => {
  const browser = await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || 'msedge'});
  const context = await browser.newContext({reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`); });
  fs.mkdirSync('artifacts/stage1',{recursive:true});
  const pages = fs.readdirSync('demo2').filter(f => f.endsWith('.html'));
  const results=[];
  for(const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    for(const file of pages) {
      await page.goto(`http://127.0.0.1:4173/demo2/${file}`);
      await page.waitForLoadState('networkidle');
      // Decode lazy images explicitly, including decorative images hidden by a breakpoint.
      // An intentionally deferred image is not a missing resource.
      await page.evaluate(async () => {
        await Promise.all([...document.images].map(image => {
          image.loading = 'eager';
          return image.decode().catch(() => {});
        }));
      });
      const state=await page.evaluate(() => ({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)}));
      assert(state.scroll<=state.width+1,`${file} overflow at ${width}: ${state.scroll}`);
      assert.equal(state.broken.length,0,`${file}: broken images ${state.broken}`);
      results.push({file,width,ok:true});
      if(width===390 || (width===1440 && ['main.html','info.html','oper.html','world.html'].includes(file))) await page.screenshot({path:`artifacts/stage1/${file.replace('.html','')}-${width}.png`,fullPage:true});
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/demo2/main.html');
  assert.equal(await page.locator('video').getAttribute('src'),null,'mobile must not download video');
  assert.equal(await page.locator('.video-controls').count(),0,'no footer video controls');
  await page.getByRole('button',{name:'开启背景声音'}).click();
  await page.waitForFunction(() => !document.querySelector('video').paused);
  assert.equal(await page.locator('video').evaluate(v=>v.muted),false);
  await page.getByRole('button',{name:'关闭背景声音'}).click();
  assert.equal(await page.locator('video').evaluate(v=>v.muted),true);
  await page.getByRole('button',{name:'菜单',exact:true}).click();
  await page.getByRole('link',{name:'OPERATOR 干员'}).click();
  await page.getByRole('button',{name:'查看阿米娅'}).click();
  assert.equal(await page.locator('#character-name').innerText(),'阿米娅');
  assert.equal(await page.locator('.operator-shadow').getAttribute('src'),await page.locator('#main-image').getAttribute('src'));
  await page.getByRole('button',{name:'查看阿米娅'}).press('ArrowRight');
  assert.equal(await page.locator('#character-name').innerText(),'陈');
  await page.goto('http://127.0.0.1:4173/demo2/world.html');
  await page.getByRole('button',{name:'感染者 INFECTED'}).click();
  assert((await page.locator('.text').innerText()).startsWith('被源石所感染'));
  await page.goto('http://127.0.0.1:4173/demo2/info.html');
  await page.getByRole('tab',{name:'公告',exact:true}).click();
  assert.equal(await page.locator('#panel-1').isVisible(),true);
  await page.getByRole('tab',{name:'公告',exact:true}).press('End');
  assert.equal(await page.locator('#panel-3').isVisible(),true);
  for(let i=0;i<4;i++) await page.getByRole('button',{name:'下一张海报'}).click();
  assert.equal(await page.locator('#slide-status').innerText(),'1 / 4');
  await page.getByRole('button',{name:'上一张海报'}).click();
  assert.equal(await page.locator('#slide-status').innerText(),'4 / 4');
  await page.goto('http://127.0.0.1:4173/demo2/login.html');
  await page.getByRole('button',{name:'验证演示表单'}).click();
  assert((await page.locator('#login-feedback').innerText()).includes('演示账号'));
  await page.locator('#username').fill('demo');
  await page.locator('#password').fill('fictional');
  await page.getByRole('button',{name:'验证演示表单'}).click();
  assert((await page.locator('#login-feedback').innerText()).includes('确认'));
  await page.locator('#agreement').check();
  await page.getByRole('button',{name:'验证演示表单'}).click();
  assert((await page.locator('#login-feedback').innerText()).includes('校验通过'));
  assert.equal(await page.locator('#password').inputValue(),'');
  assert.equal(await page.evaluate(()=>localStorage.length),0);
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/stage1/checks.json',JSON.stringify({results,interactions:'passed',errors},null,2));
  console.log(`${results.length} page/viewport checks and interaction checks passed`);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
