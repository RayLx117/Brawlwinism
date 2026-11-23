// The sword's dash stab: dash toward the bot and attack. Prints whether it hit, ragdolled, and the launch (vs a sucker punch at the same
// damage, for the half-knockback check). Frames: out/sword-dash.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  const ev = (t, c) => p.evaluate(([t, c]) => window.dispatchEvent(new KeyboardEvent(t, { code: c })), [t, c]);
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'common', base: 10, mods: [] }; __resetRound(); __step(1 / 60, 20);
    Object.assign(__bot, { x: 760, damage: 60 }); Object.assign(__fighter, { x: 480, facing: 1 }); __step(1 / 60, 10); });
  await ev('keydown', 'KeyD'); await ev('keydown', 'ShiftLeft'); await ev('keyup', 'ShiftLeft'); await p.evaluate(() => __step(1 / 60, 3));
  await ev('keydown', 'KeyJ'); await ev('keyup', 'KeyJ'); await ev('keyup', 'KeyD');
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  let res = null;
  for (let i = 0; i < 24; i++) {
    const r = await p.evaluate(() => { __step(1 / 60, 1); const P_ = __fighter.punch; return { move: P_.on ? P_.A.name : '-', rag: !!__bot.rag, vx: __bot.vx | 0, vy: __bot.vy | 0, x: __fighter.x | 0, bx: __bot.x | 0 }; });
    if (r.rag && !res) res = r;
    if (i < 14 && i % 2 === 0) { const f = OUT + `sd-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + (r.x - 120) * k, y: box.y + 380 * k, width: 400 * k, height: 190 * k } }); fs_.push(f); }
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}sword-dash.png 4 0.5 ${fs_.join(' ')}`);
  console.log('dash stab:', JSON.stringify(res));
  console.log('errors', errs); await b.close();
})();
