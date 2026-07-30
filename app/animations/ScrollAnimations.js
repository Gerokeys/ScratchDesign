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
    this._initParallax();
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
  // Process diagrams drift against the scroll, so they feel slightly detached
  // from the column they sit in.
  _initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.how-step__art').forEach((art, i) => {
      gsap.fromTo(art,
        { y: 34 },
        {
          y: -34 - i * 6,   // a touch more travel per column, so they de-sync
          ease: 'none',
          scrollTrigger: {
            trigger: art.closest('.s-how') || art,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }

  _initNavScroll() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    // The header is not a persistent sticky bar: it clears out of the way on
    // the way down and slides back in only when you scroll up.
    //
    // Tracked from scrollY directly rather than ScrollTrigger's `direction`,
    // which only updates on genuine scroll events and stays stale through
    // programmatic jumps.
    // Movement is accumulated and only acted on past a threshold. Pinned
    // sections emit small corrective scroll events as they settle, and reacting
    // to each one individually makes the header flicker.
    let last = window.scrollY;
    let travel = 0;
    const THRESHOLD = 48;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;

      // Always visible at the very top
      if (y < 80) { nav.classList.remove('is-hidden'); travel = 0; return; }

      // Reset the run whenever the direction changes
      if ((delta > 0) !== (travel > 0)) travel = 0;
      travel += delta;

      if (travel > THRESHOLD) {
        nav.classList.add('is-hidden');
        travel = 0;
      } else if (travel < -THRESHOLD) {
        nav.classList.remove('is-hidden');
        travel = 0;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.lenis?.on('scroll', onScroll);

    ScrollTrigger.create({
      start: 'top -60',
      onEnter:      () => nav.classList.add('is-scrolled'),
      onLeaveBack:  () => nav.classList.remove('is-scrolled'),
    });
  }
}
