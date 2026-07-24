import { gsap } from 'gsap';

export default class Cursor {
  constructor() {
    if (window.matchMedia('(hover: none)').matches) return;

    this._el = document.getElementById('cursor');
    if (!this._el) return;

    gsap.set(this._el, { x: -100, y: -100 });

    const moveX = gsap.quickTo(this._el, 'x', { duration: 0.055, ease: 'none' });
    const moveY = gsap.quickTo(this._el, 'y', { duration: 0.055, ease: 'none' });

    window.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
      moveX(x);
      moveY(y);
    });

    document.addEventListener('mouseleave',  () => this._el.classList.add('is-hidden'));
    document.addEventListener('mouseenter',  () => this._el.classList.remove('is-hidden'));

    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (target.closest('input, textarea, select')) {
        this._el.classList.add('is-text');
        this._el.classList.remove('is-hovering');
      } else if (target.closest('a, button, [role="button"], [tabindex="0"], .work-item, .pricing-card, .service-item')) {
        this._el.classList.add('is-hovering');
        this._el.classList.remove('is-text');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target;
      if (target.closest('input, textarea, select')) {
        this._el.classList.remove('is-text');
      } else if (target.closest('a, button, [role="button"], [tabindex="0"], .work-item, .pricing-card, .service-item')) {
        this._el.classList.remove('is-hovering');
      }
    });
  }
}
