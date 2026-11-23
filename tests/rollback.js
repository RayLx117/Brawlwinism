// Local rollback mode (pause menu: Rollback Test). Several fake networks, from typical to awful, against the parrying bot (you
// walk in and jab) and the busy bot (it plays at random and fights back). Each run: how many rollbacks and how long, and whether
// replaying the inputs the run settled on, straight through with no rollbacks, reaches exactly the same state (__rbCheck).
// Also drives the Rollback Test page (type a ping, drag a slider, Esc back). Frames with the readout: out/rollback.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const NETS = [
  ['typical (100 ms ±10, input delay 2)', { ping: 100, jitter: 10, loss: 0, inDelay: 2, busy: false }],
  ['bad, no input delay (230 ms)', { ping: 230, jitter: 0, loss: 0, inDelay: 0, busy: false }],
  ['busy bot, typical', { ping: 100, jitter: 10, loss: 0, inDelay: 2, busy: true }],
  ['busy bot, awful (200 ms ±60, 10% loss, delay 1)', { ping: 200, jitter: 60, loss: 10, inDelay: 1, busy: true }],
];
(async () => { const b = await chromium.launch(); let fail = 0;
for (const [name, net] of NETS) {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  await p.evaluate((net) => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.passives = []; L.pl.weapon = null; L.pl.weaponSpec = null; __resetRound(); __step(1 / 60, 10);
    Object.assign(__fighter, { x: 560 }); Object.assign(__bot, { x: 700 }); __bot.mode = 'parry'; __step(1 / 60, 5); __rbStart(net); }, net);
  const key = (c, d) => p.evaluate(([c, d]) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })), [c, d]);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  for (let i = 0; i < 600; i++) {   // walk in, jab now and then, back off, come again
    const ph = i % 120;
    if (ph === 0) await key('KeyD', 1); if (ph === 25) await key('KeyD', 0);
    if (ph === 30 || ph === 55 || ph === 80) await key('KeyJ', 1); if (ph === 31 || ph === 56 || ph === 81) await key('KeyJ', 0);
    if (ph === 95) await key('KeyA', 1); if (ph === 110) await key('KeyA', 0);
    await p.evaluate(() => __step(1 / 60, 1));
    if (name.startsWith('busy bot, awful') && [60, 140, 230, 330, 430, 520].includes(i)) { const f = OUT + `rbk-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x, y: box.y, width: 1000 * k, height: 600 * k } }); fs_.push(f); }
  }
  const r = await p.evaluate(() => __rbCheck());
  const ok = r && r.same && !errs.length; if (!ok) fail++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name.padEnd(50), JSON.stringify({ rollbacks: r.rollbacks, longest: r.maxRoll, same: r.same, frame: r.frame }), errs.length ? errs : '');
  if (fs_.length) execSync(`python3 ${__dirname}/grid.py ${OUT}rollback.png 3 0.55 ${fs_.join(' ')}`);
  await p.close();
}
// the page itself
const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => __startPractice()); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, at = (x, y) => [box.x + x * k, box.y + y * k];
await p.mouse.click(...at(640, 114 + 9 * 35)); await p.waitForTimeout(200);   // the Rollback Test row
const ui = { page: await p.evaluate(() => __menu.screen) };
await p.mouse.click(...at(640, 122)); await p.waitForTimeout(100); ui.switchOn = await p.evaluate(() => __rb.on);   // the switch row
await p.mouse.move(...at(400, 162)); await p.waitForTimeout(100);   // pick the Ping row, type 250 Enter
for (const c of ['Digit2', 'Digit5', 'Digit0']) await p.keyboard.press(c); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
ui.typedPing = await p.evaluate(() => __rb.ping);
await p.mouse.move(...at(700, 202)); await p.mouse.down(); await p.mouse.move(...at(790, 202), { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(100);   // drag Jitter to the end
ui.draggedJitter = await p.evaluate(() => __rb.jitter);
for (const c of ['ArrowDown', 'ArrowRight', 'ArrowRight']) { await p.keyboard.press(c); await p.waitForTimeout(60); }   // Packet loss +2
ui.arrowLoss = await p.evaluate(() => __rb.loss);
await p.screenshot({ path: OUT + 'rbtest-menu.png' });
await p.keyboard.press('Escape'); await p.waitForTimeout(150); ui.escTo = await p.evaluate(() => __menu.screen);
console.log('page', JSON.stringify(ui), errs);
if (ui.page !== 'rbtest' || !ui.switchOn || ui.typedPing !== 250 || ui.draggedJitter !== 100 || ui.arrowLoss !== 2 || ui.escTo !== 'pause' || errs.length) fail++;
await b.close(); process.exit(fail ? 1 : 0); })();
