import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * RevealZoom — the page is revealed by zooming into the plus of
 * "Clarity + Performance".
 *
 * The plus is a clip-path shape rather than a glyph, and the very same element
 * is both the wordmark's plus and the thing that zooms. That removes the
 * alignment problem entirely — there is nothing to line up against — and a
 * clip-path stays vector-sharp at any scale, so nothing softens on the way in.
 */

const LINE_ZOOM = 1.9;   // the wordmark drifts in behind the growing plus
const BAR_RATIO = 0.32;  // the plus's centre bar, as a share of its own width
const SAFETY    = 1.45;  // overshoot so white fully covers the frame

export default class RevealZoom {
  constructor() {
    this._section = document.querySelector('.s-reveal');
    this._line    = document.querySelector('.s-reveal__line');
    this._plus    = document.getElementById('reveal-plus');
    if (!this._section || !this._line || !this._plus) return;

    this._mm = gsap.matchMedia();

    this._mm.add('(prefers-reduced-motion: no-preference)', () => {
      // How far the plus must scale for its centre bar to cover the viewport.
      // Measured at rest, then divided by the wordmark's own zoom, since the
      // plus is inside the line and inherits that scale on top of its own.
      const target = () => {
        gsap.set(this._line, { scale: 1 });
        gsap.set(this._plus, { scale: 1 });

        const bar = Math.max(1, this._plus.getBoundingClientRect().width * BAR_RATIO);
        const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
        return (diagonal / bar) * SAFETY / LINE_ZOOM;
      };

      let to = target();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this._section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.6}`,
          scrub: 0.7,
          pin: true,
          invalidateOnRefresh: true,
          onRefresh: () => { to = target(); },
        },
      });

      // The wordmark drifts toward the viewer, origin on the plus so the whole
      // line converges on it rather than on its own centre.
      tl.to(this._line, {
        scale: LINE_ZOOM,
        transformOrigin: () => {
          const l = this._line.getBoundingClientRect();
          const p = this._plus.getBoundingClientRect();
          if (!l.width) return 'center center';
          return `${((p.left + p.width / 2 - l.left) / l.width) * 100}% ` +
                 `${((p.top + p.height / 2 - l.top) / l.height) * 100}%`;
        },
        ease: 'power2.in',
        duration: 1,
      }, 0);

      // The plus itself opens out until white fills the frame
      tl.to(this._plus, {
        scale: () => to,
        ease: 'power2.in',
        duration: 1,
      }, 0);

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });
  }

  destroy() {
    this._mm?.revert();
  }
}
