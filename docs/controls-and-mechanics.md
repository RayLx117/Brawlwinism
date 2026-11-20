# Controls and mechanics (v44)

Ray asked for every item here, so keep them intact unless Ray changes them.

## Keyboard

| Key | Action |
|---|---|
| A / D, ← / → | Move. A short guarded walk ramps into a speedster sprint. |
| W / ↑ / Space | Jump. Press again in the air for a somersault double jump. W/↑ also counts as "up" for the flip kick. |
| S / ↓ | Crouch while standing; you can crouch-walk slowly. Pressed at full run, or during/just after a ground dash, it slides. In the air it fast falls, with the lead foot pointed down. |
| J / X | Attack; see `moveset.md`. |
| Shift | With a direction: dash (8 ways in the air). With no direction: an instant parry. While Shift is held in the air, W/↑ aims instead of jumping. |
| P | Bot parries on or off. |
| H | Show hitboxes. |
| Esc | Pause menu. |

The controller works with the stick or d-pad: A/Y jump, X/B punch, bumpers or triggers act as Shift, Back toggles bot parry, and Start opens the pause menu.

## Home menu

The game opens on a home menu: a plain sheet of paper with "Ink Fighter" in big italic ink over a dry-brush stroke that splinters into bristles. The only option for now is **Practice Tool**, which goes to the Practice stage. Select it with Enter, Space, J, the controller's A, or a click. Tests skip this screen with `__startPractice()`; `__step` also switches to practice on its own.

## Pause menu

Esc or Start freezes the fight under a paper wash and shows an ink-bordered card with these items:
- Resume.
- Restart Round, which puts everyone back at the start, fresh (see `cards-and-companions.md`).
- Select Cards, which opens the card screen (see below).
- Bot's Cards: the same screen for the bot's loadout.
- Main Menu (last item), which goes back to the home menu. The practice fight keeps its state for when you return.
- Bot parries, an on/off switch.
- Hitboxes, an on/off switch.
- Damage numbers, an on/off switch (off by default).
  - Each hit pops its damage, for example "2.5%", in italic ink with a paper halo, out to the side the hit knocked the target.
  - The number drifts a little and shrinks away after 0.9 s.
  - Kill blows come out bigger and red, with a brush underline.
  - In a string, older numbers step up so they stack (`drawDmgNums`).
- Controls, which raises a pop-up from the bottom that lists every button by action, with keyboard and controller columns.

Navigation: up/down (stick, d-pad, W/S or arrows) moves; A, Enter or Space selects; left/right sets a switch off or on; B, Esc or Backspace backs out (it closes the pop-up first, then the menu). Start closes the menu too. The mouse works as well: hover picks an item and a click activates it.

## Select Cards (pause menu)

Cards are Ray's planned weapons and augments: weapons, companions, passives, stat boosts, abilities and so on. **None exist yet**; this is only the menu. Data lives in `CARD_SLOTS`, `CARDS` (empty) and `equipped`, which are exposed as `window.__cards`.

- **Equipped (top), in two rows:**
  - **Gear:** five slots, each holding one card at a time: Weapon, Companion, Air Dash, Parry, Ability.
  - **Passives:** there's no fixed number. Each equipped passive gets its own slot ("Passive 1", "Passive 2" and so on), and a "+" slot ("add passive") always sits at the end, so the row grows as you add passives. Past `PASS_VIS` (8) slots the row scrolls sideways to follow focus, with ◀ and "▶ n more" hints. The heading shows the count, for example "Passives (10)". The same passive can't be equipped twice.
  - An empty slot is a dashed brush outline marked "empty"; an equipped one is a solid card with the card's name.
- **Details (top right):** the name and text of the focused slot or card.
- **Sorting tabs:** All, Weapon, Companion, Air Dash, Parry, Ability, Passives (`CARD_TYPES`). New card types will get their own tabs. The controller's bumpers (LB/RB) cycle the tabs from anywhere on the screen.
- **Gallery:** an 11 × 2 grid of cards that scrolls by row, with "▲ more" / "more ▼" hints. While it's empty it reads "No cards yet".
- **Navigation:**
  - Up/down moves between the gear row, passives row, tabs and gallery.
  - Left/right moves along a row; moving along the tabs switches them right away.
  - A or Enter on a slot jumps to that slot's tab.
  - On a gallery card it equips the card, and doing it again unequips it. A passive picked after choosing a filled passive slot swaps into that slot. Otherwise, including after choosing "+", it's added at the end. Unequipping a passive closes its slot up.
  - B, Esc or Backspace goes back to the pause list; Start closes the whole menu.
  - The mouse works too: hover focuses, and a click acts.

Under the game, the controls text is now a single hint: "Esc or Start pause". The full list lives in the Controls pop-up (`CONTROLS` in `index.html`).

Input buffers: jump 0.13 s, punch 0.16 s, and dash 0.14 s (the dash buffer also works during its cooldown).

## Movement

- RUN 330, ground acceleration 2600, air acceleration 1500, friction 2900, gravity 2000, JUMP_V 885, MAX_FALL 1250, fast fall 1400.
- **Momentum:**
  - Each dash leaves you about 120 px/s faster, capped at 760.
  - Speed above a run bleeds off slowly while you hold the same direction.
  - Dash-jumps and slide-jumps keep their speed.
- **Air dash:**
  - Goes in 8 directions, once per airtime, with a 1.5 s cooldown shown as a thin ring over the head.
  - Afterwards you keep sailing until you land or press the opposite way (carry drag 45).
  - A downward air dash that lands turns into a ground dash.
  - It's drawn as the body collapsing into a spinning ink drill.
