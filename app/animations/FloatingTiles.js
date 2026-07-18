import { gsap } from 'gsap';

export default class FloatingTiles {
    constructor() {
        this._floatStats();
        this._floatTiltWhyScratch();
        this._tiltFwCards();
        this._floatPricing();
    }

    // ── Stats flip cards — GSAP float + lift; also owns tap-to-flip ──────────────
    _floatStats() {
        document.querySelectorAll('.stats-card').forEach((el, i) => {
            const startFloat = () => gsap.to(el, {
                y: -8,
                duration: 2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });

            gsap.delayedCall(i * 0.55, startFloat);

            el.addEventListener('mouseenter', () => {
                gsap.killTweensOf(el, 'y');
                gsap.to(el, { y: -11, duration: 0.3, ease: 'power2.out' });
            });

            el.addEventListener('mouseleave', () => {
                if (el.classList.contains('is-flipped')) return;
                gsap.to(el, { y: 0, duration: 0.35, ease: 'power2.out', onComplete: startFloat });
            });

            el.addEventListener('click', () => {
                el.classList.toggle('is-flipped');
                if (el.classList.contains('is-flipped')) {
                    gsap.killTweensOf(el, 'y');
                    gsap.to(el, { y: -11, duration: 0.3, ease: 'power2.out' });
                } else {
                    gsap.to(el, { y: 0, duration: 0.35, ease: 'power2.out', onComplete: startFloat });
                }
            });
        });
    }

    // ── Why Scratch cards — float + 3D tilt on hover ─────────────────────────────
    _floatTiltWhyScratch() {
        document.querySelectorAll('.why-scratch__card').forEach((el, i) => {
            const startFloat = () => gsap.to(el, {
                y: -10,
                duration: 2.4,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });

            gsap.delayedCall(i * 0.65, startFloat);

            el.addEventListener('mouseenter', () => gsap.killTweensOf(el));

            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
                const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
                gsap.to(el, {
                    rotateY: nx * 12,
                    rotateX: -ny * 10,
                    y: -15,
                    scale: 1.03,
                    transformPerspective: 900,
                    ease: 'power2.out',
                    duration: 0.35,
                    overwrite: 'auto',
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    rotateY: 0,
                    rotateX: 0,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.35)',
                    overwrite: 'auto',
                    onComplete: startFloat,
                });
            });
        });
    }

    // ── Featured Work cards — subtle 3D tilt + lift on hover ─────────────────────
    _tiltFwCards() {
        document.querySelectorAll('.fw-card').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                gsap.to(el, { y: -5, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
            });

            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
                const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
                gsap.to(el, {
                    rotateY: nx * 4,
                    rotateX: -ny * 3,
                    transformPerspective: 1400,
                    ease: 'power2.out',
                    duration: 0.4,
                    overwrite: 'auto',
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    rotateY: 0,
                    rotateX: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    overwrite: 'auto',
                });
            });
        });
    }

    // ── Pricing cards — float with rotation preserved ─────────────────────────────
    _floatPricing() {
        [
            { sel: '.pricing__card--1', rotation: -1, delay: 0 },
            { sel: '.pricing__card--2', rotation: 1, delay: 0.7 },
            { sel: '.pricing__card--3', rotation: -2, delay: 1.4 },
        ].forEach(({ sel, rotation, delay }) => {
            const el = document.querySelector(sel);
            if (!el) return;

            gsap.set(el, { rotation });

            const startFloat = () => gsap.to(el, {
                y: -9,
                duration: 2.2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });

            gsap.delayedCall(delay, startFloat);

            el.addEventListener('mouseenter', () => {
                gsap.killTweensOf(el, 'y');
                gsap.to(el, { y: -4, x: -4, duration: 0.25, ease: 'power2.out' });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    y: 0,
                    x: 0,
                    duration: 0.35,
                    ease: 'power2.out',
                    onComplete: startFloat,
                });
            });
        });
    }
}
