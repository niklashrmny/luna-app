import { store } from '../store.js';
import { JOBS, GOALS, targets, ageFrom } from '../nutrition.js';
import { esc, num, todayISO } from '../ui.js';

// Four short steps; the draft survives going back and forth.
let step = 0;
let draft = null;

const defaults = () => ({
  name: '', birthdate: '', sex: 'w', heightCm: '', weightKg: '',
  job: 'sitzend', steps: 7000, sessionsPerWeek: 3, goal: 'halten',
});

function choice(name, value, current, title, hint) {
  const id = `${name}-${value}`;
  return `<div class="choice">
    <input type="radio" name="${name}" id="${id}" value="${value}" ${String(current) === String(value) ? 'checked' : ''}>
    <label for="${id}"><strong>${esc(title)}</strong>${hint ? `<span>${esc(hint)}</span>` : ''}</label>
  </div>`;
}

const progress = () =>
  `<div class="steps" aria-hidden="true">${[0, 1, 2, 3].map((i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div>`;

function stepBody(d) {
  if (step === 0) {
    return `<p class="eyebrow">Schritt 1 von 4</p>
      <h1>Willkommen!</h1>
      <p class="muted">Ein paar Angaben, damit die App deinen Bedarf grob ausrechnen kann. Alles bleibt nur auf diesem Handy.</p>
      <div class="field"><label for="name">Vorname</label>
        <input class="input" id="name" name="name" autocomplete="given-name" value="${esc(d.name)}" required></div>
      <div class="field"><label for="birthdate">Geburtsdatum</label>
        <input class="input" id="birthdate" name="birthdate" type="date" max="${todayISO()}" value="${esc(d.birthdate)}" required></div>
      <div class="grid-2">
        <div class="field"><label for="heightCm">Größe</label>
          <div class="input-unit"><input class="input" id="heightCm" name="heightCm" type="number" inputmode="numeric" min="120" max="230" value="${esc(d.heightCm)}" required><span>cm</span></div></div>
        <div class="field"><label for="weightKg">Gewicht</label>
          <div class="input-unit"><input class="input" id="weightKg" name="weightKg" type="number" inputmode="decimal" min="30" max="250" step="0.1" value="${esc(d.weightKg)}" required><span>kg</span></div></div>
      </div>
      <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label" style="font-size:14px;font-weight:600;margin-bottom:8px">Geschlecht (für die Formel)</legend>
        <div class="choices inline" style="grid-template-columns:repeat(2,minmax(0,1fr))">
          ${choice('sex', 'w', d.sex, 'weiblich')}${choice('sex', 'm', d.sex, 'männlich')}
        </div></fieldset>`;
  }
  if (step === 1) {
    return `<p class="eyebrow">Schritt 2 von 4</p>
      <h1>Dein Alltag</h1>
      <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label" style="font-size:14px;font-weight:600;margin-bottom:8px">Beruf / Alltag</legend>
        <div class="choices">${Object.entries(JOBS).map(([k, j]) => choice('job', k, d.job, j.label, j.hint)).join('')}</div></fieldset>
      <div class="field"><label for="steps">Schritte pro Tag (ungefähr)</label>
        <div class="input-unit"><input class="input" id="steps" name="steps" type="number" inputmode="numeric" min="0" max="40000" step="500" value="${esc(d.steps)}" required><span>Schritte</span></div>
        <p class="hint">Steht in der Health-App unter „Schritte“.</p></div>
      <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label" style="font-size:14px;font-weight:600;margin-bottom:8px">Krafttraining pro Woche</legend>
        <div class="choices inline">${[2, 3, 4].map((n) => choice('sessionsPerWeek', n, d.sessionsPerWeek, `${n}×`)).join('')}</div></fieldset>`;
  }
  if (step === 2) {
    return `<p class="eyebrow">Schritt 3 von 4</p>
      <h1>Dein Ziel</h1>
      <p class="muted">Lässt sich später jederzeit ändern.</p>
      <div class="choices">${Object.entries(GOALS).map(([k, g]) => choice('goal', k, d.goal, g.label, g.hint)).join('')}</div>`;
  }
  const t = targets(normalize(d));
  return `<p class="eyebrow">Schritt 4 von 4</p>
    <h1>Dein Tagesziel</h1>
    <p class="muted">Grobe Richtwerte, keine exakte Wissenschaft. Der Wochen-Check-in passt sie später an dein echtes Gewicht an.</p>
    <section class="card">
      <dl class="stat-list" style="margin:0">
        <div><dt>Kalorien</dt><dd class="accent">ca. ${num(t.kcal)} kcal</dd></div>
        <div><dt>Eiweiß</dt><dd>${t.protein} g</dd></div>
        <div><dt>Fett</dt><dd>mind. ${t.fat} g</dd></div>
        <div><dt>Kohlenhydrate</dt><dd>ca. ${t.carbs} g</dd></div>
      </dl>
    </section>
    <p class="small muted">Grundumsatz ca. ${num(t.bmr)} kcal · Erhaltung ca. ${num(t.maintenance)} kcal · ${t.age} Jahre</p>
    <p class="small muted">Eiweiß ist das Wichtigste: Es hält und baut Muskeln, gerade wenn du trainierst. Kalorien müssen nur ungefähr passen.</p>`;
}

