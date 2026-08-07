/**
 * RevealFooter — the footer sits fixed at the bottom of the viewport while the
 * page scrolls over it, so it is uncovered rather than scrolled to. The page
 * carries a matching bottom margin, which is the only thing keeping the two in
 * step — so the footer's height is measured here and published as --rf-h
 * rather than guessed at in CSS, where the dot wordmark's size depends on the
 * viewport width and the copy rewraps.
 *
 * The wordmark itself is drawn here too: a 5x7 dot font, one <circle> per lit
 * pixel, in a viewBox so it scales to whatever width it is given. It is
 * decorative and carries no meaning the links do not, hence aria-hidden.
 */

// 5x7 uppercase, only the letters the wordmark needs
const GLYPHS = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
};

const STEP = 10;   // grid pitch, in viewBox units
const R    = 5.2;  // dot radius — slightly over half the pitch, so dots kiss
const GAP  = 1;    // blank columns between letters

/** One line of text as an SVG, sized to its own content. */
function markSVG(text) {
  const rows = 7;
  let cols = 0;
  const circles = [];

  for (const ch of text.toUpperCase()) {
    const g = GLYPHS[ch];
    if (!g) { cols += 3; continue; }          // unknown letter reads as a space
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < g[y].length; x++) {
        if (g[y][x] === '1') {
          circles.push(`<circle cx="${(cols + x) * STEP + STEP / 2}" cy="${y * STEP + STEP / 2}" r="${R}"/>`);
        }
      }
    }
    cols += g[0].length + GAP;
  }

  cols -= GAP;
  const w = cols * STEP;
  const h = rows * STEP;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet" fill="currentColor" aria-hidden="true">${circles.join('')}</svg>`;
}

export default class RevealFooter {
  constructor() {
    this._el = document.querySelector('.rev-footer');
    if (!this._el) return;

    // Two cuts of the same wordmark: one line where there is width for it,
    // two stacked where there is not. CSS picks between them.
    const mark = this._el.querySelector('.rev-footer__mark');
    if (mark) {
      mark.innerHTML =
        `<span class="rev-footer__mark-wide">${markSVG('SCRATCHDESIGN')}</span>` +
        `<span class="rev-footer__mark-tall">${markSVG('SCRATCH')}${markSVG('DESIGN')}</span>`;
    }

    this._sync = this._sync.bind(this);
    this._sync();

    if ('ResizeObserver' in window) {
      this._ro = new ResizeObserver(this._sync);
      this._ro.observe(this._el);
    }
    window.addEventListener('resize', this._sync);
    document.fonts?.ready.then(this._sync);
  }

  /**
   * Publish the footer's height so the page above can reserve exactly that
   * much room. Capped at the viewport: a footer taller than the screen could
   * never be fully uncovered, and the excess would just be dead scroll.
   */
  _sync() {
    const h = Math.min(this._el.offsetHeight, window.innerHeight);
    document.documentElement.style.setProperty('--rf-h', `${Math.round(h)}px`);
    window.ScrollTrigger?.refresh?.();
  }

  destroy() {
    this._ro?.disconnect();
    window.removeEventListener('resize', this._sync);
  }
}
