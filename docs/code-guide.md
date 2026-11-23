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

## Rollback-ready foundation (built for P2P online with rollback netcode)

Ray's plan is fair peer-to-peer online play with rollback netcode, so neither player has a host advantage. Online networking isn't built yet; this is the foundation it needs. The rule everything follows: **given the same game state and the same inputs, a frame always plays out exactly the same.**

**1. Fixed 60 Hz simulation (`frame`, `simStep`).**
- The game advances in whole 1/60 s steps (`SIM_DT`), however fast the screen draws. Each display frame runs as many steps as the real time calls for (at most `MAX_CATCHUP`), then draws once.
- Menus and the home screen run on real time, since they aren't the game. Drawing-only effects use `lastDt`.

**2. Input packets; both fighters run the same code.**
- Each step, every fighter gets one packet: `h` (buttons held), `p` (buttons newly pressed) and `stick`. `packInput` / `unpackInput` turn a packet into four integers and back; that's what will go over the wire.
- `deviceInput()` makes yours from the keyboard, pad and mouse.
- `botBrain(bot)` makes the bot's: it presses Shift to parry, and taps a direction to turn. Its reaction timer lives in `BRAIN`, outside the game state, like a player's thoughts.
- `makeFighter` builds both fighters. `fighterStep(f, dt)` is the whole of one fighter's frame, read from `f.in`. The old separate bot simulation is gone.
- KOs and respawns are shared: `koFighter`, `respawnFighter`, `ragStep`. Each fighter's `side` picks its loadout and HUD slot; `foeOf(f)` gives the opponent.

**Frame order (`simFrame(inputs, dt)`):**
1. Hand out the packets.
2. Step player 1, then player 2.
3. `resolveHits()`: each attack only records what it's touching (`f.hitTest`). Then every hit is found against where everyone is this frame, and only then applied, so player 1's hits don't land first. A trade is a trade.
4. `worldStep`: the Divine General, weapon effects, card hooks, the round and particles.

`update(dt)` reads the devices and the bot, then calls `simFrame`.

**3. Seeded random numbers.**
- Everything random that changes the game uses `grand()`: ragdoll limb jolts, the Divine General's attack choices and pauses, Wheel of Fate.
- Its state `simRng.s` is part of the game state, and every round starts from `MATCH_SEED` (online, both players will agree on it).
- Purely cosmetic effects keep `Math.random`: ink motes, drops, sparks, drips, shake, the HUD.

**4. One game state (`GAME`).**
- It holds the frame, the random state, the round, both fighters, the Divine General, and the weapon effects that can still hit (echoes, phantoms, ink pools, shockwaves).
- `saveState()` makes a deep copy. Fixed data such as `MOVES` and `DG_ATK` is kept as a link, and so is a fighter referenced from elsewhere (`dg.owner`).
- `loadState(S)` puts a copy back. `stateHash()` is an FNV-1a hash over it (numbers by their exact bits, keys sorted): the desync check both machines will compare.
- Left out on purpose: particles, the ink aura, swing trails, shake, HUD, menus, and each fighter's input packet (`in`).
- While a rollback re-runs frames, `resim` is true and particles aren't spawned twice.

**5. Card hooks (`CARD_FX`, beside `LOADOUT`).** A card is data: stats it changes, and hooks the game calls at fixed points. Each fighter has its round's card ids in `f.cards`.

| Hook | When it's called |
|---|---|
| `stats` | Multipliers folded together by `cardStat(f, key)`: `runSpeed`, `windSpeed`, `missRecovery`, `cardCd`. |
| `onRoundStart(f)` | The round begins. |
| `onInput(f, I)` | Before attacks, with this frame's packet; returns true if it used the press. |
| `onStep(f, dt)` | Every frame. |
| `pose(f, target)` | Lays the card's own animation over the fighter's. |
| `onHit(f, ctx)` | One of f's attacks lands; it can change `dmg`, `kb` and `stun`. |
| `breakParry(f, ctx)` | Lets f's attack go straight through a parry. |
| `onParry(f, ctx)` / `onParried(f, ctx)` | f parries an attack / f's attack is parried. |
| `onDash(f, ctx)` | f dashes. |
| `onKO(f)` | f is about to be knocked out; return true to save them. |
| `draw(f, R)` | Drawn with the fighter. |

Ported to hooks so far:
- **No Scope:** `onInput` (X), `onStep`, `pose`, `draw`.
- **Divine General:** `onRoundStart`.
- **Weapons (`WEAPON_FX`):** stats, `onHit` through `wpnHit`, Guard Breaker, Mirror and Anchor.

A new card only needs an entry in `CARD_FX`.

**6. Sync test (`__syncTest(packs)`, `tests/sync-test.js`).**
- Random input packets for both players, so the bot fights back.
- Runs them twice from the same start and compares the hash every frame.
- Also saves, steps, loads and steps again every frame (8 frames deep every 8th frame), which proves a save holds everything.
- Covered setups: fists v fists, sword + No Scope, the Divine General, and swords with Echo, Phantom, Splash and Bleed.

**7. Local rollback mode (pause menu: Rollback test; `tests/rollback.js`).**
- Fakes an online match against the bot. Your inputs apply at once; the bot's arrive `RB.delay` (7) frames late.
- Until they arrive the game guesses them: held buttons carry on, nothing new is pressed.
- When a real packet differs from the guess, the game loads the state saved at that frame and re-runs every frame since, before the next draw.
- A readout shows the number of rollbacks and their length.
- `__rbCheck()` replays the settled inputs straight through without rollbacks and confirms the state is identical.

**Checking the game still plays the same (`tests/golden.js`).** Scripted keyboard input through 8 scenarios, recording player and bot state every frame (`golden/before.json` from the original build). Results:
- **Player:** identical to the original in every scenario.
- **Bot:** small, deliberate differences, because it now runs the same fighter code as the player:
  - Its hit flinch changes its arm pose by about 0.2 rad.
  - When hit, it's planted for one frame before sliding back, just as the player always was.
  - Its parry fires one frame later, because it now presses Shift as an input like a player would.
- `tests/before-after.js` draws both builds side by side.

