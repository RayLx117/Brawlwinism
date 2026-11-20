# Tests and screenshots

These scripts drive `../index.html` in headless Chromium through the game's test hooks (`__step`, `__tick`, `__fighter`, `__bot`, `__hitPt`) and keyboard events. Their output goes to `tests/out/`.

Setup, once:

```
cd tests
npm init -y
npm i playwright
npx playwright install chromium
pip install pillow        # only needed by the contact-sheet scripts (join.py / grid.py)
```

| Script | What it does |
|---|---|
| `node moves.js` | Smoke test: lands every move on the bot and prints the result (velocity, ragdoll, label). It reports page errors. Note: the flip kick (`uair`) line prints `null` because of a quirk in this script's input timing; it was like that before v40. |
| `node combos.js` | Replays the combo routes with exact frame inputs and prints which hits landed. The "jump knee" entry predates the split kick and lands nothing. |
| `node knockdown.js` | Spin kick: where it connects (y), how far the target slides, when they're flat and when they're back up, at several damages and ranges. |
| `node ragdoll-time.js` | Compares the spin kick's ragdoll time with the uppercut's at several damages; they should match. |
| `node move-sheet.js` | One screenshot per move mid-strike (`out/mv*.png`, list in `out/mv.json`). Join them with `python3 join.py out/sheet.png out/mv*.png`. |
| `node spin-kick-frames.js` | A frame-by-frame contact sheet of the spin kick, made with the bot far away (`out/spin-sheet.png`). |
| `node spin-kick-hit-shot.js` | jab > cross > spin kick into the bot: hit, knockdown and get-up frames. |
| `node hud-shot.js [prefix] [botDamage] [seconds]` | A full-frame screenshot plus a HUD close-up. |
| `node menu-shot.js` | Opens the pause menu, flips both switches, opens Controls; screenshots `menu.png` and `menu-controls.png`. |
| `node cards-hover.js` | Select Cards and Bot's Cards: hovering over the category tabs doesn't switch them, and arrowing along them only moves the focus; a click or Enter on a tab does switch it. Uses `__cardsState()`. |
| `node cards-tab-hover-shot.js` | Close-ups of the Select Cards category tabs at rest and with the mouse on one (`out/tabs-rest.png`, `out/tabs-hover.png`). |
| `node mouse-controls.js` | Mouse controls: left click punches in a fight, right click doesn't punch or open the browser menu, the aim follows the mouse, the cursor is the crosshair in the arena and the ink arrow in menus, and menu clicks don't punch. Writes `out/cursors.png`. |
| `node home-shot.js` | The home (title) screen (`out/home.png`) and the page title. |
| `node menu-mockups.js` | Still mockups of main-menu background ideas (ink in water, the Divine General's wheel, misty mountains, ensō) behind the real brush title. Reuses the game's own brush and title code; writes `out/menu-mock-*.png` and `out/menu-mockups.png`. |
| `node home-video.js` | Records about 10 s of the animated main menu to `out/home-menu.webm` and prints the average frame interval. |
| `node fullscreen-shot.js` | The page layout: at 1920x1080 the game fills the window exactly; at a non-16:9 size, the leftover space is black bars. Screenshots `out/full-*.png`. |
| `node shimmer-shot.js` | The bot ragdolled after a sucker punch, showing the can't-be-hit shimmer. |
| `node dg-shot.js [prefix]` | Divine General close-ups: standing, cleave, heaven strike, quake (`out/<prefix>-*.png`). |
| `node dg-card-shot.js [prefix]` | His HUD portrait and his card in Select Cards. |
| `node dg-pierce.js` | His pierce from five angles (near, far, high, overhead, mid-air): prints when it skewered and where you landed; a frame sheet per case (`out/pierce-<case>.png`). |
| `node dg-soak.js` | Lets him fight on his own for 90 s; prints the attacks he picked, repeats, skewers, and page errors. |
| `node dg-crown-shot.js` | Close-ups of the pierce's warning halo on the player, standing and in the air (`out/crown-*.png`). |
| `node dg-quake.js` | His quake stomp on the player and on the bot: prints damage, stun, how high they were popped, and that they weren't ragdolled; frame sheets `out/quake-player.png` and `out/quake-bot.png`. |
| `node dg-hud-entrance.js` | His HUD entrance for both owners: his portrait flies in and knocks the owner's out (`out/dg-hud-entrance-*.png`). |
| `node dg-flash-shot.js` | Close-up frames of the pierce's flash jab and its sound-barrier burst (`out/flash.png`). `node dg-pierce.js` covers the hits from every angle; `BOXES=0` renders it without the hitbox view. |
| `node dg-rounds.js` | Four Divine General rounds back to back: checks his portrait's number stays normal size after each respawn, and that nothing from the last round lingers (`out/dg-rounds.png`). |
| `node weapon-rolls.js` | Rolls 2000 weapons of each rarity: prints the damage spread and modifier slots, and checks every roll is in range. |
| `node dg-sweep.js` | Quake into his sweep follow-up on the player: once taking it (prints the sideways ragdoll), once parrying as the stun wears off (no damage), once from further away; frame sheets `out/sweep-*.png`. |

## Patterns for new tests

- Reset the state by assigning fields, then step. For example, `Object.assign(__bot, { x: 860, y: 540, damage: 0, rag: null, onGround: true, ... })` and `Object.assign(__fighter, { x: 800, ... })`, then `__fighter.punch.on = false`.
- Brute-force the input timings with `__tick(1/60)` in loops, which is fast. Hits are detected when `__bot.moveT` jumps back to 1.4 and `__bot.move` names the move.
- Render with `__step(1/60, n)` before screenshots. Use `deviceScaleFactor: 2` for images Ray will see.
- Some effects use `Math.random`, such as ragdoll limb kicks and particles. Run a timing several times before calling it reliable.
