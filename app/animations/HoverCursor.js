import { gsap } from 'gsap';

/**
 * HoverCursor — a label that follows the pointer over elements carrying
 * `data-cursor`, alongside the native pointer cursor.
 *
 * Skipped on touch, where there is no hover state to attach to.
 */
export default class HoverCursor {
  constructor(selector = '[data-cursor]') {
    if (window.matchMedia('(hover: none)').matches) return;

    this._targets = [...document.querySelectorAll(selector)];
    if (!this._targets.length) return;

    this._el = document.createElement('div');
    this._el.className = 'hover-cursor';
    this._el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this._el);

    this._x = gsap.quickTo(this._el, 'x', { duration: 0.35, ease: 'power3.out' });
    this._y = gsap.quickTo(this._el, 'y', { duration: 0.35, ease: 'power3.out' });

    window.addEventListener('pointermove', (e) => {
      this._x(e.clientX);
      this._y(e.clientY);
    }, { passive: true });

    this._targets.forEach((t) => {
      t.addEventListener('pointerenter', () => {
        // A disabled panel shouldn't advertise a click
        if (t.classList.contains('is-past')) return;
        this._el.textContent = t.dataset.cursor || '';
        this._el.classList.add('is-visible');
      });
      t.addEventListener('pointerleave', () => this._el.classList.remove('is-visible'));
    });
  }

  destroy() {
    this._el?.remove();
  }
}
