import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * StackCards — every tile is on screen from the start, spaced apart. As the
 * section scrubs, the gaps close and each tile recedes behind the one below it
 * (slight scale-down plus a slight fade), so the row compresses into a stack.
 *
 * Uses gsap.matchMedia, so the pin exists only on wider viewports. Below 860px
 * it is torn down automatically and the tiles are a plain scrolling list —
 * pinned sections are unreliable on mobile, where browser chrome resizes the
 * viewport mid-scroll.
 */

const GAP_OPEN   = 18;     // px between tiles at rest
const GAP_CLOSED = 2;      // px between tiles once stacked
const SCALE_STEP = 0.028;  // width lost per tile of depth
const FADE_STEP  = 0.085;  // opacity lost per tile of depth

export default class StackCards {
  constructor() {
    this._section = document.querySelector('.s-steps');
    this._cards   = [...document.querySelectorAll('.step-card')];
    if (!this._section || this._cards.length < 2) return;

    this._mm = gsap.matchMedia();

    this._mm.add(
      {
        wide:    '(min-width: 860px)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { wide, reduced } = ctx.conditions;
        if (!wide || reduced) return;   // mobile / reduced motion: plain list

        const n = this._cards.length;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: this._section,
            start: 'top top',
            end: () => `+=${window.innerHeight * 1.35}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });

        // Close the gaps between tiles
        tl.fromTo(
          this._section,
          { '--tile-gap': `${GAP_OPEN}px` },
          { '--tile-gap': `${GAP_CLOSED}px`, ease: 'none' },
          0,
        );

        // Recede each tile by its depth in the pile; the last one stays put
        this._cards.forEach((card, i) => {
          const depth = n - 1 - i;
          if (!depth) return;

          const inner = card.querySelector('.step-card__inner');
          if (!inner) return;

          tl.to(inner, {
            scale:   1 - depth * SCALE_STEP,
            opacity: 1 - depth * FADE_STEP,
            ease:    'none',
          }, 0);
        });

        return () => { tl.scrollTrigger?.kill(); tl.kill(); };
      },
    );
  }

  destroy() {
    this._mm?.revert();
  }
}
