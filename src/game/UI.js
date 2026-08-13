import { CAR_CATALOG, carsUnlockedAt } from './CarCatalog.js';
import { thresholdForLevel } from './Progression.js';

export class UI {
  constructor() {
    this.el = {
      hud: document.getElementById('hud'),
      scoreValue: document.getElementById('score-value'),
      levelValue: document.getElementById('level-value'),
      bestValue: document.getElementById('best-value'),
      progressText: document.getElementById('progress-text'),
      progressFill: document.getElementById('progress-fill'),
      speedReadout: document.getElementById('speed-readout'),
      touchControls: document.getElementById('touch-controls'),

      startScreen: document.getElementById('start-screen'),
      carSelect: document.getElementById('car-select'),
      menuLevel: document.getElementById('menu-level'),
      menuProgress: document.getElementById('menu-progress'),
      menuBest: document.getElementById('menu-best'),
      startBtn: document.getElementById('start-btn'),

      gameoverScreen: document.getElementById('gameover-screen'),
      finalScore: document.getElementById('final-score'),
      levelupBanner: document.getElementById('levelup-banner'),
      levelupText: document.getElementById('levelup-text'),
      unlockBanner: document.getElementById('unlock-banner'),
      unlockCarName: document.getElementById('unlock-car-name'),
      goLevel: document.getElementById('go-level'),
      goProgress: document.getElementById('go-progress'),
      goBest: document.getElementById('go-best'),
      retryBtn: document.getElementById('retry-btn'),
      menuBtn: document.getElementById('menu-btn'),

      countdown: document.getElementById('countdown'),
    };
  }

  populateCarSelect(state, onSelect) {
    this.el.carSelect.innerHTML = '';
    for (const car of CAR_CATALOG) {
      const locked = car.unlockLevel > state.level;
      const swatch = document.createElement('div');
      swatch.className = `car-swatch${locked ? ' locked' : ''}${car.id === state.selectedCarId ? ' selected' : ''}`;
      swatch.title = locked ? `${car.name} — unlocks at level ${car.unlockLevel}` : car.name;

      const tag = document.createElement('div');
      tag.className = 'car-level-tag';
      tag.textContent = car.unlockLevel === 0 ? 'START' : `LV ${car.unlockLevel}`;
      swatch.appendChild(tag);

      const color = document.createElement('div');
      color.className = 'swatch-color';
      color.style.background = `#${car.body.toString(16).padStart(6, '0')}`;
      swatch.appendChild(color);

      if (!locked) {
        swatch.addEventListener('click', () => onSelect(car.id));
      }
      this.el.carSelect.appendChild(swatch);
    }
  }

  refreshMenuStats(state) {
    const need = thresholdForLevel(state.level + 1);
    this.el.menuLevel.textContent = state.level;
    this.el.menuProgress.textContent = `${Math.floor(state.points)} / ${need}`;
    this.el.menuBest.textContent = state.bestScore;
  }

  showStart(state, onSelect) {
    this.populateCarSelect(state, onSelect);
    this.refreshMenuStats(state);
    this.el.startScreen.classList.remove('hidden');
    this.el.gameoverScreen.classList.add('hidden');
    this.el.hud.classList.remove('visible');
    this.el.touchControls.classList.remove('visible');
  }

  showHUD(isTouch) {
    this.el.startScreen.classList.add('hidden');
    this.el.gameoverScreen.classList.add('hidden');
    this.el.hud.classList.add('visible');
    if (isTouch) this.el.touchControls.classList.add('visible');
  }

  updateHUD({ score, level, points, needed, speedKmh }) {
    this.el.scoreValue.textContent = Math.floor(score);
    this.el.levelValue.textContent = level;
    this.el.progressText.textContent = `${Math.floor(points)} / ${needed} to next level`;
    this.el.progressFill.style.width = `${Math.min(100, (points / needed) * 100)}%`;
    this.el.speedReadout.innerHTML = `${Math.round(speedKmh)} <span>km/h</span>`;
  }

  setBest(best) {
    this.el.bestValue.textContent = best;
  }

  async runCountdown() {
    const el = this.el.countdown;
    el.classList.remove('hidden');
    for (const label of ['3', '2', '1', 'GO!']) {
      el.textContent = label;
      await new Promise((r) => setTimeout(r, 650));
    }
    el.classList.add('hidden');
  }

  showGameOver({ runScore, levelsGained, unlockedCar, state }) {
    this.el.hud.classList.remove('visible');
    this.el.touchControls.classList.remove('visible');
    this.el.finalScore.textContent = Math.floor(runScore);

    if (levelsGained > 0) {
      this.el.levelupBanner.classList.remove('hidden');
      this.el.levelupText.textContent =
        levelsGained > 1 ? `LEVEL UP! +${levelsGained} LEVELS (now Lv.${state.level})` : `LEVEL UP! Now Level ${state.level}`;
    } else {
      this.el.levelupBanner.classList.add('hidden');
    }

    if (unlockedCar) {
      this.el.unlockBanner.classList.remove('hidden');
      this.el.unlockCarName.textContent = unlockedCar.name;
    } else {
      this.el.unlockBanner.classList.add('hidden');
    }

    const need = thresholdForLevel(state.level + 1);
    this.el.goLevel.textContent = state.level;
    this.el.goProgress.textContent = `${Math.floor(state.points)} / ${need}`;
    this.el.goBest.textContent = state.bestScore;

    this.el.gameoverScreen.classList.remove('hidden');
  }

  bind({ onStart, onRetry, onMenu }) {
    this.el.startBtn.addEventListener('click', onStart);
    this.el.retryBtn.addEventListener('click', onRetry);
    this.el.menuBtn.addEventListener('click', onMenu);
  }
}

export { carsUnlockedAt };
