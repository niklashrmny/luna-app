// Barcode scan → Open Food Facts → choose amount → log.
// Safari on iPhone has no built-in barcode detector, so the ZXing library
// is loaded from a CDN the first time the scanner opens (the service worker
// keeps a copy). Scanned products are remembered for offline use.
import { store } from './store.js';
import { esc, num, todayISO } from './ui.js';

const ZXING_URL = 'https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

let zxingLoading = null;
function loadZXing() {
  if (window.ZXing) return Promise.resolve(window.ZXing);
  zxingLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = ZXING_URL;
    s.onload = () => resolve(window.ZXing);
    s.onerror = () => { zxingLoading = null; reject(new Error('Scanner konnte nicht geladen werden (Internet?).')); };
    document.head.appendChild(s);
  });
  return zxingLoading;
}

let reader = null;
let sheet = null;

function close(ctx) {
  try { reader?.reset(); } catch { /* already stopped */ }
  reader = null;
  sheet?.remove();
  sheet = null;
  // Drop ?scan=1 so the scanner doesn't reopen on the next render.
  if (location.hash.includes('scan=1')) ctx.go('essen', currentDate && currentDate !== today() ? { tag: currentDate } : undefined);
  else ctx.refresh();
}

let currentDate = null;
const today = () => todayISO();

function frame(inner) {
  sheet.innerHTML = `<div class="sheet-inner">${inner}</div>`;
}

export async function openScanner(date, ctx) {
  if (sheet) return;
  currentDate = date;
  sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', 'Barcode scannen');
  document.body.appendChild(sheet);

  sheet.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.close !== undefined) close(ctx);
    if (b.dataset.manual !== undefined) {
      const code = sheet.querySelector('#code').value.replace(/\D/g, '');
      if (code.length >= 8) lookup(code, ctx);
    }
  });

  frame(`
    <div class="sheet-head"><h2>Barcode scannen</h2><button type="button" class="btn" data-close>Abbrechen</button></div>
    <div class="scan-box"><video id="scan-video" playsinline muted></video><div class="scan-line" aria-hidden="true"></div></div>
    <p class="small muted" id="scan-status">Kamera wird gestartet…</p>
    <div class="field"><label for="code">Oder Nummer unter dem Strichcode eintippen</label>
      <div class="row"><input class="input" id="code" inputmode="numeric" autocomplete="off" placeholder="z. B. 4001234567890"><button type="button" class="btn" data-manual>Suchen</button></div>
    </div>`);

  try {
    const ZXing = await loadZXing();
    if (!sheet) return;
    const hints = new Map();
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E]);
    reader = new ZXing.BrowserMultiFormatReader(hints);
    const video = sheet.querySelector('#scan-video');
    await reader.decodeFromConstraints({ video: { facingMode: 'environment' } }, video, (result) => {
      if (result && reader) {
        const code = result.getText();
        try { reader.reset(); } catch { /* ignore */ }
        reader = null;
        navigator.vibrate?.(80);
        lookup(code, ctx);
      }
    });
    const st = sheet?.querySelector('#scan-status');
    if (st) st.textContent = 'Strichcode in den Rahmen halten.';
  } catch (err) {
    const st = sheet?.querySelector('#scan-status');
    if (st) {
      st.textContent = err?.name === 'NotAllowedError'
        ? 'Kein Kamera-Zugriff. In den iPhone-Einstellungen erlauben oder die Nummer eintippen.'
        : (err?.message?.includes('Internet') ? err.message : 'Kamera nicht verfügbar – die Nummer eintippen geht auch.');
    }
  }
}

