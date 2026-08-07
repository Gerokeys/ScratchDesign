import { gsap } from 'gsap';

/**
 * Preloader — counts up in five deliberate beats.
 *
 * Driving the number straight off asset progress meant that on a warm cache
 * everything settled in a frame or two and the count jumped from nothing to
 * done: the animation was correct and nobody ever saw it. So the beats are
 * fixed and always play out in full, and readiness is tracked alongside rather
 * than in front of them — if the page is still loading when the count reaches
 * 100, it simply holds there until it isn't.
 *
 * Each value rolls up from below inside a masked box, and the vertical rules
 * climb bottom-to-top in step with it.
 */

const STEPS = [18, 41, 63, 84, 100];  // five beats; uneven, so it reads as loading
const ROLL  = 0.32;                   // one digit roll
const HOLD  = 0.28;                   // dwell on each value, so it can be read
const SAFETY_MS = 3500;               // never hang on a font that stalls

export default class Preloader {
  constructor(onComplete) {
    this._overlay = document.getElementById('preloader');
    this._counter = document.getElementById('preloader-counter');
    this._lines   = [...document.querySelectorAll('.preloader__line')];
    this._done    = onComplete;
    this._shown   = -1;

    if (!this._overlay) { onComplete?.(); return; }

    // First arrival only. Internal navigation is covered by the page
    // transition, so a second run would just be a second thing to sit through.
    if (sessionStorage.getItem('sd-preloaded')) {
      this._overlay.remove();
      onComplete?.();
      return;
    }
    sessionStorage.setItem('sd-preloaded', '1');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._set(100);
      gsap.set(this._lines, { scaleY: 1 });
      gsap.to(this._overlay, {
        opacity: 0, duration: 0.35, delay: 0.2,
        onComplete: () => this._finish(),
      });
      return;
    }

    window.lenis?.stop();
    this._track();
    this._count();
    this._safety = setTimeout(() => { this._ready = true; this._out(); }, SAFETY_MS);
  }

  /**
   * The five beats. Always runs to the end, whatever the network is doing.
   *
   * Paced on wall-clock timers rather than a GSAP timeline on purpose. Lag
   * smoothing clamps a long blocking frame to 33ms of tween time, and this page
   * throws several of those while the shader compiles and the scroll triggers
   * are built — which stretched a 3s count to nearly 9s of real time. The rolls
   * themselves stay on GSAP, where a dropped frame costs a frame and nothing else.
   */
  _count() {
    const step = (i) => {
      if (i >= STEPS.length) { this._counted = true; this._out(); return; }
      this._set(STEPS[i]);
      this._beat = setTimeout(() => step(i + 1), (ROLL + HOLD) * 1000);
    };
    step(0);
  }

  /**
   * Readiness runs alongside the count and only ever gates the exit.
   *
   * Fonts, and nothing else. Waiting on every image meant waiting on the
   * project screenshots, which come from a remote screenshot service far below
   * the fold — measured holding the overlay for the full safety timeout while
   * the first screen had been painted and ready for seconds. Fonts are the one
   * asset whose arrival visibly reflows what is about to be revealed; the hero
   * behind the overlay is canvas and type, both already up.
   */
  _track() {
    const settle = () => { this._ready = true; this._out(); };

    if (document.fonts?.ready) document.fonts.ready.then(settle);
    else settle();
  }

  /** Roll the displayed number up to a new value. */
  _set(pct) {
    if (pct <= this._shown || !this._counter) return;
    this._shown = pct;

    const el = this._counter;
    gsap.fromTo(el,
      { yPercent: 100 },
      { yPercent: 0, duration: ROLL, ease: 'power3.out', overwrite: true },
    );
    el.textContent = String(pct);

    // Rules climb in step with the number
    gsap.to(this._lines, {
      scaleY: pct / 100,
      duration: ROLL + 0.12,
      ease: 'power3.out',
      stagger: { each: 0.012, from: 'center' },
      overwrite: true,
    });
  }

  /** Leaves only once the count has finished *and* the page is ready. */
  _out() {
    if (this._ended || !this._counted || !this._ready) return;
    this._ended = true;
    clearTimeout(this._safety);
    clearTimeout(this._beat);

    const tl = gsap.timeline({ onComplete: () => this._finish() });

    tl.to(this._lines, {
      scaleY: 1,
      duration: 0.4,
      ease: 'power3.inOut',
      stagger: { each: 0.02, from: 'center' },
    });

    tl.to('.preloader__count', {
      yPercent: 120,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.in',
    }, '-=0.2');

    tl.to(this._overlay, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut',
    }, '-=0.15');
  }

  _finish() {
    this._overlay?.remove();
    window.lenis?.start();
    this._done?.();
  }
}
