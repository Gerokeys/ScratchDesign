import { gsap } from 'gsap';

export default class Cursor {
  constructor() {
    if (window.matchMedia('(hover: none)').matches) return;

    this._colors = ['#ff6b35', '#4B9EF5', '#7C5CF5', '#4CAF7D', '#f5c842', '#ff4d8f'];
    this._lastX = -999;
    this._lastY = -999;
    this._spawnThresh = 26;

    this._dot  = this._make('cursor-dot');
    this._ring = this._make('cursor-ring');

    // Spark pool
    this._pool = Array.from({ length: 22 }, () => {
      const el = document.createElement('div');
      el.className = 'cursor-spark';
      el.innerHTML = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 0C10 0 10.9 9.1 20 10C20 10 10.9 10.9 10 20C10 20 9.1 10.9 0 10C0 10 9.1 9.1 10 0Z" fill="currentColor"/></svg>`;
      document.body.appendChild(el);
      return { el, busy: false };
    });

    gsap.set([this._dot, this._ring], { xPercent: -50, yPercent: -50, x: -300, y: -300 });

    const dotX  = gsap.quickTo(this._dot,  'x', { duration: 0.05, ease: 'none' });
    const dotY  = gsap.quickTo(this._dot,  'y', { duration: 0.05, ease: 'none' });
    const ringX = gsap.quickTo(this._ring, 'x', { duration: 0.48, ease: 'power3.out' });
    const ringY = gsap.quickTo(this._ring, 'y', { duration: 0.48, ease: 'power3.out' });

    window.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
      dotX(x); dotY(y);
      ringX(x); ringY(y);
      if (Math.hypot(x - this._lastX, y - this._lastY) >= this._spawnThresh) {
        this._spark(x, y);
        this._lastX = x; this._lastY = y;
      }
    });

    document.addEventListener('mouseleave', () =>
      gsap.to([this._dot, this._ring], { opacity: 0, duration: 0.3 })
    );
    document.addEventListener('mouseenter', ({ clientX: x, clientY: y }) => {
      dotX(x); dotY(y); ringX(x); ringY(y);
      gsap.to([this._dot, this._ring], { opacity: 1, duration: 0.3 });
    });

    // Expand ring on interactive elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .fw-card, label')) {
        gsap.to(this._ring, { scale: 2.4, opacity: 0.45, duration: 0.3, ease: 'power2.out' });
        gsap.to(this._dot,  { scale: 0.35, duration: 0.25 });
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .fw-card, label')) {
        gsap.to(this._ring, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.to(this._dot,  { scale: 1, duration: 0.25 });
      }
    });
  }

  _make(cls) {
    const el = document.createElement('div');
    el.className = cls;
    document.body.appendChild(el);
    return el;
  }

  _free() { return this._pool.find(s => !s.busy) || this._pool[0]; }

  _spark(x, y) {
    const s = this._free();
    s.busy = true;
    const size   = 9 + Math.random() * 13;
    const color  = this._colors[Math.floor(Math.random() * this._colors.length)];
    const ox     = (Math.random() - 0.5) * 22;
    const driftY = 18 + Math.random() * 28;
    const driftX = (Math.random() - 0.5) * 18;
    const rot    = Math.random() * 90;

    s.el.style.color = color;
    gsap.set(s.el, { x: x + ox, y, xPercent: -50, yPercent: -50,
      width: size, height: size, opacity: 1, scale: 0, rotation: rot });

    gsap.to(s.el, { scale: 1, duration: 0.16, ease: 'back.out(2.5)',
      onComplete: () => gsap.to(s.el, {
        opacity: 0, y: y - driftY, x: x + ox + driftX,
        scale: 0.15, rotation: rot + 45,
        duration: 0.42 + Math.random() * 0.18, ease: 'power2.in',
        onComplete: () => { s.busy = false; },
      }),
    });
  }
}
