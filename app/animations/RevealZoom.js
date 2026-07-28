import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * RevealZoom — the "Clarity + Performance" wordmark zooms toward its plus sign
 * while a white panel clips open from that same point, revealing the light
 * section beneath.
 *
 * The plus is measured rather than assumed: its centre sets both the wordmark's
 * transform-origin and the clip-path's centre, so the two stay locked together
 * as the type reflows across viewport sizes.
 */

// Kept modest on purpose: scaled text is re-rasterised only so far before it
// softens, so the wordmark barely moves and the plus-shaped mask — a solid
// shape, sharp at any size — does the heavy lifting of the reveal.
const ZOOM_TO = 2.1;

export default class RevealZoom {
  constructor() {
    this._section = document.querySelector('.s-reveal');
    this._line    = document.querySelector('.s-reveal__line');
    this._plus    = document.getElementById('reveal-plus');
    this._mask    = document.getElementById('reveal-mask');
    if (!this._section || !this._line || !this._plus || !this._mask) return;

    this._mm = gsap.matchMedia();

    this._mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Measure the plus glyph, then sit the mask exactly on top of it. The
      // glyph is measured rather than assumed so the mask stays locked to it
      // as the type reflows across viewport sizes.
      const place = () => {
        // Read positions with the zoom cleared, or each refresh compounds
        gsap.set(this._line, { scale: 1 });

        const lineBox = this._line.getBoundingClientRect();
        const plusBox = this._plus.getBoundingClientRect();
        const secBox  = this._section.getBoundingClientRect();
        if (!lineBox.width || !plusBox.width) return 30;

        const cx = plusBox.left + plusBox.width / 2;
        const cy = plusBox.top + plusBox.height / 2;

        // Zoom pushes into the plus
        gsap.set(this._line, {
          transformOrigin:
            `${((cx - lineBox.left) / lineBox.width) * 100}% ` +
            `${((cy - lineBox.top) / lineBox.height) * 100}%`,
        });

        // Mask sits on the glyph, sized to it
        const size = Math.max(plusBox.width, plusBox.height);
        gsap.set(this._mask, {
          width:  size,
          height: size,
          left:   cx - secBox.left - size / 2,
          top:    cy - secBox.top  - size / 2,
        });

        // The plus's centre bar is 34% of the box, so it must scale by at least
        // the viewport diagonal over that bar to cover the screen.
        const bar = size * 0.34;
        const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
        return (diagonal / bar) * 1.25;
      };

      let target = place();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this._section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.5}`,
          scrub: 0.7,
          pin: true,
          invalidateOnRefresh: true,
          onRefresh: () => { target = place(); },
        },
      });

      // Slow push into the plus — subtle at first, accelerating as it opens
      tl.to(this._line, {
        scale: ZOOM_TO,
        ease: 'power2.in',
      }, 0);

      // The plus itself grows until its centre bar fills the screen: the page
      // is revealed by flying into the glyph, not by a shape opening over it.
      tl.fromTo(
        this._mask,
        { scale: 1 },
        { scale: () => target, ease: 'power2.in' },
        0,
      );

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });
  }

  destroy() {
    this._mm?.revert();
  }
}
