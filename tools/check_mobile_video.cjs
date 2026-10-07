const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4174';
(async () => {
  const browser = await chromium.launch({headless:true, channel:'msedge'});
  try {
    for (const scenario of ['autoplay', 'blocked', 'reduced-motion']) {
      const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:scenario==='reduced-motion'?'reduce':'no-preference'});
      if (scenario==='blocked') await context.addInitScript(() => {
        HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));
      });
      const page = await context.newPage();
      await page.goto(base);
      const video = page.locator('.hero-video');
      assert.equal(await video.getAttribute('playsinline'), '');
      assert.equal(await video.evaluate(v=>v.muted), true);
      if (scenario==='autoplay') {
        await page.waitForFunction(()=>{const v=document.querySelector('video');return v.videoWidth>0&&!v.paused;});
        assert.equal(await video.evaluate(v=>v.videoWidth),1920);
      } else if (scenario==='blocked') {
        await page.getByText('视频未能播放，可以继续浏览静态封面').waitFor();
        assert.equal(await video.evaluate(v=>v.paused),true);
      } else assert.equal(await video.getAttribute('src'),null);
      assert.match(await video.getAttribute('poster'),/hero-poster/);
      console.log(`${scenario}: passed`);
      await context.close();
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
