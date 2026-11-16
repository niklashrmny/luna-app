// Luna's training plan. History is stored per exercise id, so progress
// follows the exercise across days.
//
// kind: 'weight' (kg + reps), 'body' (reps only), 'band' (band strength + reps)
// cues: 2–4 short form tips shown under "Anleitung".

const ex = (name, sets, reps, rest, extra = {}) => ({ name, sets, reps, rest, kind: 'weight', step: 2.5, ...extra });

export const EXERCISES = {
  // Tag 1
  'hip-thrust': ex('Hip Thrust', 3, [8, 12], 150, { step: 5, cues: [
    'Schulterblätter auf der Bankkante, Füße hüftbreit, Schienbeine oben senkrecht.',
    'Kinn zur Brust, Becken leicht nach hinten kippen.',
    'Hoch drücken bis Hüfte gestreckt, oben 1 Sekunde den Po fest anspannen.',
    'Nicht ins Hohlkreuz gehen – die Bewegung kommt aus der Hüfte.' ] }),
  'reverse-lunges': ex('Reverse Lunges (Langhantel)', 3, [8, 10], 120, { perSide: true, cues: [
    'Stange auf dem oberen Rücken, Oberkörper leicht nach vorn geneigt.',
    'Großer Schritt nach hinten, hinteres Knie fast bis zum Boden.',
    'Über die Ferse des vorderen Beins zurück nach oben drücken.' ] }),
  'rdl': ex('Rumänisches Kreuzheben', 3, [8, 12], 120, { isNew: true, cues: [
    'Stand hüftbreit, Knie leicht gebeugt und so lassen.',
    'Po nach hinten schieben, Stange eng an den Beinen nach unten führen.',
    'Rücken gerade, runter bis zur Dehnung hinten im Oberschenkel (ca. Schienbeinmitte).',
    'Mit dem Po nach vorn hochkommen, oben nicht nach hinten lehnen.' ] }),
  'abduktoren': ex('Abduktoren-Maschine', 2, [12, 20], 60, { cues: [
    'Leicht nach vorn lehnen – das trifft den Po mehr.',
    'Kontrolliert nach außen drücken, kurz halten, langsam zurück.' ] }),
  'kabel-crunch': ex('Kabel-Crunch', 3, [10, 15], 60, { isNew: true, cues: [
    'Kniend vor dem Kabelzug, Seil neben dem Kopf halten.',
    'Brustkorb Richtung Becken rollen – der Rücken rundet sich.',
    'Die Hüfte bleibt still, nicht mit den Armen ziehen.' ] }),
  'cross-crunch': ex('Cross-Crunch', 2, [15, 20], 60, { kind: 'body', perSide: true, cues: [
    'Rückenlage, Hände locker am Kopf, nicht am Nacken ziehen.',
    'Ellbogen zum gegenüberliegenden Knie, Schulter vom Boden lösen.' ] }),

  // Tag 2
  'latzug-breit': ex('Latzug breit', 3, [8, 12], 120, { cues: [
    'Griff etwas breiter als schulterbreit, Brust raus.',
    'Stange zur oberen Brust ziehen, Ellbogen nach unten führen.',
    'Langsam zurück, oben die Arme fast strecken.' ] }),
  'kabelrudern': ex('Kabelrudern sitzend', 3, [8, 12], 120, { isNew: true, cues: [
    'Aufrecht sitzen, Knie leicht gebeugt, Füße auf der Platte.',
    'Griff zum Bauchnabel ziehen, Schulterblätter zusammen.',
    'Oberkörper bleibt ruhig – nicht mit Schwung nach hinten lehnen.' ] }),
  'schulterdruecken': ex('Schulterdrücken Kurzhanteln', 3, [8, 12], 120, { step: 1, isNew: true, cues: [
    'Sitzend, Rücken an der Lehne, Hanteln auf Schulterhöhe.',
    'Nach oben drücken, ohne die Hanteln oben zusammenzuschlagen.',
    'Bauch fest, kein Hohlkreuz.' ] }),
  'seitheben': ex('Seitheben', 3, [12, 20], 60, { step: 1, isNew: true, cues: [
    'Leichte Hanteln – Technik vor Gewicht.',
    'Arme seitlich bis Schulterhöhe heben, Ellbogen leicht gebeugt.',
    'Schultern unten lassen, nicht hochziehen. Langsam ablassen.' ] }),
  'butterfly': ex('Butterfly', 2, [10, 15], 90, { cues: [
    'Sitz so einstellen, dass die Griffe auf Brusthöhe sind.',
    'Arme vor der Brust zusammenführen, kurz drücken.',
    'Langsam öffnen bis zur Dehnung in der Brust.' ] }),
  'bizepscurls': ex('Bizepscurls', 2, [10, 15], 60, { step: 1, cues: [
    'Ellbogen bleiben am Körper.',
    'Hoch ohne Schwung, langsam (2–3 Sek.) runter.' ] }),
  'trizeps-seil': ex('Trizeps am Seil', 2, [10, 15], 60, { isNew: true, cues: [
    'Am Kabelzug, Seil oben greifen, Ellbogen am Körper.',
    'Nach unten strecken und das Seil unten leicht auseinanderziehen.',
    'Nur die Unterarme bewegen sich.' ] }),

  // Tag 3
  'beinpresse': ex('Beinpresse (Füße hoch)', 3, [10, 15], 120, { step: 5, cues: [
    'Füße hoch und hüftbreit auf die Platte – mehr Po, weniger vorderer Oberschenkel.',
    'Tief runter, solange der untere Rücken am Polster bleibt.',
    'Knie oben nicht ganz durchstrecken.' ] }),
  'hip-thrust-light': ex('Hip Thrust (leichter)', 3, [12, 15], 120, { step: 5, cues: [
    'Wie an Tag 1, aber mehr Wiederholungen mit etwas weniger Gewicht.',
    'Oben jede Wiederholung 1 Sekunde halten.' ] }),
  'hyperextensions': ex('Hyperextensions (Po-Fokus)', 3, [10, 15], 90, { cues: [
    'Polster unterhalb der Hüftknochen, Füße leicht nach außen gedreht.',
    'Oberen Rücken leicht rund, Blick nach unten.',
    'Mit dem Po hochkommen bis zur Linie mit den Beinen – nicht überstrecken.',
    'Zum Steigern eine Scheibe vor der Brust halten.' ] }),
  'rudern-eng': ex('Rudern eng', 3, [10, 12], 120, { isNew: true, cues: [
    'Am Kabelzug mit engem Griff (V-Griff).',
    'Zum Bauch ziehen, Ellbogen eng am Körper, Schulterblätter zusammen.' ] }),
  'face-pulls': ex('Face Pulls', 2, [12, 20], 60, { isNew: true, cues: [
    'Seil auf Augenhöhe am Kabelzug.',
    'Zum Gesicht ziehen, dabei die Hände nach außen auseinander.',
    'Ellbogen hoch, Schulterblätter zusammen. Leichtes Gewicht.' ] }),
  'beinheben': ex('Beinheben', 2, [10, 15], 60, { kind: 'body', isNew: true, cues: [
    'Rückenlage, Hände unter dem Po, unterer Rücken bleibt am Boden.',
    'Beine gestreckt langsam heben und senken, ohne abzulegen.',
    'Zu schwer? Knie anwinkeln.' ] }),
  'plank': ex('Plank', 2, [30, 60], 60, { kind: 'body', unit: 's', cues: [
    'Unterarme unter den Schultern, Körper eine gerade Linie.',
    'Po und Bauch fest anspannen, nicht durchhängen.' ] }),

  // Zuhause
  'glute-bridge': ex('Glute Bridge mit Mini-Band', 3, [12, 20], 60, { kind: 'band', cues: [
    'Mini-Band über den Knien, Rückenlage, Füße nah am Po.',
    'Hüfte hoch, Knie gegen das Band nach außen drücken.',
    'Oben 2 Sekunden halten. Zu leicht? Einbeinig.' ] }),
  'split-squat': ex('Bulgarian Split Squat', 3, [10, 15], 90, { kind: 'body', perSide: true, isNew: true, cues: [
    'Hinterer Fuß auf Sofa oder Stuhl, vorderer Fuß weit genug vorn.',
    'Oberkörper leicht nach vorn, runter bis das hintere Knie fast den Boden berührt.',
    'Über die vordere Ferse hochdrücken.' ] }),
  'band-rudern': ex('Rudern mit Band', 3, [12, 15], 60, { kind: 'band', cues: [
    'Band im Türanker auf Bauchhöhe oder um die Füße im Sitzen.',
    'Zum Bauch ziehen, Schulterblätter zusammen, 1 Sekunde halten.' ] }),
  'liegestuetze': ex('Liegestütze (Knie oder erhöht)', 3, [5, 15], 90, { kind: 'body', cues: [
    'Hände etwas breiter als die Schultern, Körper gerade.',
    'Brust bis kurz über den Boden, Ellbogen ca. 45° vom Körper.',
    'Zu schwer? Hände auf Sofa oder Tisch.' ] }),
  'band-seitheben': ex('Seitheben mit Band', 3, [15, 20], 60, { kind: 'band', cues: [
    'Auf das Band stellen, Enden in den Händen.',
    'Arme seitlich bis Schulterhöhe, langsam runter.' ] }),
  'band-gehen': ex('Seitliches Gehen mit Mini-Band', 2, [20, 20], 60, { kind: 'band', cues: [
    'Band über den Knien oder Knöcheln, leicht in die Hocke.',
    'Kleine Schritte zur Seite, das Band bleibt immer gespannt.' ] }),
  'dead-bug': ex('Dead Bug', 2, [8, 12], 60, { kind: 'body', perSide: true, isNew: true, cues: [
    'Rückenlage, Arme zur Decke, Knie 90° über der Hüfte.',
    'Gegenüberliegenden Arm und Bein langsam strecken.',
    'Unterer Rücken bleibt die ganze Zeit am Boden.' ] }),

  // Alternatives (used by "Tauschen")
  'glute-bridge-lh': ex('Glute Bridge (Langhantel)', 3, [8, 12], 120, { step: 5, cues: [
    'Wie Hip Thrust, aber mit dem Rücken auf dem Boden.' ] }),
  'goblet-squat': ex('Goblet Squat', 3, [10, 15], 90, { step: 2, cues: [
    'Kurzhantel vor der Brust, Füße schulterbreit.',
    'Tief in die Hocke, Knie Richtung Zehen, Brust aufrecht.' ] }),
  'rdl-kh': ex('Rumänisches Kreuzheben (Kurzhanteln)', 3, [8, 12], 120, { step: 2, cues: [
    'Wie mit Langhantel: Po nach hinten, Hanteln eng an den Beinen.' ] }),
  'beinbeuger': ex('Beinbeuger', 3, [10, 15], 90, { cues: [
    'Polster knapp über den Fersen, Hüfte bleibt am Polster.',
    'Langsam zurück, nicht fallen lassen.' ] }),
  'crunch': ex('Crunch', 3, [15, 20], 60, { kind: 'body', cues: [
    'Schultern vom Boden rollen, unterer Rücken bleibt unten.' ] }),
  'latzug-eng': ex('Latzug eng', 3, [8, 12], 120, { cues: [
    'Enger Griff, zur Brust ziehen, Ellbogen nach unten.' ] }),
  'rudern-maschine': ex('Rudermaschine', 3, [8, 12], 120, { cues: [
    'Brust ans Polster, Griffe zum Körper ziehen, Schulterblätter zusammen.' ] }),
  'kh-rudern': ex('Kurzhantel-Rudern einarmig', 3, [8, 12], 90, { step: 2, perSide: true, cues: [
    'Knie und Hand auf der Bank, Hantel zur Hüfte ziehen.' ] }),
  'schulterpresse': ex('Schulterpresse Maschine', 3, [8, 12], 120, { cues: [
    'Griffe auf Schulterhöhe, nach oben drücken, Rücken an der Lehne.' ] }),
  'seitheben-kabel': ex('Seitheben am Kabel', 3, [12, 20], 60, { step: 1.25, perSide: true, cues: [
    'Kabel unten, mit dem äußeren Arm seitlich bis Schulterhöhe heben.' ] }),
  'brustpresse': ex('Brustpresse', 3, [8, 12], 120, { cues: [
    'Griffe auf Brusthöhe, nach vorn drücken, langsam zurück.' ] }),
  'kabelcurls': ex('Bizepscurls am Kabel', 2, [10, 15], 60, { cues: [
    'Ellbogen am Körper, ohne Schwung curlen.' ] }),
  'trizeps-ueberkopf': ex('Trizeps über Kopf (Kurzhantel)', 2, [10, 15], 60, { step: 1, cues: [
    'Hantel mit beiden Händen hinter dem Kopf, nach oben strecken, Ellbogen nach vorn.' ] }),
  'reverse-butterfly': ex('Reverse Butterfly', 2, [12, 20], 60, { cues: [
    'Brust ans Polster, Arme nach hinten öffnen, Schulterblätter zusammen.' ] }),
};

