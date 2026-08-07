import '../styles/index.scss';

// Full-screen menu + block page transition, shared with every page
import './shell';
import RevealFooter from './animations/RevealFooter';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(500, 33);
window.lenis = lenis;

const WHATSAPP = '254700000000';   // same number the home page form uses

document.addEventListener('DOMContentLoaded', () => {
  new RevealFooter();
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  const val = (n) => (form.querySelector(`[name="${n}"]`)?.value || '').trim();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Native validation first, so required fields are flagged in place
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = 'Please fill in the required fields.';
      status.classList.add('is-error');
      return;
    }
    status.classList.remove('is-error');

    const lines = [
      'New project request via scratchdesign.dev',
      '',
      '01 — Project',
      `Type: ${val('type')}`,
      `Goal: ${val('goal')}`,
      `Budget: ${val('budget')}`,
      `Start: ${val('timing')}`,
      '',
      '02 — Business',
      `Industry: ${val('industry')}`,
      `Link: ${val('link') || '—'}`,
      `About: ${val('business')}`,
      '',
      '03 — Contact',
      `Name: ${val('name')}`,
      `Email: ${val('email')}`,
      `Notes: ${val('extra') || '—'}`,
    ];

    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener',
    );

    status.textContent = 'Thanks — your request is ready to send in WhatsApp.';
  });

  // ── Entrance ────────────────────────────────────────────────────────────────
  gsap.from('.s-contact__head > *', {
    y: 20, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out',
  });

  gsap.utils.toArray('.c-form__set').forEach((set) => {
    gsap.from(set, {
      y: 24, opacity: 0, duration: 0.65, ease: 'power3.out',
      scrollTrigger: { trigger: set, start: 'top 88%', once: true },
    });
  });

  ScrollTrigger.refresh();
});
