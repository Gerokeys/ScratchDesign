import { gsap } from 'gsap';

export default class MouseTrail {
  constructor() {
    // Touch/stylus devices have no hover — skip entirely
    if (window.matchMedia('(hover: none)').matches) return;

    this._dots = [];
    this._count = 16;

    for (let i = 0; i < this._count; i++) {
      const el = document.createElement('div');
      el.className = 'mouse-trail-dot';
      document.body.appendChild(el);

      // Leading dot is large + opaque; tail fades to tiny + transparent
      const t = i / (this._count - 1);          // 0 → 1 along the trail
      const size    = 10 - t * 7.5;             // 10px → 2.5px
      const opacity = 0.6 - t * 0.52;           // 0.60 → 0.08
      const dur     = 0.06 + t * 0.28;          // 0.06s → 0.34s lag

      gsap.set(el, {
        width:           size,
        height:          size,
        xPercent:        -50,
        yPercent:        -50,
        opacity:         opacity,
        transformOrigin: '50% 50%',
        x: -200,
        y: -200,
      });

      this._dots.push({
        el,
        baseOpacity: opacity,
        moveX: gsap.quickTo(el, 'x', { duration: dur, ease: 'power3.out' }),
        moveY: gsap.quickTo(el, 'y', { duration: dur, ease: 'power3.out' }),
      });
    }

    window.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
      this._dots.forEach(({ moveX, moveY }) => { moveX(x); moveY(y); });
    });

    // Fade out when cursor leaves the window
    document.addEventListener('mouseleave', () => {
      this._dots.forEach(({ el }) => gsap.to(el, { opacity: 0, duration: 0.4 }));
    });

    document.addEventListener('mouseenter', ({ clientX: x, clientY: y }) => {
      // Snap all dots to current position before fading back in
      this._dots.forEach(({ el, baseOpacity, moveX, moveY }) => {
        moveX(x); moveY(y);
        gsap.to(el, { opacity: baseOpacity, duration: 0.3 });
      });
    });
  }
}
