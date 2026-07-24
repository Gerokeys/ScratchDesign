import { gsap } from 'gsap';

export default class MobileNav {
  constructor() {
    this.overlay  = document.getElementById('nav-overlay');
    this.burger   = document.getElementById('nav-burger');
    this.closeBtn = document.getElementById('nav-close');
    this.links    = document.querySelectorAll('.nav-overlay__link');
    this.footer   = document.querySelector('.nav-overlay__footer');
    this.isOpen   = false;

    if (this.overlay && this.burger) this._bindEvents();
  }

  _bindEvents() {
    this.burger.addEventListener('click', () => this.isOpen ? this._close() : this._open());
    this.closeBtn?.addEventListener('click', () => this._close());

    this.links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href?.startsWith('#')) {
          e.preventDefault();
          this._close(() => {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
          });
        } else {
          this._close();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this._close();
    });
  }

  _open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.overlay.classList.add('is-open');
    this.burger.classList.add('is-open');
    this.burger.setAttribute('aria-expanded', 'true');
    window.lenis?.stop();

    // Stagger links in after CSS bg slide (bg takes ~0.7s)
    gsap.set(this.links, { y: '110%', opacity: 0 });
    gsap.to(this.links, {
      y: '0%', opacity: 1,
      duration: 0.65,
      stagger: 0.07,
      ease: 'power3.out',
      delay: 0.25,
    });

    if (this.footer) {
      gsap.set(this.footer, { y: 20, opacity: 0 });
      gsap.to(this.footer, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.55 });
    }
  }

  _close(onDone = null) {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.burger.classList.remove('is-open');
    this.burger.setAttribute('aria-expanded', 'false');
    window.lenis?.start();

    gsap.to([...this.links].reverse(), {
      y: '110%', opacity: 0,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power3.in',
      onComplete: () => {
        this.overlay.classList.remove('is-open');
        onDone?.();
      },
    });

    if (this.footer) {
      gsap.to(this.footer, { y: 16, opacity: 0, duration: 0.25, ease: 'power2.in' });
    }
  }
}
