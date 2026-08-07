import '../styles/index.scss';

// Full-screen menu + block page transition, shared with every page
import './shell';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import projects from './data/projects';
import RevealFooter from './animations/RevealFooter';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(500, 33);
window.lenis = lenis;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

document.addEventListener('DOMContentLoaded', () => {
  new RevealFooter();

  // The client list is the project data, set as wordmarks. Rendering the names
  // as type rather than inventing logo files keeps this honest — we have their
  // work, not their brand assets.
  const list = document.getElementById('client-list');
  if (list) {
    list.innerHTML = projects.map((p) => `
      <li class="client-list__item">
        <a href="/case.html?p=${esc(p.slug)}">
          <span class="client-list__name">${esc(p.title)}</span>
          <span class="client-list__meta">${esc(p.industry.split('·')[0].trim())} · ${esc(p.year)}</span>
        </a>
      </li>`).join('');
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Sections rise in as they arrive
  gsap.utils.toArray('.s-about section, .about-principles li, .client-list__item')
    .forEach((el) => {
      gsap.from(el, {
        y: 26, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

  // Count the numerals up once each stat is on screen. The suffix is kept out
  // of the tween so "4–6 wks" survives — only the leading figure animates.
  document.querySelectorAll('.proof-stat__num').forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (!Number.isFinite(target)) return;

    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
});
