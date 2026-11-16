// All app data lives on the device in localStorage, as one JSON document.
const KEY = 'luna-app-v1';

const empty = () => ({
  version: 1,
  profile: null,      // set by onboarding
  workouts: [],       // { id, dayId, date, sets: { [exerciseId]: [{ kg, reps }] } }
  food: [],           // { id, date, time, name, kcal, protein, fat }
  weights: [],        // { date, kg }
  customFoods: [],    // own dishes, filled in stage 3
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
  reset() {
    data = empty();
    save();
  },
};

// Ask the browser not to evict our data when storage runs low.
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
