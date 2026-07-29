import '../styles/index.scss';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import projects, { bySlug } from './data/projects';

gsap.registerPlugin(ScrollTrigger);

// ── Smooth scroll ─────────────────────────────────────────────────────────────
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

const paras = (arr) => arr.map((t) => `<p>${esc(t)}</p>`).join('');

document.addEventListener('DOMContentLoaded', () => {
  const slug = new URLSearchParams(location.search).get('p');
  const project = bySlug(slug);

  const root = document.getElementById('case-root');
  if (!project) {
    // Unknown or missing slug — say so plainly rather than rendering an empty shell
    root.innerHTML =
      '<div class="s-case__missing">' +
      '<h1>Case study not found</h1>' +
      '<p>That project doesn&rsquo;t exist, or the link is incomplete.</p>' +
      '<a class="s-case__back" href="/#work">Back to all work</a>' +
      '</div>';
    return;
  }

  document.title = `${project.title} — ScratchDesign case study`;

  // ── Left rail ───────────────────────────────────────────────────────────────
  document.getElementById('case-title').textContent = project.title;
  document.getElementById('case-desc').textContent  = project.overview[0];

  const live = document.getElementById('case-live');
  live.href = project.url;

  // ── Sections ────────────────────────────────────────────────────────────────
  const sections = [
    ['overview',    'Overview',    project.overview],
    ['challenge',   'The Challenge', project.challenge],
    ['strategy',    'The Strategy',  project.strategy],
    ['outcome',     'The Outcome',   project.outcome],
  ];
  if (project.testimonial) {
    sections.push(['testimonial', 'Client Notes', [project.testimonial.quote]]);
  }

  const statsHtml = project.stats.map(
    ([v, l]) => `<div class="case-stat"><span class="case-stat__v">${esc(v)}</span><span class="case-stat__l">${esc(l)}</span></div>`,
  ).join('');

  const tagsHtml = project.tags.map((t) => `<span>${esc(t)}</span>`).join('');

  document.getElementById('case-body').innerHTML = `
    <figure class="case-hero">
      <img src="${esc(project.image)}" alt="${esc(project.title)}" />
    </figure>

    <div class="case-facts">
      <div><span class="case-facts__k">Client</span><span class="case-facts__v">${esc(project.title)}</span></div>
      <div><span class="case-facts__k">Sector</span><span class="case-facts__v">${esc(project.industry)}</span></div>
      <div><span class="case-facts__k">Scope</span><span class="case-facts__v">${esc(project.role)}</span></div>
      <div><span class="case-facts__k">Year</span><span class="case-facts__v">${esc(project.year)}</span></div>
    </div>

    <div class="case-tags">${tagsHtml}</div>

    ${sections.map(([id, label, body]) => `
      <section class="case-block" id="sec-${id}" data-section="${id}">
        <h2 class="case-block__label">${esc(label)}</h2>
        <div class="case-block__body">
          ${id === 'testimonial' && project.testimonial
            ? `<blockquote class="case-quote">${esc(project.testimonial.quote)}
                 <cite>${esc(project.testimonial.author)}</cite>
               </blockquote>`
            : paras(body)}
          ${id === 'outcome' ? `<div class="case-stats">${statsHtml}</div>` : ''}
        </div>
      </section>
    `).join('')}

  `;

  // ── Next project + contact, below the case study ────────────────────────────
  const idx  = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  document.getElementById("case-foot").innerHTML = `
    <a class="case-nextup" href="/case.html?p=${esc(next.slug)}" data-cursor="View case study">
      <div class="case-nextup__text">
        <span class="case-nextup__label">Next up</span>
        <h2 class="case-nextup__name">${esc(next.title)}</h2>
      </div>
      <span class="case-nextup__cue">[ View next ]</span>
      <figure class="case-nextup__img"><img src="${esc(next.image)}" alt="${esc(next.title)}" loading="lazy" /></figure>
    </a>

    <a class="case-cta" href="/#contact">
      <span class="case-cta__arrow">↗</span>
      <span class="case-cta__title">Want to discuss a project?</span>
      <span class="case-cta__sub">We’d love to hear about your brand and how we can help.</span>
    </a>
  `;

  // ── Section indicators ──────────────────────────────────────────────────────
  const nav = document.getElementById('case-nav');
  nav.innerHTML = sections.map(([id, label], i) =>
    `<a class="case-nav__item${i === 0 ? ' is-current' : ''}" href="#sec-${id}" data-for="${id}">
       <span class="case-nav__dot"></span>${esc(label)}
     </a>`).join('');

  const items = [...nav.querySelectorAll('.case-nav__item')];

  sections.forEach(([id]) => {
    const el = document.getElementById(`sec-${id}`);
    if (!el) return;
    const mark = () => {
      items.forEach((a) => a.classList.toggle('is-current', a.dataset.for === id));
    };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: mark,
      onEnterBack: mark,
    });
  });

  // Anchor clicks go through Lenis so they match the page's scrolling
  items.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute('href'));
      if (el) lenis.scrollTo(el, { offset: -80 });
    });
  });

  // ── Reading progress ────────────────────────────────────────────────────────
  const bar = document.querySelector('#case-progress span');
  if (bar) {
    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });
  }

  // ── Entrance ────────────────────────────────────────────────────────────────
  gsap.from('.s-case__rail-top > *', {
    y: 18, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
  });

  gsap.utils.toArray('.case-block').forEach((block) => {
    gsap.from(block, {
      y: 26, opacity: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: block, start: 'top 88%', once: true },
    });
  });

  ScrollTrigger.refresh();
});
