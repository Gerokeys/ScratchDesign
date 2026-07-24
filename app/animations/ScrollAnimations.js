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

  // ── Hero text: lines slide up staggered after preloader ──────────────────────
  _initHeroReveal() {
    const lines = document.querySelectorAll('.s-hero__line');
    const sub   = document.querySelector('.s-hero__sub');
    const acts  = document.querySelector('.s-hero__actions');
    const label = document.querySelector('.s-hero__label');

    gsap.set([...lines, sub, acts, label], { opacity: 0, y: 40 });

    // Called by index.js after preloader completes
    window._heroReveal = () => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(label, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      tl.to([...lines], {
        opacity: 1, y: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power4.out',
      }, '-=0.4');
      tl.to([sub, acts], {
        opacity: 1, y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
      }, '-=0.6');

      // Wordmark parallax
      const wm = document.querySelector('.s-hero__wordmark');
      if (wm) {
        ScrollTrigger.create({
          trigger: '.s-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            gsap.set(wm, { yPercent: self.progress * 12 });
          },
        });
      }
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
