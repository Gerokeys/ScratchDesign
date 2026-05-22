import { gsap } from 'gsap';

export default class MobileNav {
  constructor() {
    this.overlay = document.querySelector('.nav-overlay');
    this.burger = document.querySelector('.header__hamburger');
    this.closeBtn = document.querySelector('.nav-overlay__close');
    this.links = document.querySelectorAll('.nav-overlay__link');
    this.footer = document.querySelector('.nav-overlay__footer');
    this.isOpen = false;
    this.tl = null;

    if (this.overlay && this.burger) {
      this._replaceBurger();
      this._bindEvents();
    }
  }

  _replaceBurger() {
    const fresh = this.burger.cloneNode(true);
    this.burger.parentNode.replaceChild(fresh, this.burger);
    this.burger = fresh;
  }

  _bindEvents() {
    this.burger.addEventListener('click', () => this._open());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this._close());

    this.links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          this._close(() => {
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          });
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
    document.body.classList.add('scroll-lock');
    this.burger.classList.add('toggle');

    if (this.tl) this.tl.kill();

    this.tl = gsap.timeline();

    this.tl
      .set(this.links, { y: '110%' })
      .set(this.footer, { y: 24, opacity: 0 })
      .to(this.overlay, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.75,
        ease: 'power4.inOut',
      })
      .to(
        this.links,
        {
          y: '0%',
          duration: 0.65,
          stagger: 0.07,
          ease: 'power3.out',
        },
        '-=0.35'
      )
      .to(
        this.footer,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.3'
      );
  }

  _close(onDone = null) {
    if (!this.isOpen) return;
    this.isOpen = false;
    document.body.classList.remove('scroll-lock');
    this.burger.classList.remove('toggle');

    if (this.tl) this.tl.kill();

    this.tl = gsap.timeline({
      onComplete: () => {
        this.overlay.classList.remove('is-open');
        gsap.set(this.overlay, { clipPath: 'inset(0 0 100% 0)' });
        if (onDone) onDone();
      },
    });

    this.tl
      .to(this.footer, {
        y: 20,
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in',
      })
      .to(
        this.links,
        {
          y: '110%',
          duration: 0.45,
          stagger: { each: 0.04, from: 'end' },
          ease: 'power3.in',
        },
        '-=0.1'
      )
      .to(
        this.overlay,
        {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.65,
          ease: 'power4.inOut',
        },
        '-=0.15'
      );
  }
}
