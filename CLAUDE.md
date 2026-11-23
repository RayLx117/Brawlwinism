# Brawlwinism: project guide for Claude

The game is called **Brawlwinism** (it was "Ink Fighter" while it was a prototype). Ray is building a 2D platform fighter with an inky, dry-brush, watercolor look. It is being prototyped as one self-contained HTML file: `index.html`, which uses canvas 2D and has no dependencies. The plan is a downloadable game (.exe) later, possibly in Godot, but for now everything happens in the HTML prototype.

This package was carried over from a claude.ai project on 2026-11-20, at prototype version v44. Read this file first. The `docs/` folder has the full detail.

## How Ray likes to work

- **Build only what Ray asks for.** Don't add features, mechanics or UI on your own. Ray designs the game step by step.
- **Do deviate a little when it looks cleaner or cooler.** Ray trusts your judgment on visual polish: smoother arcs, nicer timing, small effects that support the request. Say what you added.
- **Ray tunes numbers.** When Ray asks for a new move or system, design it fully and then expect tweaks. Keep the numbers in one table (`MOVES`, constants) so they're easy to adjust.
- **Show results visually.** After any visual or animation change, render screenshots or a frame-by-frame contact sheet with Playwright (see `tests/`) and look at them before calling it done. Ray reacts to pictures, so share the image.
- **Iterate on feedback literally.** When Ray corrects a pose or effect, change exactly that and keep the rest. Ray's corrections are often precise, for example "head back, standing straight, about to fall backwards".
- Refer to Ray as they/them.
- Keep replies short, lead with the result, and mention any tests you ran.

## The look (art direction)

Full notes: `docs/art-direction.md`. Reference images: `reference/`.

- **Overall:** ink on paper. Bold black dry-brush strokes are the favourite: a heavy stroke whose tail splinters into bristle hairlines. Lines are clean, sharp and decisive, with thick-thin weight.
- **Fighters:** chibi proportions taken from `reference/chibi-pose-sheet-the-look.png`: big head, small V torso, big fists, short limbs, wide stance, faceless.
  - The head is an angular helm with a visor blade at the front and a swept spike off the top-back. It grew out of Ray's wedge-head sketch, `reference/ray-sketch-wedge-head.png`.
