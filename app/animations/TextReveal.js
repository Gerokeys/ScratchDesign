import { gsap } from 'gsap'
import SplitType from "split-type";
import Observer from "../classes/Observer";

export default class TextReveal extends Observer {
    constructor({element}) {
        super({ element }); 
        this.element = element;

        const splitted = new SplitType(this.element, { types: 'words' });
        this.splitWords = new SplitType(splitted.words, { types: 'words' });
    }

    onEnter() {
        gsap.to(this.splitWords.words, {
            y: '0%',
            duration: 1.3,
            stagger:0.019,
            ease: 'power3',
        })
    }
}

document.addEventListener("DOMContentLoaded", function () {
    
    const services = gsap.utils.toArray(".service");
  
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };
  
    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const service = entry.target;
          const imgContainer = service.querySelector(".img");
  
          ScrollTrigger.create({
            trigger: service,
            start: "bottom bottom",
            end: "top top",
            scrub: true,
            onUpdate: (self) => {
              let progress = self.progress;
              let newWidth = 30 + 70 * progress;
              gsap.to(imgContainer, {
                width: newWidth + "%",
                duration: 0.1,
                ease: "none",
              });
            },
          });
  
          ScrollTrigger.create({
            trigger: service,
            start: "top bottom",
            end: "top top",
            scrub: true,
            onUpdate: (self) => {
              let progress = self.progress;
              let newHeight = 150 + 300 * progress;
              gsap.to(service, {
                height: newHeight + "px",
                duration: 0.1,
                ease: "none",
              });
            },
          });
  
          observer.unobserve(service);
        }
      });
    };
  
    const observer = new IntersectionObserver(observerCallback, observerOptions);
  
    services.forEach((service) => {
      observer.observe(service);
    });
  });