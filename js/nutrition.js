// Rough daily needs. Deliberately simple: the weekly check-in (stage 4)
// corrects the estimate from the real weight trend.

export const JOBS = {
  sitzend: { label: 'Eher sitzend', hint: 'Büro, Studium', factor: 1.3 },
  stehend: { label: 'Viel stehen/gehen', hint: 'Verkauf, Pflege, Gastro', factor: 1.45 },
  aktiv: { label: 'Körperlich aktiv', hint: 'Handwerk, Lager', factor: 1.6 },
};

export const GOALS = {
  halten: { label: 'Halten & definieren', hint: 'Gewicht halten, Muskeln aufbauen', delta: 0 },
  aufbau: { label: 'Leichter Aufbau', hint: 'etwas mehr essen für mehr Muskeln', delta: 200 },
  defizit: { label: 'Leichtes Defizit', hint: 'langsam abnehmen, max. 6–8 Wochen', delta: -350 },
};

export function ageFrom(birthdate, today = new Date()) {
  const b = new Date(birthdate);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

const round = (n, step) => Math.round(n / step) * step;

export function targets(p, today = new Date()) {
  const age = ageFrom(p.birthdate, today);
  // Mifflin-St Jeor
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * age + (p.sex === 'm' ? 5 : -161);
  const base = bmr * (JOBS[p.job]?.factor ?? 1.3);
  const steps = p.steps * 0.0005 * p.weightKg;            // ~0.5 kcal per kg per 1000 steps
  const training = (p.sessionsPerWeek * 150 + 100) / 7;   // strength sessions + one yoga
  const maintenance = base + steps + training;
  // kcalAdjust: corrections accepted in the weekly check-in.
  const kcal = round(maintenance + (GOALS[p.goal]?.delta ?? 0) + (p.kcalAdjust ?? 0), 50);

  const protein = round(p.weightKg * 1.8, 5);
  const fat = round(Math.max(p.weightKg * 1.0, (kcal * 0.25) / 9), 5);
  const carbs = round(Math.max(0, (kcal - protein * 4 - fat * 9) / 4), 5);

  return { age, bmr: round(bmr, 10), maintenance: round(maintenance, 50), kcal, protein, fat, carbs };
}

// Weekly weight change aim per goal, in kg/week: [low, high].
export const GOAL_RANGE = {
  halten: [-0.3, 0.3],
  aufbau: [0.05, 0.3],
  defizit: [-0.6, -0.2],
};

// Average of entries in [from, to) (ISO dates).
function avgBetween(weights, from, to) {
  const xs = weights.filter((w) => w.date >= from && w.date < to).map((w) => w.kg);
  return xs.length >= 2 ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysAgo = (n, today) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };

// Weekly check-in: compares the last 7 days with the 7 before and
// suggests a calorie correction when the trend misses the goal.
export function checkIn(s, today = new Date()) {
  const p = s.profile;
  const tomorrow = daysAgo(-1, today);
  const thisWeek = avgBetween(s.weights, daysAgo(6, today), tomorrow);
  const lastWeek = avgBetween(s.weights, daysAgo(13, today), daysAgo(6, today));
  const firstDate = s.weights[0]?.date;
  const daysTracked = firstDate ? Math.round((new Date(today) - new Date(firstDate + 'T00:00:00')) / 86400000) : 0;
  const lastAdjust = s.checkins?.[s.checkins.length - 1]?.date;
  const adjustedRecently = lastAdjust && lastAdjust > daysAgo(7, today);

  if (thisWeek == null || lastWeek == null) {
    return { status: 'wenig', text: 'Noch zu wenig Daten. Trag 2–3× pro Woche dein Gewicht ein – morgens, nach dem Aufstehen. Nach zwei Wochen gibt es hier eine Empfehlung.' };
  }
  const change = thisWeek - lastWeek;
  const [lo, hi] = GOAL_RANGE[p.goal] ?? GOAL_RANGE.halten;
  const base = { change, thisWeek };

  if (daysTracked < 21 && change > 0 && p.goal !== 'defizit') {
    return { ...base, status: 'ok', text: 'In den ersten Wochen steigt das Gewicht oft leicht – das ist Wasser in den Muskeln, kein Fett. Einfach weitermachen.' };
  }
  if (adjustedRecently) {
    return { ...base, status: 'ok', text: 'Die letzte Anpassung ist noch keine Woche her. Erst abwarten, wie sie wirkt.' };
  }
  if (change < lo) {
    const delta = change < lo - 0.3 ? 200 : 100;
    return { ...base, status: 'mehr', delta, text: p.goal === 'defizit'
      ? `Du nimmst schneller ab als geplant. Etwas mehr essen schützt die Muskeln: +${delta} kcal pro Tag.`
      : `Dein Gewicht geht runter, obwohl das nicht das Ziel ist. Vorschlag: +${delta} kcal pro Tag.` };
  }
  if (change > hi) {
    const delta = change > hi + 0.3 ? -200 : -100;
    return { ...base, status: 'weniger', delta, text: p.goal === 'aufbau'
      ? `Du nimmst schneller zu als nötig. Vorschlag: ${delta} kcal pro Tag.`
      : `Dein Gewicht steigt über dem Ziel. Vorschlag: ${delta} kcal pro Tag – oder ein paar Schritte mehr.` };
  }
  return { ...base, status: 'ok', text: 'Passt genau zum Ziel. Alles so lassen.' };
}
