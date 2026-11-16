// Built-in food table and a small German text parser.
// Values are per 100 g (or 100 ml): [kcal, protein, fat]. `g` is one typical
// portion in grams, `unit` how that portion is called. Rough on purpose.

const F = (id, name, names, per100, g, unit, extra = {}) => ({ id, name, names, per100, g, unit, ...extra });

export const FOODS = [
  // Eier & Milchprodukte
  F('ei', 'Ei', ['ei', 'eier', 'spiegelei', 'spiegeleier', 'gekochtes ei', 'gekochte eier'], [155, 13, 11], 60, 'Stück'),
  F('ruehrei', 'Rührei', ['rührei', 'ruehrei', 'omelett', 'omelette'], [180, 12, 14], 130, 'Portion'),
  F('milch', 'Milch', ['milch', 'kuhmilch', 'hafermilch', 'haferdrink'], [60, 3.4, 3.3], 200, 'Glas', { side: 30 }),
  F('skyr', 'Skyr', ['skyr'], [63, 11, 0.2], 150, 'Portion'),
  F('magerquark', 'Magerquark', ['magerquark', 'quark', 'speisequark'], [67, 12, 0.3], 250, 'Becher'),
  F('joghurt', 'Joghurt', ['joghurt', 'jogurt', 'naturjoghurt'], [65, 4, 3.5], 150, 'Portion'),
  F('griech-joghurt', 'Griechischer Joghurt', ['griechischer joghurt', 'griechischen joghurt', 'griechischer jogurt'], [120, 4, 10], 150, 'Portion'),
  F('huettenkaese', 'Hüttenkäse', ['hüttenkäse', 'huettenkaese', 'körniger frischkäse', 'cottage cheese'], [98, 12, 4], 200, 'Becher'),
  F('kaese', 'Käse', ['käse', 'kaese', 'gouda', 'emmentaler', 'cheddar', 'käsescheibe', 'käsescheiben'], [356, 25, 27], 25, 'Scheibe'),
  F('mozzarella', 'Mozzarella', ['mozzarella', 'burrata'], [250, 18, 19], 125, 'Kugel'),
  F('feta', 'Feta', ['feta', 'schafskäse', 'hirtenkäse'], [260, 17, 21], 50, 'Portion'),
  F('frischkaese', 'Frischkäse', ['frischkäse', 'frischkaese', 'philadelphia'], [250, 6, 23], 30, 'Portion'),
  F('butter', 'Butter', ['butter', 'margarine'], [740, 0.7, 82], 10, 'Portion'),
  F('proteinshake', 'Proteinshake', ['proteinshake', 'protein shake', 'eiweißshake', 'eiweissshake', 'shake', 'whey'], [400, 80, 5], 30, 'Shake'),
  F('proteinriegel', 'Proteinriegel', ['proteinriegel', 'protein riegel', 'eiweißriegel'], [360, 33, 12], 60, 'Stück'),
  F('proteinpudding', 'Proteinpudding', ['proteinpudding', 'protein pudding', 'high protein pudding'], [75, 10, 1.5], 200, 'Becher'),

  // Brot & Getreide
  F('toast', 'Toast', ['toast', 'toasts', 'toastie', 'toasties', 'toastbrot', 'toastscheibe', 'toastscheiben'], [260, 8, 3.5], 25, 'Scheibe'),
  F('vollkorntoast', 'Vollkorntoast', ['vollkorntoast'], [250, 9, 4], 28, 'Scheibe'),
  F('broetchen', 'Brötchen', ['brötchen', 'broetchen', 'semmel', 'semmeln', 'schrippe', 'schrippen', 'weckle', 'baguette'], [270, 9, 1.5], 60, 'Stück'),
  F('vk-broetchen', 'Vollkornbrötchen', ['vollkornbrötchen', 'körnerbrötchen', 'dinkelbrötchen'], [250, 10, 3], 70, 'Stück'),
  F('brot', 'Brot', ['brot', 'vollkornbrot', 'graubrot', 'brotscheibe', 'scheibe brot', 'sauerteigbrot'], [230, 8, 1.5], 50, 'Scheibe'),
  F('knaecke', 'Knäckebrot', ['knäckebrot', 'knäcke'], [360, 10, 2], 10, 'Scheibe'),
  F('croissant', 'Croissant', ['croissant', 'croissants', 'buttercroissant'], [410, 8, 21], 60, 'Stück'),
  F('brezel', 'Brezel', ['brezel', 'brezeln', 'breze', 'laugenbrezel', 'laugenbrötchen'], [270, 8, 2], 80, 'Stück'),
  F('haferflocken', 'Haferflocken', ['haferflocken', 'porridge', 'oatmeal', 'overnight oats', 'haferbrei'], [370, 13, 7], 50, 'Portion'),
  F('muesli', 'Müsli', ['müsli', 'muesli', 'cornflakes', 'cerealien'], [370, 9, 8], 60, 'Portion'),
  F('granola', 'Granola', ['granola', 'knuspermüsli', 'crunchy'], [450, 9, 18], 50, 'Portion'),
  F('reiswaffel', 'Reiswaffel', ['reiswaffel', 'reiswaffeln'], [390, 8, 3], 8, 'Stück'),
  F('nudeln', 'Nudeln', ['nudeln', 'pasta', 'spaghetti', 'penne', 'fusilli', 'tagliatelle', 'makkaroni'], [150, 5, 1], 250, 'Portion'),
  F('reis', 'Reis', ['reis', 'basmatireis', 'jasminreis', 'milchreis'], [130, 2.7, 0.3], 200, 'Portion'),
  F('kartoffeln', 'Kartoffeln', ['kartoffeln', 'kartoffel', 'salzkartoffeln', 'pellkartoffeln', 'süßkartoffel', 'süßkartoffeln'], [80, 2, 0.1], 250, 'Portion'),
  F('kartoffelsalat', 'Kartoffelsalat', ['kartoffelsalat', 'nudelsalat', 'reissalat'], [150, 2.5, 9], 200, 'Portion'),
  F('pommes', 'Pommes', ['pommes', 'pommes frites', 'fritten', 'wedges'], [290, 3.4, 15], 150, 'Portion'),
  F('bratkartoffeln', 'Bratkartoffeln', ['bratkartoffeln'], [150, 2.5, 7], 200, 'Portion'),
  F('pueree', 'Kartoffelpüree', ['kartoffelpüree', 'püree', 'kartoffelbrei'], [100, 2, 4], 200, 'Portion'),
  F('couscous', 'Couscous', ['couscous', 'bulgur', 'quinoa'], [115, 4, 1], 200, 'Portion'),
  F('wrap', 'Wrap', ['wrap', 'wraps', 'tortilla', 'tortillas'], [300, 8, 7], 60, 'Stück'),

  // Fleisch, Fisch & Co.
  F('haehnchen', 'Hähnchen', ['hähnchen', 'haehnchen', 'hähnchenbrust', 'hühnchen', 'huhn', 'hühnerbrust', 'chicken', 'hähnchenfilet'], [120, 23, 2], 150, 'Portion'),
  F('pute', 'Pute', ['pute', 'putenbrust', 'putenfilet', 'putenschnitzel'], [110, 24, 1.5], 150, 'Portion'),
  F('steak', 'Steak', ['steak', 'rindersteak', 'rumpsteak', 'rinderfilet', 'rindfleisch'], [160, 22, 7], 200, 'Portion'),
  F('hack', 'Hackfleisch', ['hackfleisch', 'hack', 'rinderhack', 'gehacktes', 'frikadelle', 'frikadellen', 'bulette', 'buletten'], [240, 19, 18], 125, 'Portion'),
  F('schnitzel', 'Schnitzel', ['schnitzel', 'wiener schnitzel', 'schweineschnitzel', 'paniertes schnitzel'], [220, 18, 12], 180, 'Stück'),
  F('schwein', 'Schweinefleisch', ['schweinefleisch', 'schweinefilet', 'kotelett', 'schweinesteak'], [150, 22, 6], 150, 'Portion'),
  F('bratwurst', 'Bratwurst', ['bratwurst', 'bratwürste', 'grillwurst', 'rostbratwurst'], [300, 13, 27], 100, 'Stück'),
  F('wuerstchen', 'Würstchen', ['würstchen', 'wiener', 'wienerle', 'frankfurter', 'würstel'], [260, 12, 23], 50, 'Stück'),
  F('currywurst', 'Currywurst', ['currywurst'], [250, 10, 18], 200, 'Portion'),
  F('salami', 'Salami', ['salami', 'chorizo', 'pepperoni'], [380, 22, 32], 10, 'Scheibe'),
  F('schinken', 'Schinken', ['schinken', 'kochschinken', 'putenaufschnitt', 'aufschnitt', 'serrano'], [110, 19, 3], 20, 'Scheibe'),
  F('lachs', 'Lachs', ['lachs', 'lachsfilet', 'räucherlachs'], [200, 20, 13], 125, 'Portion'),
  F('thunfisch', 'Thunfisch', ['thunfisch', 'thunfischdose'], [110, 25, 1], 130, 'Dose'),
  F('fisch', 'Fisch', ['fisch', 'fischfilet', 'kabeljau', 'seelachs', 'forelle'], [90, 19, 1], 150, 'Portion'),
  F('garnelen', 'Garnelen', ['garnelen', 'shrimps', 'scampi', 'gambas'], [90, 19, 1], 100, 'Portion'),
  F('fischstaebchen', 'Fischstäbchen', ['fischstäbchen'], [200, 12, 9], 30, 'Stück'),
  F('tofu', 'Tofu', ['tofu', 'räuchertofu', 'tempeh'], [120, 13, 7], 150, 'Portion'),
  F('linsen', 'Linsen', ['linsen', 'linsensuppe', 'dal'], [115, 9, 0.5], 200, 'Portion'),
  F('kichererbsen', 'Kichererbsen', ['kichererbsen', 'bohnen', 'kidneybohnen', 'hummus'], [140, 7, 3], 150, 'Portion'),

  // Fertige Gerichte (grob)
  F('doener', 'Döner', ['döner', 'doener', 'dürüm', 'dönerbox'], [200, 10, 8.5], 350, 'Stück'),
  F('burger', 'Burger', ['burger', 'hamburger', 'cheeseburger'], [250, 13, 11], 250, 'Stück'),
  F('pizza', 'Pizza', ['pizza', 'pizzen'], [250, 10, 10], 350, 'Pizza'),
  F('pizzastueck', 'Stück Pizza', ['stück pizza', 'pizzastück', 'pizzaecke', 'pizza ecke'], [250, 10, 10], 90, 'Stück'),
  F('lasagne', 'Lasagne', ['lasagne', 'auflauf', 'nudelauflauf'], [150, 8, 8], 350, 'Portion'),
  F('bolognese', 'Spaghetti Bolognese', ['bolognese', 'spaghetti bolognese', 'spaghetti bolo'], [140, 7, 5], 450, 'Teller'),
  F('sushi', 'Sushi', ['sushi', 'maki', 'nigiri', 'sushirolle'], [150, 5, 2], 30, 'Stück'),
  F('bowl', 'Bowl', ['bowl', 'poke', 'pokebowl', 'buddha bowl'], [140, 8, 5], 450, 'Bowl'),
  F('suppe', 'Suppe', ['suppe', 'eintopf', 'gemüsesuppe'], [60, 3, 2], 350, 'Teller'),
  F('curry', 'Curry mit Reis', ['curry', 'thai curry', 'chili con carne', 'chili'], [140, 7, 6], 450, 'Teller'),
  F('salat-dressing', 'Salat mit Dressing', ['salat mit dressing', 'gemischter salat', 'caesar salad'], [90, 3, 7], 250, 'Schüssel'),
  F('sandwich', 'Sandwich', ['sandwich', 'belegtes brötchen', 'stulle', 'bagel'], [240, 11, 9], 180, 'Stück'),

  // Gemüse & Obst
  F('salat', 'Salat', ['salat', 'blattsalat', 'rucola', 'eisbergsalat', 'feldsalat'], [15, 1.3, 0.2], 100, 'Portion'),
  F('gemuese', 'Gemüse', ['gemüse', 'gemuese', 'zucchini', 'möhren', 'karotten', 'karotte', 'pilze', 'champignons', 'spinat', 'blumenkohl', 'erbsen', 'mais'], [35, 2, 0.4], 200, 'Portion'),
  F('brokkoli', 'Brokkoli', ['brokkoli', 'broccoli'], [35, 3, 0.4], 200, 'Portion'),
  F('tomate', 'Tomate', ['tomate', 'tomaten', 'cherrytomaten'], [18, 0.9, 0.2], 100, 'Stück'),
  F('gurke', 'Gurke', ['gurke', 'gurken'], [15, 0.6, 0.1], 100, 'Portion'),
  F('paprika', 'Paprika', ['paprika', 'paprikaschote'], [30, 1, 0.3], 150, 'Stück'),
  F('avocado', 'Avocado', ['avocado', 'avocados', 'guacamole'], [160, 2, 15], 140, 'Stück'),
  F('apfel', 'Apfel', ['apfel', 'äpfel', 'birne', 'birnen'], [52, 0.3, 0.2], 180, 'Stück'),
  F('banane', 'Banane', ['banane', 'bananen'], [89, 1.1, 0.3], 120, 'Stück'),
  F('orange', 'Orange', ['orange', 'orangen', 'mandarine', 'mandarinen', 'clementine', 'kiwi'], [47, 0.9, 0.1], 150, 'Stück'),
  F('beeren', 'Beeren', ['beeren', 'heidelbeeren', 'blaubeeren', 'himbeeren', 'erdbeeren', 'beerenmix'], [45, 1, 0.3], 125, 'Portion'),
  F('trauben', 'Weintrauben', ['weintrauben', 'trauben'], [70, 0.7, 0.2], 125, 'Portion'),
  F('obst', 'Obst', ['obst', 'obstsalat', 'mango', 'ananas', 'melone', 'wassermelone'], [55, 0.7, 0.2], 150, 'Portion'),

  // Snacks & Süßes
  F('nuesse', 'Nüsse', ['nüsse', 'nuesse', 'mandeln', 'walnüsse', 'cashews', 'cashewkerne', 'erdnüsse', 'haselnüsse', 'studentenfutter'], [600, 20, 52], 30, 'Handvoll'),
  F('erdnussbutter', 'Erdnussbutter', ['erdnussbutter', 'erdnussmus', 'mandelmus', 'peanut butter'], [600, 25, 50], 15, 'EL'),
  F('nutella', 'Nutella', ['nutella', 'nussnougatcreme'], [540, 6, 31], 15, 'EL'),
  F('honig', 'Honig', ['honig', 'marmelade', 'konfitüre', 'sirup', 'ahornsirup'], [290, 0.4, 0], 20, 'EL'),
  F('schokolade', 'Schokolade', ['schokolade', 'schoki', 'schokoriegel', 'snickers', 'mars', 'twix', 'kitkat'], [520, 6, 28], 30, 'Portion'),
  F('chips', 'Chips', ['chips', 'nachos', 'flips', 'salzstangen'], [530, 6, 32], 50, 'Portion'),
  F('gummibaerchen', 'Gummibärchen', ['gummibärchen', 'gummibaerchen', 'haribo', 'fruchtgummi', 'süßigkeiten'], [340, 7, 0.5], 50, 'Portion'),
  F('keks', 'Keks', ['keks', 'kekse', 'cookie', 'cookies', 'plätzchen'], [480, 6, 22], 15, 'Stück'),
  F('kuchen', 'Kuchen', ['kuchen', 'torte', 'käsekuchen', 'brownie', 'brownies', 'waffel', 'waffeln'], [350, 5, 17], 120, 'Stück'),
  F('muffin', 'Muffin', ['muffin', 'muffins', 'donut', 'donuts', 'berliner', 'zimtschnecke'], [420, 6, 20], 90, 'Stück'),
  F('eis', 'Eis', ['eis', 'eiscreme', 'speiseeis', 'eiskugel', 'kugel eis', 'kugeln eis'], [200, 3, 10], 60, 'Kugel'),
  F('muesliriegel', 'Müsliriegel', ['müsliriegel', 'muesliriegel', 'fruchtriegel'], [420, 6, 15], 25, 'Stück'),
  F('pudding', 'Pudding', ['pudding', 'grießbrei', 'dessert'], [110, 3, 3], 150, 'Becher'),

  // Getränke
  F('kaffee', 'Kaffee', ['kaffee', 'espresso', 'americano', 'filterkaffee', 'tee', 'grüner tee'], [2, 0.1, 0], 200, 'Tasse', { drink: true }),
  F('cappuccino', 'Cappuccino', ['cappuccino', 'cappucino', 'flat white', 'milchkaffee'], [40, 2.2, 2], 200, 'Tasse', { drink: true }),
  F('latte', 'Latte Macchiato', ['latte macchiato', 'latte', 'chai latte', 'matcha latte'], [50, 2.7, 2.7], 300, 'Glas', { drink: true }),
  F('cola', 'Cola / Limo', ['cola', 'limo', 'limonade', 'fanta', 'sprite', 'eistee', 'energy', 'redbull', 'red bull'], [42, 0, 0], 330, 'Glas', { drink: true }),
  F('cola-zero', 'Cola Zero / Light', ['cola zero', 'coke zero', 'cola light', 'pepsi max', 'zero'], [0.3, 0, 0], 330, 'Glas', { drink: true }),
  F('saft', 'Saft', ['saft', 'orangensaft', 'apfelsaft', 'apfelschorle', 'schorle', 'smoothie'], [45, 0.6, 0.2], 250, 'Glas', { drink: true }),
  F('bier', 'Bier', ['bier', 'biere', 'pils', 'radler', 'weizen', 'helles'], [43, 0.5, 0], 500, 'Flasche', { drink: true }),
  F('wein', 'Wein', ['wein', 'weißwein', 'rotwein', 'rosé', 'rose', 'weinschorle'], [83, 0.1, 0], 200, 'Glas', { drink: true }),
  F('sekt', 'Sekt', ['sekt', 'prosecco', 'champagner', 'hugo'], [80, 0.2, 0], 150, 'Glas', { drink: true }),
  F('aperol', 'Aperol Spritz', ['aperol', 'aperol spritz', 'spritz', 'lillet'], [70, 0, 0], 250, 'Glas', { drink: true }),
  F('cocktail', 'Cocktail / Longdrink', ['cocktail', 'cocktails', 'longdrink', 'gin tonic', 'cuba libre', 'mojito', 'wodka e'], [100, 0, 0], 250, 'Glas', { drink: true }),
  F('shot', 'Shot', ['shot', 'shots', 'schnaps', 'kurzer', 'tequila', 'jägermeister'], [230, 0, 0], 20, 'Shot', { drink: true }),
  F('wasser', 'Wasser', ['wasser', 'sprudel', 'mineralwasser'], [0, 0, 0], 300, 'Glas', { drink: true }),

  // Fette & Saucen
  F('oel', 'Öl', ['öl', 'oel', 'olivenöl', 'rapsöl'], [884, 0, 100], 10, 'EL'),
  F('mayo', 'Mayo', ['mayo', 'mayonnaise', 'remoulade', 'aioli'], [680, 1, 75], 15, 'EL'),
  F('ketchup', 'Ketchup', ['ketchup', 'senf', 'bbq sauce', 'sojasauce'], [100, 1.2, 0.1], 15, 'EL'),
  F('pesto', 'Pesto', ['pesto'], [450, 5, 45], 30, 'Portion'),
  F('dressing', 'Dressing', ['dressing', 'salatdressing', 'vinaigrette'], [300, 1, 30], 30, 'Portion'),
  F('sahne', 'Sahne', ['sahne', 'schlagsahne', 'schmand', 'saure sahne', 'creme fraiche'], [300, 2.5, 30], 30, 'Portion', { side: 30 }),
];