// "Gerät belegt?" – equivalent swaps per exercise.
export const ALTERNATIVES = {
  'hip-thrust': ['glute-bridge-lh', 'goblet-squat'],
  'hip-thrust-light': ['glute-bridge-lh', 'glute-bridge'],
  'reverse-lunges': ['split-squat', 'goblet-squat'],
  'rdl': ['rdl-kh', 'hyperextensions'],
  'abduktoren': ['band-gehen'],
  'kabel-crunch': ['crunch', 'beinheben'],
  'cross-crunch': ['crunch', 'dead-bug'],
  'latzug-breit': ['latzug-eng'],
  'kabelrudern': ['rudern-maschine', 'kh-rudern'],
  'schulterdruecken': ['schulterpresse'],
  'seitheben': ['seitheben-kabel'],
  'butterfly': ['brustpresse'],
  'bizepscurls': ['kabelcurls'],
  'trizeps-seil': ['trizeps-ueberkopf'],
  'beinpresse': ['goblet-squat', 'split-squat'],
  'hyperextensions': ['rdl-kh', 'beinbeuger'],
  'rudern-eng': ['kabelrudern', 'kh-rudern'],
  'face-pulls': ['reverse-butterfly'],
  'beinheben': ['dead-bug', 'crunch'],
  'plank': ['dead-bug'],
};

