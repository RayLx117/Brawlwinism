// The animated main menu: records ~10 s of it to out/home-menu.webm, and times how long drawing one frame of the scene takes.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 }, recordVideo: { dir: OUT + 'vid', size: { width: 1280, height: 760 } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.stack));
  await p.goto(GAME); await p.waitForTimeout(10500);
  const ms = await p.evaluate(() => new Promise(res => { const t0 = performance.now(); let n = 0; const go = () => { if (++n < 120) requestAnimationFrame(go); else res((performance.now() - t0) / n); }; requestAnimationFrame(go); }));
  const v = await p.video().path(); await ctx.close(); fs.renameSync(v, OUT + 'home-menu.webm');
  console.log('avg frame interval ms', ms.toFixed(1), 'errors', errs); await b.close();
})();