// For entries the table doesn't know: pick a size.
export const GENERIC = [
  { id: 'gen-snack', name: 'Snack', kcal: 150, protein: 5, fat: 6 },
  { id: 'gen-klein', name: 'Kleine Mahlzeit', kcal: 400, protein: 20, fat: 15 },
  { id: 'gen-mittel', name: 'Normale Mahlzeit', kcal: 650, protein: 30, fat: 25 },
  { id: 'gen-gross', name: 'Große Mahlzeit', kcal: 900, protein: 40, fat: 35 },
];

// ---------- parsing ----------

const NUMBER_WORDS = {
  ein: 1, eine: 1, einen: 1, einem: 1, einer: 1, eins: 1,
  zwei: 2, drei: 3, vier: 4, fünf: 5, fuenf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10,
  halb: 0.5, halbe: 0.5, halben: 0.5, halber: 0.5, halbes: 0.5, anderthalb: 1.5, eineinhalb: 1.5,
  paar: 2, doppelt: 2, doppelte: 2,
};

// Units that set a gram amount directly.
const GRAM_UNITS = {
  g: 1, gr: 1, gramm: 1, kg: 1000, ml: 1, l: 1000, liter: 1000, cl: 10,
  el: 15, esslöffel: 15, essloeffel: 15, tl: 5, teelöffel: 5, teeloeffel: 5,
};
// Units that just count portions of the food.
const COUNT_UNITS = new Set(['stück', 'stueck', 'stk', 'scheibe', 'scheiben', 'portion', 'portionen', 'teller', 'schüssel', 'schale',
  'handvoll', 'becher', 'glas', 'gläser', 'tasse', 'tassen', 'dose', 'dosen', 'flasche', 'flaschen', 'kugel', 'kugeln', 'riegel', 'packung', 'pack', 'tüte', 'bowl']);
