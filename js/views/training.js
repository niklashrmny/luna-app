import { store } from '../store.js';
import { EXERCISES, ALTERNATIVES, DAYS, HOME_DAY, BANDS, dayById, nextDay, lastSets, suggest } from '../plan.js';
import { esc, icon, todayISO, kg as fmtKg } from '../ui.js';
import { startRest, stopRest } from '../timer.js';
import { imagePaths } from '../images.js';

// Start and end position, cross-fading like a slow GIF.
function exAnim(id) {
  const imgs = imagePaths(id);
  if (!imgs) return '';
  const name = EXERCISES[id].name;
  return `<figure class="ex-anim" role="img" aria-label="Ausführung ${esc(name)}: Start- und Endposition im Wechsel">
    <img src="${imgs[0]}" alt="" loading="eager" decoding="async">
    <img src="${imgs[1]}" alt="" loading="eager" decoding="async">
  </figure>`;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const toNum = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const repLabel = (e) => {
  const [a, b] = e.reps;
  return `${a === b ? a : `${a}–${b}`}${e.unit === 's' ? ' Sek.' : ''}${e.perSide ? ' je Seite' : ''}`;
};

function setSummary(e, sets) {
  const reps = sets.map((s) => s.reps).join(', ');
  if (e.kind === 'weight') {
    const weights = [...new Set(sets.map((s) => s.kg))];
    return weights.length === 1 ? `${fmtKg(weights[0] ?? 0)} × ${reps}` : sets.map((s) => `${fmtKg(s.kg ?? 0)}×${s.reps}`).join(', ');
  }
  if (e.kind === 'band') return `Band ${sets[sets.length - 1].band} × ${reps}`;
  return `${reps}${e.unit === 's' ? ' Sek.' : ' Wdh.'}`;
}

// ---------- starting and finishing ----------

function start(dayId) {
  const day = dayById(dayId);
  store.update((s) => {
    s.active = { dayId: day.id, date: todayISO(), startedAt: Date.now(), current: 0, items: [...day.items], sets: {}, rest: null, panel: null };
  });
}

function ensureSets(id) {
  const a = store.get().active;
  if (a.sets[id]) return;
  const e = EXERCISES[id];
  const sug = suggest(id, store.get().workouts);
  store.update(() => {
    a.sets[id] = Array.from({ length: e.sets }, () => ({ kg: sug.kg ?? null, band: sug.band ?? (e.kind === 'band' ? BANDS[0] : null), reps: null, done: false, feel: null }));
  });
}

function finish(ctx) {
  const s = store.get();
  const a = s.active;
  const sets = {};
  for (const [id, rows] of Object.entries(a.sets)) {
    const done = rows.filter((r) => r.done).map(({ kg, band, reps, feel }) => {
      const out = { reps };
      if (kg != null) out.kg = kg;
      if (band) out.band = band;
      if (feel) out.feel = feel;
      return out;
    });
    if (done.length) sets[id] = done;
  }
  if (!Object.keys(sets).length) {
    if (confirm('Noch kein Satz abgehakt. Training verwerfen?')) {
      stopRest();
      store.update((st) => { st.active = null; });
      ctx.go('heute');
    }
    return;
  }

  // Records: heavier than ever before for weight exercises.
  const records = [];
  for (const [id, rows] of Object.entries(sets)) {
    if (EXERCISES[id].kind !== 'weight') continue;
    const before = s.workouts.flatMap((w) => w.sets?.[id] ?? []).reduce((m, r) => Math.max(m, r.kg ?? 0), 0);
    const now = Math.max(...rows.map((r) => r.kg ?? 0));
    if (before > 0 && now > before) records.push({ id, kg: now, before });
  }

  const workout = { id: uid(), dayId: a.dayId, date: a.date, startedAt: a.startedAt, endedAt: Date.now(), sets, records };
  stopRest();
  store.update((st) => { st.workouts.push(workout); st.active = null; });
  ctx.go('training', { fertig: workout.id });
}

// ---------- screens ----------

function overview(root, ctx, params) {
  const s = store.get();
  const current = dayById(params.day) ?? nextDay(s.workouts);
  const tabs = [...DAYS, HOME_DAY].map((d) =>
    `<button type="button" class="btn ${d.id === current.id ? 'btn-primary' : ''}" style="min-height:44px;font-size:14px" data-day="${d.id}" aria-pressed="${d.id === current.id}">${esc(d.title)}</button>`).join('');

  root.innerHTML = `
    <header class="header"><div><p class="overline">${esc(current.subtitle)}</p><h1>${esc(current.title)}</h1></div></header>
    <div class="grid-2">${tabs}</div>
    <section class="card" style="gap:0;padding:4px 20px">
      <dl class="stat-list" style="margin:0">
        ${current.items.map((id) => {
          const e = EXERCISES[id];
          const last = lastSets(s.workouts, id);
          return `<div><dt style="color:var(--text)">${esc(e.name)}${e.isNew && !last ? ' <span class="accent small">neu</span>' : ''}
            ${last ? `<br><span class="small muted">${esc(setSummary(e, last.sets))}</span>` : ''}</dt>
            <dd style="font-size:15px;white-space:nowrap;padding-left:12px">${e.sets} × ${repLabel(e)}</dd></div>`;
        }).join('')}
      </dl>
    </section>
    <button type="button" class="btn btn-primary" data-start="${current.id}">${icon('play', 18)} ${esc(current.title)} starten</button>
    ${historyList(s)}`;

  root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => ctx.go('training', { day: b.dataset.day })));
  root.querySelector('[data-start]').addEventListener('click', (e) => { start(e.currentTarget.dataset.start); ctx.go('training'); });
}

