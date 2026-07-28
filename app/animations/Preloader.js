import { gsap } from 'gsap';

/**
 * Preloader — reports real loading progress.
 *
 * The count is driven by assets actually finishing (images, fonts, the window
 * load event) rather than a fixed timer, so the number means something and the
 * overlay leaves as soon as the page is genuinely ready. The rest of the site
 * renders behind it the whole time, so it is already painted when revealed.
 *
 * Each new value rolls up from below inside a masked box, and the vertical
 * rules climb bottom-to-top in step with the percentage.
 */

const MIN_MS  = 900;    // floor, so a warm cache still reads as a transition
const ROLL    = 0.34;   // duration of one digit roll

export default class Preloader {
  constructor(onComplete) {
    this._overlay = document.getElementById('preloader');
    this._counter = document.getElementById('preloader-counter');
    this._lines   = [...document.querySelectorAll('.preloader__line')];
    this._done    = onComplete;
    this._shown   = 0;
    this._started = performance.now();

    if (!this._overlay) { onComplete?.(); return; }

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
  }

  /** Watch real assets and drive the count from how many have settled. */
  _track() {
    const images = [...document.images];
    // Images + fonts + the window load event
    const total = images.length + 2;
    let done = 0;

    const bump = () => {
      done += 1;
      this._set(Math.min(99, Math.round((done / total) * 100)));
      if (done >= total) this._complete();
    };

    images.forEach((img) => {
      if (img.complete) { bump(); return; }
      img.addEventListener('load', bump, { once: true });
      img.addEventListener('error', bump, { once: true });
    });

    if (document.fonts?.ready) document.fonts.ready.then(bump);
    else bump();

    if (document.readyState === 'complete') bump();
    else window.addEventListener('load', bump, { once: true });

    // Never hang on an asset that stalls
    this._safety = setTimeout(() => this._complete(), 8000);
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
      duration: ROLL + 0.1,
      ease: 'power3.out',
      stagger: { each: 0.012, from: 'center' },
      overwrite: true,
    });
  }

  _complete() {
    if (this._ended) return;
    this._ended = true;
    clearTimeout(this._safety);

    // Hold briefly if everything arrived almost instantly
    const elapsed = performance.now() - this._started;
    const wait = Math.max(0, MIN_MS - elapsed);

    gsap.delayedCall(wait / 1000, () => {
      this._set(100);
      gsap.delayedCall(ROLL + 0.12, () => this._out());
    });
  }

  /** Rules finish climbing, then the overlay clips away upward. */
  _out() {
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
