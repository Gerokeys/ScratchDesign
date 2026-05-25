import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class ScrollAnimations {
  constructor() {
    this._initFAQ();
    this._initFooterMarquee();
    this._initBatchReveals();
    this._initServicesStack();
    this._initTestimonialsColumns();
  }

  // Clip-path image reveal + text fade for each portfolio item
  _initWorkItems() {
    gsap.utils.toArray('.featured-work__item').forEach((item) => {
      const imageInner = item.querySelector('.featured-work__item-image-inner');
      const meta = [
        item.querySelector('.featured-work__item-top'),
        item.querySelector('.featured-work__item-title'),
        item.querySelector('.featured-work__item-desc'),
        item.querySelector('.featured-work__item-cta'),
      ].filter(Boolean);

      if (!imageInner) return;

      gsap.set(imageInner, { clipPath: 'inset(0 100% 0 0)' });
      gsap.set(meta, { y: 30, opacity: 0 });

      ScrollTrigger.create({
        trigger: item,
        start: 'top 80%',
        once: true,
        onEnter() {
          gsap.to(imageInner, {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.1,
            ease: 'power4.inOut',
          });
          gsap.to(meta, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.4,
          });
        },
      });
    });
  }

  // GSAP-powered accordion — no continuous overhead
  _initFAQ() {
    document.querySelectorAll('.faq__item').forEach((item) => {
      const question = item.querySelector('.faq__question');
      const answer = item.querySelector('.faq__answer');
      const icon = item.querySelector('.faq__icon');
      if (!question || !answer) return;

      gsap.set(answer, { height: 0, opacity: 0 });

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        const allItems = document.querySelectorAll('.faq__item');

        allItems.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            gsap.to(other.querySelector('.faq__answer'), {
              height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut',
            });
            const otherIcon = other.querySelector('.faq__icon');
            if (otherIcon) gsap.to(otherIcon, { rotation: 0, duration: 0.3 });
          }
        });

        if (!isOpen) {
          item.classList.add('is-open');
          gsap.to(answer, { height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out' });
          if (icon) gsap.to(icon, { rotation: 45, duration: 0.3 });
        } else {
          item.classList.remove('is-open');
          gsap.to(answer, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut' });
          if (icon) gsap.to(icon, { rotation: 0, duration: 0.3 });
        }
      });
    });
  }

  // Continuous marquee — GPU-composited transform only
  _initFooterMarquee() {
    const track = document.querySelector('.footer__marquee-track');
    if (!track) return;

    requestAnimationFrame(() => {
      const halfWidth = track.scrollWidth / 2;
      gsap.to(track, {
        x: -halfWidth,
        duration: 22,
        ease: 'none',
        repeat: -1,
      });
    });
  }

  // Subtle scale-down on each sticky card as the next card slides over it
  _initServicesStack() {
    const cards = gsap.utils.toArray('.services-stack__card');
    if (cards.length < 2) return;

    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;

      gsap.set(card, { transformOrigin: 'top center' });
      gsap.to(card, {
        scale: 0.96,
        ease: 'none',
        scrollTrigger: {
          trigger: cards[i + 1],
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });
    });
  }

  // 3-column infinite-scroll testimonials
  _initTestimonialsColumns() {
    const columns = document.querySelectorAll('.testimonials__column');
    if (!columns.length) return;

    const durations = [15, 19, 17];

    columns.forEach((col, i) => {
      const items = Array.from(col.children);
      items.forEach((item) => col.appendChild(item.cloneNode(true)));

      gsap.to(col, {
        yPercent: -50,
        duration: durations[i] || 15,
        ease: 'none',
        repeat: -1,
      });
    });
  }

  // Single-pass batch reveal for all simple fade-up elements
  _initBatchReveals() {
    const selectors = [
      '.process__step',
      '.pricing__card',
      '.faq__item',
    ];

    selectors.forEach((sel) => {
      const els = gsap.utils.toArray(sel);
      if (!els.length) return;

      gsap.set(els, { opacity: 0, y: 24 });

      ScrollTrigger.batch(els, {
        start: 'top 85%',
        once: true,
        onEnter(batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
          });
        },
      });
    });

    // Single elements
    const singleEls = gsap.utils.toArray(
      '.featured-work__title, .process__title, ' +
      '.pricing__title, .testimonials__title, .faq__title, .contact-cta__title'
    );
    gsap.set(singleEls, { opacity: 0, y: 20 });
    ScrollTrigger.batch(singleEls, {
      start: 'top 88%',
      once: true,
      onEnter(batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' });
      },
    });
  }
}
