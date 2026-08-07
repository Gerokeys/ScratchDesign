/**
 * SplitLines — the SplitText effect: text broken into its rendered lines, each
 * inside its own overflow-hidden mask so the line can be swept up from below.
 *
 * GSAP's own SplitText is not in the installed 3.12.5 — it only became part of
 * the free tier in 3.13 — and upgrading GSAP would mean re-verifying every
 * scroll animation on the site. This does the one thing that is needed here.
 *
 * Lines are found by measuring, not guessed at: each word is wrapped, its
 * offsetTop read, and words sharing a top edge grouped into a line. That is the
 * only way to know where the browser actually broke the text, and it means a
 * resize can simply re-split.
 */

const MASK_CLASS = 'split-line';
const INNER_CLASS = 'split-line__inner';

export default class SplitLines {
  /** @param {HTMLElement} el  @param {{resplit?: boolean}} [opts] */
  constructor(el, opts = {}) {
    this.el = el;
    this.lines = [];
    if (!el) return;

    // Keep the original so a re-split starts from clean text rather than from
    // the spans left by the last one
    this._html = el.innerHTML;
    this.split();

    if (opts.resplit !== false) {
      this._onResize = () => {
        clearTimeout(this._t);
        this._t = setTimeout(() => this.split(), 180);
      };
      window.addEventListener('resize', this._onResize);
    }
  }

  split() {
    const el = this.el;
    el.innerHTML = this._html;

    // Wrap every word so each one has a box to measure
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'split-word';
            w.textContent = part;
            words.push(w);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);

    if (!words.length) { this.lines = []; return; }

    // Group by rendered top edge. Rounding absorbs the sub-pixel drift between
    // words that sit on the same line but carry different inline boxes.
    const groups = [];
    let top = null;
    words.forEach((w) => {
      const t = Math.round(w.offsetTop);
      if (top === null || Math.abs(t - top) > 2) { groups.push([]); top = t; }
      groups[groups.length - 1].push(w);
    });

    // Rebuild as mask + inner per line
    this.lines = groups.map((group) => {
      const mask = document.createElement('span');
      mask.className = MASK_CLASS;
      const inner = document.createElement('span');
      inner.className = INNER_CLASS;

      group[0].before(mask);
      group.forEach((w) => {
        inner.appendChild(w);
        inner.appendChild(document.createTextNode(' '));
      });
      mask.appendChild(inner);
      return inner;
    });

    // Any whitespace text nodes left between the old word positions
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
    });

    return this.lines;
  }

  /** Put the original markup back — used when reduced motion is on. */
  revert() {
    if (this._html != null) this.el.innerHTML = this._html;
    this.lines = [];
  }

  destroy() {
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    clearTimeout(this._t);
  }
}
