import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import Observer from '../classes/Observer';

gsap.registerPlugin(ScrollTrigger);

export default class TextReveal extends Observer {
    constructor({ element }) {
        super({ element });
        this.element = element;

        const splitted = new SplitType(this.element, { types: 'words' });
        this.splitWords = new SplitType(splitted.words, { types: 'words' });

        // Set initial hidden state
        gsap.set(this.splitWords.words, { y: '100%' });
    }

    onEnter() {
        gsap.to(this.splitWords.words, {
            y: '0%',
            duration: 1.2,
            stagger: 0.018,
            ease: 'power3.out',
        });
    }
}

// Service card expand on scroll — proper scrub pattern (one tween, zero per-tick overhead)
document.addEventListener('DOMContentLoaded', () => {
    gsap.utils.toArray('.service').forEach((service) => {
        const imgContainer = service.querySelector('.img');
        if (!imgContainer) return;

        gsap.fromTo(imgContainer,
            { width: '30%' },
            {
                width: '100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: service,
                    start: 'bottom bottom',
                    end: 'top top',
                    scrub: true,
                },
            }
        );

        gsap.fromTo(service,
            { height: '150px' },
            {
                height: '450px',
                ease: 'none',
                scrollTrigger: {
                    trigger: service,
                    start: 'top bottom',
                    end: 'top top',
                    scrub: true,
                },
            }
        );
    });
});
