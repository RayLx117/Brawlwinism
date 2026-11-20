const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
const res = await p.evaluate(() => {
  const K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  const out = [];
  for (const dmg of [0, 40, 80, 120]) for (const [name, key] of [['spin kick', 'KeyS'], ['uppercut', null]]) {
    for (const c of ['KeyA','KeyD','KeyS','KeyW','KeyJ','ShiftLeft','Space']) K(c,0); __tick(1/60); __tick(1/60);
    Object.assign(__bot,{x:860,y:540,vx:0,vy:0,rag:null,onGround:true,stunT:0,hurtT:0,damage:dmg,dead:0,combo:0,label:'',move:'',moveT:0,parryT:0});
    Object.assign(__fighter,{x:800,y:540,vx:0,vy:0,onGround:true,facing:1});
    __fighter.punch.on=false; __fighter.punch.next=0; __fighter.punch.lastEnd=-9; __tick(1/60);
    let hitAt = -1, left0 = 0, endRag = -1;
    for (let i = 0; i < 260; i++) {
      if (i === 0 || i === 16) K('KeyJ', 1); if (i === 1 || i === 17) K('KeyJ', 0);
      if (i === 30) { if (key) K(key, 1); K('KeyJ', 1); } if (i === 31) K('KeyJ', 0);
      __tick(1/60);
      if (hitAt < 0 && __bot.move === name) { hitAt = i; left0 = __bot.rag ? __bot.rag.left : -1; if (key) K(key, 0); }
      if (hitAt >= 0 && endRag < 0 && __bot.rag && __bot.rag.left <= 0) endRag = i;
    }
    out.push(`${dmg}% ${name}: ragdoll timer ${left0.toFixed(2)}s, ran out ${((endRag - hitAt) / 60).toFixed(2)}s after the hit`);
  }
  return out.join('\n'); });
console.log(res); console.log(errs); await b.close(); })();
