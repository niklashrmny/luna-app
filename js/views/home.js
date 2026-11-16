import { store } from '../store.js';
import { targets } from '../nutrition.js';
import { EXERCISES, nextDay, lastTop, dayById } from '../plan.js';
import { esc, num, kg, icon, ring, todayISO, dateLabel, weekStart, daysSince } from '../ui.js';

function greeting(name) {
  const h = new Date().getHours();
  if (h < 11) return `Guten Morgen, ${name}`;
  if (h < 17) return `Los geht's, ${name}`;
  return `Hey ${name}`;
}

function lastTrainingText(workouts) {
  const last = workouts[workouts.length - 1];
  if (!last) return 'Dein erstes Training';
  const d = daysSince(last.date);
  if (d === 0) return 'Heute schon trainiert';
  if (d === 1) return 'Zuletzt gestern';
  return `Zuletzt vor ${d} Tagen`;
}

export function render(root, ctx) {
  const s = store.get();
  const p = s.profile;
  const t = targets(p);
  const day = nextDay(s.workouts);

  const monday = todayISO(weekStart());
  const doneThisWeek = s.workouts.filter((w) => w.date >= monday).length;

  const today = todayISO();
  const eaten = s.food.filter((f) => f.date === today)
    .reduce((a, f) => ({ kcal: a.kcal + (f.kcal || 0), protein: a.protein + (f.protein || 0) }), { kcal: 0, protein: 0 });

  // Three preview tiles: last weight, or "neu" for exercises she hasn't done yet.
  const tiles = day.items
    .filter((id) => EXERCISES[id].kind === 'weight')
    .slice(0, 3)
    .map((id) => {
      const top = lastTop(s.workouts, id);
      const name = EXERCISES[id].name.replace(/ \(.+\)$/, '');
      const value = top ? kg(top.kg) : '<span class="accent">neu</span>';
      return `<div class="tile"><p class="label">${esc(name)}</p><p class="value">${value}</p></div>`;
    }).join('');

  const newCount = day.items.filter((id) => EXERCISES[id].isNew && !lastTop(s.workouts, id)).length;

  root.innerHTML = `
    <header class="header">
      <div>
        <p class="overline">${esc(dateLabel())}</p>
        <h1>${esc(greeting(p.name))}</h1>
      </div>
      <p class="week">Woche<strong>${doneThisWeek} / ${p.sessionsPerWeek}</strong></p>
    </header>

    <section class="card" aria-labelledby="next-title">
      <div class="row" style="justify-content:space-between;align-items:center">
        <p class="eyebrow">Nächstes Training</p>
        <p class="small muted">${esc(lastTrainingText(s.workouts))}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <h2 id="next-title">${esc(day.title)}</h2>
        <p class="muted small">${esc(day.subtitle)} · ${day.items.length} Übungen · ~${day.minutes} Min.${newCount ? ` · ${newCount} neu` : ''}</p>
      </div>
      <div class="grid-3">${tiles}</div>
      <div class="row">
        ${s.active
          ? `<button type="button" class="btn btn-primary" data-resume>${icon('play', 18)} ${esc(dayById(s.active.dayId).title)} fortsetzen</button>`
          : `<button type="button" class="btn btn-primary" data-start="${day.id}">${icon('play', 18)} START</button>
             <button type="button" class="btn btn-icon" data-start="zuhause" aria-label="Training zuhause">${icon('home')}</button>`}
      </div>
    </section>

    <section class="grid-2" aria-label="Heute gegessen">
      <div class="card ring-card">
        ${ring({ value: eaten.protein, target: t.protein, color: 'var(--pink)', big: num(eaten.protein), small: `/ ${t.protein} g`, label: `Eiweiß ${num(eaten.protein)} von ${t.protein} Gramm` })}
        <p>Eiweiß</p>
      </div>
      <div class="card ring-card">
        ${ring({ value: eaten.kcal, target: t.kcal, color: 'var(--pink-soft)', big: num(eaten.kcal), small: `/ ${num(t.kcal)} kcal`, label: `Kalorien ${num(eaten.kcal)} von ${num(t.kcal)}` })}
        <p>Kalorien</p>
      </div>
    </section>

    <section class="row">
      <button type="button" class="btn btn-tile" data-food="mic">${icon('mic')} Essen sagen</button>
      <button type="button" class="btn btn-tile" data-food="scan">${icon('scan')} Scannen</button>
    </section>

    <button type="button" class="btn-link small" data-go="profil" style="align-self:center">Körperdaten & Ziel ändern</button>
  `;

  root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => ctx.go(b.dataset.go)));
  root.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => ctx.go('training', { start: b.dataset.start })));
  root.querySelectorAll('[data-food]').forEach((b) => b.addEventListener('click', () => ctx.go('essen', { [b.dataset.food]: 1 })));
  root.querySelector('[data-resume]')?.addEventListener('click', () => ctx.go('training'));
}
