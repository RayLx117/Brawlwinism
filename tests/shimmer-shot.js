const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 }); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
const box = await p.locator('canvas').boundingBox(); const sx = box.width/1280; const S=OUT;
await p.evaluate(() => {
  const K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })); window.K = K;
  for (const c of ['KeyA','KeyD','KeyS','KeyW','KeyJ','ShiftLeft','Space']) K(c,0); __step(1/60,30);
  Object.assign(__bot,{x:860,y:540,vx:0,vy:0,rag:null,onGround:true,stunT:0,hurtT:0,damage:40,dead:0,combo:0,label:'',moveLab:'',moveLabT:0,parryT:0,labelT:0});
  Object.assign(__fighter,{x:800,y:540,vx:0,vy:0,onGround:true,facing:1});
  __fighter.punch.on=false; __fighter.punch.next=0; __fighter.punch.lastEnd=-9; __step(1/60,1);
  window.I = 0;
  window.adv = (n) => { for (let k = 0; k < n; k++) { const i = I++;
    if (i === 0 || i === 16) K('KeyJ', 1); if (i === 1 || i === 17) K('KeyJ', 0);
    if (i === 30) { K('KeyD', 1); K('KeyJ', 1); } if (i === 31) K('KeyJ', 0); if (i === 40) K('KeyD', 0);
    __step(1/60, 1); } };
});
const marks = [56, 58, 60, 62, 64, 66, 68, 120];
const files = []; let cur = 0;
for (let m = 0; m < marks.length; m++) { await p.evaluate((n) => adv(n), marks[m] - cur); cur = marks[m];
  const [bx, by, inv, rag] = await p.evaluate(() => [__bot.R ? __bot.R.centre[0] : __bot.x, __bot.R ? __bot.R.centre[1] : __bot.y, __bot.invK, __bot.rag ? __bot.rag.phase : '-']);
  console.log(marks[m], Math.round(bx), Math.round(by), inv.toFixed(2), rag);
  const f = S + 'sh' + m + '.png'; files.push(f);
  await p.screenshot({ path: f, clip: { x: box.x + Math.max(0, Math.min(1280 - 200, bx - 100)) * sx, y: box.y + Math.max(0, Math.min(720 - 180, by - 90)) * sx, width: 200 * sx, height: 180 * sx } }); }
console.log('errors', errs); await b.close();
require('child_process').execSync('python3 ' + path.join(__dirname, 'grid.py') + ' ' + OUT + 'preview-cant-hit-shimmer.png 4 0.6 ' + files.join(' '));
})();
