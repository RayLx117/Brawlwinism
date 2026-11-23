const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 }); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
const box = await p.locator('canvas').boundingBox(); const sx = box.width/1280; const S=OUT;
const botx = +(process.argv[2] || 1150);
await p.evaluate((botx) => {
  const k = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })); window.K = k;
  for (const c of ['KeyA','KeyD','KeyS','KeyW','KeyJ','ShiftLeft','Space']) k(c,0); __step(1/60,30);
  Object.assign(__bot,{x:botx,y:540,vx:0,vy:0,rag:null,onGround:true,stunT:0,hurtT:0,damage:0,dead:0,combo:0,label:'',moveLab:'',moveLabT:0,parryT:0,labelT:0});
  Object.assign(__fighter,{x:600,y:540,vx:0,vy:0,onGround:true,facing:1});
  __fighter.punch.on=false; __fighter.punch.next=0; __fighter.punch.lastEnd=-9; __step(1/60,1);
  window.str = (n) => { K('KeyJ',1);__step(1/60,1);K('KeyJ',0); __step(1/60,n); };
  str(15); str(14); K('KeyS',1); K('KeyJ',1); __step(1/60,1); K('KeyJ',0);
}, botx);
const steps = [3,4,5,4,2,2,2,3,6,6,6,8];
const files=[]; let t=1;
for (let i=0;i<steps.length;i++){ await p.evaluate((n)=>__step(1/60,n), steps[i]); t+=steps[i];
  const x = await p.evaluate(()=>__fighter.x);
  const f=S+'sp'+i+'.png'; files.push(f); await p.screenshot({ path: f, clip: { x: box.x + (x-90)*sx, y: box.y + 400*sx, width: 190*sx, height: 150*sx } }); }
console.log('errors', errs, await p.evaluate(()=>[__bot.moveLab, __bot.label, !!__bot.rag]));
await b.close();
require('child_process').execSync('python3 '+path.join(__dirname,'join.py')+' '+S+'spin-sheet.png '+files.join(' '), {env: {...process.env, SC: '0.6'}});
})();
