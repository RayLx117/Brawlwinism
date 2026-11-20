// Divine General look: a full-size close-up standing idle, a few attack poses, his HUD portrait and his card art. Screenshots to out/.
// usage: node dg-shot.js [prefix]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const pre = process.argv[2] || 'dg';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox();
  await p.evaluate(() => { __startPractice(); __cards.LOADOUT.bot.companion = 'divineGeneral'; __resetRound(); __step(1 / 60, 240); });
  // park the player far away so he idles, then shoot him
  const shot = async (name, setup, n) => {
    const r = await p.evaluate(([setup, n]) => {
      const g = __dg(); __fighter.x = 300; __fighter.vx = 0;
      if (setup) eval(setup);
      __step(1 / 60, n);
      const sc = box => box; const cw = document.querySelector('canvas').getBoundingClientRect();
      return { x: g.x, y: g.y, state: g.state, cw: cw.width, gw: 1280 };
    }, [setup, n]);
    const k = box.width / 1280, cx = box.x + r.x * k, cy = box.y + (r.y - 230) * k, w = 520 * k, h = 560 * k;
    await p.screenshot({ path: OUT + `${pre}-${name}.png`, clip: { x: cx - w / 2, y: Math.max(box.y, cy - h / 2), width: w, height: h } });
  };
  await p.evaluate(() => { const g = __dg(); g.x = 760; g.y = 540; g.state = 'idle'; g.gapT = 99; g.facing = 1; });
  await p.evaluate(() => { const g = __dg(); g.state = 'idle'; g.gapT = 999; });
  await shot('idle', "g.gapT=999; g.state='idle'; g.x=760; g.facing=-1;", 60);
  for (const [k, t] of [['cleave', 0.38], ['cleave', 0.6], ['heaven', 0.5], ['quake', 0.6]]) {
    await shot(`${k}-${t}`, `g.x=760; dgS='${k}'; __dgStart('${k}'); g.facing=-1;`, Math.round(t * 60));
  }
  await shot('rag', "g.x=760; g.state='idle'; g.gapT=999;", 1);
  await p.screenshot({ path: OUT + `${pre}-full.png`, clip: box });
  console.log('errors', errs); await b.close();
})();
