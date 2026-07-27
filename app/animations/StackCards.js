import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * StackCards — full-bleed strips that pile up on scroll.
 *
 * Each strip pins at a stepped offset (index x band), so instead of one strip
 * replacing the last they accumulate: every strip already passed leaves a band
 * visible at the top, and once all are pinned they exactly fill the viewport.
 *
 * Pinning is done with ScrollTrigger rather than `position: sticky` — sticky is
 * fragile here (any scroll-container ancestor silently disables it) and does not
 * compose with Lenis as predictably.
 */

const SCALE_X_TO = 0.94;   // width a covered strip recedes to
const DIM_TO     = 0.42;   // scrim strength over a covered strip

export default class StackCards {
  constructor(selector = '.step-card') {
    this._cards = [...document.querySelectorAll(selector)];
    if (this._cards.length < 2) return;

    this._triggers = [];
    this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._band = this._readBand();
    this._build();
  }

  /** Band height in px, read from the --band custom property on the section. */
  _readBand() {
    const section = document.querySelector('.s-steps');
    if (!section) return window.innerHeight * 0.2;

    const raw = getComputedStyle(section).getPropertyValue('--band').trim();
    // --band is authored in svh; resolve it by measuring against the viewport.
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;height:${raw || '20svh'}`;
    section.appendChild(probe);
    const px = probe.getBoundingClientRect().height;
    probe.remove();

    return px || window.innerHeight * 0.2;
  }

  _build() {
    const last = this._cards[this._cards.length - 1];
    const n = this._cards.length;

    this._cards.forEach((card, i) => {
      // Pin each strip at its own offset, all releasing together once the last
      // strip reaches its slot — that is the moment the pile is complete.
      const t = ScrollTrigger.create({
        trigger: card,
        start: () => `top top+=${i * this._band}`,
        endTrigger: last,
        // Hold until the last slot has scrolled through, so the completed pile
        // stays on screen to be read. Ending when the last tile merely *lands*
        // released everything instantly.
        end: 'bottom bottom',
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
      this._triggers.push(t);

      if (this._reduced) return;

      const inner = card.querySelector('.step-card__inner');
      const next = this._cards[i + 1];
      if (!inner || !next) return;

      // Width-only recede: the strips are pinned in a pile, so vertical movement
      // would break their alignment. Narrowing alone reads as depth.
      const tween = gsap.to(inner, {
        scaleX:  SCALE_X_TO,
        '--dim': DIM_TO,
        ease:    'none',
        scrollTrigger: {
          trigger: next,
          start: () => `top bottom`,
          end:   () => `top top+=${i * this._band}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      this._triggers.push(tween.scrollTrigger);
    });

    // Band depends on viewport height, so recompute it on resize.
    this._onRefresh = () => { this._band = this._readBand(); };
    ScrollTrigger.addEventListener('refreshInit', this._onRefresh);
  }

  destroy() {
    ScrollTrigger.removeEventListener('refreshInit', this._onRefresh);
    this._triggers.forEach((t) => t?.kill());
    this._triggers = [];
  }
}
