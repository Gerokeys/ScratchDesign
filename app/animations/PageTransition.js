import { gsap } from 'gsap';

/**
 * PageTransition — horizontal blocks sweep in from the left to cover the page,
 * the browser navigates behind them, and on the next page they carry on in the
 * same direction and slide off to the right. One continuous left-to-right
 * motion across two documents.
 *
 * These are real page loads, not a router, so the two halves have to be handed
 * over through sessionStorage. The flag is read by a one-line inline script in
 * every <head>, which paints a flat cover before the browser's first paint —
 * without it the new page would flash into view for the frame or two before
 * this module runs, which is the exact thing the transition exists to hide.
 */

const KEY   = 'sd-page-transition';
const ROWS  = 6;
const COVER = 'is-pt-cover';   // set on <html> by the inline head script

export default class PageTransition {
  constructor() {
    // Nothing here degrades gracefully into a shorter animation — the point is
    // a covered screen — so reduced motion opts out of the whole mechanism and
    // links behave like plain links.
    this._off = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this._off) {
      document.documentElement.classList.remove(COVER);
      try { sessionStorage.removeItem(KEY); } catch { /* private mode */ }
      return;
    }

    this._el = this._build();
    this._rows = [...this._el.querySelectorAll('.page-transition__row')];

    if (document.documentElement.classList.contains(COVER)) this._reveal();
    else sessionStorage.removeItem(KEY);

    this._bindLinks();

    // Coming back via the back button restores the page from the bfcache with
    // the blocks still covering it, so uncover on show as well as on load.
    window.addEventListener('pageshow', (e) => { if (e.persisted) this._reveal(); });
  }

  _build() {
    const existing = document.getElementById('page-transition');
    const el = existing || document.createElement('div');
    el.className = 'page-transition';
    el.id = 'page-transition';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = Array.from({ length: ROWS }, () => '<span class="page-transition__row"></span>').join('');
    if (!existing) document.body.appendChild(el);
    return el;
  }

  /** Blocks are already covering the page — carry them off to the right. */
  _reveal() {
    try { sessionStorage.removeItem(KEY); } catch { /* private mode */ }
    // Position first, reveal second: the container is hidden until `is-active`,
    // so the blocks are never seen anywhere but where they were put.
    gsap.set(this._rows, { xPercent: 0 });
    this._el.classList.add('is-active');

    gsap.to(this._rows, {
      xPercent: 101,
      duration: 0.62,
      ease: 'power3.inOut',
      stagger: 0.055,
      // Drop the flat cover only once the blocks are in place under it, so
      // there is never a frame of bare page between the two.
      onStart: () => document.documentElement.classList.remove(COVER),
      onComplete: () => {
        this._el.classList.remove('is-active');
        gsap.set(this._rows, { xPercent: -101 });
      },
    });
  }

  /** Blocks sweep in from the left, then the browser navigates behind them. */
  _cover(href) {
    gsap.set(this._rows, { xPercent: -101 });
    this._el.classList.add('is-active');

    gsap.to(this._rows, {
      xPercent: 0,
      duration: 0.5,
      ease: 'power3.inOut',
      stagger: 0.05,
      onComplete: () => { location.href = href; },
    });
  }

  _bindLinks() {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      const link = e.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      // Escape hatch for pages outside the bundle, which have no module to
      // uncover them again — privacy.html and terms.html
      if (link.hasAttribute('data-no-transition')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      // Same-document anchors (/#work from a sub-page is still a real load)
      let url;
      try { url = new URL(href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;

      e.preventDefault();
      try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ }
      this._cover(url.href);
    });
  }
}