// Gym days rotate in this order; "zuhause" replaces a gym day when needed.
export const DAYS = [
  { id: 'tag1', title: 'Unterkörper', subtitle: 'Tag 1 · Po-Fokus', minutes: 55,
    items: ['hip-thrust', 'reverse-lunges', 'rdl', 'abduktoren', 'kabel-crunch', 'cross-crunch'] },
  { id: 'tag2', title: 'Oberkörper', subtitle: 'Tag 2', minutes: 55,
    items: ['latzug-breit', 'kabelrudern', 'schulterdruecken', 'seitheben', 'butterfly', 'bizepscurls', 'trizeps-seil'] },
  { id: 'tag3', title: 'Ganzkörper', subtitle: 'Tag 3', minutes: 55,
    items: ['beinpresse', 'hip-thrust-light', 'hyperextensions', 'rudern-eng', 'seitheben', 'face-pulls', 'beinheben', 'plank'] },
];

export const HOME_DAY = {
  id: 'zuhause', title: 'Zuhause', subtitle: 'Matte & Bänder', minutes: 40,
  items: ['glute-bridge', 'split-squat', 'band-rudern', 'liegestuetze', 'band-seitheben', 'band-gehen', 'dead-bug', 'plank'],
};

export const BANDS = ['leicht', 'mittel', 'stark', 'extra stark'];