function normalize(d) {
  return {
    ...d,
    name: d.name.trim(),
    heightCm: Number(d.heightCm),
    weightKg: Number(String(d.weightKg).replace(',', '.')),
    steps: Number(d.steps),
    sessionsPerWeek: Number(d.sessionsPerWeek),
  };
}

function validate(d) {
  if (step === 0) {
    if (!d.name.trim()) return 'Bitte deinen Vornamen eintragen.';
    if (!d.birthdate) return 'Bitte dein Geburtsdatum eintragen.';
    const age = ageFrom(d.birthdate);
    if (age < 14 || age > 100) return 'Das Geburtsdatum sieht nicht richtig aus.';
    const h = Number(d.heightCm), w = Number(String(d.weightKg).replace(',', '.'));
    if (!(h >= 120 && h <= 230)) return 'Bitte die Größe in cm eintragen (z. B. 168).';
    if (!(w >= 30 && w <= 250)) return 'Bitte das Gewicht in kg eintragen (z. B. 58).';
  }
  if (step === 1 && !(Number(d.steps) >= 0)) return 'Bitte ungefähre Schritte eintragen.';
  return null;
}

export function render(root, ctx) {
  if (!draft) draft = { ...defaults(), ...(store.get().profile ?? {}) };
  const editing = !!store.get().profile;

  root.innerHTML = `
    <form class="form" novalidate>
      ${progress()}
      ${stepBody(draft)}
      <p class="error" role="alert" id="err"></p>
      <div class="row">
        ${step > 0 || editing ? `<button type="button" class="btn" data-back>Zurück</button>` : ''}
        <button type="submit" class="btn btn-primary">${step === 3 ? (editing ? 'Speichern' : 'Los geht\'s') : 'Weiter'}</button>
      </div>
    </form>`;

  const form = root.querySelector('form');
  const collect = () => {
    for (const el of form.elements) {
      if (!el.name || (el.type === 'radio' && !el.checked)) continue;
      draft[el.name] = el.value;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    collect();
    const err = validate(draft);
    if (err) { root.querySelector('#err').textContent = err; return; }
    if (step < 3) { step++; render(root, ctx); window.scrollTo(0, 0); return; }

    const profile = normalize(draft);
    store.update((s) => {
      const first = !s.profile;
      s.profile = profile;
      if (first || !s.weights.length) s.weights.push({ date: todayISO(), kg: profile.weightKg });
    });
    step = 0; draft = null;
    ctx.go('heute');
  });

  form.querySelector('[data-back]')?.addEventListener('click', () => {
    collect();
    if (step === 0) { draft = null; ctx.go('heute'); return; }
    step--;
    render(root, ctx);
  });
}
