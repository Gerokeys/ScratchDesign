import { gsap } from 'gsap';

export default class WorkPreview {
  constructor() {
    this._preview = document.getElementById('work-preview');
    this._img     = document.getElementById('work-preview-img');
    if (!this._preview || window.matchMedia('(hover: none)').matches) return;

    this._mx = gsap.quickTo(this._preview, 'x', { duration: 0.6, ease: 'power3.out' });
    this._my = gsap.quickTo(this._preview, 'y', { duration: 0.6, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      this._mx(e.clientX + 24);
      this._my(e.clientY - 80);
    });

    document.querySelectorAll('.work-item').forEach((item) => {
      const src = item.dataset.image || '';

      item.addEventListener('mouseenter', () => {
        if (src && this._img.src !== new URL(src, location.href).href) {
          this._img.src = src;
        }
        gsap.to(this._preview, {
          opacity: 1,
          scale:   1,
          rotation: gsap.utils.random(-3, 3),
          duration: 0.45,
          ease: 'power3.out',
          overwrite: true,
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(this._preview, {
          opacity:  0,
          scale:    0.88,
          duration: 0.3,
          ease:     'power2.in',
          overwrite: true,
        });
      });
    });
  }
}
