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

const ZOOM_TO = 4.2;   // how far the wordmark scales into the plus

export default class RevealZoom {
  constructor() {
    this._section = document.querySelector('.s-reveal');
    this._line    = document.querySelector('.s-reveal__line');
    this._plus    = document.getElementById('reveal-plus');
    this._panel   = document.getElementById('reveal-panel');
    if (!this._section || !this._line || !this._plus || !this._panel) return;

    this._mm = gsap.matchMedia();

    this._mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Origin of the zoom, as a percentage of the wordmark's own box
      const setOrigin = () => {
        const lineBox = this._line.getBoundingClientRect();
        const plusBox = this._plus.getBoundingClientRect();
        if (!lineBox.width || !lineBox.height) return { x: 50, y: 50 };

        const x = ((plusBox.left + plusBox.width / 2) - lineBox.left) / lineBox.width * 100;
        const y = ((plusBox.top + plusBox.height / 2) - lineBox.top) / lineBox.height * 100;

        gsap.set(this._line, { transformOrigin: `${x}% ${y}%` });

        // Same point, but relative to the section, for the clip-path centre
        const secBox = this._section.getBoundingClientRect();
        return {
          x: ((plusBox.left + plusBox.width / 2) - secBox.left) / secBox.width * 100,
          y: ((plusBox.top + plusBox.height / 2) - secBox.top) / secBox.height * 100,
        };
      };

      let centre = setOrigin();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this._section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.5}`,
          scrub: 0.7,
          pin: true,
          invalidateOnRefresh: true,
          onRefresh: () => { centre = setOrigin(); },
        },
      });

      // Slow push into the plus — subtle at first, accelerating as it opens
      tl.to(this._line, {
        scale: ZOOM_TO,
        ease: 'power2.in',
      }, 0);

      // White page clips open from the plus, timed to the later part of the zoom
      tl.fromTo(
        this._panel,
        { clipPath: () => `circle(0% at ${centre.x}% ${centre.y}%)` },
        {
          clipPath: () => `circle(150% at ${centre.x}% ${centre.y}%)`,
          ease: 'power2.inOut',
        },
        0.55,
      );

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });
  }

  destroy() {
    this._mm?.revert();
  }
}
