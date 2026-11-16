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
  const kcal = round(maintenance + (GOALS[p.goal]?.delta ?? 0), 50);

  const protein = round(p.weightKg * 1.8, 5);
  const fat = round(Math.max(p.weightKg * 1.0, (kcal * 0.25) / 9), 5);
  const carbs = round(Math.max(0, (kcal - protein * 4 - fat * 9) / 4), 5);

  return { age, bmr: round(bmr, 10), maintenance: round(maintenance, 50), kcal, protein, fat, carbs };
}
