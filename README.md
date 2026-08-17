# Game Arcade

**Play now: https://aviaan5789.github.io/Game/**

A small arcade of original browser games, built with vanilla JavaScript and [Vite](https://vitejs.dev/). The root is a landing page linking to each game; every game is a fully self-contained sub-app with its own `index.html` and `src/`.

- **[Penalty King](./penalty-king/)** — a full penalty-shootout career game (Canvas 2D)
- **[Turbo Dodge](./turbo-dodge/)** — a fully 3D endless car-dodging game ([Three.js](https://threejs.org/))

## Development

```bash
npm install
npm run dev       # start the dev server (hub at /, games at /penalty-king/ and /turbo-dodge/)
npm run build      # production build to dist/ (all three pages)
npm run preview    # preview the production build
```

## Project structure

```
index.html              landing page (hub) linking to both games
favicon.svg
vite.config.js            multi-page build: hub + one entry per game

penalty-king/
  index.html
  favicon.svg
  src/
    main.js                 entry point, registers every screen
    style.css                dark stadium-themed UI
    game/
      router.js               tiny screen router
      scene.js                  canvas pitch/goal/keeper/ball rendering + animation sequences
      audio.js                   procedural WebAudio sound effects
      flow.js                     shared interactive penalty-attempt flow (direction → power → result)
      shootoutEngine.js            shared shootout runner (round tracker, sudden death)
      core/
        constants.js                zones, difficulty tuning, save key
        state.js                     localStorage save/load
        player.js                     player model, rating/XP math
        engine.js                      shot-quality & keeper-AI probability model
        penaltyInput.js                 direction grid / power meter / dive-reaction DOM widgets
      data/
        clubs.js, nations.js, players.js, names.js, achievements.js
      ui/
        mainMenu.js, createPlayer.js, components.js
      modes/
        career.js, shootout.js, tournament.js, goalkeeper.js, training.js,
        statistics.js, achievementsScreen.js

turbo-dodge/
  index.html
  favicon.svg
  src/
    main.js            entry point
    style.css           UI styling
    game/
      Game.js            main game loop / state machine
      SceneSetup.js      renderer, camera, lights, ground
      Road.js            scrolling 3-lane road + roadside scenery
      Car.js              procedural player car mesh + handling
      Obstacles.js         procedural obstacles, spawning, collision
      Particles.js         exhaust trail + crash burst effects
      Input.js              keyboard / touch / swipe input
      Audio.js               procedural WebAudio sound effects
      UI.js                   DOM UI bindings (HUD, menus, overlays)
      CarCatalog.js           unlockable car color definitions
      Progression.js          score/level persistence logic
```

## Penalty King

A full penalty-shootout career game — no game engine, no external art or audio assets, everything (pitch, keeper, ball, crowd, sound effects) is drawn/synthesized on the fly.

**Core loop:** Create Player → Start Career → Train → Take Penalties → Earn XP → Improve → Get Club Offers → Play Important Matches → Win Shootouts → Win Trophies → Become a Penalty Legend.

- **Create Your Player** — any name, nationality, starting age and preferred foot.
- **Career Mode** — start at a Youth Academy and climb through 5 tiers of real-world-style clubs (lower league up to global superclubs) across seasons of league fixtures and cup runs, with matchday pressure penalties, club offers driven by reputation, earnings, trophies and a career timeline.
- **Penalty Shooting** — a 7-zone direction grid, a tap-to-stop power meter, and shot types (placed, low driven, power high, Panenka). Outcome is driven by a shared probability engine using accuracy, power, composure, technique, weak foot, timing precision, match pressure and difficulty. Full run-up → strike → flight → keeper dive → result animation on canvas, with goal/save/post/crossbar outcomes.
- **Skills & Progression** — Penalty Accuracy, Power, Composure, Technique and Weak Foot (25–99), improved by spending XP-earned attribute points. Separate Goalkeeper attributes (Reflexes, Positioning, Reach, Anticipation) for Goalkeeper Mode.
- **Shootout Mode** — a standalone best-of-5-plus-sudden-death shootout against a club of your choice, with a live round-by-round ⚽/❌ tracker.
- **Goalkeeper Mode** — play in goal: react fast, pick a side under a shrinking timer, and rack up saves.
- **Tournament Mode** — pick a national team and fight through a Round of 16 → Quarter-Final → Semi-Final → Final knockout bracket, with 16 real nations (several featuring real star players as icons) and rising difficulty each round.
- **Training Mode** — unlimited practice with a running score and shot-type variety, no stakes attached.
- **Statistics & Achievements** — a full stats page (matches, conversion %, streaks, shootout record, trophies, earnings, timeline) and 16 trackable achievements.
- **Difficulty** — Easy / Normal / Hard / Legendary, changing the keeper's skill, reaction speed, unpredictability and the size of your accuracy window.
- **Save System** — career autosaves to `localStorage`; "Continue Career" appears on the main menu whenever a save exists.
- **Real clubs & players** — real club and national team names and real star players are used as text/gradient cards only; no logos or photos are used anywhere (all crests are generated initials, all badges are emoji flags).

## Turbo Dodge

A fully 3D endless car-dodging game built with Three.js. Weave a car across three lanes of oncoming traffic, tyre stacks, and barriers, chase a constantly-ticking score, and level up to unlock new car colors.

- **3 lanes** — switch between them to dodge obstacles (tyre stacks, road barriers, parked/oncoming cars).
- **Controls** — Arrow keys / `A` `D` on desktop, swipe or on-screen buttons on mobile.
- **Scoring** — 3 points per second survived, ticking live on the HUD.
- **Leveling** — Points persist across attempts. Level 1 needs 300 points, level 2 needs 700, and each level after that needs 400 more than the last.
- **Unlockable cars** — a new car color unlocks at every level, selectable from the main menu.
- **Difficulty ramp** — your car speeds up the longer you survive in a run, and the base speed also increases as your player level rises.

Progress for each game (level, points, best score, career save, etc.) is saved to `localStorage` independently, so it persists between sessions in the same browser.
