import { gsap } from 'gsap';

/**
 * NavMenu — the full-screen menu, built here rather than written into each of
 * the six HTML pages so there is one copy to change.
 *
 * Each row is a full-bleed band with the item's number and word. On hover the
 * band fills, the word steps aside and a marquee of the item's own phrase runs
 * across it — the phrase names what the destination actually is, so the hover
 * reads as an answer to the word rather than decoration.
 *
 * The links are duplicated in every page footer, so building the menu in JS
 * costs nothing in crawlability.
 */

const ITEMS = [
  { num: '01', word: 'Work',    href: '/work.html',    phrase: 'Our recent projects' },
  { num: '02', word: 'About',   href: '/about.html',   phrase: 'Who you would be working with' },
  { num: '03', word: 'Process', href: '/#how',         phrase: 'How a project actually runs' },
  { num: '04', word: 'Contact', href: '/contact.html', phrase: 'Start a project with us' },
];

// The phrase list is rendered twice and the track loops on -50%, so one list
// only has to be wider than the viewport for the seam to stay off screen.
const REPEATS = 4;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default class NavMenu {
  constructor() {
    this._el = this._build();
    this._rows  = [...this._el.querySelectorAll('.nav-menu__row')];
    this._panel = this._el.querySelector('.nav-menu__panel');
    this._foot  = this._el.querySelector('.nav-menu__foot');
    this._top   = this._el.querySelector('.nav-menu__top');
    this._open  = false;

    this._trigger = this._ensureTrigger();
    this._bind();
  }

  // ── Markup ─────────────────────────────────────────────────────────────────
  _build() {
    const rows = ITEMS.map(({ num, word, href, phrase }) => {
      const marquee = Array.from({ length: REPEATS }, () =>
        `<span class="nav-menu__phrase">${esc(phrase)}</span><span class="nav-menu__sep" aria-hidden="true">✳</span>`,
      ).join('');

      return `
        <a class="nav-menu__row" href="${href}">
          <span class="nav-menu__inner">
            <span class="nav-menu__num">${num}</span>
            <span class="nav-menu__word">${esc(word)}</span>
            <span class="nav-menu__hint">${esc(phrase)}</span>
          </span>
          <span class="nav-menu__marquee" aria-hidden="true">
            <span class="nav-menu__track">${marquee}${marquee}</span>
          </span>
        </a>`;
    }).join('');

    const el = document.createElement('div');
    el.className = 'nav-menu';
    el.id = 'nav-menu';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Menu');
    el.innerHTML = `
      <div class="nav-menu__panel">
        <div class="nav-menu__top">
          <a class="nav-menu__logo" href="/" aria-label="ScratchDesign home">
            <img src="/images/scratchdesign%20logo.jpeg" alt="ScratchDesign" width="56" height="56" />
          </a>
          <button type="button" class="nav-menu__close" id="nav-menu-close" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <nav class="nav-menu__list" aria-label="Primary">${rows}</nav>

        <div class="nav-menu__foot">
          <p class="nav-menu__bio">
            We build websites that are quick and clear, for businesses that would rather be
            understood than admired.
          </p>
          <div class="nav-menu__meta">
            <a href="mailto:hello@scratchdesign.co">hello@scratchdesign.co</a>
            <span>Nairobi, Kenya</span>
          </div>
          <div class="nav-menu__social">
            <a href="https://www.instagram.com/scratchdesign" target="_blank" rel="noopener">instagram</a>
            <a href="https://wa.me/254700000000" target="_blank" rel="noopener">whatsapp</a>
          </div>
        </div>
      </div>`;

    document.body.appendChild(el);
    return el;
  }

  /**
   * The home page ships its own Menu button. Sub-pages carry a slimmer header,
   * and the case page carries none at all — so build one rather than editing
   * five HTML files, and float it if there is no header to sit in.
   */
  _ensureTrigger() {
    const existing = document.getElementById('nav-burger');
    if (existing) return existing;

    const host = document.querySelector('.c-nav');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = host ? 'c-nav__menu' : 'c-nav__menu c-nav__menu--float';
    btn.id = 'nav-burger';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span>Menu</span><span class="c-nav__menu-dot"></span>';
    (host || document.body).appendChild(btn);
    return btn;
  }

  // ── Behaviour ──────────────────────────────────────────────────────────────
  _bind() {
    this._trigger?.addEventListener('click', () => (this._open ? this.close() : this.open()));
    this._el.querySelector('#nav-menu-close')?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._open) this.close();
    });

    // An in-page anchor has no navigation to hide behind, so close the menu
    // and scroll once it is out of the way.
    //
    // Every other row is left alone: PageTransition covers the screen before
    // the browser leaves, and its blocks sit above the menu — so closing here
    // would only flash the page underneath for the length of the sweep.
    this._rows.forEach((row) => {
      row.addEventListener('click', (e) => {
        const href = row.getAttribute('href');
        const samePage = href.startsWith('#') ||
          (href.startsWith('/#') && (location.pathname === '/' || location.pathname === '/index.html'));
        if (!samePage) return;

        e.preventDefault();
        const id = href.slice(href.indexOf('#'));
        this.close(false, () => {
          const target = document.querySelector(id);
          if (target) window.lenis?.scrollTo(target, { offset: -20 });
        });
      });
    });
  }

  open() {
    if (this._open) return;
    this._open = true;
    this._el.classList.add('is-open');
    this._trigger?.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('has-menu');
    window.lenis?.stop();

    gsap.killTweensOf([this._rows, this._foot, this._top]);
    gsap.fromTo(this._rows,
      { yPercent: 106, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.62, ease: 'power3.out', stagger: 0.06, delay: 0.12 });
    gsap.fromTo([this._top, this._foot],
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.3 });
  }

  /**
   * `instant` skips the outro: the page is navigating away behind the blocks,
   * so animating the menu out would only delay the transition.
   */
  close(instant = false, onDone = null) {
    if (!this._open) return;
    this._open = false;
    this._trigger?.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('has-menu');
    window.lenis?.start();

    gsap.killTweensOf([this._rows, this._foot, this._top]);

    if (instant) {
      this._el.classList.remove('is-open');
      onDone?.();
      return;
    }

    gsap.to([...this._rows].reverse(), {
      yPercent: 106, opacity: 0,
      duration: 0.34, ease: 'power3.in', stagger: 0.04,
      onComplete: () => {
        this._el.classList.remove('is-open');
        gsap.set([this._rows, this._top, this._foot], { clearProps: 'all' });
        onDone?.();
      },
    });
    gsap.to([this._top, this._foot], { opacity: 0, duration: 0.2, ease: 'power2.in' });
  }
}
