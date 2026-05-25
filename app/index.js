import '../styles/index.scss';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import TextReveal from './animations/TextReveal';
import ScrollAnimations from './animations/ScrollAnimations';
import MobileNav from './animations/MobileNav';
import Cursor from './animations/Cursor';
import Preloader from './animations/Preloader';
import FeaturedWork from './animations/FeaturedWork';

gsap.registerPlugin(ScrollTrigger);

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Expose so MobileNav / FeaturedWork can pause scrolling when needed
window.lenis = lenis;

// ── App bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    new Cursor();
    new MobileNav();

    new Preloader(() => {
        document.querySelectorAll('[data-animation="text-reveal"]').forEach((el) => {
            new TextReveal({ element: el });
        });
        new ScrollAnimations();
        new FeaturedWork();
    });
});
