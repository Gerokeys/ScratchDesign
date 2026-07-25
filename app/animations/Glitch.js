/**
 * Glitch — swaps the accent word behind a brief digital-corruption burst.
 *
 * Each cycle: scramble the glyphs for a few frames while the RGB-split layers
 * fire, commit the new word mid-burst (so the swap is hidden inside the noise),
 * then settle. Runs every 7–12s.
 */

const MIN_DELAY = 7000;
const MAX_DELAY = 12000;

const SCRAMBLE_CHARS = '/\\|_-=+*#%@<>[]{}$&01';
const FRAME_MS       = 45;   // scramble frame rate
const FRAMES_BEFORE  = 4;    // frames before the word is committed
const FRAMES_AFTER   = 4;    // frames after, resolving into the new word

export default class Glitch {
  constructor(selector = '[data-glitch]') {
    this._els = [...document.querySelectorAll(selector)];
    if (!this._els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this._state = this._els.map((el) => {
      const words = (el.dataset.words || el.textContent || '')
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);
      return { el, words, index: 0, raf: null };
    });

    this._timer = null;
    this._schedule();

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
    this._state.forEach((s) => this._run(s));
    this._schedule();
  }

  _run(s) {
    if (s.words.length < 2) return;

    const from = s.words[s.index];
    s.index = (s.index + 1) % s.words.length;
    const to = s.words[s.index];

    const total = FRAMES_BEFORE + FRAMES_AFTER;
    let frame = 0;

    s.el.classList.add('is-glitch');
    clearInterval(s.raf);

    s.raf = setInterval(() => {
      frame += 1;

      // Before the midpoint scramble the outgoing word; after, resolve the
      // incoming one left-to-right so it reads as the text re-materialising.
      if (frame <= FRAMES_BEFORE) {
        s.el.textContent = this._scramble(from, 1 - frame / (FRAMES_BEFORE + 1));
      } else {
        const settled = (frame - FRAMES_BEFORE) / FRAMES_AFTER;
        s.el.textContent = this._scramble(to, settled);
      }

      // keep the RGB-split copies in sync with the live text
      s.el.dataset.text = s.el.textContent;

      // Words differ in length, so re-fit every frame — the headline keeps
      // spanning 100vw and the resize is hidden inside the burst.
      window._heroRefit?.();

      if (frame >= total) {
        clearInterval(s.raf);
        s.raf = null;
        s.el.textContent = to;
        s.el.dataset.text = to;
        s.el.classList.remove('is-glitch');
        window._heroRefit?.();
      }
    }, FRAME_MS);
  }

  /** `settled` 0→1: fraction of leading characters shown as their real glyph. */
  _scramble(word, settled) {
    const keep = Math.floor(word.length * Math.max(0, Math.min(1, settled)));
    let out = '';
    for (let i = 0; i < word.length; i++) {
      out += i < keep
        ? word[i]
        : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
    }
    return out;
  }

  destroy() {
    clearTimeout(this._timer);
    this._state.forEach((s) => clearInterval(s.raf));
  }
}
