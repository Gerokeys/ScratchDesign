/**
 * HeroFit — scales the hero headline so its longest line spans the full
 * viewport width.
 *
 * The line is measured with a Range (not offsetWidth): the line is a block with
 * `white-space: nowrap`, so its box is the container width while the text
 * overflows it — a Range reports the true content width instead.
 */

const MIN_VW = 760;   // below this the headline wraps and CSS clamp() takes over

export default class HeroFit {
  constructor() {
    this._title = document.querySelector('.s-hero__title');
    this._line  = document.querySelector('.s-hero__line--one');
    if (!this._title || !this._line) return;

    this._fit = this._fit.bind(this);

    this._fit();
    window.addEventListener('resize', this._fit);

    // Glitch.js swaps the accent word for ones of different length; it calls
    // this so the line keeps spanning the viewport through the swap.
    window._heroRefit = this._fit;

    // Re-measure once the display face is actually loaded — measuring against a
    // fallback font otherwise bakes in the wrong ratio.
    document.fonts?.ready.then(this._fit);
  }

  _fit() {
    const vw = window.innerWidth;

    if (vw < MIN_VW) {
      this._title.style.fontSize = '';
      return;
    }

    // Measure at a known reference size, then scale linearly.
    const REF = 100;
    this._title.style.fontSize = `${REF}px`;

    const range = document.createRange();
    range.selectNodeContents(this._line);
    const width = range.getBoundingClientRect().width;
    range.detach?.();

    if (!width) { this._title.style.fontSize = ''; return; }

    this._title.style.fontSize = `${(REF * vw) / width}px`;
  }

  destroy() {
    window.removeEventListener('resize', this._fit);
    if (this._title) this._title.style.fontSize = '';
  }
}
