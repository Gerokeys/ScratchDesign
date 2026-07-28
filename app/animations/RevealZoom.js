import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * RevealZoom — the page is revealed by flying into the plus of
 * "Clarity + Performance".
 *
 * A copy of the glyph is measured onto the original and then grown by
 * font-size rather than transform. Two reasons: the outline is re-rendered
 * every frame so it never softens the way a scaled bitmap does, and because it
 * is the same character in the same face it lines up exactly — an approximated
 * plus shape could not be made to match the type.
 *
 * Past a certain size the glyph's centre bar already covers the viewport, so a
 * plain white panel takes over for the last of the fill; growing the font any
 * further would cost a great deal to rasterise for no visible gain.
 */

const LINE_ZOOM = 1.9;    // the wordmark drifts in behind the glyph
const MAX_PX    = 2600;   // font-size ceiling for the growing plus

export default class RevealZoom {
  constructor() {
    this._section = document.querySelector('.s-reveal');
    this._line    = document.querySelector('.s-reveal__line');
    this._plus    = document.getElementById('reveal-plus');
    this._zoom    = document.getElementById('reveal-zoom');
    this._fill    = document.getElementById('reveal-fill');
    if (!this._section || !this._line || !this._plus || !this._zoom || !this._fill) return;

    this._mm = gsap.matchMedia();

    this._mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Lay the copy exactly over the original glyph.
      const place = () => {
        // Clear both transforms first, or each refresh measures a zoomed state
        gsap.set(this._line, { scale: 1 });

        const base = parseFloat(getComputedStyle(this._plus).fontSize) || 100;
        gsap.set(this._zoom, { fontSize: base, x: 0, y: 0 });

        const plusBox = this._plus.getBoundingClientRect();
        const secBox  = this._section.getBoundingClientRect();

        // Anchor to the section, centred on the original glyph
        gsap.set(this._zoom, {
          top:  plusBox.top  - secBox.top,
          left: plusBox.left - secBox.left,
        });

        // A glyph's ink is not centred in its own box, so correct by the
        // measured difference rather than assuming they coincide.
        const zoomBox = this._zoom.getBoundingClientRect();
        gsap.set(this._zoom, {
          x: (plusBox.left + plusBox.width  / 2) - (zoomBox.left + zoomBox.width  / 2),
          y: (plusBox.top  + plusBox.height / 2) - (zoomBox.top  + zoomBox.height / 2),
        });

        // Grow about the glyph's own centre
        gsap.set(this._zoom, { transformOrigin: 'center center' });

        return base;
      };

      let base = place();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this._section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.6}`,
          scrub: 0.7,
          pin: true,
          invalidateOnRefresh: true,
          onRefresh: () => { base = place(); },
        },
      });

      // The copy appears immediately, sitting invisibly on top of the original
      tl.set(this._zoom, { opacity: 1 }, 0);

      // The wordmark drifts toward the viewer behind the growing glyph
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

      // The plus itself grows — the actual reveal
      tl.to(this._zoom, {
        fontSize: () => MAX_PX,
        ease: 'power2.in',
        duration: 1,
        // Keep it centred on its anchor as the box grows
        onUpdate: () => {
          const p = this._plus.getBoundingClientRect();
          const z = this._zoom.getBoundingClientRect();
          const dx = gsap.getProperty(this._zoom, 'x');
          const dy = gsap.getProperty(this._zoom, 'y');
          gsap.set(this._zoom, {
            x: dx + ((p.left + p.width / 2) - (z.left + z.width / 2)),
            y: dy + ((p.top + p.height / 2) - (z.top + z.height / 2)),
          });
        },
      }, 0);

      // White takes over once the bar already fills most of the frame
      tl.to(this._fill, { opacity: 1, ease: 'power2.in', duration: 0.28 }, 0.72);

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });
  }

  destroy() {
    this._mm?.revert();
  }
}
