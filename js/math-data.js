/* ============================================================
   math-data.js — Math coloring exercise generator
   ============================================================ */

const MATH_COLORS = [
  '#FF4444', // rouge
  '#FF8800', // orange
  '#FFDD00', // jaune
  '#44BB44', // vert
  '#4488FF', // bleu
  '#AA44FF', // violet
  '#FF66AA', // rose
  '#88DDFF', // bleu clair
];

const MATH_COLOR_NAMES = [
  'Rouge', 'Orange', 'Jaune', 'Vert', 'Bleu', 'Violet', 'Rose', 'Bleu clair'
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ----------------------------------------------------------
   Generate a nice result value for the legend, per type+difficulty
   Results are kept small and distinct to be child-friendly
   ---------------------------------------------------------- */
function generateLegendResults(type, difficulty, count) {
  const results = new Set();
  let min, max;

  switch (type) {
    case 'addition':
      if (difficulty === 'easy')        { min = 3;  max = 15; }
      else if (difficulty === 'medium')  { min = 10; max = 40; }
      else                               { min = 30; max = 100; }
      break;
    case 'subtraction':
      if (difficulty === 'easy')        { min = 1;  max = 10; }
      else if (difficulty === 'medium')  { min = 5;  max = 30; }
      else                               { min = 10; max = 60; }
      break;
    case 'multiplication':
      if (difficulty === 'easy')        { min = 2;  max = 12; }
      else if (difficulty === 'medium')  { min = 6;  max = 36; }
      else                               { min = 10; max = 72; }
      break;
    case 'division':
      if (difficulty === 'easy')        { min = 1;  max = 8; }
      else if (difficulty === 'medium')  { min = 2;  max = 12; }
      else                               { min = 3;  max = 15; }
      break;
    default:
      min = 2; max = 15;
  }

  let attempts = 0;
  while (results.size < count && attempts < 200) {
    let val = rand(min, max);
    // For multiplication, prefer non-prime composite numbers
    if (type === 'multiplication' && val > 2) {
      const composites = [];
      for (let n = min; n <= max; n++) {
        if (n > 1 && !isPrime(n)) composites.push(n);
      }
      if (composites.length > 0) {
        val = composites[rand(0, composites.length - 1)];
      }
    }
    results.add(val);
    attempts++;
  }

  return Array.from(results);
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

/* ----------------------------------------------------------
   Generate an operation that gives a specific result
   Adapted to difficulty for clean, readable operations
   ---------------------------------------------------------- */
function generateOperationForResult(type, target, difficulty) {
  switch (type) {
    case 'addition': {
      let a, b;
      if (difficulty === 'easy') {
        a = rand(1, Math.max(1, target - 1));
      } else if (difficulty === 'medium') {
        a = rand(2, Math.max(2, target - 2));
      } else {
        a = rand(10, Math.max(10, target - 5));
      }
      b = target - a;
      if (b < 0) { a = 1; b = target - 1; }
      return { text: a + ' + ' + b, result: target };
    }
    case 'subtraction': {
      let a, b;
      if (difficulty === 'easy') {
        b = rand(1, 8);
      } else if (difficulty === 'medium') {
        b = rand(3, 20);
      } else {
        b = rand(10, 50);
      }
      a = target + b;
      return { text: a + ' - ' + b, result: target };
    }
    case 'multiplication': {
      // Find factor pairs
      const factors = [];
      for (let i = 2; i <= Math.sqrt(target); i++) {
        if (target % i === 0) factors.push([i, target / i]);
      }
      // Always include [1, target] as fallback
      if (factors.length === 0) {
        factors.push([1, target]);
      }
      const pair = factors[rand(0, factors.length - 1)];
      return Math.random() > 0.5
        ? { text: pair[0] + ' x ' + pair[1], result: target }
        : { text: pair[1] + ' x ' + pair[0], result: target };
    }
    case 'division': {
      let b;
      if (difficulty === 'easy') {
        b = rand(2, 5);
      } else if (difficulty === 'medium') {
        b = rand(2, 10);
      } else {
        b = rand(3, 12);
      }
      const a = target * b;
      return { text: a + ' : ' + b, result: target };
    }
    default:
      return { text: '' + target, result: target };
  }
}

/* ----------------------------------------------------------
   Create a math coloring exercise for a given drawing
   ---------------------------------------------------------- */
function generateMathExercise(drawingId, mathType, difficulty) {
  const drawing = DRAWINGS.find(d => d.id === drawingId);
  if (!drawing) return null;

  // Parse zones from the SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(drawing.svg, 'image/svg+xml');
  const zoneElements = doc.querySelectorAll('[data-zone]');
  const zoneIds = [];
  zoneElements.forEach(el => {
    const z = el.getAttribute('data-zone');
    if (!zoneIds.includes(z)) zoneIds.push(z);
  });

  if (zoneIds.length === 0) return null;

  // Limit colors: max 6 for easy, 7 for medium, 8 for hard
  const maxColors = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 6 : 7;
  const numColors = Math.min(zoneIds.length, Math.min(MATH_COLORS.length, maxColors));

  // Generate distinct result values for the legend
  const results = generateLegendResults(mathType, difficulty, numColors);
  const legend = results.map((r, i) => ({
    result: r,
    color: MATH_COLORS[i],
    colorName: MATH_COLOR_NAMES[i]
  }));

  // Assign each zone a legend entry + generate its own unique operation
  const zones = zoneIds.map(zoneId => {
    const legendIdx = rand(0, legend.length - 1);
    const target = legend[legendIdx];
    const op = generateOperationForResult(mathType, target.result, difficulty);

    return {
      zoneId,
      operation: op.text,
      correctResult: target.result,
      correctColor: target.color,
      correctColorName: target.colorName
    };
  });

  return { legend, zones };
}

/* ----------------------------------------------------------
   Get drawings available for math mode (with enough zones)
   ---------------------------------------------------------- */
function getMathCompatibleDrawings() {
  return DRAWINGS.filter(d => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(d.svg, 'image/svg+xml');
    return doc.querySelectorAll('[data-zone]').length >= 4;
  });
}
