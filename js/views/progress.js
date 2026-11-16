import { store } from '../store.js';
import { checkIn, targets } from '../nutrition.js';
import { EXERCISES, DAYS, HOME_DAY } from '../plan.js';
import { esc, num, todayISO, daysSince } from '../ui.js';

const MEASURES = [
  ['taille', 'Taille'],
  ['huefte', 'Hüfte / Po'],
  ['oberschenkel', 'Oberschenkel'],
  ['arm', 'Oberarm'],
];

const toNum = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const dec = (n, d = 1) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const signed = (n, d = 1, unit = 'kg') => `${n > 0 ? '+' : n < 0 ? '−' : '±'}${dec(Math.abs(n), d)} ${unit}`;
const shortDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });

// ---------- charts ----------

// Line chart as inline SVG. points: [{ t: ms, y }]. Optional trend line.
function lineChart(points, { trend = null, h = 150, unit = '' } = {}) {
  if (points.length < 2) return '';
  const W = 320, H = h, pad = { l: 34, r: 8, t: 10, b: 22 };
  const ys = [...points.map((p) => p.y), ...(trend ?? []).map((p) => p.y)];
  let min = Math.min(...ys), max = Math.max(...ys);
  if (max - min < 1) { min -= 0.5; max += 0.5; }
  const t0 = points[0].t, t1 = points[points.length - 1].t || t0 + 1;
  const x = (t) => pad.l + ((t - t0) / Math.max(1, t1 - t0)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const path = (ps) => ps.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const ticks = [min, (min + max) / 2, max];
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Verlauf von ${dec(points[0].y)} auf ${dec(points[points.length - 1].y)} ${unit}">
    ${ticks.map((v) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/>
      <text x="${pad.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${dec(v, max - min < 5 ? 1 : 0)}</text>`).join('')}
    <text x="${pad.l}" y="${H - 4}" font-size="10" fill="var(--muted)">${esc(shortDate(new Date(t0).toISOString().slice(0, 10)))}</text>
    <text x="${W - pad.r}" y="${H - 4}" font-size="10" fill="var(--muted)" text-anchor="end">${esc(shortDate(new Date(t1).toISOString().slice(0, 10)))}</text>
    ${trend ? `<path d="${path(points)}" fill="none" stroke="var(--line-strong)" stroke-width="1.5"/>
      ${points.map((p) => `<circle cx="${x(p.t).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="2.5" fill="var(--muted)"/>`).join('')}
      <path d="${path(trend)}" fill="none" stroke="var(--pink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="${path(points)}" fill="none" stroke="var(--pink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${points.map((p) => `<circle cx="${x(p.t).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="3" fill="var(--pink)"/>`).join('')}`}
  </svg>`;
}

function sparkline(ys) {
  if (ys.length < 2) return '';
  const W = 80, H = 28;
  const min = Math.min(...ys), max = Math.max(...ys);
  const span = max - min || 1;
  const d = ys.map((v, i) => `${i ? 'L' : 'M'}${((i / (ys.length - 1)) * (W - 4) + 2).toFixed(1)},${(H - 3 - ((v - min) / span) * (H - 6)).toFixed(1)}`).join(' ');
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--pink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

const ms = (iso) => new Date(iso + 'T00:00:00').getTime();

// 7-day rolling average for each weight entry.
function rolling(weights) {
  return weights.map((w) => {
    const from = ms(w.date) - 6 * 86400000;
    const win = weights.filter((x) => ms(x.date) >= from && ms(x.date) <= ms(w.date));
    return { t: ms(w.date), y: win.reduce((a, b) => a + b.kg, 0) / win.length };
  });
}

// ---------- sections ----------

function backupHint(s) {
  const hasData = s.workouts.length + s.food.length + s.weights.length > 3;
  if (!hasData) return '';
  const since = s.lastBackup ? daysSince(s.lastBackup) : null;
  if (since != null && since < 14) return '';
  return `<section class="card hint-card" style="gap:10px">
    <p><strong>Zeit für ein Backup</strong></p>
    <p class="small muted">${since == null ? 'Du hast noch kein Backup gemacht.' : `Letztes Backup vor ${since} Tagen.`} Deine Daten liegen nur auf diesem Handy – ein Backup in iCloud Drive schützt sie, falls die App gelöscht wird.</p>
    <button type="button" class="btn btn-primary" data-backup>Backup sichern</button>
  </section>`;
}

function checkInCard(s) {
  const c = checkIn(s);
  const t = targets(s.profile);
  const last7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return todayISO(d); });
  const days = last7.map((d) => s.food.filter((f) => f.date === d)).filter((x) => x.length);
  const avgProtein = days.length ? days.reduce((a, d) => a + d.reduce((x, f) => x + f.protein, 0), 0) / days.length : null;
  const avgKcal = days.length ? days.reduce((a, d) => a + d.reduce((x, f) => x + f.kcal, 0), 0) / days.length : null;
  const monday = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return todayISO(d); })();
  const trainings = s.workouts.filter((w) => w.date >= monday).length;

  return `<section class="card" style="gap:14px" aria-labelledby="ci-title">
    <p class="eyebrow" id="ci-title">Wochen-Check-in</p>
    <div class="grid-3">
      <div class="tile"><p class="label">Training</p><p class="value">${trainings} / ${s.profile.sessionsPerWeek}</p></div>
      <div class="tile"><p class="label">Ø Eiweiß</p><p class="value">${avgProtein == null ? '–' : `${num(avgProtein)} g`}</p></div>
      <div class="tile"><p class="label">Gewicht</p><p class="value">${c.change == null ? '–' : signed(c.change)}</p></div>
    </div>
    ${avgProtein != null && avgProtein < t.protein * 0.8 ? `<p class="small">Eiweiß liegt im Schnitt bei ${num(avgProtein)} g – Ziel sind ${t.protein} g. Das ist der wichtigste Hebel für Muskeln.</p>` : ''}
    ${avgKcal != null ? `<p class="small muted">Ø ${num(avgKcal)} kcal an ${days.length} ${days.length === 1 ? 'Tag' : 'Tagen'} mit Einträgen · Ziel ${num(t.kcal)} kcal</p>` : ''}
    <p class="hint-box ${c.delta ? 'up' : ''}">${esc(c.text)}</p>
    ${c.delta ? `<button type="button" class="btn btn-primary" data-adjust="${c.delta}">Übernehmen: ${c.delta > 0 ? '+' : ''}${c.delta} kcal</button>` : ''}
    ${s.profile.kcalAdjust ? `<p class="small muted">Bisherige Anpassungen: ${s.profile.kcalAdjust > 0 ? '+' : ''}${s.profile.kcalAdjust} kcal · <button type="button" class="btn-link small" data-resetadjust style="min-height:0;padding:0">zurücksetzen</button></p>` : ''}
  </section>`;
}

function weightCard(s) {
  const ws = [...s.weights].sort((a, b) => a.date.localeCompare(b.date));
  const recent = ws.filter((w) => daysSince(w.date) <= 90);
  const pts = recent.map((w) => ({ t: ms(w.date), y: w.kg }));
  const trend = rolling(recent);
  const current = trend.length ? trend[trend.length - 1].y : null;
  const monthAgo = ws.filter((w) => daysSince(w.date) >= 28).pop();
  const today = ws.find((w) => w.date === todayISO());

  return `<section class="card" style="gap:14px" aria-labelledby="w-title">
    <div style="display:flex;justify-content:space-between;align-items:baseline">
      <p class="eyebrow" id="w-title">Gewicht</p>
      ${current != null ? `<p><strong class="display" style="font-size:24px">${dec(current)} kg</strong> <span class="small muted">Ø 7 Tage</span></p>` : ''}
    </div>
    ${monthAgo && current != null ? `<p class="small muted">Seit ${shortDate(monthAgo.date)}: ${signed(current - monthAgo.kg)}</p>` : ''}
    ${pts.length >= 2 ? lineChart(pts, { trend, unit: 'kg' }) : '<p class="small muted">Ab zwei Einträgen siehst du hier deinen Verlauf. Pink ist der 7-Tage-Schnitt – der zählt, nicht der einzelne Tag.</p>'}
    <form class="row" data-form="weight">
      <div class="input-unit" style="flex:1"><label class="sr" for="w-in">Gewicht heute</label>
        <input class="input" id="w-in" inputmode="decimal" placeholder="${today ? dec(today.kg) : 'Gewicht heute'}" autocomplete="off"><span>kg</span></div>
      <button type="submit" class="btn">${today ? 'Ändern' : 'Speichern'}</button>
    </form>
    <p class="small muted">Am besten morgens nach dem Aufstehen, 2–3× pro Woche.</p>
  </section>`;
}

function strengthCard(s) {
  const order = [...new Set([...DAYS, HOME_DAY].flatMap((d) => d.items))];
  const ids = [...new Set([...order, ...Object.keys(EXERCISES)])].filter((id) => EXERCISES[id].kind === 'weight');
  const rows = ids.map((id) => {
    const pts = s.workouts.filter((w) => w.sets?.[id]?.length).map((w) => Math.max(...w.sets[id].map((x) => x.kg ?? 0)));
    return { id, pts };
  }).filter((r) => r.pts.length);

  if (!rows.length) {
    return `<section class="card" style="gap:8px"><p class="eyebrow">Kraft</p><p class="small muted">Nach den ersten Trainings siehst du hier, wie deine Gewichte steigen.</p></section>`;
  }
  return `<section class="card" style="gap:4px" aria-labelledby="k-title">
    <p class="eyebrow" id="k-title" style="margin-bottom:6px">Kraft</p>
    ${rows.map(({ id, pts }) => {
      const diff = pts[pts.length - 1] - pts[0];
      return `<div class="strength-row">
        <div style="flex:1;min-width:0"><p>${esc(EXERCISES[id].name)}</p>
          <p class="small muted">${dec(pts[0], pts[0] % 1 ? 1 : 0)} → <strong style="color:var(--text)">${dec(pts[pts.length - 1], pts[pts.length - 1] % 1 ? 1 : 0)} kg</strong>${diff > 0 ? ` <span class="accent">${signed(diff, diff % 1 ? 1 : 0)}</span>` : ''}</p></div>
        ${sparkline(pts)}
      </div>`;
    }).join('')}
  </section>`;
}

function measuresCard(s, open) {
  const all = [...s.measures].sort((a, b) => a.date.localeCompare(b.date));
  // Per measure: first and latest value, so measuring just one keeps the others visible.
  const firstOf = (k) => all.find((m) => m[k] != null)?.[k] ?? null;
  const lastOf = (k) => [...all].reverse().find((m) => m[k] != null)?.[k] ?? null;
  const last = all[all.length - 1];
  const fmt = (v) => dec(v, v % 1 ? 1 : 0);
  const tiles = MEASURES.map(([k, l]) => {
    const v = lastOf(k), f = firstOf(k);
    if (v == null) return '';
    const good = k === 'taille' ? v < f : v > f;
    const diff = v !== f ? ` <span class="small ${good ? 'accent' : 'muted'}" style="font-family:var(--font-body)">${signed(v - f, 1, 'cm')}</span>` : '';
    return `<div class="tile"><p class="label">${l}</p><p class="value">${fmt(v)} cm${diff}</p></div>`;
  }).join('');
  return `<section class="card" style="gap:12px" aria-labelledby="m-title">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <p class="eyebrow" id="m-title">Umfänge</p>
      ${last ? `<p class="small muted">zuletzt ${shortDate(last.date)}</p>` : ''}
    </div>
    ${last ? `<div class="grid-2">${tiles}</div>`
      : '<p class="small muted">Einmal im Monat messen zeigt, was die Waage nicht zeigt: Taille schmaler, Po runder.</p>'}
    ${open ? `<form class="form" data-form="measures" style="gap:10px">
      <div class="grid-2">${MEASURES.map(([k, l]) => `<div class="field"><label for="m-${k}">${l}</label>
        <div class="input-unit"><input class="input" id="m-${k}" name="${k}" inputmode="decimal" placeholder="${lastOf(k) != null ? fmt(lastOf(k)) : ''}"><span>cm</span></div></div>`).join('')}</div>
      <p class="small muted">Taille: an der schmalsten Stelle. Hüfte/Po: an der breitesten Stelle. Oberschenkel und Arm: an der dicksten Stelle.</p>
      <button type="submit" class="btn btn-primary">Speichern</button>
    </form>` : `<button type="button" class="btn" data-measure>${last ? 'Neu messen' : 'Umfänge eintragen'}</button>`}
  </section>`;
}

function dataCard(s) {
  const total = s.workouts.length;
  return `<section class="card" style="gap:10px">
    <p class="eyebrow">Daten & Einstellungen</p>
    <p class="small muted">${total} ${total === 1 ? 'Training' : 'Trainings'} · ${s.food.length} Essens-Einträge${s.lastBackup ? ` · Backup vom ${shortDate(s.lastBackup)}` : ''}</p>
    <button type="button" class="btn" data-backup>Backup sichern</button>
    <label class="btn" for="restore" style="cursor:pointer">Backup laden</label>
    <input type="file" id="restore" accept="application/json,.json" class="sr">
    <button type="button" class="btn" data-profile>Körperdaten & Ziel ändern</button>
    <p class="small muted" style="margin-top:6px">Übungsfotos: free-exercise-db (gemeinfrei). Produktdaten: Open Food Facts.</p>
  </section>`;
}

// ---------- backup ----------

async function exportBackup() {
  const s = store.get();
  const date = todayISO();
  const json = JSON.stringify({ ...s, active: null, exportedAt: new Date().toISOString() });
  const name = `luna-backup-${date}.json`;
  const file = new File([json], name, { type: 'application/json' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Luna Backup' });
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }
    store.update((st) => { st.lastBackup = date; });
    return true;
  } catch (e) {
    if (e?.name === 'AbortError') return false; // share sheet closed
    alert('Backup hat nicht geklappt: ' + (e?.message ?? e));
    return false;
  }
}

async function importBackup(file) {
  try {
    const next = JSON.parse(await file.text());
    const info = `${next.workouts?.length ?? 0} Trainings und ${next.food?.length ?? 0} Essens-Einträge`;
    if (!confirm(`Backup laden? Es enthält ${info}. Die aktuellen Daten auf diesem Handy werden dabei ersetzt.`)) return false;
    store.replace(next);
    return true;
  } catch (e) {
    alert(e?.message?.includes('Backup') ? e.message : 'Die Datei konnte nicht gelesen werden.');
    return false;
  }
}

// ---------- view ----------

export function render(root, ctx, params) {
  const s = store.get();
  root.innerHTML = `
    <header class="header"><div><p class="overline">Dein Weg</p><h1>Fortschritt</h1></div></header>
    ${backupHint(s)}
    ${checkInCard(s)}
    ${weightCard(s)}
    ${strengthCard(s)}
    ${measuresCard(s, !!params.messen)}
    ${dataCard(s)}`;

  root.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const form = ev.target;
    if (form.dataset.form === 'weight') {
      const kg = toNum(form.querySelector('#w-in').value);
      if (!(kg >= 30 && kg <= 250)) { form.querySelector('#w-in').focus(); return; }
      store.update((st) => {
        const d = todayISO();
        st.weights = st.weights.filter((w) => w.date !== d);
        st.weights.push({ date: d, kg });
        st.weights.sort((a, b) => a.date.localeCompare(b.date));
        // Keep the profile weight close to the recent average for the targets.
        const recent = st.weights.filter((w) => daysSince(w.date) <= 6);
        st.profile.weightKg = Math.round((recent.reduce((a, w) => a + w.kg, 0) / recent.length) * 10) / 10;
      });
      ctx.refresh();
    }
    if (form.dataset.form === 'measures') {
      const entry = { date: todayISO() };
      let any = false;
      for (const [k] of MEASURES) {
        const v = toNum(form.elements[k].value);
        if (v != null && v > 10 && v < 250) { entry[k] = v; any = true; }
      }
      if (!any) return;
      store.update((st) => {
        st.measures = st.measures.filter((m) => m.date !== entry.date);
        st.measures.push(entry);
      });
      ctx.go('fortschritt');
    }
  });

  root.addEventListener('change', async (ev) => {
    if (ev.target.id === 'restore' && ev.target.files?.[0]) {
      if (await importBackup(ev.target.files[0])) ctx.go('heute');
      ev.target.value = '';
    }
  });

  root.addEventListener('click', async (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if (d.backup !== undefined) { if (await exportBackup()) ctx.refresh(); }
    if (d.adjust) {
      const delta = Number(d.adjust);
      store.update((st) => {
        st.profile.kcalAdjust = (st.profile.kcalAdjust ?? 0) + delta;
        st.checkins.push({ date: todayISO(), delta });
      });
      ctx.refresh();
    }
    if (d.resetadjust !== undefined && confirm('Alle Kalorien-Anpassungen aus dem Check-in zurücksetzen?')) {
      store.update((st) => { st.profile.kcalAdjust = 0; });
      ctx.refresh();
    }
    if (d.measure !== undefined) ctx.go('fortschritt', { messen: 1 });
    if (d.profile !== undefined) ctx.go('profil');
  });
}