function historyList(s) {
  if (!s.workouts.length) return '';
  const items = [...s.workouts].reverse().slice(0, 5).map((w) => {
    const d = new Date(w.date + 'T00:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
    const n = Object.values(w.sets).reduce((a, r) => a + r.length, 0);
    return `<div><dt>${esc(d)}</dt><dd style="font-size:15px">${esc(dayById(w.dayId)?.title ?? '')} · ${n} Sätze</dd></div>`;
  }).join('');
  return `<p class="overline" style="margin-top:8px">Letzte Trainings</p>
    <section class="card" style="gap:0;padding:4px 20px"><dl class="stat-list" style="margin:0">${items}</dl></section>`;
}

function workout(root, ctx) {
  const s = store.get();
  const a = s.active;
  const day = dayById(a.dayId);
  const id = a.items[a.current];
  const e = EXERCISES[id];
  ensureSets(id);
  const rows = a.sets[id];
  const sug = suggest(id, s.workouts);
  const last = lastSets(s.workouts, id);
  const isLast = a.current === a.items.length - 1;
  const origId = day.items[a.current];
  const alts = (ALTERNATIVES[origId] ?? []).concat(origId !== id ? [origId] : []).filter((x) => x !== id);

  const strip = a.items.map((x, i) => {
    const done = a.sets[x]?.some((r) => r.done);
    return `<button type="button" class="${i === a.current ? 'current' : done ? 'done' : ''}" data-goto="${i}" aria-label="${esc(EXERCISES[x].name)}${done ? ', erledigt' : ''}"><span></span></button>`;
  }).join('');

  const head = e.kind === 'weight' ? '<span>kg</span>' : e.kind === 'band' ? '<span>Band</span>' : '<span></span>';
  const setRows = rows.map((r, i) => {
    let first;
    if (e.kind === 'weight') {
      first = `<input class="input" data-field="kg" data-i="${i}" type="text" inputmode="decimal" value="${r.kg ?? ''}" placeholder="kg" aria-label="Satz ${i + 1} Gewicht in kg">`;
    } else if (e.kind === 'band') {
      first = `<select class="input" data-field="band" data-i="${i}" aria-label="Satz ${i + 1} Bandstärke">${BANDS.map((b) => `<option ${b === r.band ? 'selected' : ''}>${b}</option>`).join('')}</select>`;
    } else {
      first = '<span></span>';
    }
    const feel = r.done ? `<div class="feel" role="group" aria-label="Wie schwer war Satz ${i + 1}?">
        ${[['leicht', 'leicht'], ['gut', 'passend'], ['hart', 'am Limit']].map(([v, l]) =>
          `<button type="button" data-feel="${v}" data-i="${i}" aria-pressed="${r.feel === v}">${l}</button>`).join('')}
      </div>` : '';
    return `<div class="set-row ${r.done ? 'done' : ''}">
        <span class="n">${i + 1}</span>
        ${first}
        <input class="input" data-field="reps" data-i="${i}" type="text" inputmode="numeric" value="${r.reps ?? ''}" placeholder="${e.reps[0]}–${e.reps[1]}" aria-label="Satz ${i + 1} ${e.unit === 's' ? 'Sekunden' : 'Wiederholungen'}">
        <button type="button" class="check" data-check="${i}" aria-pressed="${r.done}" aria-label="Satz ${i + 1} ${r.done ? 'erledigt' : 'abhaken'}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
        </button>
      </div>${feel}`;
  }).join('');

  const panel = a.panel === 'info'
    ? `<section class="card" style="gap:12px">
        <ol class="cues">${(e.cues ?? []).map((c) => `<li>${esc(c)}</li>`).join('')}</ol>
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.name.replace(/\(.+\)/, '') + ' Ausführung')}" target="_blank" rel="noopener" class="small">Video auf YouTube suchen</a>
      </section>`
    : a.panel === 'swap'
    ? `<section class="card" style="gap:10px">
        <p class="small muted">Gerät belegt? Gleichwertige Alternative wählen:</p>
        ${alts.map((x) => `<button type="button" class="list-btn" data-swap="${x}"><span>${esc(EXERCISES[x].name)}</span><small>${EXERCISES[x].sets} × ${repLabel(EXERCISES[x])}</small></button>`).join('') || '<p class="small muted">Keine Alternative hinterlegt.</p>'}
      </section>`
    : '';

  root.innerHTML = `
    <header style="display:flex;flex-direction:column;gap:6px;padding-top:8px">
      <p class="overline">${esc(day.title)} · Übung ${a.current + 1} von ${a.items.length}</p>
      <nav class="ex-strip" aria-label="Übungen">${strip}</nav>
      <h1 style="font-size:28px;line-height:1.15">${esc(e.name)} ${e.isNew && !last ? '<span class="badge">neu</span>' : ''}</h1>
      <p class="muted small">${e.sets} Sätze · ${repLabel(e)} · Pause ${String(Math.round(e.rest / 60 * 10) / 10).replace(".", ",")} Min.</p>
    </header>

    ${exAnim(id)}

    <div class="row">
      <button type="button" class="btn" style="flex:1;min-height:44px;font-size:14px" data-panel="info" aria-pressed="${a.panel === 'info'}">Anleitung</button>
      <button type="button" class="btn" style="flex:1;min-height:44px;font-size:14px" data-panel="swap" aria-pressed="${a.panel === 'swap'}">Tauschen</button>
    </div>
    ${panel}

    <section class="card" style="gap:12px">
      ${last ? `<p class="small muted">Letztes Mal: <strong style="color:var(--text)">${esc(setSummary(e, last.sets))}</strong></p>` : ''}
      <p class="hint-box ${sug.up ? 'up' : ''}">${esc(sug.text)}</p>
      <div class="sets">
        <div class="set-head"><span>Satz</span>${head}<span>${e.unit === 's' ? 'Sek.' : 'Wdh.'}</span><span></span></div>
        ${setRows}
      </div>
      <button type="button" class="btn-link small" data-addset style="align-self:flex-start">+ Satz hinzufügen</button>
    </section>

    <div class="row">
      ${a.current > 0 ? `<button type="button" class="btn" data-prev>Zurück</button>` : ''}
      ${isLast
        ? `<button type="button" class="btn btn-primary" data-finish>Training beenden</button>`
        : `<button type="button" class="btn btn-primary" data-next>Nächste Übung</button>`}
    </div>
    ${!isLast ? `<button type="button" class="btn-link small" data-finish style="align-self:center">Training jetzt beenden</button>` : ''}`;

  // Typing updates the data without re-rendering, so the keyboard stays open.
  root.addEventListener('input', (ev) => {
    const el = ev.target;
    if (!el.dataset.field) return;
    const i = Number(el.dataset.i);
    store.update(() => {
      const r = a.sets[id][i];
      if (el.dataset.field === 'kg') r.kg = toNum(el.value);
      if (el.dataset.field === 'reps') r.reps = toNum(el.value);
      if (el.dataset.field === 'band') r.band = el.value;
    });
  });

  root.addEventListener('click', (ev) => {
    const t = ev.target.closest('button');
    if (!t) return;
    const d = t.dataset;
    const rerender = () => ctx.refresh();

    if (d.check !== undefined) {
      const i = Number(d.check);
      const r = a.sets[id][i];
      if (!r.done) {
        if (r.reps == null) { root.querySelector(`[data-field="reps"][data-i="${i}"]`).focus(); return; }
        if (e.kind === 'weight' && r.kg == null) { root.querySelector(`[data-field="kg"][data-i="${i}"]`).focus(); return; }
        store.update(() => {
          r.done = true;
          // Carry the load to the next open set.
          const nextRow = a.sets[id][i + 1];
          if (nextRow && !nextRow.done) {
            if (nextRow.kg == null) nextRow.kg = r.kg;
            if (e.kind === 'band') nextRow.band = r.band;
          }
        });
        const allDone = a.sets[id].every((x) => x.done);
        if (!(allDone && isLast)) startRest(e.rest);
      } else {
        store.update(() => { r.done = false; r.feel = null; });
      }
      rerender();
    } else if (d.feel) {
      const r = a.sets[id][Number(d.i)];
      store.update(() => { r.feel = r.feel === d.feel ? null : d.feel; });
      rerender();
    } else if (d.panel) {
      store.update(() => { a.panel = a.panel === d.panel ? null : d.panel; });
      rerender();
    } else if (d.swap) {
      store.update(() => { a.items[a.current] = d.swap; a.panel = null; });
      rerender();
    } else if (d.goto !== undefined) {
      store.update(() => { a.current = Number(d.goto); a.panel = null; });
      rerender(); window.scrollTo(0, 0);
    } else if (d.prev !== undefined || d.next !== undefined) {
      store.update(() => { a.current += d.next !== undefined ? 1 : -1; a.panel = null; });
      rerender(); window.scrollTo(0, 0);
    } else if (d.addset !== undefined) {
      const prev = a.sets[id][a.sets[id].length - 1];
      store.update(() => { a.sets[id].push({ kg: prev?.kg ?? null, band: prev?.band ?? null, reps: null, done: false, feel: null }); });
      rerender();
    } else if (d.finish !== undefined) {
      finish(ctx);
    }
  });
}

function summary(root, ctx, workoutId) {
  const s = store.get();
  const w = s.workouts.find((x) => x.id === workoutId);
  if (!w) { ctx.go('training'); return; }
  const n = Object.values(w.sets).reduce((a, r) => a + r.length, 0);
  const minutes = Math.max(1, Math.round((w.endedAt - w.startedAt) / 60000));
  const ups = Object.keys(w.sets).filter((id) => suggest(id, s.workouts).up).length;

  root.innerHTML = `
    <header class="header"><div><p class="eyebrow">Geschafft</p><h1>Stark, ${esc(s.profile.name)}!</h1></div></header>
    <section class="grid-2">
      <div class="card" style="gap:4px"><p class="summary-num">${n}</p><p class="small muted">Sätze</p></div>
      <div class="card" style="gap:4px"><p class="summary-num">${minutes}</p><p class="small muted">Minuten</p></div>
    </section>
    ${w.records.length ? `<section class="card" style="gap:10px"><p class="eyebrow">Neue Bestwerte</p>
      ${w.records.map((r) => `<p>${esc(EXERCISES[r.id].name)}: <strong class="accent">${fmtKg(r.kg)}</strong> <span class="small muted">(vorher ${fmtKg(r.before)})</span></p>`).join('')}</section>` : ''}
    <section class="card" style="gap:6px">
      <p class="eyebrow">Nächstes Mal</p>
      <p>${ups ? `Bei <strong>${ups} ${ups === 1 ? 'Übung' : 'Übungen'}</strong> geht es mit mehr Gewicht weiter.` : 'Gleiche Gewichte – versuche ein paar Wiederholungen mehr.'}</p>
      <p class="small muted">Nächstes Training: ${esc(nextDay(s.workouts).title)}</p>
    </section>
    <button type="button" class="btn btn-primary" data-home>Zum Start</button>`;
  root.querySelector('[data-home]').addEventListener('click', () => ctx.go('heute'));
}

export function render(root, ctx, params) {
  if (params.start && !store.get().active) {
    start(params.start);
    ctx.go('training');
    return;
  }
  if (params.fertig) return summary(root, ctx, params.fertig);
  if (store.get().active) return workout(root, ctx);
  return overview(root, ctx, params);
}
