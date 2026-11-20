# Art direction

Ray wants an inky brush-stroke look. Everything should read as ink and watercolor on paper.

## References (in `reference/`)

- `chibi-pose-sheet-the-look.png` is **the look**. Ray said to use this reference itself as the style. It has chibi proportions: a big head (about 40% of the height) with a sharp swoosh crest, a small V torso, big fists, a wide stance, and bold thick-thin brush outlines with flame-like flicks.
- `ray-sketch-wedge-head.png` is Ray's rough sketch: a big blocky wedge/fin head with a flat-ish bottom and a top edge sweeping up to a sharp point, on a blocky body. Ray liked that blockiness. The current head (an angular helm with a visor blade and a top-back spike) is the blend of this sketch and the chibi sheet.
- `watercolor-stain-reference.png` is the watercolor reference: a coffee-stain-like page with flat layered washes, crisp darker tide-line edges, white paper gaps and faint laid-paper lines.
- `line-styles-round1.jpg` is the first style sheet. Ray's favourite stroke is the **dry brush with a bristle break**: a bold stroke with small splintering bristle lines breaking off its tail. Hit effects are ink splashes scaled to hit strength. That sheet also has motion arcs and speed strokes in the same family.

## Fighters

- They are simple humanoids with no extra limbs and are faceless. Limbs are short, and Ray disliked long ones.
- They are built as a cutout rig of parts: helm head, torso, upper and lower arm (with a fist), upper and lower leg, and a separate flat foot. Each part is drawn with an inner thick-thin brush line, a stain fill and dry-brush bristle shading on the side away from the light.
- Lines are uniform, clean, sharp and decisive. Feet stay flat on the ground, and legs flow out of the body with no line across the join.
- **The liquid-ink outline:**
  - A crisp rippling core plus a lagging liquid layer that sloshes away from the direction of travel.
  - A swept crest off the top-back of the head.
  - Drips that form and fall.
  - Ray removed the faded outer haze, so keep only the black goo.
- **The fill** is a dull watercolor stain in the player's color. P1 is a dull blue (92,128,166); the bot is a dull red (170,98,82). The head uses a calmer wash so no blotch reads as a face.
- **Idle** is an IK fighting stance with bent knees and a bob.
- **Movement:**
  - Walking starts as a short guarded walk that ramps into a speedster sprint, with a deep lean, arms swept back and fast leg turnover.
  - Jump and fall arms stay tucked in guard, because Ray disliked floppy arms.
- **Future idea, not started:** evolutions that add organic growths such as extra fins, spurs, dorsal plates and carapace, with small vermilion vein accents. The game's theme is evolution. Don't build this until Ray asks.

## Effects language

- **Hits** make ink splashes (drops plus motes), scaled with hit strength. More of the splash comes out red as the target's damage rises. There is no spiky splat and no hit-pause.
- **Kill blows:**
  - During the wind-up, ink motes converge on the striking fist or foot as a telegraph.
  - A dry-brush swoosh follows the limb's arc.
  - The hit gives a small screen kick.
- **Ragdolls** leave dry-brush flight streaks.
- **KO:** an ink-splash burst thrown in from the screen edge they left. It is particles only, with no blob or text.
- **The parry** has a white wash over the fighter and one quick yellow "cling": about 6 short sparks and a brief glint where the arms cross.
- **The air dash** collapses the body into a spinning black ink drill with spiral grooves and ragged tails.
- **Can't be hit** (ragdolled or getting up): the goo border flickers pale, white bands sweep across it and small star glints ride round it.

## Stage: "Practice"

- The background is graph-paper: a fine blue-grey grid, bolder every fifth line, lined up with the floor and wall. There is a soft vignette.
- The floor runs from an open edge at x 150, where a dry-brush lip splinters off, to a wall at x 1180 that goes up off-screen.
- The solid ground is one L-shaped cut-away mass with diagonal cross-hatching and ink pooled along the faces. Bold ink lines mark every surface you can stand on or hit.
- The stage name "Practice" is stencilled top-left in italic serif with a brush underline.
- The game space is 1280x720, scaled to fit at 16:9.

## Rejected or removed (don't bring back)

- v1 big detailed creatures, v2 extra-limb creatures, and the round-3 heads and bodies sheet (Ray: "awful").
- Long limbs, round blank heads and floppy arms.
- The faded outer haze around the outline, and tendril-like head and joint flares.
- Hit-pause, which Ray found choppy.
- The bubble shield, the feint and the hold-to-shield.
- The parry chest-pump and back-arch, which Ray tried and then dropped.
- The 2D "paper flip" turn on the spin kick.


## Practice stage: brutalist concrete with depth

Ray asked for the platform and wall to look brutalist and concrete-like in the game's style, and for the illusion of standing on a 3D surface.

### The depth rule, for every map (`STAGE3D`)

A first try used true perspective: the slab's end slanted back and the wall's inner face reached into the play space. Fighters then overlapped surfaces that should have been in front of them, and masking them off still clipped. Ray asked for the way 2D platform fighters like Brawlhalla do it:
1. **The drawn silhouette of the terrain sits exactly on the collision lines.** The ledge's corner and the cliff line are at `PLAT.x0`; the wall's back corner is at `WALL`.
2. **Depth is only shown on surfaces that recede behind the fighters:**
   - **Floors** get a top band `d` px above and below the walk line, so feet land mid-band. Its ends stop square at the ledge, so standing right on the lip always has surface under you.
   - **Walls** get an inner face just past their collision line, from `WALL` out to `WALL + wd`, so a fighter against the wall touches its back edge and never overlaps it.
3. **Fighters are always drawn in front of the terrain.** There's no masking or occlusion, so nothing can clip.
4. **Lines going back** (joints, board marks) run toward a vanishing point (`vp`), which gives the perspective.

### The concrete

- **Washes:** flat grey, lighter on the top, mid on the wall's inner face and darker on the front faces, with soft mottling, aggregate speckle and air pockets.
- **Front faces:**
  - board-form plank marks and panel joints every 205 px;
  - form-tie holes;
  - thin blurred rain streaks;
  - a few hairline cracks;
  - ink hatching and shade under the lip.
- **Top:** expansion joints running back toward the vanishing point, and a shadow where it meets the wall.
- **Ink:** heaviest on the silhouette the fighters meet: the floor's front edge, the ledge line running from the top's back edge down the cliff (thinning out, with one clean join at the corner), and the wall's front corner. Lighter on the lines going back. Ray had the old splintering bristle strokes off the lip removed.
- **Background:** the graph paper stays for Practice only. Other maps will have their own dull colours.
