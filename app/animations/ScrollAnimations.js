import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

/**
 * Put every above-the-fold element into its hidden start state and expose
 * `window._heroReveal()` to play them in.
 *
 * This MUST run before the preloader starts, not from its completion callback:
 * the overlay is removed before that callback fires, so hiding there would show
 * a fully-rendered page through the closing wipe and then snap it away.
 * Called while the overlay still covers the viewport, nothing is ever seen.
 */
export function prepareHero() {
  const words    = document.querySelectorAll('.s-hero__word');
  const fades    = document.querySelectorAll('.s-hero [data-reveal-fade]');
  const marks    = document.querySelectorAll(
    '.s-hero__dot, .s-hero__ring, .s-hero__honors, .s-strategy__badge'
  );
  const navBits  = document.querySelectorAll('.site-nav__logo, .site-nav__burger');
  const band     = document.querySelector('.s-strategy');
  const floaters = document.querySelectorAll('.wa-float');

  gsap.set(words,    { yPercent: 105, opacity: 0 });
  gsap.set(fades,    { opacity: 0, y: 20 });
  gsap.set(marks,    { opacity: 0 });
  gsap.set(navBits,  { opacity: 0, y: -14 });
  gsap.set(floaters, { opacity: 0, scale: 0.6 });
  // The hero clips its overflow, so the band hides fully off its own bottom edge
  if (band) gsap.set(band, { yPercent: 100 });

  window._heroReveal = () => {
    const tl = gsap.timeline({ delay: 0.12 });

    tl.to(navBits, {
      opacity: 1, y: 0,
      duration: 0.7, stagger: 0.08, ease: 'power3.out',
    });

    tl.to(words, {
      yPercent: 0, opacity: 1,
      duration: 1.15, stagger: 0.075, ease: 'power4.out',
    }, '-=0.45');

    if (band) {
      tl.to(band, {
        yPercent: 0,
        duration: 1.0, ease: 'power4.out',
      }, '-=0.85');
    }

    tl.to(fades, {
      opacity: 1, y: 0,
      duration: 0.8, stagger: 0.1, ease: 'power3.out',
    }, '-=0.7');

    tl.to(marks, {
      opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out',
    }, '-=0.6');

    tl.to(floaters, {
      opacity: 1, scale: 1,
      duration: 0.6, ease: 'back.out(1.6)',
    }, '-=0.45');
  };
}

export default class ScrollAnimations {
  constructor() {
    this._initSplitTitles();
    this._initFadeUps();
    this._initStats();
    this._initWorkItems();
    this._initNavScroll();
  }


  // ── Split headings: chars fall in on scroll ───────────────────────────────────
  _initSplitTitles() {
    document.querySelectorAll('[data-split]').forEach((el) => {
      const split = new SplitType(el, { types: 'chars,words' });

      gsap.set(split.chars, { opacity: 0, y: '110%' });

      ScrollTrigger.create({
        trigger: el,
        start:   'top 88%',
        once:    true,
        onEnter: () => {
          gsap.to(split.chars, {
            opacity:  1,
            y:        '0%',
            duration: 0.75,
            stagger:  0.016,
            ease:     'power4.out',
          });
        },
      });
    });
  }

  // ── Generic fade-up for sections ─────────────────────────────────────────────
  _initFadeUps() {
    const els = document.querySelectorAll(
      '.process-step, .pricing-card, .service-item, .s-contact__left, .s-contact__form'
    );
    gsap.set(els, { opacity: 0, y: 32 });

    ScrollTrigger.batch(els, {
      start:  'top 90%',
      once:   true,
      onEnter(batch) {
        gsap.to(batch, {
          opacity:  1,
          y:        0,
          duration: 0.7,
          stagger:  0.08,
          ease:     'power3.out',
        });
      },
    });
  }

  // ── Stat count-up animation ───────────────────────────────────────────────────
  _initStats() {
    document.querySelectorAll('.count').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const obj    = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start:   'top 85%',
        once:    true,
        onEnter: () => {
          gsap.to(obj, {
            val:      target,
            duration: 1.8,
            ease:     'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.val); },
          });
        },
      });
    });
  }

  // ── Work items stagger in ─────────────────────────────────────────────────────
  _initWorkItems() {
    const items = document.querySelectorAll('.work-item');
    gsap.set(items, { opacity: 0, x: -24 });

    ScrollTrigger.batch(items, {
      start: 'top 90%',
      once:  true,
      onEnter(batch) {
        gsap.to(batch, {
          opacity:  1,
          x:        0,
          duration: 0.65,
          stagger:  0.1,
          ease:     'power3.out',
        });
      },
    });
  }

  // ── Nav shrinks on scroll ─────────────────────────────────────────────────────
  _initNavScroll() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -60',
      onEnter:      () => nav.classList.add('is-scrolled'),
      onLeaveBack:  () => nav.classList.remove('is-scrolled'),
    });
  }
}