- **Slide:** the whole body drops so the outstretched lead foot rides along the floor.
- **Double jump:** a forward somersault (0.5 s).
- **Collisions:** there are no player-player collisions; Ray removed them. A landed hit soaks up your lunge.
- **Cliff face (solid):** the face under the open edge on the left (x 150, below floor level) is a wall too. It works exactly like the big wall, with the same slide, wall jumps, speed lock and sparks, so you can cling under the ledge and climb back up. It only counts while you're airborne, so nothing standing on the floor near the edge gets pushed off (`wallXAt`, `wallOverlap`).
- **Wall (solid):** the player's whole outline is kept out of the wall, so fists, feet, the head and the air-dash drill all stop at its face (`bodyMaxX`, which uses the same part silhouettes as the goo border). A punch thrown into the wall pushes you back off it instead of going through.
- **Wall slide (`WALL_SLIDE`):**
  - Starts when you're airborne, falling, touching the wall and not holding away from it. It doesn't start while attacking, dashing, fast falling or stunned.
  - Pose (`WALLSLIDE`): facing the wall and pressed up against it, with both fists flat on it, the lead foot braced on it and the rear knee tucked under. Ray asked that the slide never turn the fighter around, because turning caused a flicker. Ink motes smear off the contact point, more of them the faster you go.
  - **Speed lock:**
    - Once the slide's speed limit reaches `lock` (560 px/s, about 2.6 s of wall time), the wall gives no jump at all: no wall jump, and no double jump while you're touching the wall.
    - To jump again, let go of the wall (hold away), or land to reset.
    - From `warn` (380 px/s, about 1.6 s) friction sparks fly up off the fists and lead foot. They start yellow, turn red by the lock, and stay red after it. The colour is set by `addSpark`'s `red` value.
  - Speed is 70 + 190 × (time on the wall) px/s, capped at 900. Wall time keeps adding up across wall contacts until you touch the ground, which resets it. A fall onto the wall is caught over a moment (brake 2600) rather than stopped dead.
  - Gives back your double jump, and your air dash too, but only once its cooldown is over.
  - Hold away from the wall to drop off it; down fast falls off it.
- **Wall jump (`WALL_JUMP`):**
  - Jump while touching the wall in the air, with a 0.1 s grace after leaving it. It doesn't use your double jump.
  - Holding toward the wall climbs it: up 820, out 150, so you drift back onto the wall. Any other input kicks off it: up 820, out 430.
  - A short tap gets the usual short hop, so hold jump to climb properly.
  - Climbing has no limit yet.

## Parry (Shift with no direction)

- **Window:** 0.32 s.
  - The arms snap into a jittery X in front of the face, with the head tucked behind it and the knees bent a little (a semi-crouch).
  - A white wash covers the fighter.
  - A quick yellow "cling" appears where the arms cross: about 6 short sparks and a brief glint.
- **Cooldown:** 3 s, shown as a small ink arc over the head. It starts only after the window ends.
- **Success:**
  - Your cooldown resets.
  - The attacker is stunned for 1.5 s: the head snaps back and stays back, they stand tall teetering backwards as if about to fall, with a subtle sway and dazed ink dots.
- **Miss:** you're locked standing still for 0.3 s with the arms still up.
- **Removed by Ray:** feint (v24), shield / hold-to-shield (v25) and the chest-pump/back-arch pose. Don't bring them back.

## Damage, ragdolls, death

- **Damage:** a "damaged" percentage that only goes up, to a 150% maximum. The jab adds 5 and the cross 7; see `moveset.md` for the rest.
- **The red tide:** red goo rises from the feet to the head over the black ink and the parts' line work as damage builds. It is fully red only at 150%.
- **Kill blows** (moves with `ragdoll: true`):
  - The target ragdolls for `0.2 + 1.3 * (d/150)^1.2` seconds, using the damage after the hit.
  - Launch grows with damage: `1 + 1.35 * (d/150)^1.1`. A move's `lsK` can soften that growth.
  - Ragdolls keep their momentum (no drag), bounce off the floor and wall, spin with their flight, and leave dry-brush streaks.
- **After a ragdoll:**
  - A ragdoll that's still in the air rights itself and falls normally.
  - One that's on the ground gets up over 0.45 s.
  - A knockdown (`down: true`, the spin kick) never rights itself in the air; it lands flat and then gets up.
- **Can't be hit:** a ragdolled fighter, including during the get-up, can't be hit (`canBeHit()`). Their goo border shimmers white the whole time.
- **Death:**
  - Only by leaving the screen (top, left, bottom, or past the wall side). This applies to the player too.
  - It plays an ink-splash burst from that edge, particles only.
  - The bot respawns at 0%, dropped in from above.

## Test bot

- The bot stands still at x 860. It's red and looks dazed when stunned.
- It shows labels such as "2 hit combo" and "not a true combo" (the latter for a string hit that the target could have parried in between).
- It also shows the name of the move that just landed.
- P switches it to a mode where it parries any punch it sees while not stunned, with a 0.06 s reaction.

## Debug

H toggles the hitbox view:
- Hurtboxes are pink, one oval or circle per body part following the pose. They're used for hit tests and turn faint and dashed while ragdolled.
- Light-attack hitboxes are yellow.
- Kill-blow hitboxes are orange: a limb capsule shown only during active frames.
