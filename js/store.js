// All app data lives on the device in localStorage, as one JSON document.
const KEY = 'luna-app-v1';

const empty = () => ({
  version: 1,
  profile: null,      // set by onboarding
  workouts: [],       // { id, dayId, date, sets: { [exerciseId]: [{ kg, reps }] } }
  food: [],           // { id, date, time, name, kcal, protein, fat }
  weights: [],        // { date, kg }
  customFoods: [],    // own dishes and scanned products
  measures: [],       // { date, taille, huefte, oberschenkel, arm } in cm
  checkins: [],       // accepted calorie corrections { date, delta }
  lastBackup: null,   // ISO date of the last exported backup
});

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const store = {
  get: () => data,
  update(fn) {
    fn(data);
    save();
  },
  // Restore from a backup file. Throws if it doesn't look like ours.
  replace(next) {
    if (!next || typeof next !== 'object' || !Array.isArray(next.workouts) || !Array.isArray(next.food)) {
      throw new Error('Das ist keine Backup-Datei dieser App.');
    }
    data = { ...empty(), ...next, active: null };
    save();
  },
  reset() {
    data = empty();
    save();
  },
};

// Ask the browser not to evict our data when storage runs low.
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
