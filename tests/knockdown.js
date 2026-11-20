const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
const res = await p.evaluate(() => {
  const K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  const out = [];
  for (const [dmg, gap] of [[0, 60], [70, 60], [140, 60], [0, 30], [0, 95], [0, 120], [0, 140], [0, 160]]) {
    for (const c of ['KeyA','KeyD','KeyS','KeyW','KeyJ','ShiftLeft','Space']) K(c,0); __tick(1/60); __tick(1/60);
    Object.assign(__bot,{x:800 + gap,y:540,vx:0,vy:0,rag:null,onGround:true,stunT:0,hurtT:0,damage:dmg,dead:0,combo:0,label:'',move:'',moveT:0,parryT:0});
    Object.assign(__fighter,{x:800,y:540,vx:0,vy:0,onGround:true,facing:1,airJumps:1,landT:0});
    __fighter.punch.on=false; __fighter.punch.next=gap === 60 ? 0 : 2; __fighter.punch.lastEnd=__fighter.time; __tick(1/60);
    let hitAt = -1, landAt = -1, upAt = -1, x0 = 0, xLand = 0, peak = 540, died = false, plFree = -1, hitY = 0;
    for (let i = 0; i < 200; i++) {
      if (gap === 60) { if (i === 0 || i === 16) K('KeyJ', 1); if (i === 1 || i === 17) K('KeyJ', 0); if (i === 30) { K('KeyS', 1); K('KeyJ', 1); } if (i === 31) K('KeyJ', 0); }
      else { if (i === 0) { K('KeyS', 1); K('KeyJ', 1); } if (i === 1) K('KeyJ', 0); }
      __tick(1/60);
      const bo = __bot;
      if (hitAt < 0 && bo.move === 'spin kick') { hitAt = i; x0 = bo.x; hitY = Math.round(window.__hitPt[1]); K('KeyS', 0); }
      if (hitAt >= 0) { peak = Math.min(peak, bo.y); if (landAt < 0 && bo.rag && bo.rag.phase === 'ground') { landAt = i; xLand = bo.x; } if (upAt < 0 && !bo.rag) upAt = i; if (plFree < 0 && !__fighter.punch.on) plFree = i; }
      if (bo.dead > 0) died = true;
    }
    out.push(`dmg ${dmg} gap ${gap}: ${hitAt < 0 ? 'MISS' : `hit at foot y${hitY} (floor 540); flat on floor ${(landAt - hitAt)}f after, slid ${Math.round(xLand - x0)}px, rose ${540 - Math.round(peak)}px, back up ${upAt - hitAt}f after; attacker free ${plFree - hitAt}f after; died=${died}`}`);
  }
  return out.join('\n'); });
console.log(res); console.log(errs); await b.close(); })();
