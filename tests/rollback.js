// Local rollback mode: you attack the parrying bot while its inputs reach the game 7 frames late. The game guesses them, and rolls
// back when the real ones differ. Checks: rollbacks happened, and replaying the inputs the run settled on straight through (no
// rollbacks) reaches exactly the same state (__rbCheck). Frames with the readout: out/rollback.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.passives = []; L.pl.weapon = null; L.pl.weaponSpec = null; __resetRound(); __step(1 / 60, 10);
  Object.assign(__fighter, { x: 560 }); Object.assign(__bot, { x: 700 }); __bot.mode = 'parry'; __step(1 / 60, 5); __rbStart(); });
const key = (c, d) => p.evaluate(([c, d]) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })), [c, d]);
for (let i = 0; i < 600; i++) {   // walk in, jab now and then, back off, come again
  const ph = i % 120;
  if (ph === 0) await key('KeyD', 1); if (ph === 25) await key('KeyD', 0);
  if (ph === 30 || ph === 55 || ph === 80) await key('KeyJ', 1); if (ph === 31 || ph === 56 || ph === 81) await key('KeyJ', 0);
  if (ph === 95) await key('KeyA', 1); if (ph === 110) await key('KeyA', 0);
  await p.evaluate(() => __step(1 / 60, 1));
  if ([34, 37, 40, 58, 84, 150].includes(i)) { const f = OUT + `rbk-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x, y: box.y, width: 900 * k, height: 600 * k } }); fs_.push(f); }
}
const r = await p.evaluate(() => __rbCheck());
console.log(JSON.stringify(r));
execSync(`python3 ${__dirname}/grid.py ${OUT}rollback.png 3 0.6 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); process.exit(r && r.same && r.rollbacks > 0 && !errs.length ? 0 : 1); })();
