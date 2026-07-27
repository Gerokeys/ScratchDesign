import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * StackCards — every tile is on screen from the start, spaced apart. Once the
 * first tile's bottom edge reaches the middle of the viewport, the gaps begin
 * closing and each tile recedes behind the one below it: narrowing, fading
 * slightly and blurring by its depth in the pile.
 *
 * Scroll-linked rather than pinned. Pinning would have to engage part-way
 * through the section to start at that point, which jumps; scrubbing the
 * section as it passes gives the same read with no discontinuity.
 *
 * gsap.matchMedia keeps the effect to wider viewports — on mobile the tiles are
 * a plain scrolling list, which avoids both the viewport-resize problems and
 * the cost of animating blur on a phone GPU.
 */

const GAP_OPEN   = 22;     // px between tiles at rest
const GAP_CLOSED = 2;      // px between tiles once stacked
const SCALE_STEP = 0.030;  // width lost per tile of depth
const FADE_STEP  = 0.075;  // opacity lost per tile of depth
const BLUR_STEP  = 1.15;   // px of blur per tile of depth

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
            // Motion begins as the first tile's lower edge crosses mid-screen
            trigger: this._cards[0],
            start: 'bottom center',
            end: () => `+=${window.innerHeight * 0.85}`,
            scrub: 0.6,
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
            filter:  `blur(${(depth * BLUR_STEP).toFixed(2)}px)`,
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
