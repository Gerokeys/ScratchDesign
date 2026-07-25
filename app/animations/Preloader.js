import { gsap } from 'gsap';

/**
 * Preloader — a five-beat count-up with climbing vertical rules.
 *
 * 1. The counter jumps 0 → 20 → 40 → 60 → 80 → 100 in five discrete beats.
 *    On each beat the vertical rules snap upward (scaleY from the bottom) to
 *    the matching fraction, so the lines and the number advance in lockstep.
 * 2. At 100 the rules slide horizontally and merge into a single centre line.
 * 3. The overlay then closes in onto that line, revealing the page.
 */

const STEPS = [20, 40, 60, 80, 100];
const SNAP  = 0.22;   // duration of a beat's snap
const HOLD  = 0.16;   // pause between beats, so the rhythm reads as stepped
const MERGE = 0.62;
const CLOSE = 0.78;

export default class Preloader {
  constructor(onComplete) {
    this._overlay = document.getElementById('preloader');
    this._counter = document.getElementById('preloader-counter');
    this._lines   = [...document.querySelectorAll('.preloader__line')];
    this._done    = onComplete;

    if (!this._overlay) { onComplete?.(); return; }

    if (sessionStorage.getItem('sd-preloaded')) {
      this._overlay.remove();
      onComplete?.();
      return;
    }
    sessionStorage.setItem('sd-preloaded', '1');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(this._lines, { scaleY: 1 });
      if (this._counter) this._counter.textContent = '100';
      gsap.to(this._overlay, {
        opacity: 0, duration: 0.35, delay: 0.2,
        onComplete: () => this._finish(),
      });
      return;
    }

    window.lenis?.stop();
    this._run();
  }

  _run() {
    const tl = gsap.timeline({ onComplete: () => this._finish() });

    // ── 1. five discrete beats ────────────────────────────────────────────────
    STEPS.forEach((pct) => {
      tl.call(() => {
        if (this._counter) this._counter.textContent = String(pct);
      });
      tl.to(this._lines, {
        scaleY: pct / 100,
        duration: SNAP,
        ease: 'power4.out',
        stagger: { each: 0.012, from: 'center' },
      });
      tl.to({}, { duration: HOLD });
    });

    // ── 2. rules converge into one centre line ────────────────────────────────
    // Offsets are measured now (post-layout) rather than assumed, so this holds
    // at any viewport width.
    const cx = window.innerWidth / 2;
    const offsets = this._lines.map((line) => {
      const r = line.getBoundingClientRect();
      return cx - (r.left + r.width / 2);
    });

    // Label the merge so everything below anchors to it explicitly. Relative
    // positions ('>') would chain off the *counter fade* — the last tween
    // inserted, and much shorter — starting the close mid-merge.
    tl.addLabel('merge', '+=0.06');

    this._lines.forEach((line, i) => {
      tl.to(line, {
        x: offsets[i],
        duration: MERGE,
        ease: 'power4.inOut',
      }, 'merge');
    });

    tl.to('.preloader__count', {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    }, 'merge');

    // ── 3. overlay closes in onto the merged line ─────────────────────────────
    tl.addLabel('close', `merge+=${MERGE - 0.06}`);

    tl.to(this._overlay, {
      clipPath: 'inset(0% 50% 0% 50%)',
      duration: CLOSE,
      ease: 'power4.inOut',
    }, 'close');
  }

  _finish() {
    this._overlay?.remove();
    window.lenis?.start();
    this._done?.();
  }
}
