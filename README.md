# Turbo Dodge

A fully 3D endless car-dodging game built with [Three.js](https://threejs.org/) and [Vite](https://vitejs.dev/). Weave a car across three lanes of oncoming traffic, tyre stacks, and barriers, chase a constantly-ticking score, and level up to unlock new car colors.

## Gameplay

- **3 lanes** — switch between them to dodge obstacles (tyre stacks, road barriers, parked/oncoming cars).
- **Controls** — Arrow keys / `A` `D` on desktop, swipe or on-screen buttons on mobile.
- **Scoring** — 3 points per second survived, ticking live on the HUD.
- **Leveling** — Points persist across attempts. Level 1 needs 300 points, level 2 needs 700, and each level after that needs 400 more than the last. Any points beyond a level-up threshold carry over into progress toward the next level. Points reset to zero (plus overflow) after leveling up.
- **Unlockable cars** — A new car color unlocks at every level, selectable from the main menu.
- **Difficulty ramp** — your car speeds up the longer you survive in a run, and the base speed also increases as your player level rises.

Progress (level, points, best score, and selected car) is saved to `localStorage`, so it persists between sessions in the same browser.

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
  main.js            entry point
  style.css           UI styling
  game/
    Game.js           main game loop / state machine
    SceneSetup.js      renderer, camera, lights, ground
    Road.js            scrolling 3-lane road + roadside scenery
    Car.js              procedural player car mesh + handling
    Obstacles.js        procedural obstacles, spawning, collision
    Particles.js        exhaust trail + crash burst effects
    Input.js             keyboard / touch / swipe input
    Audio.js             procedural WebAudio sound effects
    UI.js                DOM UI bindings (HUD, menus, overlays)
    CarCatalog.js        unlockable car color definitions
    Progression.js       score/level persistence logic
```
