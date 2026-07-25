import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export default class ScrollAnimations {
  constructor() {
    this._initHeroReveal();
    this._initSplitTitles();
    this._initFadeUps();
    this._initStats();
    this._initWorkItems();
    this._initNavScroll();
  }

  // ── Hero: headline words rise, chrome fades in ───────────────────────────────
  _initHeroReveal() {
    const words  = document.querySelectorAll('.s-hero__word');
    const fades  = document.querySelectorAll('.s-hero [data-reveal-fade]');
    const swoosh = document.querySelector('.s-hero__swoosh');
    const marks  = document.querySelectorAll('.s-hero__dot, .s-hero__ring, .s-hero__honors');
    const navBits = document.querySelectorAll('.site-nav__logo, .site-nav__burger');

    gsap.set(words,   { yPercent: 105, opacity: 0 });
    gsap.set(fades,   { opacity: 0, y: 20 });
    gsap.set(marks,   { opacity: 0 });
    gsap.set(navBits, { opacity: 0, y: -14 });
    if (swoosh) gsap.set(swoosh, { scale: 0, rotate: -70, opacity: 0 });

    // Called by index.js after the preloader completes
    window._heroReveal = () => {
      const tl = gsap.timeline({ delay: 0.1 });

      tl.to(navBits, {
        opacity: 1, y: 0,
        duration: 0.7, stagger: 0.08, ease: 'power3.out',
      });

      tl.to(words, {
        yPercent: 0, opacity: 1,
        duration: 1.15,
        stagger: 0.075,
        ease: 'power4.out',
      }, '-=0.45');

      if (swoosh) {
        tl.to(swoosh, {
          scale: 1, rotate: -8, opacity: 1,
          duration: 0.9, ease: 'back.out(1.7)',
        }, '-=0.55');
      }

      tl.to(fades, {
        opacity: 1, y: 0,
        duration: 0.8, stagger: 0.1, ease: 'power3.out',
      }, '-=0.7');

      tl.to(marks, {
        opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out',
      }, '-=0.6');
    };
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
