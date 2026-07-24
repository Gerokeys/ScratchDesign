import { gsap } from 'gsap';

export default class MagneticButton {
  constructor() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('[data-magnetic]').forEach((el) => this._bind(el));
  }

  _bind(el) {
    const strength = 0.35;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * strength;
      const dy   = (e.clientY - cy) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out', overwrite: true });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)', overwrite: true });
    });
  }
}