function parseGrams(s) {
  const m = String(s ?? '').replace(',', '.').match(/([\d.]+)\s*(g|ml|kg|l)\b/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return /k|^l$/i.test(m[2]) ? n * 1000 : n;
}

async function lookup(code, ctx) {
  if (!sheet) return;
  frame(`<div class="sheet-head"><h2>Suche Produkt…</h2><button type="button" class="btn" data-close>Abbrechen</button></div><p class="muted">Barcode ${esc(code)}</p>`);

  // Known from an earlier scan? Works offline.
  let product = store.get().customFoods.find((p) => p.kind === 'product' && p.code === code);
  if (!product) {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_de,brands,nutriments,serving_quantity,serving_size,quantity`);
      const data = await res.json();
      const p = data.product;
      const n = p?.nutriments ?? {};
      const kcal = n['energy-kcal_100g'] ?? (n.energy_100g != null ? n.energy_100g / 4.184 : null);
      if (data.status === 1 && kcal != null) {
        product = {
          id: uid(), kind: 'product', code,
          name: [p.product_name_de || p.product_name, p.brands?.split(',')[0]].filter(Boolean).join(' · ') || `Produkt ${code}`,
          per100: [kcal, n.proteins_100g ?? 0, n.fat_100g ?? 0],
          serving: Number(p.serving_quantity) || parseGrams(p.serving_size),
          pack: parseGrams(p.quantity),
        };
      }
    } catch {
      return notFound(code, 'Keine Verbindung zur Produkt-Datenbank. Mit Internet nochmal versuchen.', ctx);
    }
  }
  if (!sheet) return;
  if (!product) return notFound(code, 'Dieses Produkt ist (noch) nicht in der Datenbank.', ctx);
  amountStep(product, ctx);
}

function notFound(code, msg, ctx) {
  frame(`<div class="sheet-head"><h2>Nicht gefunden</h2><button type="button" class="btn" data-close>Schließen</button></div>
    <p class="muted">${esc(msg)}</p>
    <p class="small muted">Tipp: Werte von der Packung abschreiben (pro Portion) – dann merkt sich die App das Produkt.</p>
    <form class="form" id="manual-form">
      <div class="field"><label for="m-name">Name</label><input class="input" id="m-name" required></div>
      <div class="grid-3">
        <div class="field"><label for="m-kcal">kcal</label><input class="input" id="m-kcal" inputmode="numeric" required></div>
        <div class="field"><label for="m-p">Eiweiß g</label><input class="input" id="m-p" inputmode="decimal"></div>
        <div class="field"><label for="m-f">Fett g</label><input class="input" id="m-f" inputmode="decimal"></div>
      </div>
      <button type="submit" class="btn btn-primary">Eintragen & merken</button>
    </form>`);
  sheet.querySelector('#manual-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (id) => parseFloat(String(sheet.querySelector(id).value).replace(',', '.')) || 0;
    const name = sheet.querySelector('#m-name').value.trim() || `Produkt ${code}`;
    // Store as per-100 with a 100 g "portion" so amounts stay simple.
    const product = { id: uid(), kind: 'product', code, name, per100: [v('#m-kcal'), v('#m-p'), v('#m-f')], serving: 100, pack: null, perPortion: true };
    store.update((s) => { s.customFoods.push(product); });
    log(product, 100, '1 Portion', ctx);
  });
}

function amountStep(product, ctx) {
  const [k, p, f] = product.per100;
  const opts = [];
  if (product.perPortion) opts.push([100, '1 Portion']);
  else {
    if (product.serving) opts.push([product.serving, `1 Portion (${num(product.serving)} g)`]);
    opts.push([100, '100 g']);
    if (product.pack && product.pack !== product.serving && product.pack <= 1500) opts.push([product.pack, `Ganze Packung (${num(product.pack)} g)`]);
  }
  frame(`<div class="sheet-head"><h2>${esc(product.name)}</h2><button type="button" class="btn" data-close>Abbrechen</button></div>
    <p class="small muted">${product.perPortion ? 'Pro Portion' : 'Pro 100 g'}: ${num(k)} kcal · ${num(p)} g Eiweiß · ${num(f)} g Fett</p>
    <p class="overline">Wie viel?</p>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${opts.map(([g, l]) => `<button type="button" class="list-btn" data-g="${g}" data-l="${esc(l)}"><span>${esc(l)}</span><small>${num((k * g) / 100)} kcal</small></button>`).join('')}
    </div>
    ${product.perPortion ? '' : `<div class="field"><label for="grams">Eigene Menge</label>
      <div class="row"><div class="input-unit" style="flex:1"><input class="input" id="grams" inputmode="decimal" placeholder="z. B. 150"><span>g</span></div>
      <button type="button" class="btn" data-custom>OK</button></div></div>`}`);

  sheet.addEventListener('click', function onPick(e) {
    const b = e.target.closest('button');
    if (!b || !sheet) return;
    if (b.dataset.g) { sheet.removeEventListener('click', onPick); log(product, Number(b.dataset.g), b.dataset.l, ctx); }
    if (b.dataset.custom !== undefined) {
      const g = parseFloat(String(sheet.querySelector('#grams').value).replace(',', '.'));
      if (g > 0) { sheet.removeEventListener('click', onPick); log(product, g, `${num(g)} g`, ctx); }
    }
  });
}

function log(product, grams, label, ctx) {
  const [k, p, f] = product.per100;
  const factor = grams / 100;
  const amount = label.replace(/\s*\(.*\)/, '').replace(/^1 Portion$/, `${num(grams)} g`);
  store.update((s) => {
    let saved = s.customFoods.find((x) => x.kind === 'product' && x.code === product.code);
    if (!saved) { saved = { ...product }; s.customFoods.push(saved); }
    saved.uses = (saved.uses ?? 0) + 1;
    saved.lastAmount = product.perPortion ? '' : amount;
    saved.kcal = Math.round(k * factor); saved.protein = Math.round(p * factor); saved.fat = Math.round(f * factor);
    s.food.push({ id: uid(), date: currentDate, time: currentDate === today() ? new Date().toTimeString().slice(0, 5) : '12:00',
      name: product.name, amount: product.perPortion ? '' : amount, kcal: saved.kcal, protein: saved.protein, fat: saved.fat, src: 'scan' });
  });
  close(ctx);
}
