export class Input {
  constructor({ onLeft, onRight }) {
    this.onLeft = onLeft;
    this.onRight = onRight;
    this.enabled = true;

    this._keydown = (e) => {
      if (!this.enabled) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.onLeft();
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.onRight();
    };
    window.addEventListener('keydown', this._keydown);

    this.touchStartX = null;
    this.touchStartY = null;
    this._touchStart = (e) => {
      if (!this.enabled) return;
      const t = e.changedTouches[0];
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
    };
    this._touchEnd = (e) => {
      if (!this.enabled || this.touchStartX === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - this.touchStartX;
      const dy = t.clientY - this.touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) this.onLeft();
        else this.onRight();
      }
      this.touchStartX = null;
    };
    window.addEventListener('touchstart', this._touchStart, { passive: true });
    window.addEventListener('touchend', this._touchEnd, { passive: true });

    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    this._btnLeft = () => this.enabled && this.onLeft();
    this._btnRight = () => this.enabled && this.onRight();
    btnLeft.addEventListener('click', this._btnLeft);
    btnRight.addEventListener('click', this._btnRight);
    this.btnLeft = btnLeft;
    this.btnRight = btnRight;
  }

  dispose() {
    window.removeEventListener('keydown', this._keydown);
    window.removeEventListener('touchstart', this._touchStart);
    window.removeEventListener('touchend', this._touchEnd);
    this.btnLeft.removeEventListener('click', this._btnLeft);
    this.btnRight.removeEventListener('click', this._btnRight);
  }
}

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