const SIZE_WORDS = { klein: 0.7, kleine: 0.7, kleinen: 0.7, kleiner: 0.7, kleines: 0.7, groß: 1.4, große: 1.4, großen: 1.4, großer: 1.4, großes: 1.4, gross: 1.4, grosse: 1.4, riesig: 1.8, riesige: 1.8 };
const FILLER = new Set(['ich', 'habe', 'hab', 'hatte', 'gegessen', 'getrunken', 'heute', 'morgens', 'mittags', 'abends', 'zum', 'zu', 'frühstück', 'mittag', 'mittagessen',
  'abendessen', 'abend', 'noch', 'etwas', 'bisschen', 'so', 'dann', 'auch', 'danach', 'vorher', 'snack', 'als', 'von', 'vom', 'der', 'die', 'das', 'den', 'dem', 'mir', 'gab',
  'es', 'eben', 'gerade', 'ca', 'circa', 'ungefähr', 'etwa', 'paar', 'mal', 'nur', 'bei', 'im', 'am', 'in', 'auf', 'aus', 'an', 'vom', 'beim', 'kleinen', 'großen', 'leckeren', 'leckere', 'lecker']);

export const norm = (s) => s.toLowerCase().replace(/ß/g, 'ß').replace(/[.!?"()]/g, ' ').replace(/\s+/g, ' ').trim();

// Longest alias first, so "griechischer joghurt" wins over "joghurt".
let ALIASES = null;
function aliases() {
  if (!ALIASES) {
    ALIASES = FOODS.flatMap((f) => f.names.map((n) => ({ n: norm(n), f }))).sort((a, b) => b.n.length - a.n.length);
  }
  return ALIASES;
}

function findFood(chunk, own) {
  // Own dishes by name first.
  for (const d of [...own].sort((a, b) => b.name.length - a.name.length)) {
    const n = norm(d.name);
    if (n.length >= 3 && (` ${chunk} `).includes(` ${n} `)) return { own: d, match: n };
  }
  const words = chunk.split(' ');
  for (const { n, f } of aliases()) {
    if ((` ${chunk} `).includes(` ${n} `)) return { food: f, match: n };
  }
  // Loose: a word that starts with an alias (e.g. "hähnchenbrustfilet").
  for (const { n, f } of aliases()) {
    if (n.length >= 4 && !n.includes(' ') && words.some((w) => w.startsWith(n) && w.length - n.length <= 6)) {
      return { food: f, match: words.find((w) => w.startsWith(n)) };
    }
  }
  return null;
}

function parseAmount(words) {
  let count = null; let grams = null; let size = 1; let unit = null;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const num = w.match(/^(\d+(?:[.,]\d+)?)(g|gr|ml|l|kg)?$/);
    const frac = w.match(/^(\d+)\/(\d+)$/);
    if (num || frac || NUMBER_WORDS[w] != null || w === '½') {
      let n = num ? parseFloat(num[1].replace(',', '.')) : frac ? Number(frac[1]) / Number(frac[2]) : w === '½' ? 0.5 : NUMBER_WORDS[w];
      if (w === 'paar' && words[i - 1] === 'ein') n = 2;
      const glued = num?.[2];
      const next = words[i + 1];
      if (glued) { grams = n * GRAM_UNITS[glued]; unit = glued; }
      else if (next && GRAM_UNITS[next] != null) { grams = n * GRAM_UNITS[next]; unit = next; }
      else { count = (count ?? 1) * n; if (next && COUNT_UNITS.has(next)) unit = next; }
      if (grams != null) break;
    } else if (SIZE_WORDS[w]) {
      size = SIZE_WORDS[w];
    } else if (GRAM_UNITS[w] != null && count == null && grams == null) {
      grams = GRAM_UNITS[w]; unit = w; // "ein EL" handled above; bare "EL Öl" = 1 EL
    }
  }
  return { count, grams, size, unit };
}

const fmtNum = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

export function amountLabel(item) {
  if (item.grams != null && item.byGrams) return `${fmtNum(item.grams)} ${item.food?.drink ? 'ml' : 'g'}`;
  const c = item.count;
  const size = item.size > 1.2 ? 'groß' : item.size < 0.8 ? 'klein' : '';
  const plural = { Scheibe: 'Scheiben', Kugel: 'Kugeln', Tasse: 'Tassen', Flasche: 'Flaschen', Dose: 'Dosen', Portion: 'Portionen', Schüssel: 'Schüsseln', Glas: 'Gläser', Becher: 'Becher', Shake: 'Shakes', Bowl: 'Bowls', Pizza: 'Pizzen', Teller: 'Teller' };
  const unit = c > 1 ? plural[item.unit] ?? item.unit : item.unit;
  return `${fmtNum(c)} ${unit}${size ? ` (${size})` : ''}`;
}

// Recalculate kcal/protein/fat of a parsed item from its amount.
export function compute(item) {
  if (item.own) {
    const k = item.count * item.size;
    return { ...item, kcal: item.own.kcal * k, protein: item.own.protein * k, fat: item.own.fat * k };
  }
  if (item.generic) return { ...item, kcal: item.generic.kcal * item.count, protein: item.generic.protein * item.count, fat: item.generic.fat * item.count };
  const grams = item.byGrams ? item.grams : item.count * item.food.g * item.size;
  const [k, p, f] = item.food.per100;
  return { ...item, grams, kcal: (k * grams) / 100, protein: (p * grams) / 100, fat: (f * grams) / 100 };
}

// "2 Eier, 2 Toast und ein Kaffee mit Milch" -> list of items.
export function parse(text, own = []) {
  const items = [];
  const parts = norm(text).split(/\s*(?:,|;|\+|&|\bund\b|\bmit\b|\bdazu\b|\bsowie\b|\bplus\b|\n)\s*/);
  let prev = null;
  for (const part of parts) {
    if (!part) continue;
    const words = part.split(' ').filter(Boolean);
    const hit = findFood(part, own);
    const amt = parseAmount(words);

    if (hit?.own) {
      items.push(compute({ own: hit.own, name: hit.own.name, unit: 'Portion', count: amt.count ?? 1, size: amt.size, source: part }));
      prev = null;
      continue;
    }
    if (hit) {
      const f = hit.food;
      let byGrams = amt.grams != null;
      let grams = amt.grams;
      let count = amt.count ?? 1;
      // "Kaffee mit Milch": just a splash.
      if (!byGrams && amt.count == null && f.side && prev?.drink) { byGrams = true; grams = f.side; }
      items.push(compute({ food: f, name: f.name, unit: f.unit, count, size: amt.size, byGrams, grams, source: part }));
      prev = f;
      continue;
    }
    const rest = words.filter((w) => !FILLER.has(w) && NUMBER_WORDS[w] == null && !/^\d/.test(w) && GRAM_UNITS[w] == null && !COUNT_UNITS.has(w));
    if (rest.length) items.push({ unknown: true, name: rest.join(' '), source: part, count: 1, size: 1, kcal: 0, protein: 0, fat: 0 });
    prev = null;
  }
  return items;
}

export function sum(items) {
  return items.reduce((a, i) => ({ kcal: a.kcal + (i.kcal || 0), protein: a.protein + (i.protein || 0), fat: a.fat + (i.fat || 0) }), { kcal: 0, protein: 0, fat: 0 });
}
