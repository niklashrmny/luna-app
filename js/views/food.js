import { store } from '../store.js';
import { targets } from '../nutrition.js';
import { parse, compute, sum, amountLabel, GENERIC } from '../foods.js';
import { esc, num, icon, todayISO } from '../ui.js';
import { openScanner } from '../scanner.js';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const r0 = (n) => Math.round(n);

// The preview survives re-renders until it is saved or discarded.
let draft = null; // { text, items, saveAs, saveName }

function dayLabel(iso) {
  const today = todayISO();
  const d = new Date(iso + 'T00:00:00');
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (iso === today) return 'Heute';
  if (iso === todayISO(y)) return 'Gestern';
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

function shiftDay(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return todayISO(d);
}

const nowTime = () => new Date().toTimeString().slice(0, 5);

export function addEntries(date, entries) {
  store.update((s) => {
    for (const e of entries) {
      s.food.push({ id: uid(), date, time: date === todayISO() ? nowTime() : '12:00', name: e.name, amount: e.amount ?? '',
        kcal: r0(e.kcal), protein: r0(e.protein), fat: r0(e.fat), src: e.src ?? 'table' });
    }
  });
}

function bar(label, value, target, color, unit) {
  const pct = Math.min(100, target ? (value / target) * 100 : 0);
  return `<div style="display:flex;flex-direction:column;gap:6px">
    <div style="display:flex;justify-content:space-between;align-items:baseline">
      <p style="font-weight:600">${label}</p>
      <p><strong class="display">${num(value)}</strong> <span class="muted small">/ ${num(target)} ${unit}</span></p>
    </div>
    <div class="bar"><div style="width:${pct}%;background:${color}"></div></div>
  </div>`;
}

// Frequent foods for one-tap logging: own dishes first, then most logged names.
function quickPicks(s) {
  const own = [...s.customFoods].filter((d) => d.kind === 'dish' || (d.kind === 'product' && d.kcal != null)).sort((a, b) => (b.uses ?? 0) - (a.uses ?? 0));
  const counts = {};
  for (const f of s.food.slice(-300)) {
    const k = `${f.name}|${f.amount}`;
    counts[k] = counts[k] ?? { n: 0, f };
    counts[k].n++;
  }
  const frequent = Object.values(counts).filter((c) => c.n >= 2 && !own.some((d) => d.name === c.f.name))
    .sort((a, b) => b.n - a.n).map((c) => c.f);
  return { own: own.slice(0, 8), frequent: frequent.slice(0, 6) };
}

function previewHtml(s) {
  const items = draft.items;
  const total = sum(items);
  const unknownOptions = [...GENERIC.map((g) => `<option value="gen:${g.id}">${esc(g.name)} (~${g.kcal} kcal)</option>`),
    ...s.customFoods.filter((d) => d.kind === 'dish').map((d) => `<option value="own:${d.id}">${esc(d.name)}</option>`)].join('');

  const rows = items.map((it, i) => {
    if (it.unknown) {
      return `<div class="pv-row unknown">
        <div class="pv-main"><p><strong>„${esc(it.name)}“</strong></p><p class="small muted">Nicht in der Tabelle – wie groß war es?</p>
          <label class="sr" for="unk-${i}">Größe für ${esc(it.name)}</label>
          <select class="input" id="unk-${i}" data-resolve="${i}" style="height:44px;font-size:15px;margin-top:6px">
            <option value="">Bitte wählen…</option>${unknownOptions}<option value="skip">Weglassen</option>
          </select></div>
      </div>`;
    }
    return `<div class="pv-row">
      <div class="pv-main">
        <p><strong>${esc(it.name)}</strong> <span class="muted small">${esc(amountLabel(it))}</span></p>
        <p class="small muted">${num(it.kcal)} kcal · ${num(it.protein)} g Eiweiß · ${num(it.fat)} g Fett</p>
      </div>
      <div class="stepper">
        <button type="button" class="btn" data-step="${i}" data-d="-1" aria-label="Weniger ${esc(it.name)}">−</button>
        <button type="button" class="btn" data-step="${i}" data-d="1" aria-label="Mehr ${esc(it.name)}">+</button>
      </div>
    </div>`;
  }).join('');

  const hasUnknown = items.some((i) => i.unknown);
  return `<section class="card" style="gap:12px" aria-label="Erkannt">
    <p class="eyebrow">Erkannt</p>
    ${items.length ? rows : '<p class="muted">Nichts erkannt. Versuch es mit z. B. „2 Eier und 1 Toast“.</p>'}
    ${items.length ? `<p class="pv-total">Zusammen: <strong class="accent">${num(total.kcal)} kcal</strong> · ${num(total.protein)} g Eiweiß · ${num(total.fat)} g Fett</p>` : ''}
    ${items.length > 0 ? `<div class="choice"><input type="checkbox" id="save-as" ${draft.saveAs ? 'checked' : ''}>
      <label for="save-as"><strong>Als eigenes Gericht merken</strong><span>Dann reicht nächstes Mal ein Tipp.</span></label></div>
      ${draft.saveAs ? `<div class="field"><label for="save-name">Name</label><input class="input" id="save-name" value="${esc(draft.saveName)}"></div>` : ''}` : ''}
    <div class="row">
      <button type="button" class="btn" data-discard>Verwerfen</button>
      <button type="button" class="btn btn-primary" data-save ${hasUnknown || !items.length ? 'disabled' : ''}>Eintragen</button>
    </div>
    ${hasUnknown ? '<p class="small muted">Erst die unbekannten Einträge zuordnen.</p>' : ''}
  </section>`;
}

export function render(root, ctx, params) {
  const s = store.get();
  const t = targets(s.profile);
  const date = params.tag ?? todayISO();
  const entries = s.food.filter((f) => f.date === date).sort((a, b) => a.time.localeCompare(b.time));
  const total = sum(entries);
  const picks = quickPicks(s);
  const isToday = date === todayISO();

  root.innerHTML = `
    <header class="header" style="align-items:center">
      <button type="button" class="btn btn-icon" data-day="-1" aria-label="Tag zurück">${icon('back')}</button>
      <div style="text-align:center;flex:1"><p class="overline">Essen</p><h1 style="font-size:26px">${esc(dayLabel(date))}</h1></div>
      <button type="button" class="btn btn-icon" data-day="1" aria-label="Tag vor" ${isToday ? 'disabled style="opacity:.3"' : ''}><span style="transform:rotate(180deg);display:flex">${icon('back')}</span></button>
    </header>

    <section class="card" style="gap:14px">
      ${bar('Eiweiß', total.protein, t.protein, 'var(--pink)', 'g')}
      ${bar('Kalorien', total.kcal, t.kcal, 'var(--pink-soft)', 'kcal')}
      ${bar('Fett', total.fat, t.fat, '#B98AFF', 'g')}
      ${isToday && total.protein < t.protein ? `<p class="small muted">Noch ca. ${num(t.protein - total.protein)} g Eiweiß – z. B. Skyr, Quark, Hähnchen oder ein Shake.</p>` : ''}
    </section>

    ${draft ? previewHtml(s) : `
    <section class="card" style="gap:12px">
      <label for="food-text" style="font-weight:600">Was hast du gegessen?</label>
      <textarea id="food-text" class="input textarea" rows="2" placeholder="z. B. 2 Eier, 2 Toast und ein Proteinshake"></textarea>
      <div class="row">
        <button type="button" class="btn" data-mic aria-label="Spracheingabe" style="flex:1">${icon('mic')} Sprechen</button>
        <button type="button" class="btn" data-scan style="flex:1">${icon('scan')} Scannen</button>
      </div>
      <button type="button" class="btn btn-primary" data-parse>Erkennen</button>
      <p class="small muted" id="mic-hint" hidden></p>
    </section>`}

    ${!draft && (picks.own.length || picks.frequent.length) ? `
    <section style="display:flex;flex-direction:column;gap:8px">
      <p class="overline">Schnell eintragen</p>
      <div class="chips">
        ${picks.own.map((d) => `<button type="button" class="chip" data-own="${d.id}">${esc(d.name)} <span>${num(d.kcal)}</span></button>`).join('')}
        ${picks.frequent.map((f, i) => `<button type="button" class="chip" data-freq="${i}">${esc(f.name)}${f.amount ? ` · ${esc(f.amount)}` : ''} <span>${num(f.kcal)}</span></button>`).join('')}
      </div>
    </section>` : ''}

    <section style="display:flex;flex-direction:column;gap:8px">
      <p class="overline">${entries.length ? `Eingetragen (${entries.length})` : 'Noch nichts eingetragen'}</p>
      ${entries.length ? `<div class="card" style="gap:0;padding:4px 16px">
        ${entries.map((e) => `<div class="entry">
          <span class="small muted">${esc(e.time)}</span>
          <div style="flex:1;min-width:0"><p>${esc(e.name)} <span class="small muted">${esc(e.amount)}</span></p>
            <p class="small muted">${num(e.kcal)} kcal · ${num(e.protein)} g Eiweiß</p></div>
          <button type="button" class="btn-x" data-del="${e.id}" aria-label="${esc(e.name)} löschen">×</button>
        </div>`).join('')}
      </div>` : ''}
    </section>
    ${s.customFoods.some((d) => d.kind === 'dish') ? `<button type="button" class="btn-link small" data-manage style="align-self:center">Eigene Gerichte verwalten</button>` : ''}
    ${params.verwalten ? manageHtml(s) : ''}`;

  // ----- events -----
  const go = (p) => ctx.go('essen', { ...(date !== todayISO() ? { tag: date } : {}), ...p });

  root.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.id === 'save-as') { draft.saveAs = el.checked; ctx.refresh(); }
    if (el.dataset.resolve != null) {
      const i = Number(el.dataset.resolve);
      const v = el.value;
      if (!v) return;
      if (v === 'skip') draft.items.splice(i, 1);
      else if (v.startsWith('gen:')) {
        const g = GENERIC.find((x) => x.id === v.slice(4));
        draft.items[i] = compute({ generic: g, name: `${draft.items[i].name} (${g.name})`, unit: 'Portion', count: 1, size: 1 });
      } else {
        const d = s.customFoods.find((x) => x.id === v.slice(4));
        draft.items[i] = compute({ own: d, name: d.name, unit: 'Portion', count: 1, size: 1 });
      }
      ctx.refresh();
    }
  });
  root.addEventListener('input', (ev) => {
    if (ev.target.id === 'save-name') draft.saveName = ev.target.value;
  });

  root.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const d = b.dataset;

    if (d.day) { const n = shiftDay(date, Number(d.day)); ctx.go('essen', n === todayISO() ? undefined : { tag: n }); return; }

    if (d.parse !== undefined) {
      const text = root.querySelector('#food-text').value.trim();
      if (!text) { root.querySelector('#food-text').focus(); return; }
      draft = { text, items: parse(text, s.customFoods.filter((x) => x.kind === 'dish')), saveAs: false, saveName: text.slice(0, 40) };
      ctx.refresh();
      return;
    }
    if (d.step) {
      const it = draft.items[Number(d.step)];
      const delta = Number(d.d);
      if (it.byGrams) {
        const stepG = it.grams >= 100 ? 50 : 10;
        it.grams = Math.max(stepG, it.grams + delta * stepG);
      } else {
        const stepC = it.count <= 1 ? 0.5 : 1;
        it.count = Math.max(0.5, it.count + delta * stepC);
      }
      draft.items[Number(d.step)] = compute(it);
      ctx.refresh();
      return;
    }
    if (d.discard !== undefined) { draft = null; ctx.refresh(); return; }
    if (d.save !== undefined) {
      const items = draft.items.filter((i) => !i.unknown);
      if (draft.saveAs) {
        const tot = sum(items);
        const name = (draft.saveName || draft.text).trim().slice(0, 40);
        store.update((st) => { st.customFoods.push({ id: uid(), kind: 'dish', name, kcal: r0(tot.kcal), protein: r0(tot.protein), fat: r0(tot.fat), uses: 1 }); });
        addEntries(date, [{ name, amount: '', ...tot, src: 'own' }]);
      } else {
        addEntries(date, items.map((i) => ({ name: i.name, amount: i.own || i.generic ? (i.count !== 1 ? `${i.count}×` : '') : amountLabel(i), kcal: i.kcal, protein: i.protein, fat: i.fat, src: i.own ? 'own' : i.generic ? 'generic' : 'table' })));
      }
      draft = null;
      ctx.refresh();
      return;
    }
    if (d.own) {
      const dish = s.customFoods.find((x) => x.id === d.own);
      store.update(() => { dish.uses = (dish.uses ?? 0) + 1; });
      addEntries(date, [{ name: dish.name, amount: dish.kind === 'product' ? dish.lastAmount ?? '' : '', kcal: dish.kcal, protein: dish.protein, fat: dish.fat, src: 'own' }]);
      ctx.refresh();
      return;
    }
    if (d.freq) {
      const f = picks.frequent[Number(d.freq)];
      addEntries(date, [{ ...f, src: f.src }]);
      ctx.refresh();
      return;
    }
    if (d.del) {
      store.update((st) => { st.food = st.food.filter((x) => x.id !== d.del); });
      ctx.refresh();
      return;
    }
    if (d.delown) {
      if (!confirm('Dieses eigene Gericht löschen? Bereits eingetragene Mahlzeiten bleiben.')) return;
      store.update((st) => { st.customFoods = st.customFoods.filter((x) => x.id !== d.delown); });
      ctx.refresh();
      return;
    }
    if (d.manage !== undefined) { go(params.verwalten ? {} : { verwalten: 1 }); return; }
    if (d.mic !== undefined) { startMic(root); return; }
    if (d.scan !== undefined) { openScanner(date, ctx); }
  });

  if (params.mic && !draft) startMic(root);
  if (params.scan && !draft) openScanner(date, ctx);
}

