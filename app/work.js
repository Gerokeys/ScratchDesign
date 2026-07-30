import '../styles/index.scss';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import projects from './data/projects';
import HoverCursor from './animations/HoverCursor';

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
  const list = document.getElementById('wp-list');
  if (!list) return;

  list.innerHTML = projects.map((p, i) => `
    <a class="wp-item" href="/case.html?p=${esc(p.slug)}" data-cursor="View case study">
      <figure class="wp-item__media">
        <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />
      </figure>
      <div class="wp-item__meta">
        <span class="wp-item__num">${String(i + 1).padStart(2, '0')}</span>
        <h2 class="wp-item__name">${esc(p.title)}</h2>
        <span class="wp-item__cat">${esc(p.industry)}</span>
        <span class="wp-item__year">${esc(p.year)}</span>
      </div>
    </a>
  `).join('');

  // Hover label, same as the home page work section
  new HoverCursor();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.from('.s-wp__top > *', {
      y: 18, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    });

    gsap.utils.toArray('.wp-item').forEach((item) => {
      gsap.from(item, {
        y: 30, opacity: 0, duration: 0.75, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
      });
    });
  }

  ScrollTrigger.refresh();
});
