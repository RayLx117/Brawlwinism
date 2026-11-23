const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 }); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
const box = await p.locator('canvas').boundingBox(); const sx = box.width/1280; const S=OUT;
await p.evaluate(() => {
  const K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })); window.K = K;
  for (const c of ['KeyA','KeyD','KeyS','KeyW','KeyJ','ShiftLeft','Space']) K(c,0); __step(1/60,30);
  Object.assign(__bot,{x:885,y:540,vx:0,vy:0,rag:null,onGround:true,stunT:0,hurtT:0,damage:90,dead:0,combo:0,label:'',moveLab:'',moveLabT:0,parryT:0,labelT:0});
  Object.assign(__fighter,{x:800,y:540,vx:0,vy:0,onGround:true,facing:1});
  __fighter.punch.on=false; __fighter.punch.next=0; __fighter.punch.lastEnd=-9; __step(1/60,1);
  window.I = 0; window.hitAt = -1;
  window.adv = (n) => { for (let k = 0; k < n; k++) { const i = I++;
    if (i === 0 || i === 16) K('KeyJ', 1); if (i === 1 || i === 17) K('KeyJ', 0);
    if (i === 30) { K('KeyS', 1); K('KeyJ', 1); } if (i === 31) K('KeyJ', 0);
    if (hitAt >= 0) { const j = i - hitAt; if (j === 1) K('KeyS', 0);  }
    __step(1/60, 1);
    if (hitAt < 0 && __bot.moveLab === 'spin kick') hitAt = i; } };
});
// frames: cross recovering, wind (turning), back turned, strike/hit, pop, jump, flying kick connect, aftermath
const marks = [36, 44, 48, 51, 58, 70, 94, 112];
const files = []; let cur = 0;
for (let m = 0; m < marks.length; m++) { await p.evaluate((n) => adv(n), marks[m] - cur); cur = marks[m];
  const f = S + 'rt' + m + '.png'; files.push(f);
  await p.screenshot({ path: f, clip: { x: box.x + 720*sx, y: box.y + 290*sx, width: 340*sx, height: 260*sx } }); }
console.log(await p.evaluate(() => [hitAt, __bot.moveLab, __bot.label, __bot.damage]), 'errors', errs); await b.close();
require('child_process').execSync('python3 ' + path.join(__dirname, 'grid.py') + ' ' + OUT + 'preview-spin-kick-hit.png 4 0.5 ' + files.join(' '));
})();
