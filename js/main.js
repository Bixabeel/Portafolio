/* ============================================
   PORTFOLIO — MAIN CONTROLLER
   Sebastián Carabaguíaz 2026
============================================ */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/* ============================================
   1. SMOOTH SCROLL — LENIS
============================================ */
class SmoothScroll {
  constructor() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

/* ============================================
   2. CUSTOM CURSOR
============================================ */
class CustomCursor {
  constructor() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    this.cursor = document.querySelector('.cursor');
    this.dot = this.cursor.querySelector('.cursor__dot');
    this.ring = this.cursor.querySelector('.cursor__ring');
    this.label = this.cursor.querySelector('.cursor__label');

    this.pos = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };

    this.bind();
    this.render();
  }

  bind() {
    window.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
    });

    const hoverables = document.querySelectorAll('a, button, [data-cursor], .substrato, .project, .production, .media-item, .capability, .stratum, .phase, .pipeline__stage');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this.cursor.classList.add('is-hover');
        const text = el.getAttribute('data-cursor') || el.getAttribute('aria-label') || '';
        this.label.textContent = text;
      });
      el.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('is-hover');
      });
    });

    window.addEventListener('mousedown', () => this.cursor.classList.add('is-active'));
    window.addEventListener('mouseup', () => this.cursor.classList.remove('is-active'));
  }

  render() {
    this.pos.x += (this.target.x - this.pos.x) * 0.15;
    this.pos.y += (this.target.y - this.pos.y) * 0.15;

    this.cursor.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px)`;

    requestAnimationFrame(() => this.render());
  }
}

/* ============================================
   3. SCENE 00 — UMBRAL ANIMATION
============================================ */
class UmbralScene {
  constructor() {
    this.section = document.querySelector('#umbral');
    this.canvas = this.section.querySelector('.umbral__canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };

    this.resize();
    this.createParticles();
    this.bind();
    this.animate();
    this.typeTerminal();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  createParticles() {
    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
  }

  bind() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    this.section.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      // Mouse influence
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        p.vx -= (dx / dist) * 0.02;
        p.vy -= (dy / dist) * 0.02;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(212, 168, 92, ${p.opacity})`;
      this.ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(212, 168, 92, ${(1 - d / 120) * 0.15})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  typeTerminal() {
    const lines = this.section.querySelectorAll('.umbral__line');
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('is-visible');
      }, 500 + i * 400);
    });
  }
}

/* ============================================
   4. TEXT SPLIT & REVEAL
============================================ */
class TextAnimator {
  constructor() {
    this.initHeadlines();
    this.initStatements();
  }

  initHeadlines() {
    document.querySelectorAll('[data-split]').forEach((el) => {
      const split = new SplitType(el, { types: 'words, chars' });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          if (el.classList.contains('manifiesto__headline') || el.classList.contains('contacto__title') || el.classList.contains('produccion__title') || el.classList.contains('media__title') || el.classList.contains('research__title') || el.classList.contains('sustratos__title') || el.classList.contains('metodo__title')) {
            gsap.to(split.chars, {
              y: 0,
              stagger: 0.015,
              duration: 1,
              ease: 'power3.out',
            });
          } else {
            gsap.to(split.words, {
              opacity: 1,
              stagger: 0.03,
              duration: 0.8,
            });
          }
          el.classList.add('is-visible');
        },
      });
    });
  }

  initStatements() {
    // Already handled in initHeadlines
  }
}

/* ============================================
   5. SCENE CONTROLLER — PROGRESS LABEL
============================================ */
class SceneController {
  constructor() {
    this.progressBar = document.querySelector('.progress__bar');
    this.progressLabel = document.querySelector('.progress__label');
    this.scenes = document.querySelectorAll('.scene:not(.scene--umbral)');

    this.bind();
  }

