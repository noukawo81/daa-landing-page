(function (global) {
  'use strict';

  function setVisible(element, visible) {
    if (!element) return;
    element.hidden = !visible;
    element.classList.toggle('hidden', !visible);
  }

  function renderTestimonials() {
    const config = global.DAASiteConfig;
    const section = document.getElementById('temoignages');
    const grid = document.getElementById('testimonials-grid');
    if (!config || !section || !grid) return;

    const testimonials = Array.isArray(config.testimonials) ? config.testimonials : [];
    grid.replaceChildren();

    testimonials.forEach((testimonial) => {
      const figure = document.createElement('figure');
      figure.className = 'daa-card flex flex-col p-6';

      const quote = document.createElement('blockquote');
      quote.className = 'flex-1 text-sm leading-relaxed text-slate-700';
      quote.textContent = testimonial.text || '';
      figure.appendChild(quote);

      const caption = document.createElement('figcaption');
      caption.className = 'mt-6 flex items-center gap-3';

      if (testimonial.photo) {
        const photo = document.createElement('img');
        photo.src = testimonial.photo;
        photo.alt = '';
        photo.width = 64;
        photo.height = 64;
        photo.loading = 'lazy';
        photo.decoding = 'async';
        photo.className = 'h-12 w-12 rounded-full object-cover';
        caption.appendChild(photo);
      }

      const identity = document.createElement('div');
      const name = document.createElement('p');
      name.className = 'text-sm font-bold text-night';
      name.textContent = testimonial.firstName || '';
      identity.appendChild(name);

      if (testimonial.business) {
        const business = document.createElement('p');
        business.className = 'text-xs text-slate-500';
        business.textContent = testimonial.business;
        identity.appendChild(business);
      }

      caption.appendChild(identity);
      figure.appendChild(caption);
      grid.appendChild(figure);
    });

    const hasTestimonials = testimonials.length > 0;
    setVisible(section, hasTestimonials);
    document.querySelectorAll('[data-testimonials-link]').forEach((link) => {
      setVisible(link, hasTestimonials);
      setVisible(link.closest('li'), hasTestimonials);
    });
  }

  function renderShell() {
    const config = global.DAASiteConfig;
    const headerMount = document.querySelector('[data-site-header]');
    const footerMount = document.querySelector('[data-site-footer]');
    if (!config) return;

    if (headerMount) {
      headerMount.innerHTML = `
        <header class="bg-night text-white">
          <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <a href="index.html#accueil" class="font-black text-white">Digital Artisans Academy</a>
            <nav class="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm font-semibold" aria-label="Navigation principale">
              <a href="index.html#services" class="hover:text-amber-300">Services</a>
              <a href="index.html#packs" class="hover:text-amber-300">Packs</a>
              <a href="index.html#bourse-vip" class="hover:text-amber-300">Académie</a>
            </nav>
          </div>
        </header>`;
    }

    if (footerMount) {
      footerMount.innerHTML = `
        <footer class="bg-night text-white">
          <div class="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span class="font-bold">Digital Artisans Academy · Abidjan</span>
            <a href="${config.whatsapp.links.direct}" class="font-semibold text-emerald-300 hover:text-white">Contacter DAA</a>
          </div>
        </footer>`;
    }
  }

  function initializeGallery() {
    const dialog = document.getElementById('gallery-lightbox');
    const stage = dialog && dialog.querySelector('[data-gallery-stage]');
    if (!dialog || !stage) return;

    let activeFrame = null;
    let originalParent = null;
    let originalNextSibling = null;

    function restoreFrame() {
      if (!activeFrame || !originalParent) return;
      if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
        originalParent.insertBefore(activeFrame, originalNextSibling);
      } else {
        originalParent.appendChild(activeFrame);
      }
      activeFrame = null;
      originalParent = null;
      originalNextSibling = null;
      stage.replaceChildren();
    }

    document.querySelectorAll('[data-gallery-open]').forEach((button) => {
      button.addEventListener('click', () => {
        const frame = button.closest('article')?.querySelector('.ba-frame');
        if (!frame) return;

        activeFrame = frame;
        originalParent = frame.parentNode;
        originalNextSibling = frame.nextSibling;
        stage.appendChild(frame);
        dialog.showModal();
      });
    });

    dialog.querySelector('[data-gallery-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', restoreFrame);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function initialize() {
    renderTestimonials();
    renderShell();
    initializeGallery();
  }

  global.DAASite = Object.freeze({ initialize, renderTestimonials, renderShell });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})(window);
