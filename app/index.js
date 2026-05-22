import '../styles/index.scss';

import TextReveal from './animations/TextReveal';
import ScrollAnimations from './animations/ScrollAnimations';
import MobileNav from './animations/MobileNav';
import MouseTrail from './animations/MouseTrail';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-animation="text-reveal"]').forEach((el) => {
        new TextReveal({ element: el });
    });

    new ScrollAnimations();
    new MobileNav();
    new MouseTrail();
});