  bind() {
    // Overall progress
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (this.progressBar) {
          this.progressBar.style.setProperty('--progress', `${self.progress * 100}%`);
          const after = this.progressBar.querySelector('::after') || this.progressBar;
          this.progressBar.style.cssText = '';
        }
        // Update bar via CSS variable
        document.documentElement.style.setProperty('--scroll-progress', self.progress);
      },
    });

    // Update progress bar height via a real element
    const barAfter = document.createElement('style');
    barAfter.id = 'progress-style';
    document.head.appendChild(barAfter);

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const sheet = document.getElementById('progress-style');
        sheet.textContent = `.progress__bar::after { height: ${self.progress * 100}% !important; }`;
      },
    });

    // Scene detection
    this.scenes.forEach((scene) => {
      ScrollTrigger.create({
        trigger: scene,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => this.updateLabel(scene),
        onEnterBack: () => this.updateLabel(scene),
      });
    });
  }

  updateLabel(scene) {
    if (!this.progressLabel) return;
    const name = scene.getAttribute('data-scene-name');
    if (name) this.progressLabel.textContent = name;
  }
}

/* ============================================
   6. PROJECT ENTRANCE ANIMATIONS
============================================ */
class ProjectAnimator {
  constructor() {
    this.animateProjects();
    this.animateSubstratos();
    this.animateProductions();
    this.animateStrata();
    this.animateMedia();
  }

  animateProjects() {
    document.querySelectorAll('.project').forEach((project) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: project,
          start: 'top 80%',
        },
      });

      tl.from(project.querySelector('.project__meta'), { opacity: 0, y: 20, duration: 0.6 })
        .from(project.querySelector('.project__name'), { opacity: 0, y: 40, duration: 1, ease: 'power3.out' }, '-=0.3')
        .from(project.querySelector('.project__tagline'), { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
        .from(project.querySelector('.project__image-frame'), { opacity: 0, scale: 0.95, duration: 1, ease: 'power2.out' }, '-=0.4')
        .from(project.querySelector('.project__quote'), { opacity: 0, x: -30, duration: 0.8 }, '-=0.6');
    });
  }

  animateSubstratos() {
    document.querySelectorAll('.substrato').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        opacity: 0,
        y: 60,
        duration: 1,
        delay: i * 0.15,
        ease: 'power3.out',
      });
    });
  }

  animateProductions() {
    document.querySelectorAll('.production').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        opacity: 0,
        y: 60,
        duration: 1,
        delay: i * 0.12,
        ease: 'power3.out',
      });
    });
  }

  animateStrata() {
    document.querySelectorAll('.stratum').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        opacity: 0,
        x: -40,
        duration: 1,
        delay: i * 0.1,
        ease: 'power3.out',
      });
    });
  }

  animateMedia() {
    document.querySelectorAll('.media-item').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out',
      });
    });
  }
}

