/* Avenue Automobiles — interactions */
(() => {
  'use strict';

  const fcfa = (n) => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n))} FCFA`;

  /* Menu mobile */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Ouvrir le menu' : 'Fermer le menu');
    nav.classList.toggle('open', !open);
  });
  nav?.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }
  });

  /* Filtres de l'inventaire */
  const cards = [...document.querySelectorAll('.car-card')];
  const search = document.getElementById('f-search');
  const brand = document.getElementById('f-brand');
  const budget = document.getElementById('f-budget');
  const energy = document.getElementById('f-energy');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty-state');

  const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function applyFilters() {
    const q = normalize(search.value.trim());
    const b = brand.value;
    const max = budget.value ? Number(budget.value) : Infinity;
    const e = energy.value;
    let visible = 0;

    cards.forEach((card) => {
      const d = card.dataset;
      const haystack = normalize(`${d.name} ${d.brand}`);
      const ok = (!q || haystack.includes(q)) &&
                 (!b || d.brand === b) &&
                 Number(d.price) <= max &&
                 (!e || d.energy === e);
      card.hidden = !ok;
      if (ok) visible++;
    });

    count.textContent = `${visible} véhicule${visible > 1 ? 's' : ''}`;
    empty.hidden = visible !== 0;
  }

  [search, brand, budget, energy].forEach((el) => el?.addEventListener('input', applyFilters));

  document.getElementById('reset-filters')?.addEventListener('click', () => {
    [search, brand, budget, energy].forEach((el) => { el.value = ''; });
    applyFilters();
  });

  /* Simulateur de mensualité */
  const price = document.getElementById('sim-price');
  const duration = document.getElementById('sim-duration');
  const priceOut = document.getElementById('sim-price-out');
  const durationOut = document.getElementById('sim-duration-out');
  const monthly = document.getElementById('sim-monthly');

  function simulate() {
    const capital = Number(price.value);
    const months = Number(duration.value);
    const rate = 0.059 / 12;
    const due = capital * rate / (1 - Math.pow(1 + rate, -months));
    priceOut.textContent = fcfa(capital);
    durationOut.textContent = `${months} mois`;
    monthly.textContent = `${fcfa(due)} / mois`;
  }

  price?.addEventListener('input', simulate);
  duration?.addEventListener('input', simulate);
  simulate();

  /* Fiche véhicule */
  const dialog = document.getElementById('car-dialog');
  const contactSelect = document.getElementById('contact-vehicule');
  let currentVehicle = '';

  cards.forEach((card) => {
    card.querySelector('.link-btn')?.addEventListener('click', () => {
      const d = card.dataset;
      currentVehicle = d.name;
      document.getElementById('dialog-img').src = d.img;
      document.getElementById('dialog-img').alt = d.name;
      document.getElementById('dialog-badge').textContent = d.badge;
      document.getElementById('dialog-title').textContent = d.name;
      document.getElementById('dialog-price').textContent = fcfa(Number(d.price));
      document.getElementById('dialog-year').textContent = d.year;
      document.getElementById('dialog-km').textContent = d.km;
      document.getElementById('dialog-energy').textContent = d.energy;
      dialog.showModal();
    });
  });

  document.getElementById('dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  document.getElementById('dialog-contact')?.addEventListener('click', () => {
    dialog.close();
    if (contactSelect) contactSelect.value = currentVehicle;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    document.querySelector('input[name="nom"]')?.focus({ preventScroll: true });
  });

  /* Formulaire de contact (démonstration) */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nom = String(data.get('nom') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!nom || !emailOk || !message) {
      status.style.color = '#b42318';
      status.textContent = 'Renseignez votre nom, une adresse email valide et un message.';
      return;
    }

    status.style.color = '#1e7a4c';
    status.textContent = `Merci ${nom}, votre demande est prête. Un conseiller vous rappellerait sous 24 h.`;
    form.reset();
  });
})();
