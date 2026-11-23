// Weapon swing trails: close-ups at the moment of each sword swing (rising slash, overhead chop, sword spin) so the thin trail
// lines can be judged. Sheet: out/swing-trail.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 4 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
const setup = () => p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = Object.assign(__weapons.rollWeapon('sword', 'common'), { mods: [] }); __resetRound(); __step(1 / 60, 30);
  Object.assign(__fighter, { x: 500, facing: 1 }); Object.assign(__bot, { x: 1100 }); __step(1 / 60, 30); });
const J = () => p.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); });
const shot = async (dy = 0) => { const [x, y] = await p.evaluate(() => [__fighter.x, __fighter.y]); const f = OUT + `swt-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + (x - 130) * k, y: box.y + (y - 210 + dy) * k, width: 280 * k, height: 230 * k } }); fs_.push(f); };
await setup(); await J(); await p.evaluate(() => __step(1 / 60, 14)); await shot();   // rising slash, up through
await setup(); await p.evaluate(() => { __fighter.punch.next = 1; __fighter.punch.lastEnd = __fighter.time; }); await J(); await p.evaluate(() => __step(1 / 60, 32)); await shot();   // the chop
await setup(); await p.evaluate(() => { Object.assign(__fighter, { y: 380, vy: 0, onGround: false }); __step(1 / 60, 2); Object.assign(__fighter, { y: 380, vy: 0 }); }); await J();
await p.evaluate(() => { for (let i = 0; i < 13; i++) { Object.assign(__fighter, { y: 380, vy: 0 }); __step(1 / 60, 1); } }); await shot(40);   // the spin
execSync(`python3 ${__dirname}/grid.py ${OUT}swing-trail.png 3 0.45 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();
