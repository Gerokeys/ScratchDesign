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

        // The section itself is pinned, so the tiles can sit at their natural
        // height with only a small gap between them — the scroll distance for
        // the animation comes from the pin, not from padding under each tile.
        const tl = gsap.timeline({
          scrollTrigger: {
            // Triggered off the first tile, but pinning the whole section: the
            // sequence begins as that tile's bottom edge crosses mid-screen,
            // rather than when the section reaches the top of the viewport.
            trigger: this._cards[0],
            start: 'bottom center',
            end: () => `+=${window.innerHeight * 0.55 * steps}`,
            scrub: 0.55,
            pin: this._section,
            invalidateOnRefresh: true,
          },
        });
        tweens.push({ scrollTrigger: tl.scrollTrigger, kill: () => tl.kill() });

        // Gaps close over the sequence, ending slightly overlapped
        tl.fromTo(
          this._section,
          { '--tile-gap': `${GAP_OPEN}px` },
          {
            '--tile-gap': `${-OVERLAP}px`,
            duration: steps,
            ease: 'none',
          },
          0,
        );

        // Each tile carries its own trigger and starts the moment *its* bottom
        // edge crosses mid-screen — so a tile can begin receding while the one
        // before it is still settling, rather than waiting its turn.
        this._cards.forEach((card, i) => {
          const depth = n - 1 - i;
          if (!depth) return;           // front tile stays put

          const inner = card.querySelector('.step-card__inner');
          if (!inner) return;

          // Phase 1 — width. Occupies this tile's own slice of the timeline, so
          // it finishes narrowing before the next tile starts.
          // scaleX, not scale: a uniform scale shrinks height too, which opens
          // a vertical gap under each receding tile and stops the pile closing.
          tl.to(inner, {
            scaleX:   1 - depth * SCALE_STEP,
            duration: 0.6,
            ease:     'none',
          }, i);

          // Phase 2 — blur and fade, afterwards, as the next tile stacks on top
          tl.to(inner, {
            opacity:  1 - depth * FADE_STEP,
            filter:   `blur(${(depth * BLUR_STEP).toFixed(2)}px)`,
            duration: 0.75,
            ease:     'none',
          }, i + 0.6);
        });

        return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      },
    );
  }

  destroy() {
    this._mm?.revert();
  }
}
