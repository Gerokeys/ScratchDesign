import '../styles/index.scss';
import Lenis from 'lenis';

import TextReveal from './animations/TextReveal';

class App {
    constructor() {
        this._createLenis();
        this._createTextReveal();
        this._render();
    }

    _createTextReveal() {
        const textItems = [
            ...document.querySelectorAll('[data-animation="text-reveal"]'),
        ];

        textItems.forEach((text) => {
            new TextReveal({
                element:text,
            });
        });
    }

    _createLenis() {
        this.lenis = new Lenis({
            lerp:0.15,
        })
    }

    _render(time) {
        this.lenis.raf(time);

        requestAnimationFrame(this._render.bind(this))
    }
}

new App();

const navSlide = () => {
    const burger = document.querySelector('.header__hamburger');
    const nav = document.querySelector('.header__nav-links');
    const navLinks = document.querySelectorAll('.header__nav-links li');
    const body = document.body;

    burger.addEventListener('click', () => {
        // Toggle nav
        nav.classList.toggle('nav-active');
        
        // Toggle scroll lock on body
        body.classList.toggle('scroll-lock');

        // Animate links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.4}s`;
            }
        });

        // Burger animation
        burger.classList.toggle('toggle');
    });
};

navSlide();
