import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

gsap.registerPlugin(ScrollTrigger);

/**
 * Typewriter — types a word in one character at a time when it scrolls into
 * view. The text lives in `data-typewriter` rather than in the element, so the
 * caret in CSS always sits after whatever has been revealed so far.
 */

const CHAR_MS = 62;

export default class Typewriter {
  constructor(selector = '[data-typewriter]') {
    this._els = [...document.querySelectorAll(selector)];
    if (!this._els.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._els.forEach((el) => {
      const word = el.dataset.typewriter || '';
      if (!word) return;

      // Reserve the final width so the line doesn't reflow as it types
      el.style.minWidth = `${word.length}ch`;

      if (reduced) {
        el.textContent = word;
        el.classList.add('is-done');
        return;
      }

      el.textContent = '';

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          let i = 0;
          const tick = setInterval(() => {
            i += 1;
            el.textContent = word.slice(0, i);
            if (i >= word.length) {
              clearInterval(tick);
              // Settle the caret once the word is complete
              setTimeout(() => el.classList.add('is-done'), 900);
            }
          }, CHAR_MS);
        },
      });
    });
  }
}
