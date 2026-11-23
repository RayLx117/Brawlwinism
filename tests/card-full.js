// The full card preview (top right of Select Cards) for each card: No Scope (passive slot), the equipped Sword (rolled), the Divine
// General, and an unequipped Sword in the gallery. Sheet: out/card-full.png; whole screen: out/card-full-screen.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT.pl; L.passives = ['noScope']; L.companion = 'divineGeneral'; L.weapon = 'sword'; L.weaponSpec = __weapons.rollWeapon('sword', 'legendary'); }); await p.waitForTimeout(300);
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
await p.mouse.click(box.x + 640 * k, box.y + 184 * k); await p.waitForTimeout(400); await p.mouse.move(box.x + 5, box.y + 5);
const focus = async (row, col) => { await p.evaluate(([r, c]) => { const s = __cardsState(); s.row = r; s.col = c; s.selT = 0; }, [row, col]); await p.waitForTimeout(250); };
for (const [row, col] of [[1, 0], [0, 1], [3, 1], [0, 0]]) { await focus(row, col); const f = OUT + `cf-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + 740 * k, y: box.y + 70 * k, width: 420 * k, height: 330 * k } }); fs_.push(f); }
await focus(1, 0); await p.screenshot({ path: OUT + 'card-full-screen.png' });
execSync(`python3 ${__dirname}/grid.py ${OUT}card-full.png 4 0.6 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();