- **Fill:** a dull watercolor stain in the player's color, like coffee stains: flat layered washes, darker tide lines, white paper gaps and faint laid-paper lines (`reference/watercolor-stain-reference.png`). Dry-brush bristle shading sits on the shadow side of each part.
- **Outline:** a rippling black liquid-ink "goo" border around the whole silhouette, with a crisp core and a lagging wet layer. Drips form and fall off it. There is no faded outer haze; Ray removed it.
- **Effects:** ink splashes and ink motes only. There are no fading image effects and no spiky splats. Hit strength scales the splash.
- **Damage:** red goo rises like a tide from the feet to the head over the black ink. It is fully red only at 150%.
- **Stage "Practice":**
  - The background is graph paper.
  - The floor runs from an open edge at x 150 to a wall at x 1180 that runs up off-screen.
  - The ground and wall are brutalist board-formed concrete in ink and wash, drawn with depth (Ray's request). **The depth rule for every map:** the terrain's drawn silhouette sits exactly on the collision lines; depth is only shown on surfaces that recede behind the fighters (a top band around the walk line, a wall's inner face just past its collision line); fighters are always drawn in front, with no masking. See `STAGE3D` and `docs/art-direction.md`.
- **Typography:** italic Georgia/serif in ink, underlined with a short brush stroke.
- **Rejected looks (don't bring back):** big detailed creatures; extra limbs; long limbs; round blank heads; floppy arms in the air; a faded haze; hit-pause (Ray found it choppy); bubble shields; feint; the 2D "paper flip" spin.

## Files

```
index.html                  the whole game (HTML + CSS + one IIFE script). Open it in a browser to play.
docs/art-direction.md       visual style, references, and what Ray accepted or rejected
docs/controls-and-mechanics.md  movement, Shift dash/parry, damage, ragdolls, death, bot, controller
docs/moveset.md             every attack: inputs, timing and numbers, combo routes, design rules
docs/cards-and-companions.md  card rarities, card data, rounds, and the Divine General companion (boss)
docs/hud-and-feedback.md    portrait HUD, can't-be-hit shimmer, labels, parry visuals
docs/code-guide.md          how the code is laid out: rig, angle conventions, MOVES fields, test hooks
docs/history.md             version-by-version log of what Ray asked for (v1 to v44)
reference/                  Ray's reference images plus the line-style sheet Ray picked from
previews/                   recent screenshots and contact sheets (what v40 to v44 look like)
tests/                      Playwright scripts: move smoke tests, combo routes, screenshots, contact sheets
```

The game used to be published as a claude.ai artifact (https://claude.ai/artifact/WdNqV124yFa5Q1YDQThbj9). `index.html` here is the same build as v44.

## Running and testing

- **Play:** open `index.html` in a browser.
- **Tests and screenshots:** `cd tests && npm init -y && npm i playwright && npx playwright install chromium`, then for example `node moves.js`. Images go to `tests/out/`. `tests/README.md` lists each script.
- The game exposes test hooks:
  - `window.__step(dt, n)` advances n frames and draws.
  - `window.__tick(dt)` advances one frame without drawing; it's fast, so use it for brute-force searches.
  - `window.__fighter` / `window.__bot` give state.
  - `window.__hitPt` is where the last hit connected.
  - Drive inputs by dispatching `KeyboardEvent`s on `window`, using codes such as `KeyJ`, `KeyS` and `Space`.
- After changing a move, check three things:
  1. It still connects from its combo; `node moves.js` prints every move's hit.
  2. The routes in `docs/moveset.md` still work; use `combos.js`, or write a quick brute-force search over input timings like `knockdown.js`.
  3. Look at a frame sheet of the animation.
- Use git now that the project is local. Commit after each change Ray accepts, so it's easy to roll back. During the claude.ai phase every version was kept as a backup copy.

## Game summary (v44)

Controls:
- A/D or arrows: move. A short guarded walk ramps into a speedster sprint.
- W/Up/Space: jump. Jumping again in the air does a somersault double jump.
- S/Down: crouch, slide at full run, or fast fall in the air.
- J/X or left click: attack (X also fires the No Scope passive when it has a target). Right click: ability button (for abilities, aimed with the mouse crosshair).
- Shift: with a direction it dashes, any of 8 ways in the air. With no direction it is an instant parry.
- P: toggles bot parry. H: toggles the hitbox view.
- A controller is supported.

Mechanics:
- **Damage:** a percentage that only goes up, to a 150% maximum. Kill blows ragdoll the target. Ragdoll time is `0.2 + 1.3 * (d/150)^1.2` seconds, and knockback grows with damage. Ragdolled fighters can't be hit, and their goo border shimmers white while that's true.
- **Death:** only from leaving the screen (top, side or bottom), with an ink splash from that edge. The bot respawns at 0%.
- **Parry:**
  - The window is 0.32 s. The arms snap into an X in front of the face, with a semi-crouch, the head tucked, a white wash over the fighter and a quick yellow "cling" spark.
  - A success stuns the attacker for 1.5 s (standing tall, head back, teetering) and resets your cooldown.
  - A miss locks you in place for 0.3 s.
  - The 3 s cooldown starts after the window ends.
  - It cancels normal attacks (fists or weapon) like a dash, but never an ability or channel such as No Scope: the ability keeps its animation while the parry still runs (white flash, window). This is the rule for every future ability.
- **Movement:**
  - Each dash adds about 120 px/s of momentum, up to 760 (a run is 330).
  - The air dash has a 1.5 s cooldown and keeps carrying you until you land or press the opposite way. It's drawn as a spinning ink drill.

Moves are all on the attack button; full table in `docs/moveset.md`:
- **Ground string:** jab, then cross, then a finisher. Neutral is an uppercut (launch kill). Holding left or right gives a sucker punch (horizontal kill). Holding down gives a spin kick (a head-height knockdown that doesn't launch).
- **Out of movement:** dash punch, low kick (crouching) and slide kick (a launcher). The first two lead into cross and then a finisher.
- **Aerials:** neutral is a split kick (hits both sides). Left or right is a flying kick (a slightly weaker kill). Up is a flip kick (juggle). Down is a stomp (spike).
- **Rules Ray set:**
  - Every hit is telegraphed but rewarding.
  - Kill blows have long, readable wind-ups, and ink motes gather on the striking limb.
  - Side aerials are not air punches.
  - Aerials float you slightly toward their direction.
  - Ground attacks plant you; only lunges move you.
  - Jump-cancelling a ground attack on hit ends it, so you can act in the air immediately.

HUD: there is a round portrait for each fighter in play, bottom centre. Each one shows a head-and-shoulders bust inside a dry-brush ring border, with the damage % in big italic over the bottom of the circle.

## Guardrails

- **Rollback-ready rules** (for the planned P2P online play with rollback netcode, so there's no host advantage; see `docs/code-guide.md`):
  - The game only advances in fixed 1/60 s steps (`simFrame`) and reads input only from each fighter's packet (`f.in`), never the keyboard.
  - Both fighters run `fighterStep`; nothing is special-cased to the player or the bot (use `foeOf`, `side`).
  - Anything random that affects gameplay uses `grand()`, never `Math.random`; cosmetic effects may use `Math.random`.
  - Gameplay state lives on the fighters, `dg`, `round` or the `GAME` lists, so `saveState` captures it. Anything new that can affect the outcome must be reachable from `GAME`.
  - New cards are entries in `CARD_FX` using the hooks, not special cases.
  - After gameplay changes, run `node tests/sync-test.js` (all PASS) and `node tests/rollback.js`.

- Keep existing behaviour intact when changing something else. Many mechanics have specific numbers Ray asked for; they're recorded in `docs/`.
- When Ray says "remove" or "forget" an idea, remove it fully. Don't leave toggles or remnants.
- Keep everything in `index.html` unless Ray asks to split it up or move to an engine.
- New visuals must fit the ink-and-paper style: brush strokes made with `brushPath`, stain fills, ink motes and drops. Don't use glows, gradients that look digital, or flat vector UI.
