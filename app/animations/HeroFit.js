/**
 * HeroFit — scales the hero headline so the widest line spans a fixed fraction
 * of the viewport, without any line overflowing.
 *
 * Lines are measured with a Range, not offsetWidth: a line is a block with
 * (on desktop) `white-space: nowrap`, so its box is the container width while
 * the text overflows it — a Range reports true content width instead.
 */

const MIN_VW = 620;   // below this the headline wraps and CSS clamp() takes over
const FILL   = 0.96;  // fraction of the viewport the widest line may occupy
const PASSES = 3;     // wrapping shifts as size changes; iterate to settle

/**
 * Widest rendered line, given per-inline-box rects.
 *
 * getClientRects() yields one rect per inline box, and each word is an
 * inline-block — so rects are per-word, not per-line. Rects on the same visual
 * line share a near-identical top, so cluster on that and measure each
 * cluster's full span (max right − min left).
 */
function widestLine(rects) {
  if (!rects.length) return 0;

  const tol = Math.max(...rects.map((r) => r.height)) * 0.5;
  const lines = [];

  rects
    .slice()
    .sort((a, b) => a.top - b.top)
    .forEach((r) => {
      const line = lines.find((l) => Math.abs(l.top - r.top) <= tol);
      if (line) {
        line.left  = Math.min(line.left, r.left);
        line.right = Math.max(line.right, r.right);
      } else {
        lines.push({ top: r.top, left: r.left, right: r.right });
      }
    });

  return Math.max(...lines.map((l) => l.right - l.left));
}

function contentWidth(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = [...range.getClientRects()];
  range.detach?.();
  return widestLine(rects);
}

export default class HeroFit {
  constructor() {
    this._title = document.querySelector('.s-hero__title');
    this._lines = [...document.querySelectorAll('.s-hero__line')];
    if (!this._title || !this._lines.length) return;

    this._fit = this._fit.bind(this);

    this._fit();
    window.addEventListener('resize', this._fit);

    // Glitch.js swaps the accent word for ones of different length; it calls
    // this so the headline keeps its fit through the swap.
    window._heroRefit = this._fit;

    // Re-measure once the display face is loaded — measuring against the
    // fallback font otherwise bakes in the wrong ratio.
    document.fonts?.ready.then(this._fit);
  }

  _fit() {
    const vw = window.innerWidth;

    if (vw < MIN_VW) {
      this._title.style.fontSize = '';
      return;
    }

    // Each line's total span is its (constant) indent plus its content, and
    // content scales linearly with font-size. So for every line solve
    //   indent + k * size <= vw * FILL
    // and take the smallest permitted size, so no line can overflow.
    let size = 100;

    for (let pass = 0; pass < PASSES; pass++) {
      this._title.style.fontSize = `${size}px`;

      let best = Infinity;

      for (const line of this._lines) {
        const indent = parseFloat(getComputedStyle(line).paddingLeft) || 0;
        const width  = contentWidth(line);
        if (!width) continue;

        const perPx   = width / size;          // content width per px of type
        const allowed = vw * FILL - indent;
        if (allowed <= 0 || perPx <= 0) continue;

        best = Math.min(best, allowed / perPx);
      }

      if (!Number.isFinite(best)) {
        this._title.style.fontSize = '';
        return;
      }
      size = best;
    }

    this._title.style.fontSize = `${size}px`;
  }

  destroy() {
    window.removeEventListener('resize', this._fit);
    if (this._title) this._title.style.fontSize = '';
  }
}
