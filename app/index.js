import '../styles/index.scss';

import Lenis            from 'lenis';
import { gsap }         from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Preloader        from './animations/Preloader';
import WebGLHero        from './animations/WebGLHero';
import HeroFit          from './animations/HeroFit';
import Glitch           from './animations/Glitch';
import StackCards       from './animations/StackCards';
import RevealZoom       from './animations/RevealZoom';
import Typewriter       from './animations/Typewriter';
import WorksScroll      from './animations/WorksScroll';
import HoverCursor      from './animations/HoverCursor';
import ScrollAnimations, { prepareHero } from './animations/ScrollAnimations';
import MagneticButton   from './animations/MagneticButton';
import WorkPreview      from './animations/WorkPreview';
import FeaturedWork     from './animations/FeaturedWork';

// Full-screen menu + block page transition, shared with every other page
import './shell';
import RevealFooter from './animations/RevealFooter';

gsap.registerPlugin(ScrollTrigger);

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
// Keep GSAP's default lag smoothing rather than disabling it: with smoothing
// off, a single long blocking frame (module eval, font load, WebGL init)
// advances the ticker by the full elapsed wall time and swallows short
// timelines whole — the preloader would jump straight from 0% to done.
gsap.ticker.lagSmoothing(500, 33);
window.lenis = lenis;

// ── App bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  new RevealFooter();

  // Contour field — hero only; the strategy band is a flat charcoal panel
  new WebGLHero('hero-canvas');

  // Scale the headline to span the full viewport width
  new HeroFit();

  // Hide everything above the fold *before* the preloader runs, while the
  // overlay still covers the viewport — otherwise the page shows through the
  // closing wipe and then snaps away.
  prepareHero();

  // Preloader → then wire everything that depends on DOM being ready
  new Preloader(() => {
    new ScrollAnimations();
    new FeaturedWork();
    new WorkPreview();
    new MagneticButton();
    new StackCards();
    new RevealZoom();
    new Typewriter();
    new WorksScroll();
    new HoverCursor();

    // Pins and fitted type change the document height as they initialise, so
    // triggers created earlier measure stale positions. Refresh once everything
    // exists — then again after a tick and after fonts land, because pinning
    // itself alters layout during the first pass and leaves the triggers
    // created before it still measuring the shorter document.
    ScrollTrigger.refresh();
    requestAnimationFrame(() => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    // Hero text reveal (set up by ScrollAnimations, fired here)
    window._heroReveal?.();

    // Rare, subtle RGB-split flicker on the accent word
    new Glitch();
  });

  // ── Contact form → WhatsApp ─────────────────────────────────────────────────
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = (form.querySelector('[name="name"]')?.value    || '').trim();
      const email   = (form.querySelector('[name="email"]')?.value   || '').trim();
      const service = (form.querySelector('[name="service"]')?.value || '');
      const message = (form.querySelector('[name="message"]')?.value || '').trim();
      const text = `Hi ScratchDesign 👋\n\nMy name is ${name} (${email}).\n\nLooking for: ${service || 'your services'}\n\n${message}`;
      window.open(`https://wa.me/254700000000?text=${encodeURIComponent(text)}`, '_blank');
      form.reset();
      document.getElementById('cf-success')?.removeAttribute('hidden');
    });
  }

  // ── Lazy-load work preview images ───────────────────────────────────────────
  document.querySelectorAll('.work-preview__img').forEach((img) => {
    img.addEventListener('load', () => img.classList.add('is-loaded'));
  });

});
