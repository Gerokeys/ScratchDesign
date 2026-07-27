import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * StackCards — every tile is on screen from the start, spaced apart. Once the
 * first tile's bottom edge reaches the middle of the viewport, the tiles recede
 * one at a time: each finishes narrowing, fading and blurring before the next
 * begins, so the stack builds sequentially rather than skewing all at once.
 *
 * Scroll-linked rather than pinned. Pinning would have to engage part-way
 * through the section to start at that point, which jumps; scrubbing the
 * section as it passes gives the same read with no discontinuity.
 *
 * gsap.matchMedia keeps the effect to wider viewports — on mobile the tiles are
 * a plain scrolling list, which avoids both the viewport-resize problems and
 * the cost of animating blur on a phone GPU.
 */

const GAP_OPEN   = 18;     // px between tiles at rest
const OVERLAP    = 6;      // px each tile sits over the one before, once stacked
const SCALE_STEP = 0.05;   // per tile of depth → the deepest lands at 0.80
const FADE_STEP  = 0.075;  // opacity lost per tile of depth
const BLUR_STEP  = 1.3;    // px of blur per tile of depth
const TRAVEL     = 0.40;   // scroll distance per tile, as a fraction of the viewport

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
        const steps = n - 1;            // the front tile never recedes
        const tweens = [];
        const last = this._cards[n - 1];

        // Pin offset per tile. Slightly less than the tile height, so the
        // finished pile overlaps a little rather than sitting spaced apart.
        const stride = () => {
          const inner = this._cards[0].querySelector('.step-card__inner');
          const h = inner ? inner.getBoundingClientRect().height : 0;
          return Math.max(24, h - OVERLAP);
        };

        // Stick each tile to the top at its own offset so they pile up
        this._cards.forEach((card, i) => {
          tweens.push({
            scrollTrigger: ScrollTrigger.create({
              trigger: card,
              start: () => `top top+=${i * stride()}`,
              endTrigger: last,
              end: 'bottom bottom',
              pin: true,
              pinSpacing: false,
              invalidateOnRefresh: true,
            }),
            kill() {},
          });
        });

        // Each tile carries its own trigger and starts the moment *its* bottom
        // edge crosses mid-screen — so a tile can begin receding while the one
        // before it is still settling, rather than waiting its turn.
        this._cards.forEach((card, i) => {
          const depth = n - 1 - i;
          if (!depth) return;           // front tile stays put

          const inner = card.querySelector('.step-card__inner');
          if (!inner) return;

          // Both phases are driven by the *next* tile's approach, not this
          // tile's own position: once pinned, a tile stops moving, so its own
          // edges never cross a trigger line again.
          const next = this._cards[i + 1];

          // Phase 1 — width. Completes as the next tile reaches mid-screen, so
          // this tile has finished narrowing before the next one starts.
          tweens.push(gsap.to(inner, {
            // scaleX, not scale: a uniform scale shrinks height too, which
            // opens a vertical gap under each receding tile and stops the pile
            // ever closing up.
            scaleX: 1 - depth * SCALE_STEP,
            ease:   'none',
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end:   'top center',
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          }));

          // Phase 2 — blur and fade, afterwards, while the next tile travels
          // the rest of the way in and stacks on top.
          tweens.push(gsap.to(inner, {
            opacity: 1 - depth * FADE_STEP,
            filter:  `blur(${(depth * BLUR_STEP).toFixed(2)}px)`,
            ease:    'none',
            scrollTrigger: {
              trigger: next,
              start: 'top center',
              end:   () => `top top+=${(i + 1) * stride()}`,
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          }));
        });

        return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      },
    );
  }

  destroy() {
    this._mm?.revert();
  }
}
