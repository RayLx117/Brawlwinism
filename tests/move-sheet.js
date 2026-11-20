const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 }); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
const box = await p.locator('canvas').boundingBox(); const sx = box.width/1280; const S=OUT;
await p.evaluate(() => {
  const k = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })); window.K = k;
  window.reset = (px=600, air=null) => { const f=__fighter, bo=__bot; for (const c of ['KeyA','KeyD','KeyS','KeyW','KeyJ','ShiftLeft','Space']) k(c,0); __step(1/60,30);
    Object.assign(bo,{x:1150,y:540,vx:0,vy:0,rag:null,onGround:true,stunT:0,hurtT:0,damage:0,dead:0,combo:0,label:'',move:'',moveT:0,parryT:0,labelT:0});
    Object.assign(f,{x:px,y:air??540,vx:0,vy:0,onGround:air==null,facing:1,dashT:0,slideT:0,crouchK:0,staggerT:0,lockT:0,landT:0,airJumps:1,airDashes:1,airDashCd:0,fastFall:false,moveT:0});
    f.punch.on=false; f.punch.next=0; f.punch.lastEnd=-9; __step(1/60,1); };
  window.str = (n) => { K('KeyJ',1);__step(1/60,1);K('KeyJ',0); __step(1/60,n); };
});
const M = [
 ['dash punch', `reset(); K('KeyD',1); K('ShiftLeft',1); __step(1/60,1); K('ShiftLeft',0); __step(1/60,3); K('KeyD',0); str(6);`],
 ['low kick', `reset(); K('KeyS',1); __step(1/60,12); str(5);`],
 ['slide kick', `reset(300); K('KeyD',1); __step(1/60,40); K('KeyS',1); __step(1/60,3); str(6);`],
 ['uppercut (3rd hit)', `reset(); str(15); str(15); str(19);`],
 ['sucker punch (3rd + side)', `reset(); str(15); str(15); K('KeyD',1); str(19);`],
 ['roundhouse (3rd + down)', `reset(); str(15); str(15); K('KeyS',1); str(21);`],
 ['split kick (air)', `reset(600,380); str(7);`],
 ['flying kick (air + side)', `reset(600,360); K('KeyD',1); str(12);`],
 ['flip kick (air + up)', `reset(600,360); K('KeyW',1); str(7);`],
 ['stomp (air + down)', `reset(600,300); K('KeyS',1); str(15);`],
];
const files=[];
for (let i=0;i<M.length;i++){ await p.evaluate(M[i][1]); const [x,y]=await p.evaluate(()=>[__fighter.x,__fighter.y]);
  const f=S+'mv'+i+'.png'; files.push(f); await p.screenshot({ path: f, clip: { x: box.x + (x-95)*sx, y: box.y + (Math.min(y,540)-140)*sx, width: 200*sx, height: 160*sx } }); }
console.log('errors', errs); await b.close();
require('fs').writeFileSync(S+'mv.json', JSON.stringify({files, names: M.map(m=>m[0])}));
})();
