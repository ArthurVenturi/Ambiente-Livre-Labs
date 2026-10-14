import { initHeroCanvas } from './modules/hero-canvas.js';
import { initPluginCatalog } from './modules/plugin-catalog.js';
import { initTalksCatalog } from './modules/talks-catalog.js';

function initMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open');
  });
}

function initReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...document.querySelectorAll('.reveal')];
  if (cards.length === 0 || prefersReducedMotion) {
    cards.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15 });

  cards.forEach((node) => observer.observe(node));
}

initMenu();
initReveal();
initHeroCanvas();
initPluginCatalog();
initTalksCatalog();
