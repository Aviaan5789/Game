const registry = new Map();
let appEl = null;

export function mount(el) {
  appEl = el;
}

export function registerScreen(name, renderFn) {
  registry.set(name, renderFn);
}

export function goto(screen, ctx = {}) {
  const fn = registry.get(screen);
  if (!fn) {
    console.error(`Unknown screen: ${screen}`);
    return;
  }
  window.scrollTo(0, 0);
  appEl.innerHTML = '';
  fn(appEl, ctx);
}
