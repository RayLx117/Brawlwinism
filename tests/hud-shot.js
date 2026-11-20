const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 }); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
const box = await p.locator('canvas').boundingBox(); const sx = box.width/1280;
const dmg = +(process.argv[3] || 87), t = +(process.argv[4] || 2);
await p.evaluate(([d, t]) => { __step(1/60, Math.round(t*60)); __bot.damage = d; __step(1/60, 1); }, [dmg, t]);
await p.screenshot({ path: (process.argv[2] || OUT + 'hud') + '-full.png', clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
await p.screenshot({ path: (process.argv[2] || OUT + 'hud') + '-hud.png', clip: { x: box.x + 460*sx, y: box.y + 590*sx, width: 360*sx, height: 130*sx } });
console.log('errors', errs); await b.close(); })();
