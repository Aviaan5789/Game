# Penalty King

**Play now: https://aviaan5789.github.io/Game/**

A full penalty-shootout career game built with vanilla JavaScript, HTML5 Canvas and [Vite](https://vitejs.dev/) — no game engine, no external art or audio assets, everything (pitch, keeper, ball, crowd, sound effects) is drawn/synthesized on the fly.

## Core loop

Create Player → Start Career → Train → Take Penalties → Earn XP → Improve → Get Club Offers → Play Important Matches → Win Shootouts → Win Trophies → Become a Penalty Legend.

## Features

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

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## Project structure

```
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
```
