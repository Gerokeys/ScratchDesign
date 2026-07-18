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
import HeroBlobs from './animations/HeroBlobs';
import FloatingTiles from './animations/FloatingTiles';

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

// ── Page transitions ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const pt = document.getElementById('page-transition');
    if (pt) {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href');
            if (
                !href ||
                href.startsWith('#') ||
                href.startsWith('http') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                link.target === '_blank'
            ) return;
            e.preventDefault();
            pt.classList.add('is-exiting');
            setTimeout(() => { location.href = href; }, 340);
        });
    }
});

// ── App bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    new Cursor();
    new MobileNav();
    new HeroBlobs();

    // Contact form → WhatsApp submission (replace 254700000000 with your number)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name    = (contactForm.querySelector('[name="name"]')?.value    || '').trim();
            const email   = (contactForm.querySelector('[name="email"]')?.value   || '').trim();
            const service = (contactForm.querySelector('[name="service"]')?.value || '');
            const message = (contactForm.querySelector('[name="message"]')?.value || '').trim();
            const text = `Hi ScratchDesign 👋\n\nMy name is ${name} (${email}).\n\nI'm looking for: ${service || 'your services'}\n\n${message}`;
            window.open(`https://wa.me/254700000000?text=${encodeURIComponent(text)}`, '_blank');
            contactForm.reset();
            const successEl = document.getElementById('cf-success');
            if (successEl) successEl.removeAttribute('hidden');
        });
    }

    // Lazy-load card images
    document.querySelectorAll('.fw-card__image img').forEach((img) => {
        const markLoaded = () => img.classList.add('is-loaded');
        if (img.complete && img.naturalHeight !== 0) markLoaded();
        else { img.addEventListener('load', markLoaded); img.addEventListener('error', markLoaded); }
    });

    new Preloader(() => {
        document.querySelectorAll('[data-animation="text-reveal"]').forEach((el) => {
            new TextReveal({ element: el });
        });
        new ScrollAnimations();
        new FeaturedWork();
        new FloatingTiles();
    });
});
