// Keyed sword swings only move the sword for their own animation. Each case cuts the rising slash / overhead short (dash, jump,
// parry) or lets it finish, then does a dash stab: through the stab the sword must be back to normal (twist 1 = edge as drawn,
// the wrist straight along the forearm). Also how fast it comes back after a cancel. Frames of case "rise > dash > stab":
// out/sword-cancel.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
const r = await p.evaluate(() => {
  const L = __cards.LOADOUT, key = (c, d = true) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })), tap = (c) => { key(c); key(c, false); };
  const setup = () => { __startPractice(); L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = Object.assign(__weapons.rollWeapon('sword', 'common'), { mods: [] }); __resetRound();
    for (let i = 0; i < 30; i++) __tick(1 / 60); Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); Object.assign(__bot, { x: 1100 }); for (let i = 0; i < 30; i++) __tick(1 / 60); };
  const T = (n) => { for (let i = 0; i < n; i++) __tick(1 / 60); };
  const stab = () => { key('KeyD'); tap('ShiftLeft'); __tick(1 / 60); tap('KeyJ'); let worst = 0, tw = 1, seen = false;
    for (let i = 0; i < 30; i++) { __tick(1 / 60); const P = __fighter.punch; if (P.on && P.A.name === 'dash stab') { seen = true; worst = Math.max(worst, Math.abs(__fighter.swordW)); tw = Math.min(tw, __fighter.swordTwist); } }
    key('KeyD', false); return { stab: seen, wristOff: +worst.toFixed(3), minTwist: +tw.toFixed(3) }; };
  const out = {};
  setup(); out.cleanStab = stab();
  setup(); tap('KeyJ'); T(8); out.riseCutByDash = stab();
  setup(); tap('KeyJ'); T(40); out.riseFinished = stab();
  setup(); __fighter.punch.next = 1; __fighter.punch.lastEnd = __fighter.time; tap('KeyJ'); T(26); out.overCutByDash = stab();
  // jump-cancel / parry mid-rise: how many frames until the sword is back to normal (twist 1)
  const back = (act, near) => { setup(); if (near) { Object.assign(__bot, { x: 530, y: 540, damage: 20 }); T(10); __bot.x = 530; } tap('KeyJ'); T(near ? 11 : 9); const tw0 = +__fighter.swordTwist.toFixed(2); act(); let n = 0; while (n < 40 && __fighter.swordTwist < 0.98) { __tick(1 / 60); n++; } return { twistAtCancel: tw0, framesBack: n }; };
  out.riseJumpCancel = back(() => { key('Space'); __tick(1 / 60); key('Space', false); }, true);   // (it has to land for the jump-cancel)
  out.riseParry = back(() => tap('ShiftLeft'));
  return out; });
console.log(JSON.stringify(r, null, 1));
// frames: rising slash cut by a dash, into the dash stab
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = Object.assign(__weapons.rollWeapon('sword', 'common'), { mods: [] }); __resetRound(); __step(1 / 60, 30);
  Object.assign(__fighter, { x: 360, facing: 1 }); Object.assign(__bot, { x: 1100 }); __step(1 / 60, 30);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); });
for (let i = 0; i < 14; i++) {
  const x = await p.evaluate((i) => { const ev = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
    if (i === 4) { ev('KeyD', 1); ev('ShiftLeft', 1); ev('ShiftLeft', 0); } if (i === 5) { ev('KeyJ', 1); ev('KeyJ', 0); } if (i === 11) ev('KeyD', 0); __step(1 / 60, 2); return __fighter.x; }, i);
  const f = OUT + `scn-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + (x - 110) * k, y: box.y + 380 * k, width: 260 * k, height: 180 * k } }); fs_.push(f); }
execSync(`python3 ${__dirname}/grid.py ${OUT}sword-cancel.png 7 0.5 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();
