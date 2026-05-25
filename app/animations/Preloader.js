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
    const obj = { val: 0 };
    const LOAD = 4.0;
    const tl = gsap.timeline();

    // Logo slides in from below
    tl.fromTo(
      this.logoEl,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }
    );

    // Bar fills left-to-right, counter ticks in sync
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

    // Hold at 100%, then exit
    tl.call(() => this._exit(), null, '+=0.45');
  }

  _exit() {
    const tl = gsap.timeline({ onComplete: () => this._flyToNav() });

    // Foot fades down
    tl.to(this.foot, {
      opacity: 0,
      y: 10,
      duration: 0.38,
      ease: 'power2.in',
    });
  }

  _flyToNav() {
    const navLogo = document.querySelector('.header__logo a') || document.querySelector('.header__logo');
    const navRect  = navLogo?.getBoundingClientRect();
    const logoRect = this.logoEl.getBoundingClientRect();
    const tl = gsap.timeline({ onComplete: () => this._wipe() });

    if (navRect && logoRect && logoRect.width > 0) {
      const dx    = (navRect.left + navRect.width  / 2) - (logoRect.left + logoRect.width  / 2);
      const dy    = (navRect.top  + navRect.height / 2) - (logoRect.top  + logoRect.height / 2);
      const scale = Math.max(navRect.height / logoRect.height, 0.12);

      tl.to(this.logoEl, {
        x: dx, y: dy,
        scale,
        transformOrigin: '50% 50%',
        duration: 0.9,
        ease: 'power4.inOut',
      });
    } else {
      tl.to(this.logoEl, { opacity: 0, duration: 0.3 });
    }
  }

  _wipe() {
    gsap.to(this.overlay, {
      yPercent: -100,
      duration: 1.1,
      ease: 'power4.inOut',
      onComplete: () => {
        this.overlay.remove();
        document.body.style.overflow = '';
        this.onComplete?.();
      },
    });
  }
}
