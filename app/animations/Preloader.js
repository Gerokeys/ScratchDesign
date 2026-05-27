import { gsap } from 'gsap';

export default class Preloader {
  constructor(onComplete) {
    this.overlay    = document.getElementById('preloader');
    this.logoEl     = document.getElementById('preloader-logo');
    this.bar        = document.getElementById('preloader-bar');
    this.counter    = document.getElementById('preloader-counter');
    this.foot       = document.getElementById('preloader-foot');
    this.onComplete = onComplete;

    if (!this.overlay) { onComplete?.(); return; }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(this.overlay, {
        opacity: 0, duration: 0.4, delay: 0.2,
        onComplete: () => { this.overlay.remove(); onComplete?.(); },
      });
      return;
    }

    document.body.style.overflow = 'hidden';
    this._run();
  }

  _run() {
    const obj  = { val: 0 };
    const LOAD = 4.0;
    const tl   = gsap.timeline();

    // Logo slides up into view
    tl.fromTo(
      this.logoEl,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }
    );

    // Progress bar + counter fill in sync
    tl.to(this.bar, {
      scaleX: 1,
      duration: LOAD,
      ease: 'power2.inOut',
    }, '-=0.7');

    tl.to(obj, {
      val: 100,
      duration: LOAD,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.counter.textContent = `${Math.round(obj.val)}%`;
      },
    }, '<');

    // Hold at 100% then burst
    tl.call(() => this._burst(), null, '+=0.35');
  }

  _burst() {
    const tl = gsap.timeline({
      onComplete: () => {
        this.overlay.remove();
        document.body.style.overflow = '';
        this.onComplete?.();
      },
    });

    // Foot fades down and out
    tl.to(this.foot, {
      opacity: 0,
      y: 12,
      duration: 0.28,
      ease: 'power2.in',
    });

    // Logo zooms toward the viewer — starts slow then rockets
    tl.to(this.logoEl, {
      scale: 16,
      opacity: 0,
      duration: 1.05,
      ease: 'power4.in',
      transformOrigin: '50% 50%',
    }, '-=0.05');

    // Overlay fades out mid-zoom so the page bleeds through
    tl.to(this.overlay, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.inOut',
    }, '-=0.62');
  }
}