export const dayById = (id) => (id === HOME_DAY.id ? HOME_DAY : DAYS.find((d) => d.id === id));

// Next gym day in the rotation, based on the last finished gym workout.
export function nextDay(workouts) {
  const lastGym = [...workouts].reverse().find((w) => w.dayId !== HOME_DAY.id);
  if (!lastGym) return DAYS[0];
  const i = DAYS.findIndex((d) => d.id === lastGym.dayId);
  return DAYS[(i + 1) % DAYS.length];
}

// Sets of an exercise from its most recent workout, or null.
export function lastSets(workouts, id) {
  for (let i = workouts.length - 1; i >= 0; i--) {
    const sets = workouts[i].sets?.[id];
    if (sets?.length) return { sets, date: workouts[i].date };
  }
  return null;
}

// Heaviest set of an exercise in its most recent workout, or null.
export function lastTop(workouts, id) {
  const last = lastSets(workouts, id);
  return last ? last.sets.reduce((a, b) => ((b.kg ?? 0) > (a.kg ?? 0) ? b : a)) : null;
}

// Double progression: once every set reaches the top of the rep range
// (and none felt "am Limit"), the load goes up next time.
export function suggest(id, workouts) {
  const e = EXERCISES[id];
  const [lo, hi] = e.reps;
  const last = lastSets(workouts, id);
  if (!last) {
    return { kg: null, band: null, reps: lo, up: false,
      text: e.kind === 'weight' ? 'Neu: mit leichtem Gewicht starten und die Technik lernen.' : `Ziel: ${lo}–${hi}${e.unit === 's' ? ' Sek.' : ' Wdh.'} pro Satz.` };
  }
  const done = last.sets;
  const allTop = done.length >= e.sets && done.every((s) => s.reps >= hi) && !done.some((s) => s.feel === 'hart');

  if (e.kind === 'weight') {
    const top = Math.max(...done.map((s) => s.kg ?? 0));
    if (allTop) return { kg: round(top + e.step), up: true, text: `Letztes Mal alle Sätze geschafft – heute +${fmt(e.step)} kg.` };
    return { kg: top, up: false, text: `Gleiches Gewicht. Ziel: ${hi} Wdh. in allen Sätzen, dann gibt es mehr.` };
  }
  if (e.kind === 'band') {
    const band = done[done.length - 1].band ?? BANDS[0];
    const i = BANDS.indexOf(band);
    if (allTop && i < BANDS.length - 1) return { band: BANDS[i + 1], up: true, text: `Alle Sätze geschafft – heute das Band „${BANDS[i + 1]}“.` };
    if (allTop) return { band, up: true, text: 'Stärkstes Band geschafft – jetzt 3 Sekunden langsam ablassen.' };
    return { band, up: false, text: `Gleiches Band. Ziel: ${hi} Wdh. in allen Sätzen.` };
  }
  if (allTop) return { up: true, text: e.unit === 's' ? `Alle Sätze geschafft – heute je 10 Sek. länger.` : 'Alle Sätze geschafft – heute langsamer (3 Sek. runter) oder schwerere Variante.' };
  return { up: false, text: `Ziel: ${hi}${e.unit === 's' ? ' Sek.' : ' Wdh.'} in allen Sätzen.` };
}

const round = (n) => Math.round(n * 4) / 4;
const fmt = (n) => String(n).replace('.', ',');
