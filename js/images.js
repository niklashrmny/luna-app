// Start/end photos per exercise from free-exercise-db (github.com/yuhonas/free-exercise-db),
// released into the public domain (Unlicense). Files live in img/ex/<name>-0.jpg / -1.jpg.
// Some home/alternative exercises reuse the closest matching movement.

export const IMAGES = {
  'hip-thrust': 'Barbell_Hip_Thrust',
  'hip-thrust-light': 'Barbell_Hip_Thrust',
  'reverse-lunges': 'Dumbbell_Rear_Lunge',
  'rdl': 'Romanian_Deadlift',
  'abduktoren': 'Thigh_Abductor',
  'kabel-crunch': 'Cable_Crunch',
  'cross-crunch': 'Cross-Body_Crunch',
  'latzug-breit': 'Wide-Grip_Lat_Pulldown',
  'kabelrudern': 'Seated_Cable_Rows',
  'schulterdruecken': 'Dumbbell_Shoulder_Press',
  'seitheben': 'Side_Lateral_Raise',
  'butterfly': 'Butterfly',
  'bizepscurls': 'Dumbbell_Bicep_Curl',
  'trizeps-seil': 'Triceps_Pushdown_-_Rope_Attachment',
  'beinpresse': 'Leg_Press',
  'hyperextensions': 'Hyperextensions_Back_Extensions',
  'rudern-eng': 'Seated_Cable_Rows',
  'face-pulls': 'Face_Pull',
  'beinheben': 'Flat_Bench_Lying_Leg_Raise',
  'plank': 'Plank',
  'glute-bridge': 'Single_Leg_Glute_Bridge',
  'split-squat': 'Split_Squat_with_Dumbbells',
  'band-rudern': 'Seated_Cable_Rows',
  'liegestuetze': 'Pushups',
  'band-seitheben': 'Lateral_Raise_-_With_Bands',
  'band-gehen': 'Monster_Walk',
  'dead-bug': 'Dead_Bug',
  'glute-bridge-lh': 'Barbell_Glute_Bridge',
  'goblet-squat': 'Goblet_Squat',
  'rdl-kh': 'Stiff-Legged_Dumbbell_Deadlift',
  'beinbeuger': 'Seated_Leg_Curl',
  'crunch': 'Crunches',
  'latzug-eng': 'Close-Grip_Front_Lat_Pulldown',
  'rudern-maschine': 'Seated_Cable_Rows',
  'kh-rudern': 'One-Arm_Dumbbell_Row',
  'schulterpresse': 'Leverage_Shoulder_Press',
  'seitheben-kabel': 'Cable_Seated_Lateral_Raise',
  'brustpresse': 'Leverage_Chest_Press',
  'kabelcurls': 'Standing_Biceps_Cable_Curl',
  'trizeps-ueberkopf': 'Dumbbell_One-Arm_Triceps_Extension',
  'reverse-butterfly': 'Reverse_Machine_Flyes',
};

export const imagePaths = (id) => {
  const n = IMAGES[id];
  return n ? [`img/ex/${n}-0.jpg`, `img/ex/${n}-1.jpg`] : null;
};
