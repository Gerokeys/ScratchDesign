import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class FeaturedWork {
  constructor() {
    this.modal     = document.getElementById('fw-modal');
    this.backdrop  = document.getElementById('fw-modal-backdrop');
    this.panel     = document.getElementById('fw-modal-panel');
    this.closeBtn  = document.getElementById('fw-modal-close');
    this.isOpen    = false;

    if (!this.modal) return;

    this._initCardReveal();
    this._bindCards();
    this._bindClose();
  }

  // Staggered fade-up on scroll for the cards
  _initCardReveal() {
    const cards = gsap.utils.toArray('.fw-card');
    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 36 });

    ScrollTrigger.batch(cards, {
      start: 'top 88%',
      once: true,
      onEnter(batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
    });
  }

  _bindCards() {
    document.querySelectorAll('.fw-card').forEach((card) => {
      card.addEventListener('click', () => this._open(card.dataset));
    });
  }

  _bindClose() {
    this.closeBtn?.addEventListener('click', () => this._close());
    this.backdrop?.addEventListener('click', () => this._close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this._close();
    });
  }

  _open(data) {
    if (this.isOpen) return;
    this.isOpen = true;

    // Populate content
    document.getElementById('fw-modal-title').textContent = data.title || '';
    document.getElementById('fw-modal-desc').textContent  = data.desc  || '';
    document.getElementById('fw-modal-year').textContent  = data.year  || '';
    document.getElementById('fw-modal-role').textContent  = data.role  || '';
    document.getElementById('fw-modal-link').href         = data.url   || '#';

    const img = document.getElementById('fw-modal-img');
    img.src = data.image || '';
    img.alt = data.title || '';

    const tagsEl = document.getElementById('fw-modal-tags');
    tagsEl.innerHTML = '';
    (data.tags || '').split(',').forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'fw-modal__tag';
      span.textContent = tag.trim();
      tagsEl.appendChild(span);
    });

    this.modal.classList.add('is-open');
    this.modal.removeAttribute('aria-hidden');
    this.panel.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    window.lenis?.stop();

    // Animate in — start fully below viewport, kill any in-progress close tween first
    gsap.killTweensOf(this.panel);
    gsap.killTweensOf(this.backdrop);
    gsap.set(this.panel, { y: window.innerHeight });
    gsap.to(this.backdrop, { opacity: 1, duration: 0.4, ease: 'power2.out', overwrite: true });
    gsap.to(this.panel, {
      y: 0,
      duration: 0.55,
      ease: 'power4.out',
      overwrite: true,
    });
  }

  _close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    // Kill any in-progress open animation so the close always wins
    gsap.killTweensOf(this.panel);
    gsap.killTweensOf(this.backdrop);

    gsap.to(this.backdrop, {
      opacity: 0,
      duration: 0.38,
      ease: 'power2.in',
      overwrite: true,
    });
    gsap.to(this.panel, {
      y: window.innerHeight * 1.2,
      duration: 0.42,
      ease: 'power3.in',
      overwrite: true,
      onComplete: () => {
        this.modal.classList.remove('is-open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        window.lenis?.start();
      },
    });
  }
}