/* ============================================
   7. PARALLAX IMAGES
============================================ */
class ParallaxImages {
  constructor() {
    document.querySelectorAll('.project__image').forEach((img) => {
      gsap.to(img, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.project'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }
}

/* ============================================
   8. MEDIA FILTERS
============================================ */
class MediaFilters {
  constructor() {
    this.filters = document.querySelectorAll('.media__filter');
    this.items = document.querySelectorAll('.media-item');
    this.bind();
  }

  bind() {
    this.filters.forEach((filter) => {
      filter.addEventListener('click', () => {
        this.filters.forEach((f) => f.classList.remove('is-active'));
        filter.classList.add('is-active');

        const category = filter.getAttribute('data-filter');
        this.items.forEach((item) => {
          if (category === 'all' || item.getAttribute('data-category') === category) {
            item.classList.remove('is-hidden');
            gsap.fromTo(item, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
          } else {
            item.classList.add('is-hidden');
          }
        });
      });
    });
  }
}

/* ============================================
   9. NAVIGATION
============================================ */
class Navigation {
  constructor() {
    this.toggle = document.querySelector('.nav__menu-toggle');
    this.menu = document.querySelector('.nav-menu');
    this.links = document.querySelectorAll('.nav-menu__link');
    this.bind();
  }

  bind() {
    this.toggle.addEventListener('click', () => {
      document.body.classList.toggle('menu-open');
      const isOpen = document.body.classList.contains('menu-open');
      this.toggle.setAttribute('aria-expanded', isOpen);
      this.menu.setAttribute('aria-hidden', !isOpen);
    });

    this.links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        document.body.classList.remove('menu-open');
        if (window.smoothScroll && window.smoothScroll.lenis) {
          window.smoothScroll.lenis.scrollTo(target, { offset: 0, duration: 1.5 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}

/* ============================================
   10. EASTER EGGS
============================================ */
class EasterEggs {
  constructor() {
    this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    this.konamiIndex = 0;
    this.eternaBuffer = '';
    this.shiftStart = null;

    this.modal = document.querySelector('.easter-egg');
    this.closeBtn = this.modal?.querySelector('.easter-egg__close');

    this.bind();
  }

  bind() {
    document.addEventListener('keydown', (e) => {
      // Konami
      if (e.key === this.konamiCode[this.konamiIndex]) {
        this.konamiIndex++;
        if (this.konamiIndex === this.konamiCode.length) {
          this.revealSecret();
          this.konamiIndex = 0;
        }
      } else {
        this.konamiIndex = 0;
      }

      // ETERNA buffer
      if (e.key.length === 1) {
        this.eternaBuffer = (this.eternaBuffer + e.key.toLowerCase()).slice(-6);
        if (this.eternaBuffer === 'eterna') {
          this.glitchEterna();
          this.eternaBuffer = '';
        }
      }

      // Shift hold for blueprint mode
      if (e.key === 'Shift' && !this.shiftStart) {
        this.shiftStart = Date.now();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift' && this.shiftStart) {
        const duration = Date.now() - this.shiftStart;
        if (duration > 2500) {
          document.body.classList.toggle('blueprint-mode');
        }
        this.shiftStart = null;
      }
    });

    this.closeBtn?.addEventListener('click', () => {
      this.modal.classList.remove('is-visible');
    });
  }

  revealSecret() {
    this.modal?.classList.add('is-visible');
  }

  glitchEterna() {
    document.body.style.transition = 'filter 0.1s';
    document.body.style.filter = 'hue-rotate(45deg) contrast(1.5)';
    setTimeout(() => {
      document.body.style.filter = '';
    }, 150);
    setTimeout(() => {
      document.body.style.filter = 'invert(1)';
      setTimeout(() => {
        document.body.style.filter = '';
      }, 80);
    }, 200);
  }
}

/* ============================================
   11. IMAGE LAZY LOADING (future-proof)
============================================ */
class LazyImages {
  constructor() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src) {
              const realImg = new Image();
              realImg.onload = () => {
                img.style.backgroundImage = `url(${src})`;
                img.querySelector('.project__image-placeholder')?.remove();
              };
              realImg.src = src;
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '100px' });

      document.querySelectorAll('[data-src]').forEach((el) => observer.observe(el));
    }
  }
}

/* ============================================
   12. ACCESSIBILITY — FOCUS MANAGEMENT
============================================ */
class Accessibility {
  constructor() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') document.body.classList.add('is-keyboard');
    });
    document.addEventListener('mousemove', () => {
      document.body.classList.remove('is-keyboard');
    });
  }
}

/* ============================================
   BOOTSTRAP
============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Detect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    window.smoothScroll = new SmoothScroll();
    new CustomCursor();
    new UmbralScene();
    new TextAnimator();
    new SceneController();
    new ProjectAnimator();
    new ParallaxImages();
  } else {
    // Still init non-motion features
    document.querySelectorAll('.umbral__line').forEach((l) => l.classList.add('is-visible'));
  }

  new MediaFilters();
  new Navigation();
  new EasterEggs();
  new LazyImages();
  new Accessibility();

  // Refresh ScrollTrigger after everything loaded
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
});