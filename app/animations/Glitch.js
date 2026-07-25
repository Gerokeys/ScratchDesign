/**
 * Glitch — fires a brief, low-amplitude RGB-split flicker on the accent word.
 *
 * Deliberately rare and understated: a ~260ms pulse on a randomised interval of
 * 10–18s. The animation itself lives in CSS; this only toggles the class.
 */

const MIN_DELAY = 10000;
const MAX_DELAY = 18000;
const DURATION  = 300;

export default class Glitch {
  constructor(selector = '[data-glitch]') {
    this._els = [...document.querySelectorAll(selector)];
    if (!this._els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this._timer = null;
    this._schedule();

    // Don't burn cycles (or fire unseen) while the tab is hidden.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(this._timer);
      else this._schedule();
    });
  }

  _schedule() {
    clearTimeout(this._timer);
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    this._timer = setTimeout(() => this._fire(), delay);
  }

  _fire() {
    this._els.forEach((el) => {
      el.classList.add('is-glitch');
      setTimeout(() => el.classList.remove('is-glitch'), DURATION);
    });
    this._schedule();
  }

  destroy() {
    clearTimeout(this._timer);
  }
}
