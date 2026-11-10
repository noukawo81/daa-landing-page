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

  function renderSubscriptions() {
    const config = global.DAASiteConfig;
    const grid = document.getElementById('subscription-grid');
    const deadline = document.getElementById('subscription-deadline');
    if (!config || !grid) return;

    const prices = config.prices;
    const subscriptions = Array.isArray(prices.subscriptions) ? prices.subscriptions : [];
    const money = new Intl.NumberFormat('fr-FR');
    grid.replaceChildren();
    if (deadline) deadline.textContent = prices.subscriptionLaunchDeadline;

    subscriptions.forEach((subscription) => {
      const card = document.createElement('article');
      card.className = 'daa-card flex flex-col p-6';

      const title = document.createElement('h3');
      title.className = 'text-xl font-extrabold text-night';
      title.textContent = subscription.name;
      card.appendChild(title);

      const features = document.createElement('ul');
      features.className = 'mt-4 flex-1 space-y-2 text-sm text-slate-600';
      subscription.features.forEach((feature) => {
        const item = document.createElement('li');
        item.className = 'flex items-start gap-2';
        const marker = document.createElement('span');
        marker.className = 'font-bold text-primary';
        marker.setAttribute('aria-hidden', 'true');
        marker.textContent = '✓';
        item.append(marker, document.createTextNode(feature));
        features.appendChild(item);
      });
      card.appendChild(features);

      const period = subscription.period ? '/' + subscription.period : '';
      const launch = document.createElement('p');
      launch.className = 'mt-5 text-sm text-slate-500';
      const launchLabel = document.createElement('span');
      launchLabel.textContent = 'Prix de lancement : ';
      const launchPrice = document.createElement('s');
      launchPrice.textContent = money.format(subscription.launchPrice) + ' ' + prices.currency + period;
      launch.append(launchLabel, launchPrice);
      card.appendChild(launch);

      const normal = document.createElement('p');
      normal.className = 'daa-price mt-1 text-lg';
      normal.textContent = 'Prix normal : ' + money.format(subscription.normalPrice) + ' ' + prices.currency + period;
      card.appendChild(normal);

      if (subscription.periodicity) {
        const periodicity = document.createElement('p');
        periodicity.className = 'mt-1 text-xs text-slate-500';
        periodicity.textContent = 'Périodicité : ' + subscription.periodicity;
        card.appendChild(periodicity);
      }

      const expiry = document.createElement('p');
      expiry.className = 'mt-2 text-xs text-slate-500';
      expiry.textContent = 'Prix de lancement jusqu’au ' + prices.subscriptionLaunchDeadline;
      card.appendChild(expiry);

      const message = 'Bonjour DAA, je souhaite souscrire à l’offre ' + subscription.name + ' au prix de lancement de ' + money.format(subscription.launchPrice) + ' ' + prices.currency + '.';
      const order = document.createElement('a');
      order.className = 'daa-button-primary mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition';
      order.href = config.whatsapp.baseUrl + '?text=' + encodeURIComponent(message);
      order.target = '_blank';
      order.rel = 'noopener noreferrer';
      order.textContent = 'Choisir cet abonnement';
      order.setAttribute('aria-label', 'Choisir ' + subscription.name + ' sur WhatsApp');
      card.appendChild(order);
      grid.appendChild(card);
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
    renderSubscriptions();
    renderShell();
    initializeGallery();
  }

  global.DAASite = Object.freeze({ initialize, renderTestimonials, renderSubscriptions, renderShell });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})(window);
