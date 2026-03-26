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
  '#886633', // marron
  '#888888', // gris
];

const MATH_COLOR_NAMES = [
  'Rouge', 'Orange', 'Jaune', 'Vert', 'Bleu',
  'Violet', 'Rose', 'Bleu clair', 'Marron', 'Gris'
];

/* ----------------------------------------------------------
   Generate math operations based on type & difficulty
   ---------------------------------------------------------- */
function generateMathOperation(type, difficulty) {
  let a, b, result;
  switch (type) {
    case 'addition':
      if (difficulty === 'easy')        { a = rand(1,10);  b = rand(1,10); }
      else if (difficulty === 'medium')  { a = rand(10,50); b = rand(10,50); }
      else                               { a = rand(50,200);b = rand(50,200); }
      result = a + b;
      return { text: `${a} + ${b}`, result };

    case 'subtraction':
      if (difficulty === 'easy')        { a = rand(5,15);  b = rand(1, a); }
      else if (difficulty === 'medium')  { a = rand(20,80); b = rand(1, a); }
      else                               { a = rand(80,300);b = rand(1, a); }
      result = a - b;
      return { text: `${a} - ${b}`, result };

    case 'multiplication':
      if (difficulty === 'easy')        { a = rand(1,5);   b = rand(1,5); }
      else if (difficulty === 'medium')  { a = rand(2,10);  b = rand(2,10); }
      else                               { a = rand(5,15);  b = rand(5,15); }
      result = a * b;
      return { text: `${a} × ${b}`, result };

    case 'division':
      if (difficulty === 'easy')        { b = rand(1,5);   result = rand(1,5); }
      else if (difficulty === 'medium')  { b = rand(2,10);  result = rand(2,10); }
      else                               { b = rand(3,12);  result = rand(3,12); }
      a = b * result;
      return { text: `${a} ÷ ${b}`, result };

    default:
      return generateMathOperation('addition', difficulty);
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ----------------------------------------------------------
   Create a math coloring exercise for a given drawing
   Returns { legend: [{result, color, colorName}], zones: [{zoneId, operation, correctResult, correctColor}] }
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

  // Determine how many distinct results/colors we need (max 8)
  const numColors = Math.min(zoneIds.length, Math.min(MATH_COLORS.length, 8));

  // Generate unique results mapped to colors
  const legend = [];
  const usedResults = new Set();

  for (let i = 0; i < numColors; i++) {
    let op;
    let attempts = 0;
    do {
      op = generateMathOperation(mathType, difficulty);
      attempts++;
    } while (usedResults.has(op.result) && attempts < 50);
    usedResults.add(op.result);
    legend.push({
      result: op.result,
      color: MATH_COLORS[i],
      colorName: MATH_COLOR_NAMES[i]
    });
  }

  // Assign each zone a random legend entry + generate its own operation
  const zones = zoneIds.map(zoneId => {
    const legendIdx = rand(0, legend.length - 1);
    const target = legend[legendIdx];

    // Generate an operation that gives the correct result
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
   Generate an operation that results in a specific value
   ---------------------------------------------------------- */
function generateOperationForResult(type, target, difficulty) {
  switch (type) {
    case 'addition': {
      const a = rand(1, Math.max(1, target - 1));
      const b = target - a;
      return { text: `${a} + ${b}`, result: target };
    }
    case 'subtraction': {
      const b = rand(1, 50);
      const a = target + b;
      return { text: `${a} - ${b}`, result: target };
    }
    case 'multiplication': {
      // Find factor pairs
      const factors = [];
      for (let i = 1; i <= Math.sqrt(target); i++) {
        if (target % i === 0) factors.push([i, target / i]);
      }
      if (factors.length === 0 || target === 0) {
        return { text: `${target} × 1`, result: target };
      }
      const pair = factors[rand(0, factors.length - 1)];
      // Randomly swap order
      return Math.random() > 0.5
        ? { text: `${pair[0]} × ${pair[1]}`, result: target }
        : { text: `${pair[1]} × ${pair[0]}`, result: target };
    }
    case 'division': {
      const b = rand(1, 12);
      const a = target * b;
      return { text: `${a} ÷ ${b}`, result: target };
    }
    default:
      return { text: `${target}`, result: target };
  }
}

/* ----------------------------------------------------------
   Get drawings available for math mode (ones with data-zone)
   ---------------------------------------------------------- */
function getMathCompatibleDrawings() {
  return DRAWINGS.filter(d => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(d.svg, 'image/svg+xml');
    return doc.querySelectorAll('[data-zone]').length >= 3;
  });
}
