export default class HeroBlobs {
  constructor() {
    this.blob1 = document.querySelector('.hero-blob--1');
    this.blob2 = document.querySelector('.hero-blob--2');
    if (!this.blob1 || !this.blob2) return;

    // Current interpolated position (normalised -0.5 → 0.5 from center)
    this.cx = 0; this.cy = 0;
    // Raw mouse target
    this.tx = 0; this.ty = 0;

    this._onMove = this._onMove.bind(this);
    this._tick  = this._tick.bind(this);

    window.addEventListener('mousemove', this._onMove, { passive: true });
    this._raf = requestAnimationFrame(this._tick);
  }

  _onMove(e) {
    // Normalise to -0.5 … +0.5 relative to viewport center
    this.tx = (e.clientX / window.innerWidth)  - 0.5;
    this.ty = (e.clientY / window.innerHeight) - 0.5;
  }

  _tick() {
    // Ease factor — lower = slower/subtler follow
    const ease = 0.04;
    this.cx += (this.tx - this.cx) * ease;
    this.cy += (this.ty - this.cy) * ease;

    // Primary blob: more movement
    const shift1x = this.cx * 80;
    const shift1y = this.cy * 60;

    // Secondary blob: opposite drift, half speed — creates depth
    const shift2x = this.cx * -40;
    const shift2y = this.cy * -30;

    this.blob1.style.transform = `translate3d(${shift1x}px, ${shift1y}px, 0)`;
    this.blob2.style.transform = `translate3d(${shift2x}px, ${shift2y}px, 0)`;

    this._raf = requestAnimationFrame(this._tick);
  }

  destroy() {
    window.removeEventListener('mousemove', this._onMove);
    cancelAnimationFrame(this._raf);
  }
}