function manageHtml(s) {
  const dishes = s.customFoods.filter((d) => d.kind === 'dish');
  return `<section class="card" style="gap:0;padding:4px 16px" aria-label="Eigene Gerichte">
    ${dishes.map((d) => `<div class="entry"><div style="flex:1"><p>${esc(d.name)}</p><p class="small muted">${num(d.kcal)} kcal · ${num(d.protein)} g Eiweiß · ${num(d.fat)} g Fett</p></div>
      <button type="button" class="btn-x" data-delown="${d.id}" aria-label="${esc(d.name)} löschen">×</button></div>`).join('')}
  </section>`;
}

// ---------- voice ----------

function startMic(root) {
  const area = root.querySelector('#food-text');
  const hint = root.querySelector('#mic-hint');
  if (!area) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const fallback = () => {
    hint.hidden = false;
    hint.textContent = 'Tipp: Auf der Tastatur unten rechts aufs Mikrofon tippen und einfach sprechen.';
    area.focus();
  };
  if (!SR) return fallback();
  try {
    const rec = new SR();
    rec.lang = 'de-DE';
    rec.interimResults = true;
    rec.continuous = false;
    const btn = root.querySelector('[data-mic]');
    const before = area.value ? area.value.trim() + ', ' : '';
    btn.classList.add('listening');
    btn.lastChild.textContent = ' Ich höre zu…';
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(' ');
      area.value = before + text;
    };
    rec.onerror = () => { btn.classList.remove('listening'); btn.lastChild.textContent = ' Sprechen'; fallback(); };
    rec.onend = () => {
      btn.classList.remove('listening');
      btn.lastChild.textContent = ' Sprechen';
      if (area.value.trim()) root.querySelector('[data-parse]')?.click();
    };
    rec.start();
  } catch {
    fallback();
  }
}
