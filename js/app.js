import { store } from './store.js';
import { icon } from './ui.js';
import { resumeTimer } from './timer.js';
import * as home from './views/home.js';
import * as onboarding from './views/onboarding.js';
import * as training from './views/training.js';
import * as food from './views/food.js';

// Hash routes: #heute, #training?day=tag2, #essen, #fortschritt, #profil
const soon = (title, text) => (root) => {
  root.innerHTML = `<div class="placeholder"><h1>${title}</h1><p class="muted">${text}</p></div>`;
};

const routes = {
  heute: { render: home.render, tab: true },
  training: { render: training.render, tab: true },
  essen: { render: food.render, tab: true },
  fortschritt: { render: soon('Fortschritt', 'Gewichtstrend, Kraftkurven und Wochen-Check-in kommen in Etappe 4.'), tab: true },
  profil: { render: onboarding.render, tab: false },
};

const TABS = [
  ['heute', 'Heute', 'home'],
  ['training', 'Training', 'training'],
  ['essen', 'Essen', 'food'],
  ['fortschritt', 'Fortschritt', 'progress'],
];

let view = document.getElementById('view');
const tabbar = document.getElementById('tabbar');

function parse() {
  const [name, query] = location.hash.slice(1).split('?');
  return { name: routes[name] ? name : 'heute', params: Object.fromEntries(new URLSearchParams(query ?? '')) };
}

const ctx = {
  go(name, params) {
    const q = params ? '?' + new URLSearchParams(params) : '';
    const target = `#${name}${q}`;
    if (location.hash === target) render(); else location.hash = target;
  },
  refresh: () => render(),
};

function render() {
  let { name, params } = parse();
  if (!store.get().profile) name = 'profil'; // first start: onboarding
  const route = routes[name];

  // A fresh element per render, so listeners from the last screen never pile up.
  const fresh = view.cloneNode(false);
  view.replaceWith(fresh);
  view = fresh;

  view.classList.toggle('no-tabbar', !route.tab);
  tabbar.hidden = !route.tab;
  tabbar.innerHTML = TABS.map(([id, label, ic]) =>
    `<a href="#${id}" ${id === name ? 'aria-current="page"' : ''}>${icon(ic, 24)}${label}</a>`).join('');

  route.render(view, ctx, params);
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
render();
resumeTimer();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
