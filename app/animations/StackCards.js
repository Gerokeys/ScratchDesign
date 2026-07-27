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
const OVERLAP         = 6;   // px used to size each phase's scroll length
const OVERLAP_CLOSED  = 22;  // px each tile lies over the one before, once stacked
const SCALE_STEP = 0.04;   // per tile of depth → the deepest lands at 0.80
const FADE_STEP  = 0.075;  // opacity lost per tile of depth
const BLUR_STEP  = 1.3;    // px of blur per tile of depth
const TRAVEL     = 0.40;   // scroll distance per tile, as a fraction of the viewport

export default class StackCards {
  constructor() {
    this._section = document.querySelector('.s-steps');
    this._cards   = [...document.querySelectorAll('.step-card')];
    if (!this._section || this._cards.length < 2) return;

    // Indent each paragraph to its own heading's midpoint. Titles differ in
    // length, so this is measured per tile rather than set to a fixed value.
    this._measureTitles = () => {
      this._cards.forEach((card) => {
        const inner = card.querySelector('.step-card__inner');
        const title = card.querySelector('.step-card__title');
        if (!inner || !title) return;
        const w = title.getBoundingClientRect().width;
        inner.style.setProperty('--title-half', `${Math.round(w / 2)}px`);
      });
    };

    this._measureTitles();
    document.fonts?.ready.then(this._measureTitles);
    ScrollTrigger.addEventListener('refreshInit', this._measureTitles);

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

        // Scroll-linked, not pinned. Pinning the section from a trigger that
        // fires before it reaches the top leaves a pin-spacer gap above it,
        // which shows the cream page background as a band over the tiles.
        //
        // Each tile carries its own trigger rather than sharing one timeline:
        // a single timeline long enough for five tiles outruns the section,
        // which is only about one viewport tall, so only the first tile ever
        // animated while the section was still on screen.

        // One tile's height plus its gap — the scroll gap between successive
        // tiles reaching mid-screen, and so the length of each phase.
        const stride = () => {
          const inner = this._cards[0].querySelector('.step-card__inner');
          const h = inner ? inner.getBoundingClientRect().height : 0;
          return Math.max(80, h + GAP_OPEN);
        };

        // Gaps close across the whole run
        tweens.push(gsap.fromTo(
          this._section,
          { '--tile-gap': `${GAP_OPEN}px` },
          {
            '--tile-gap': `${-OVERLAP_CLOSED}px`,
            ease: 'none',
            scrollTrigger: {
              trigger: this._cards[0],
              start: 'bottom center',
              end: () => `+=${stride() * steps}`,
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          },
        ));

        // Each tile carries its own trigger and starts the moment *its* bottom
        // edge crosses mid-screen — so a tile can begin receding while the one
        // before it is still settling, rather than waiting its turn.
        this._cards.forEach((card, i) => {
          // depth counts from the front tile at 1, so every tile — including
          // the last — gets a recede of its own.
          const depth = n - i;
          const next  = this._cards[i + 1];

          const inner = card.querySelector('.step-card__inner');
          if (!inner) return;

          // Phase 1 — width, starting when THIS tile's own bottom edge reaches
          // mid-screen. scaleX, not scale: a uniform scale shrinks height too,
          // which opens a gap under each receding tile so the pile never closes.
          tweens.push(gsap.to(inner, {
            scaleX: 1 - depth * SCALE_STEP,
            ease:   'none',
            scrollTrigger: {
              trigger: card,
              start: 'bottom center',
              end: () => `+=${stride()}`,
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          }));

          // Phase 2 — blur and fade, starting when the tile BELOW reaches
          // mid-screen, so this one recedes as the next begins its own turn.
          // The last tile has nothing after it, so it never blurs.
          if (!next) return;

          tweens.push(gsap.to(inner, {
            opacity: 1 - (depth - 1) * FADE_STEP,
            filter:  `blur(${((depth - 1) * BLUR_STEP).toFixed(2)}px)`,
            ease:    'none',
            scrollTrigger: {
              // Fires while the next tile is still below centre, so the blur
              // is already underway by the time that tile takes its turn
              trigger: next,
              start: 'bottom center+=12%',
              end: () => `+=${stride()}`,
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
