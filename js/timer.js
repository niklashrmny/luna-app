// Rest timer bar above the tab bar. Works from timestamps, so it stays
// correct after switching apps; the beep only plays while the app is open.
import { store } from './store.js';

const bar = document.getElementById('timer');
let tick = null;
let audio = null;
let doneShownUntil = 0;

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function beep() {
  try {
    if (!audio) return;
    [0, 0.25, 0.5].forEach((t) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, audio.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.4, audio.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + t + 0.18);
      o.connect(g).connect(audio.destination);
      o.start(audio.currentTime + t);
      o.stop(audio.currentTime + t + 0.2);
    });
  } catch { /* sound is a bonus */ }
  navigator.vibrate?.([200, 100, 200]);
}

function rest() {
  return store.get().active?.rest ?? null;
}

function draw() {
  const r = rest();
  const now = Date.now();
  if (!r) {
    if (now < doneShownUntil) return;
    bar.hidden = true;
    stop();
    return;
  }
  const left = Math.max(0, Math.ceil((r.endsAt - now) / 1000));
  if (left === 0) {
    store.update((s) => { if (s.active) s.active.rest = null; });
    beep();
    doneShownUntil = now + 4000;
    bar.hidden = false;
    bar.innerHTML = `<p class="timer-done" role="status">Pause vorbei – nächster Satz!</p>`;
    setTimeout(draw, 4100);
    return;
  }
  const pct = Math.min(100, ((r.total - left) / r.total) * 100);
  bar.hidden = false;
  bar.innerHTML = `
    <div class="timer-progress" style="width:${pct}%"></div>
    <p class="timer-label">Pause</p>
    <p class="timer-time" role="timer" aria-live="off">${mmss(left)}</p>
    <button type="button" class="btn timer-btn" data-t="plus">+15 s</button>
    <button type="button" class="btn timer-btn" data-t="skip">Weiter</button>`;
}

function stop() {
  clearInterval(tick);
  tick = null;
}

function ensureTicking() {
  if (!tick) tick = setInterval(draw, 250);
  draw();
}

bar.addEventListener('click', (e) => {
  const t = e.target.closest('[data-t]')?.dataset.t;
  if (!t) return;
  store.update((s) => {
    if (!s.active?.rest) return;
    if (t === 'plus') { s.active.rest.endsAt += 15000; s.active.rest.total += 15; }
    if (t === 'skip') s.active.rest = null;
  });
  doneShownUntil = 0;
  draw();
});

export function startRest(seconds) {
  // Called from a tap, so iOS allows audio to start.
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume?.();
  } catch { /* no audio */ }
  store.update((s) => { if (s.active) s.active.rest = { endsAt: Date.now() + seconds * 1000, total: seconds }; });
  doneShownUntil = 0;
  ensureTicking();
}

export function stopRest() {
  store.update((s) => { if (s.active) s.active.rest = null; });
  doneShownUntil = 0;
  draw();
}

// Resume after reload or app switch.
export function resumeTimer() {
  if (rest()) ensureTicking(); else draw();
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) resumeTimer(); });
