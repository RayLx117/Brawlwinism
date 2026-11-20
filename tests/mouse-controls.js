// Mouse controls: left click punches in a fight, right click is the ability button (no browser menu), the cursor is the ink
// crosshair in the arena and the ink arrow in the menus, and clicks in the menus still pick things without punching.
// Also writes a close-up of both cursors (out/cursors.png).
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 } }); const errs = []; p.on('pageerror', e => errs.push(e.stack));
  await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox();
  let ok = true; const check = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) ok = false; };
  check(await p.evaluate(() => __cursor()) === 'menu', 'home screen: ink arrow cursor');
  check((await p.evaluate(() => document.querySelector('canvas').style.cursor)).includes('image-set') || (await p.evaluate(() => document.querySelector('canvas').style.cursor)).includes('url('), 'cursor is a custom image');
  await p.evaluate(() => __startPractice()); await p.waitForTimeout(200);
  check(await p.evaluate(() => __cursor()) === 'aim', 'in the arena: crosshair cursor');
  await p.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3);
  await p.mouse.down(); await p.waitForTimeout(50);
  check(await p.evaluate(() => __fighter.punch.on), 'left click starts a punch');
  await p.mouse.up(); await p.waitForTimeout(700);
  const a = await p.evaluate(() => ({ ...__aim }));
  check(Math.abs(a.x - 1280 * 0.7) < 4 && Math.abs(a.y - 720 * 0.3) < 4 && a.on, `aim follows the mouse (${a.x | 0}, ${a.y | 0})`);
  let menuOpened = false; p.on('dialog', () => {});
  await p.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5, { button: 'right' }); await p.waitForTimeout(100);
  check(!(await p.evaluate(() => __fighter.punch.on)), 'right click does not punch');
  const ctxBlocked = await p.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.querySelector('canvas').dispatchEvent(e); return e.defaultPrevented; });
  check(ctxBlocked, 'right click does not open the browser menu');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  check(await p.evaluate(() => __menu.open && __cursor() === 'menu'), 'pause menu: ink arrow cursor');
  await p.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5); await p.waitForTimeout(100);
  check(!(await p.evaluate(() => __fighter.punch.on)), 'a click in the menu does not punch');
  // cursor close-up
  const imgs = await p.evaluate(() => { const c = __cursorImages(); const pick = (v) => v[0].split('url(')[2].split(')')[0]; return [pick(c.aim), pick(c.menu)]; });
  const p2 = await b.newPage({ viewport: { width: 420, height: 200 }, deviceScaleFactor: 2 });
  await p2.setContent(`<body style="margin:0;display:flex;gap:30px;padding:20px;background:#ece4d3">${imgs.map(u => `<div style="padding:10px;background:#ece4d3"><img src="${u}" width="160" height="160" style="image-rendering:auto"></div>`).join('')}<div style="padding:10px;background:#15120f"><img src="${imgs[0]}" width="80" height="80"></div></body>`);
  await p2.waitForTimeout(200); await p2.screenshot({ path: OUT + 'cursors.png' });
  console.log(ok ? 'all passed' : 'FAILED', 'errors', errs); await b.close();
})();
