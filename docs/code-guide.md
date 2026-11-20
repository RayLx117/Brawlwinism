# Code guide (index.html, v44)

Everything is in one file. The HTML/CSS (a paper "desk", a 16:9 canvas and a line of controls hints) comes first, then one `<script>` IIFE of about 2,100 lines. The game works in fixed 1280x720 game coordinates and is scaled to the canvas with `view.s * view.dpr`.

Line numbers below are approximate; search for the names.

## Map

| Area | Names |
|---|---|
| Matrices | `T`, `R`, `Sc`, `mul`, `chain`, `apply`, `localVec`. A 2D affine matrix is `[a,b,c,d,e,f]`. |
| Textures | `stainTexture(rgb, seed, plain)` (watercolor), `dryBrushCanvas` / `BRUSH` (bristle shading), `granCanvas` |
| Parts | `SRC` → `PARTS`: Path2D `fill` (the silhouette, which also drives the aura), `ink` (the inner brush line), `deco`, `thin`, `brush`, `shade`. Constants `LEN`, `FIST_C`, `SOLE`. |
| Poses | `KEYS`, `mixPose`, `ik`, `idlePose`, `walkPose`, `sprintPose`, plus constants such as `JUMP`, `FALL`, `SLIDE`, `TUCK`, `FASTFALL`, `AIRDASH` and `LIMP` |
| Moves | `MOVES` (~line 263), `limbChain`, `COMBO_GAP`, `HIT_R` |
| Hurtboxes | `HURT_SHAPES` (ovals per part, in part space), `hurtShapes(R)`, `hurtHit(shapes, x, y, r)` |
| Parry | `XGUARD`, `PARRY_WIN`, `PARRY_STUN`, `PARRY_MISS_LOCK`, `parryPose`, `parryStunPose`, sparks |
| Rig | `rig(f)` (~line 530) returns `{ centre, L:{f,b}:{up,lo,ft}, torso, head, fa:{up,lo}, ba:{up,lo} }` |
| Ink aura | `AUR`, `INST` rings per part, `auraUpdate`, `botInk`. These hold the liquid outline: core, liquid, drips and the red band. |
| Player state | `pl` (`window.__fighter`), keyboard map `MAP`, gamepad `pollPad` |
| Bot | `bot` (`window.__bot`), `BOT_HOME`, `botUpdate`, `botRespawn`, `koBurst` |
| Damage and ragdoll | `MAX_DAMAGE`, `ragTime`, `launchScale`, `canBeHit`, `startRagdoll`, `ragdollStep`, `ragdollGround`, `ragImpact` |
| Attacks | `pickMove`, `startPunch`, `landHit` |
| Main update | `update(dt)`: input, dash/parry, movement, pose blending, attack hit tests, then `botUpdate` |
| Drawing | `drawPart`, `drawFighter`, `drawInkBody`, `drawDrill`, `drawBot`, `drawShimmer`, `drawParryTint`, `drawCooldown`, `brushPath` (tapered brush polygon), `buildBackdrop` (stage, cached per size), `drawBotLabel`, `drawHud`/`drawPortrait`, `drawBoxes`, `draw()` |

## Conventions that trip people up

- **Pose angles** are in radians. Arms are relative to the torso: an arm's world angle is `tl + a1`, and the forward horizontal is `-π/2 - tl`. **Legs are world angles from the hip** (root), not relative to the torso. For any limb, a **negative angle swings forward**. `ff`/`bf` are foot angles relative to the ground; positive means toe down.
- **Pose keys:** `tl` torso lean (positive leans forward), `hd` head, `fa1`/`fa2` front arm upper/lower, `ba1`/`ba2` back arm, `fl1`/`fl2` front leg, `bl1`/`bl2` back leg, `ff`/`bf` feet, `dx` body shift (rig units, along facing), `sp` punch shoulder push.
- The **lowest sole is placed on the feet line**, so changing the legs moves the body up or down automatically. A slide holds the slide height.
- **Facing** is a mirror in the root matrix (`Sc(facing * S, S)`). `S = 1.25` converts rig units to game px.
- **Attack phases:** phase 0 is wind (`t < wind`), phase 1 is strike (until `wind + act + hold`), phase 2 is recovery. During the wind and the strike every key moves at the move's snap rate. During recovery only the attacking limb and the torso, head, `dx` and `sp` ease back at that rate; the rest uses the normal rate. Over-the-top swings (angles past π) unwind the short way in recovery.
- **The rear-leg stretch** (`pl.bStretch`) lengthens the back leg's upper and lower parts in the rig. It's only used by the spin kick.
- **The hit test** is a capsule (radius `r`) along the limb chain (tip first: fist > elbow > shoulder, or toe > ankle > knee > hip). It runs against the bot's hurt ovals, only during active frames, and only when `canBeHit(bot)` is true.
- **Kill-blow knockback** uses the damage the target had going in; ragdoll time uses the damage after the hit.

## Test hooks

- `window.__step(dt, n)` advances n frames and draws.
- `window.__tick(dt)` advances one frame without drawing; use it in brute-force searches.
- `window.__fighter` and `window.__bot` hold state. You can set fields directly in tests, for example `__bot.damage = 140`.
- `window.__hitPt` is `[x, y]` of the last hit.
- `window.__dbg`, `window.__XG` are debug bits.
- Inputs: `window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' }))`, then `'keyup'`.
