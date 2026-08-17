import * as THREE from 'three';
import { createScene, createRenderer, createCamera, createLights, createGround } from './SceneSetup.js';
import { Road } from './Road.js';
import { Car } from './Car.js';
import { ObstacleField } from './Obstacles.js';
import { ExhaustTrail, CrashBurst } from './Particles.js';
import { Input, isTouchDevice } from './Input.js';
import { GameAudio } from './Audio.js';
import { UI } from './UI.js';
import { loadProgress, saveProgress, applyRunScore, thresholdForLevel } from './Progression.js';
import { getCar, highestUnlockedCar, carsUnlockedAt } from './CarCatalog.js';

const LANE_WIDTH = 3.05;
const CAR_HALF_SIZE = new THREE.Vector3(0.72, 0.5, 1.7);
const BASE_SPEED = 15.5;
const LEVEL_SPEED_STEP = 0.85;
const RAMP_RATE = 0.11;
const RAMP_CAP = 15;
const POINTS_PER_SECOND = 3;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = createScene();
    this.renderer = createRenderer(canvas);
    this.camera = createCamera();
    createLights(this.scene);
    createGround(this.scene);

    this.road = new Road(this.scene, LANE_WIDTH);
    this.obstacles = new ObstacleField(this.scene, LANE_WIDTH);
    this.crashBurst = new CrashBurst(this.scene);
    this.audio = new GameAudio();
    this.ui = new UI();

    this.progress = loadProgress();
    if (this.progress.selectedCarId === undefined) this.progress.selectedCarId = 0;
    // guard against stale saves selecting a car above current unlocked level
    if (getCar(this.progress.selectedCarId).unlockLevel > this.progress.level) {
      this.progress.selectedCarId = highestUnlockedCar(this.progress.level).id;
    }

    this.car = new Car(getCar(this.progress.selectedCarId));
    this.car.setLane(1, LANE_WIDTH);
    this.car.group.position.x = 0;
    this.scene.add(this.car.group);
    this.exhaust = new ExhaustTrail(this.scene, this.car.group);

    this.state = 'menu';
    this.clock = new THREE.Clock();
    this.shake = 0;
    this.cameraBaseY = this.camera.position.y;

    this.input = new Input({
      onLeft: () => this.changeLane(-1),
      onRight: () => this.changeLane(1),
    });

    this.ui.setBest(this.progress.bestScore);
    this.ui.showStart(this.progress, (carId) => this.selectCar(carId));

    this.ui.bind({
      onStart: () => this.beginRun(),
      onRetry: () => this.beginRun(),
      onMenu: () => this.returnToMenu(),
    });

    window.addEventListener('resize', () => this.onResize());
    this.onResize();

    this.renderer.setAnimationLoop(() => this.tick());
  }

  selectCar(carId) {
    this.progress.selectedCarId = carId;
    saveProgress(this.progress);
    this.car.setColor(getCar(carId));
    this.ui.populateCarSelect(this.progress, (id) => this.selectCar(id));
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  changeLane(dir) {
    if (this.state !== 'playing') return;
    const next = THREE.MathUtils.clamp(this.car.laneIndex + dir, 0, 2);
    if (next === this.car.laneIndex) return;
    this.car.setLane(next, LANE_WIDTH);
    this.audio.laneSwitch();
  }

  async beginRun() {
    this.state = 'countdown';
    this.obstacles.reset();
    this.car.setLane(1, LANE_WIDTH);
    this.car.group.position.x = 0;
    this.car.group.rotation.set(0, 0, 0);
    this.car.isCrashed = false;
    this.runScore = 0;
    this.runElapsed = 0;
    this.ui.showHUD(isTouchDevice());
    this.updateHUDDisplay();
    this.audio.startEngine();

    await this.ui.runCountdown();
    if (this.state !== 'countdown') return; // guard if user navigated away
    this.state = 'playing';
  }

  returnToMenu() {
    this.state = 'menu';
    this.audio.stopEngine();
    this.obstacles.reset();
    this.ui.showStart(this.progress, (carId) => this.selectCar(carId));
  }

  currentSpeed() {
    const base = BASE_SPEED + this.progress.level * LEVEL_SPEED_STEP;
    const ramp = Math.min(RAMP_CAP, this.runElapsed * RAMP_RATE);
    return base + ramp;
  }

  updateHUDDisplay() {
    const need = thresholdForLevel(this.progress.level + 1);
    this.ui.updateHUD({
      score: this.runScore,
      level: this.progress.level,
      points: this.progress.points,
      needed: need,
      speedKmh: this.state === 'playing' ? this.currentSpeed() * 3.6 : 0,
    });
  }

  crash() {
    if (this.car.isCrashed) return;
    this.car.isCrashed = true;
    this.state = 'crashing';
    this.audio.crash();
    this.audio.stopEngine();
    this.crashBurst.burst(this.car.group.position.x, 0.6, 0);
    this.shake = 0.5;

    setTimeout(() => this.finishRun(), 900);
  }

  finishRun() {
    const result = applyRunScore(this.progress, this.runScore);
    const prevLevel = this.progress.level;
    this.progress = result.state;
    saveProgress(this.progress);
    this.ui.setBest(this.progress.bestScore);

    let unlockedCar = null;
    if (result.levelsGained > 0) {
      const unlocked = carsUnlockedAt(this.progress.level);
      const prevUnlocked = carsUnlockedAt(prevLevel);
      if (unlocked.length > prevUnlocked.length) unlockedCar = unlocked[unlocked.length - 1];
      this.audio.levelUp();
    }

    this.state = 'gameover';
    this.ui.showGameOver({
      runScore: this.runScore,
      levelsGained: result.levelsGained,
      unlockedCar,
      state: this.progress,
    });
  }

  updatePlaying(dt) {
    this.runElapsed += dt;
    this.runScore += dt * POINTS_PER_SECOND;

    const speed = this.currentSpeed();
    const distanceDelta = speed * dt;
    const difficultyGapScale = speed / BASE_SPEED;

    this.road.update(distanceDelta, 0);
    this.obstacles.update(dt, distanceDelta, speed, 0, -150, difficultyGapScale);
    this.car.update(dt, speed, false);
    this.exhaust.update(dt, speed, 0);

    const hit = this.obstacles.checkCollision(this.car.x, 0, CAR_HALF_SIZE);
    if (hit) this.crash();

    this.updateHUDDisplay();
    this.audio.updateEngine(Math.min(1, (speed - BASE_SPEED) / RAMP_CAP));
  }

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.state === 'playing') {
      this.updatePlaying(dt);
    } else if (this.state === 'crashing' || this.state === 'gameover') {
      this.car.update(dt, 0, false);
      this.exhaust.update(dt, 0, 0);
    } else {
      this.car.update(dt, 4, false);
    }

    this.crashBurst.update(dt);

    // camera follow + screen shake
    const targetCamX = this.car.x * 0.45;
    this.camera.position.x += (targetCamX - this.camera.position.x) * (1 - Math.exp(-6 * dt));
    let shakeX = 0;
    let shakeY = 0;
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 1.4);
      shakeX = (Math.random() - 0.5) * this.shake * 0.6;
      shakeY = (Math.random() - 0.5) * this.shake * 0.6;
    }
    this.camera.position.y = this.cameraBaseY + shakeY;
    this.camera.lookAt(this.car.x * 0.3 + shakeX, 1.15, -8);

    this.renderer.render(this.scene, this.camera);
  }
}
