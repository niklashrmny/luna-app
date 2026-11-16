// Small shared helpers: escaping, formatting, icons, dates.

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const nf = new Intl.NumberFormat('de-DE');
export const num = (n) => nf.format(Math.round(n));
export const kg = (n) => `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(n)} kg`;

export const todayISO = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};

export const dateLabel = (d = new Date()) =>
  d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '').replace(',', ' ·');

// Monday 00:00 of the current week.
export function weekStart(d = new Date()) {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
}

export function daysSince(iso, today = new Date()) {
  const a = new Date(iso + 'T00:00:00');
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((b - a) / 86400000);
}

const path = {
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  training: '<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>',
  food: '<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9"/>',
  progress: '<path d="M4 19h16M6 15l4-4 3 3 5-6"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  scan: '<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M8 8v8M11 8v8M14 8v8M16.5 8v8"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
};

export function icon(name, size = 22) {
  if (name === 'play') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path[name]}</svg>`;
}

// Progress ring: value of target, with a big number and a small caption.
export function ring({ value, target, color, big, small, label }) {
  const c = 2 * Math.PI * 42;
  const filled = Math.min(1, target ? value / target : 0) * c;
  return `<svg width="96" height="96" viewBox="0 0 100 100" role="img" aria-label="${esc(label)}">
    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--track)" stroke-width="10"/>
    ${filled > 0 ? `<circle cx="50" cy="50" r="42" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${filled.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/>` : ''}
    <text x="50" y="50" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="${big.length > 4 ? 19 : 22}" font-weight="700" fill="var(--text)">${esc(big)}</text>
    <text x="50" y="66" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="var(--muted)">${esc(small)}</text>
  </svg>`;
}
