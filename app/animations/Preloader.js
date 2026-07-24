import { gsap } from 'gsap';

export default class Preloader {
  constructor(onComplete) {
    this._overlay  = document.getElementById('preloader');
    this._counter  = document.getElementById('preloader-counter');
    this._bar      = document.getElementById('preloader-bar');
    this._complete = onComplete;

    if (!this._overlay) { onComplete?.(); return; }

    if (sessionStorage.getItem('sd-preloaded')) {
      this._overlay.remove();
      onComplete?.();
      return;
    }
    sessionStorage.setItem('sd-preloaded', '1');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(this._overlay, {
        opacity: 0, duration: 0.3, delay: 0.1,
        onComplete: () => { this._overlay.remove(); onComplete?.(); },
      });
      return;
    }

    window.lenis?.stop();
    this._run();
  }

  _run() {
    const LOAD = 2.8;
    const obj  = { val: 0 };
    const tl   = gsap.timeline();

    tl.to(obj, {
      val: 100,
      duration: LOAD,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(obj.val);
        if (this._counter) this._counter.textContent = v;
      },
    });

    tl.to(this._bar, {
      scaleX: 1,
      duration: LOAD,
      ease: 'power2.inOut',
    }, 0);

    tl.call(() => this._burst());
  }

  _burst() {
    const tl = gsap.timeline({
      onComplete: () => {
        this._overlay.remove();
        window.lenis?.start();
        this._complete?.();
      },
    });

    // Count flicks to 100 then blasts up
    tl.to(this._counter, {
      yPercent: -120,
      opacity:  0,
      duration: 0.55,
      ease:     'power4.in',
    });

    // Bar fades
    tl.to(this._bar?.parentElement, {
      opacity:  0,
      duration: 0.3,
    }, 0);

    // Overlay clips upward
    tl.to(this._overlay, {
      yPercent: -105,
      duration: 0.85,
      ease:     'power4.inOut',
      delay:    0.05,
    }, '-=0.2');
  }
}
