import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * WorksScroll — sticky project meta beside a scrolling column of images.
 *
 * The left column never moves; only its contents change. As each image panel
 * takes over, the outgoing meta's parts leave in a stagger and the incoming
 * one's arrive the same way. Panels already scrolled past dim back and stop
 * accepting clicks, so only the project you are actually looking at is live.
 *
 * Disabled below 860px, where the layout is a plain stacked list — a sticky
 * column has nowhere to sit on a narrow screen.
 */

const OUT_Y = -18;
const IN_Y  = 22;

export default class WorksScroll {
  constructor() {
    this._section = document.querySelector('.s-works');
    this._metas   = [...document.querySelectorAll('.works-meta')];
    this._panels  = [...document.querySelectorAll('.works-panel')];
    if (!this._section || !this._metas.length || !this._panels.length) return;

    this._active = 0;
    this._mm = gsap.matchMedia();

    // Matches the CSS breakpoint where the columns collapse to one stack
    this._mm.add('(min-width: 1101px)', () => {
      const triggers = [];

      this._panels.forEach((panel, i) => {
        triggers.push(ScrollTrigger.create({
          trigger: panel,
          start: 'top center',
          end: 'bottom center',
          onEnter:     () => this._show(i),
          onEnterBack: () => this._show(i),
          invalidateOnRefresh: true,
        }));

        // Dim and disable a panel once it has left the top of the viewport
        triggers.push(ScrollTrigger.create({
          trigger: panel,
          start: 'bottom 22%',
          onEnter:     () => panel.classList.add('is-past'),
          onLeaveBack: () => panel.classList.remove('is-past'),
          invalidateOnRefresh: true,
        }));
      });

      return () => {
        triggers.forEach((t) => t.kill());
        this._panels.forEach((p) => p.classList.remove('is-past'));
        this._metas.forEach((m, i) => m.classList.toggle('is-active', i === 0));
      };
    });
  }

  /** Swap the sticky meta: current parts leave, the new ones arrive. */
  _show(index) {
    if (index === this._active) return;

    const prev = this._metas[this._active];
    const next = this._metas[index];
    this._active = index;
    if (!next) return;

    if (prev && prev !== next) {
      const parts = prev.querySelectorAll('[data-anim]');
      gsap.killTweensOf(parts);
      gsap.to(parts, {
        yPercent: OUT_Y,
        opacity: 0,
        duration: 0.32,
        stagger: 0.045,
        ease: 'power2.in',
        // Only retire it if it has not become current again in the meantime.
        // Scrolling back and forth can finish this tween after `prev` was
        // re-activated, which would otherwise leave no meta visible at all.
        onComplete: () => {
          if (this._metas[this._active] !== prev) prev.classList.remove('is-active');
        },
      });
    }

    const parts = next.querySelectorAll('[data-anim]');
    next.classList.add('is-active');
    gsap.killTweensOf(parts);
    gsap.fromTo(parts,
      { yPercent: IN_Y, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.12,
      },
    );
  }

  destroy() {
    this._mm?.revert();
  }
}
