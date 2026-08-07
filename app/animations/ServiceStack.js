import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitLines from './SplitLines';

gsap.registerPlugin(ScrollTrigger);

/**
 * ServiceStack — each service is a full-screen card that sticks to the top of
 * the viewport while the next one rises over it.
 *
 * The stacking itself is CSS: sticky cards of one viewport each, in a section
 * as tall as all of them. JS adds the two things CSS cannot — the leading edge
 * of an incoming card is cut on a slant that levels off as it arrives, and each
 * card's contents play in once it is on screen, the copy and the title line by
 * line out of their masks.
 */

const SLANT = 11;   // % of the card's height the leading edge is cut back by

export default class ServiceStack {
  constructor() {
    this._cards = [...document.querySelectorAll('.serv-card')];
    if (!this._cards.length) return;

    this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._splits = [];

    this._cards.forEach((card, i) => {
      this._resolveArt(card);
      this._slant(card, i);
      if (!this._reduced) this._intro(card);
    });
  }

  /**
   * The first card has nothing behind it to arrive over, so it is left square —
   * a wedge there would just look like a broken edge.
   */
  _slant(card, i) {
    if (i === 0 || this._reduced) return;

    gsap.fromTo(card,
      { '--slant': `${SLANT}%` },
      {
        '--slant': '0%',
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });
  }

  /**
   * Each panel carries both a photo slot and a drawing. Drop a real file at
   * /images/services/<name>.jpg and it takes over; until then it 404s and the
   * drawing is what shows.
   *
   * The drawing is what's visible by default and the photo only replaces it on
   * a successful load — not the other way round. Hiding the drawing while
   * waiting on the image left it hidden indefinitely, because a lazy image that
   * is still far below the fold is never fetched, so neither event ever fires.
   */
  _resolveArt(card) {
    const panel = card.querySelector('.serv-card__panel');
    const img = card.querySelector('.serv-card__img');
    if (!panel || !img) return;

    const usePhoto = () => {
      panel.classList.add('has-photo');
      panel.querySelector('svg')?.remove();
    };

    if (img.complete) {
      if (img.naturalWidth) usePhoto(); else img.remove();
    } else {
      img.addEventListener('load', usePhoto, { once: true });
      img.addEventListener('error', () => img.remove(), { once: true });
    }
  }

  _intro(card) {
    const num   = card.querySelector('.serv-card__num');
    const rule  = card.querySelector('.serv-card__rule');
    const copy  = card.querySelector('.serv-card__copy');
    const media = card.querySelector('.serv-card__media');
    const cap   = card.querySelector('.serv-card__cap');
    const title = card.querySelector('.serv-card__title');
    const line  = card.querySelector('.serv-card__hr');
    const more  = card.querySelector('.serv-card__more');

    const copySplit  = copy  ? new SplitLines(copy)  : null;
    const titleSplit = title ? new SplitLines(title) : null;
    if (copySplit)  this._splits.push(copySplit);
    if (titleSplit) this._splits.push(titleSplit);

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: card,
        // Late enough that the card is genuinely on screen, early enough that
        // nothing has already been read by the time it plays
        start: 'top 55%',
        once: true,
      },
    });

    if (rule) tl.fromTo(rule, { scaleY: 0 }, { scaleY: 1, duration: 0.5, transformOrigin: 'top' }, 0);
    if (num)  tl.fromTo(num, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.05);

    if (copySplit?.lines.length) {
      tl.fromTo(copySplit.lines,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.72, stagger: 0.045 }, 0.06);
    }

    if (media) {
      tl.fromTo(media,
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.9, ease: 'power3.inOut' }, 0.12);
    }
    if (cap) tl.fromTo(cap, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.7);

    if (titleSplit?.lines.length) {
      tl.fromTo(titleSplit.lines,
        { yPercent: 108 },
        { yPercent: 0, duration: 0.85, stagger: 0.07 }, 0.2);
    }

    if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.7, transformOrigin: 'left' }, 0.4);
    if (more) tl.fromTo(more, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 0.55);
  }

  destroy() {
    this._splits.forEach((s) => s.destroy());
  }
}
