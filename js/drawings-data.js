/* ============================================================
   drawings-data.js — SVG drawings & categories database
   ============================================================ */

const CATEGORIES = [
  { id: 'enfants',      name: 'Enfants',       icon: '👶', description: 'Dessins simples pour les petits' },
  { id: 'debutant',     name: 'Débutant',      icon: '🎓', description: 'Idéal pour commencer' },
  { id: 'animaux',      name: 'Animaux',       icon: '🐾', description: 'Chat, chien, lion...' },
  { id: 'ecole',        name: 'École',         icon: '🏫', description: 'Thèmes scolaires' },
  { id: 'super-heros',  name: 'Super-héros',   icon: '🦸', description: 'Héros originaux' }
];

/* ----------------------------------------------------------
   SVG helpers
   ---------------------------------------------------------- */
function svgWrap(inner, vb = '0 0 400 400') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="400" height="400">${inner}</svg>`;
}

/* ----------------------------------------------------------
   Animal SVGs — thick strokes, closed regions, child-friendly
   ---------------------------------------------------------- */
const SVG_CAT = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- body top -->
    <ellipse data-zone="body-top" cx="200" cy="240" rx="100" ry="50" fill="white"/>
    <!-- body bottom -->
    <ellipse data-zone="body-bottom" cx="200" cy="300" rx="100" ry="50" fill="white"/>
    <!-- head -->
    <circle data-zone="head" cx="200" cy="140" r="75" fill="white"/>
    <!-- forehead spot -->
    <circle data-zone="forehead" cx="200" cy="105" r="22" fill="white"/>
    <!-- ears -->
    <polygon data-zone="ear-left" points="145,80 120,25 175,60" fill="white"/>
    <polygon data-zone="ear-right" points="255,80 280,25 225,60" fill="white"/>
    <!-- inner ears -->
    <polygon data-zone="ear-inner-left" points="147,75 132,42 167,63" fill="white"/>
    <polygon data-zone="ear-inner-right" points="253,75 268,42 233,63" fill="white"/>
    <!-- cheeks -->
    <circle data-zone="cheek-left" cx="155" cy="155" r="20" fill="white"/>
    <circle data-zone="cheek-right" cx="245" cy="155" r="20" fill="white"/>
    <!-- eyes -->
    <ellipse cx="175" cy="130" rx="12" ry="15" fill="#222"/>
    <ellipse cx="225" cy="130" rx="12" ry="15" fill="#222"/>
    <!-- nose -->
    <polygon data-zone="nose" points="200,150 192,162 208,162" fill="white"/>
    <!-- mouth -->
    <path d="M192,162 Q200,175 208,162" fill="none"/>
    <!-- whiskers -->
    <line x1="130" y1="145" x2="170" y2="148"/>
    <line x1="130" y1="158" x2="170" y2="158"/>
    <line x1="230" y1="148" x2="270" y2="145"/>
    <line x1="230" y1="158" x2="270" y2="158"/>
    <!-- tail -->
    <path data-zone="tail" d="M310,260 Q360,220 355,170 Q350,140 325,155 Q340,190 310,230" fill="white" stroke-width="6"/>
    <!-- front paws -->
    <ellipse data-zone="paw-fl" cx="150" cy="345" rx="32" ry="18" fill="white"/>
    <ellipse data-zone="paw-fr" cx="250" cy="345" rx="32" ry="18" fill="white"/>
    <!-- back paws -->
    <ellipse data-zone="paw-bl" cx="120" cy="335" rx="22" ry="14" fill="white"/>
    <ellipse data-zone="paw-br" cx="280" cy="335" rx="22" ry="14" fill="white"/>
    <!-- belly spot -->
    <ellipse data-zone="belly" cx="200" cy="280" rx="40" ry="25" fill="white"/>
  </g>
`);

const SVG_DOG = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- body -->
    <ellipse data-zone="body" cx="200" cy="265" rx="120" ry="85" fill="white"/>
    <!-- belly -->
    <ellipse data-zone="belly" cx="200" cy="280" rx="55" ry="35" fill="white"/>
    <!-- collar -->
    <rect data-zone="collar" x="155" y="195" width="90" height="18" rx="8" fill="white"/>
    <!-- head -->
    <circle data-zone="head" cx="200" cy="135" r="80" fill="white"/>
    <!-- muzzle -->
    <ellipse data-zone="muzzle" cx="200" cy="160" rx="35" ry="25" fill="white"/>
    <!-- ears -->
    <ellipse data-zone="ear-left" cx="130" cy="100" rx="28" ry="48" fill="white"/>
    <ellipse data-zone="ear-right" cx="270" cy="100" rx="28" ry="48" fill="white"/>
    <!-- eyes -->
    <circle cx="175" cy="125" r="10" fill="#222"/>
    <circle cx="225" cy="125" r="10" fill="#222"/>
    <circle cx="178" cy="122" r="3" fill="white"/>
    <circle cx="228" cy="122" r="3" fill="white"/>
    <!-- nose -->
    <ellipse cx="200" cy="155" rx="15" ry="10" fill="#333"/>
    <!-- mouth -->
    <path d="M185,168 Q200,185 215,168" fill="none"/>
    <!-- tongue -->
    <ellipse data-zone="tongue" cx="200" cy="190" rx="12" ry="14" fill="white"/>
    <!-- front legs -->
    <rect data-zone="leg-fl" x="135" y="320" width="35" height="55" rx="14" fill="white"/>
    <rect data-zone="leg-fr" x="230" y="320" width="35" height="55" rx="14" fill="white"/>
    <!-- back legs -->
    <rect data-zone="leg-bl" x="100" y="310" width="30" height="50" rx="12" fill="white"/>
    <rect data-zone="leg-br" x="270" y="310" width="30" height="50" rx="12" fill="white"/>
    <!-- tail -->
    <path data-zone="tail" d="M320,240 Q370,200 360,155 Q355,140 340,155 Q350,180 320,220" fill="white" stroke-width="6"/>
    <!-- spot on back -->
    <circle data-zone="spot" cx="230" cy="240" r="25" fill="white"/>
  </g>
`);

const SVG_LION = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- mane outer -->
    <path data-zone="mane-outer" d="M200,55 Q215,30 230,60 Q250,35 260,65 Q280,45 285,75 Q305,65 300,95 Q320,90 305,120 Q320,125 305,145 Q318,155 300,170 Q310,185 295,195 Q305,210 285,215 Q290,235 270,230 Q265,250 245,240 Q235,258 215,245 Q200,260 185,245 Q165,258 155,240 Q135,250 130,230 Q110,235 115,215 Q95,210 105,195 Q90,185 100,170 Q82,155 95,145 Q80,125 95,120 Q80,90 100,95 Q95,65 115,75 Q120,45 140,65 Q150,35 170,60 Q185,30 200,55Z" fill="white"/>
    <!-- mane inner ring -->
    <circle data-zone="mane-inner" cx="200" cy="160" r="95" fill="white"/>
    <!-- face -->
    <circle data-zone="face" cx="200" cy="165" r="68" fill="white"/>
    <!-- forehead -->
    <circle data-zone="forehead" cx="200" cy="130" r="25" fill="white"/>
    <!-- eye areas -->
    <circle data-zone="eye-area-l" cx="178" cy="150" r="16" fill="white"/>
    <circle data-zone="eye-area-r" cx="222" cy="150" r="16" fill="white"/>
    <!-- eyes -->
    <ellipse cx="178" cy="150" rx="8" ry="10" fill="#222"/>
    <ellipse cx="222" cy="150" rx="8" ry="10" fill="#222"/>
    <!-- nose -->
    <polygon data-zone="nose" points="200,172 190,185 210,185" fill="white"/>
    <!-- mouth area -->
    <ellipse data-zone="mouth-area" cx="200" cy="195" rx="25" ry="12" fill="white"/>
    <path d="M192,185 Q200,198 208,185"/>
    <!-- body upper -->
    <ellipse data-zone="body-upper" cx="200" cy="290" rx="78" ry="40" fill="white"/>
    <!-- body lower -->
    <ellipse data-zone="body-lower" cx="200" cy="330" rx="70" ry="30" fill="white"/>
    <!-- belly -->
    <ellipse data-zone="belly" cx="200" cy="310" rx="35" ry="22" fill="white"/>
    <!-- paws -->
    <ellipse data-zone="paw-fl" cx="145" cy="365" rx="30" ry="16" fill="white"/>
    <ellipse data-zone="paw-fr" cx="255" cy="365" rx="30" ry="16" fill="white"/>
    <ellipse data-zone="paw-bl" cx="160" cy="355" rx="20" ry="12" fill="white"/>
    <ellipse data-zone="paw-br" cx="240" cy="355" rx="20" ry="12" fill="white"/>
    <!-- tail -->
    <path data-zone="tail" d="M280,310 Q335,290 345,255 Q350,238 340,235 Q330,238 335,260 Q330,280 280,295" fill="white" stroke-width="5"/>
    <!-- tail tip -->
    <circle data-zone="tail-tip" cx="340" cy="235" r="14" fill="white"/>
  </g>
`);

const SVG_ELEPHANT = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- body upper -->
    <ellipse data-zone="body-upper" cx="220" cy="230" rx="120" ry="60" fill="white"/>
    <!-- body lower / belly -->
    <ellipse data-zone="belly" cx="220" cy="290" rx="110" ry="50" fill="white"/>
    <!-- back -->
    <ellipse data-zone="back" cx="280" cy="220" rx="55" ry="40" fill="white"/>
    <!-- head -->
    <circle data-zone="head" cx="150" cy="150" r="75" fill="white"/>
    <!-- forehead -->
    <circle data-zone="forehead" cx="150" cy="115" r="30" fill="white"/>
    <!-- ear outer -->
    <ellipse data-zone="ear-outer" cx="80" cy="155" rx="50" ry="65" fill="white"/>
    <!-- ear inner -->
    <ellipse data-zone="ear-inner" cx="80" cy="155" rx="30" ry="40" fill="white"/>
    <!-- cheek -->
    <circle data-zone="cheek" cx="170" cy="175" r="22" fill="white"/>
    <!-- eye -->
    <circle cx="165" cy="135" r="8" fill="#222"/>
    <circle cx="168" cy="132" r="3" fill="white"/>
    <!-- trunk upper -->
    <path data-zone="trunk-upper" d="M145,205 Q130,240 125,270" fill="none" stroke-width="18"/>
    <!-- trunk lower -->
    <path data-zone="trunk-lower" d="M125,270 Q120,300 135,320 Q150,325 155,310" fill="none" stroke-width="16"/>
    <!-- tusk -->
    <path data-zone="tusk" d="M175,200 Q195,235 185,260" fill="none" stroke-width="6" stroke="#222"/>
    <!-- legs -->
    <rect data-zone="leg-fl" x="115" y="318" width="42" height="58" rx="16" fill="white"/>
    <rect data-zone="leg-fr" x="170" y="322" width="42" height="58" rx="16" fill="white"/>
    <rect data-zone="leg-bl" x="245" y="322" width="42" height="58" rx="16" fill="white"/>
    <rect data-zone="leg-br" x="295" y="318" width="42" height="58" rx="16" fill="white"/>
    <!-- toenails -->
    <ellipse data-zone="foot-fl" cx="136" cy="378" rx="22" ry="8" fill="white"/>
    <ellipse data-zone="foot-fr" cx="191" cy="382" rx="22" ry="8" fill="white"/>
    <ellipse data-zone="foot-bl" cx="266" cy="382" rx="22" ry="8" fill="white"/>
    <ellipse data-zone="foot-br" cx="316" cy="378" rx="22" ry="8" fill="white"/>
    <!-- tail -->
    <path data-zone="tail" d="M340,235 Q370,220 375,195 Q378,180 368,178" fill="none" stroke-width="6"/>
  </g>
`);

const SVG_FISH = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- body front -->
    <ellipse data-zone="body-front" cx="150" cy="200" rx="70" ry="65" fill="white"/>
    <!-- body middle -->
    <ellipse data-zone="body-middle" cx="220" cy="200" rx="65" ry="55" fill="white"/>
    <!-- body back -->
    <ellipse data-zone="body-back" cx="280" cy="200" rx="50" ry="45" fill="white"/>
    <!-- tail top -->
    <polygon data-zone="tail-top" points="320,200 385,145 385,200" fill="white"/>
    <!-- tail bottom -->
    <polygon data-zone="tail-bottom" points="320,200 385,200 385,255" fill="white"/>
    <!-- dorsal fin -->
    <path data-zone="fin-top" d="M155,140 Q195,55 235,140" fill="white"/>
    <!-- bottom fin -->
    <path data-zone="fin-bottom" d="M175,260 Q200,325 230,260" fill="white"/>
    <!-- side fin -->
    <path data-zone="fin-side" d="M140,220 Q115,260 155,260" fill="white"/>
    <!-- eye ring -->
    <circle data-zone="eye-ring" cx="115" cy="185" r="20" fill="white" stroke-width="5"/>
    <!-- eye -->
    <circle cx="115" cy="185" r="8" fill="#222"/>
    <circle cx="118" cy="182" r="3" fill="white"/>
    <!-- mouth -->
    <path d="M72,200 Q80,210 72,220"/>
    <!-- scales pattern -->
    <circle data-zone="scale1" cx="170" cy="185" r="12" fill="white" stroke-width="3"/>
    <circle data-zone="scale2" cx="200" cy="200" r="12" fill="white" stroke-width="3"/>
    <circle data-zone="scale3" cx="230" cy="185" r="12" fill="white" stroke-width="3"/>
    <circle data-zone="scale4" cx="260" cy="200" r="12" fill="white" stroke-width="3"/>
    <circle data-zone="scale5" cx="185" cy="215" r="12" fill="white" stroke-width="3"/>
    <circle data-zone="scale6" cx="245" cy="215" r="12" fill="white" stroke-width="3"/>
  </g>
`);

const SVG_BUTTERFLY = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- left top wing -->
    <path data-zone="wing-lt" d="M200,180 Q120,80 60,140 Q30,180 80,220 Q130,250 200,200Z" fill="white"/>
    <!-- right top wing -->
    <path data-zone="wing-rt" d="M200,180 Q280,80 340,140 Q370,180 320,220 Q270,250 200,200Z" fill="white"/>
    <!-- left bottom wing -->
    <path data-zone="wing-lb" d="M200,210 Q130,260 100,310 Q85,350 130,340 Q170,330 200,270Z" fill="white"/>
    <!-- right bottom wing -->
    <path data-zone="wing-rb" d="M200,210 Q270,260 300,310 Q315,350 270,340 Q230,330 200,270Z" fill="white"/>
    <!-- wing patterns -->
    <circle data-zone="pattern-lt" cx="130" cy="165" r="22" fill="white"/>
    <circle data-zone="pattern-rt" cx="270" cy="165" r="22" fill="white"/>
    <circle data-zone="pattern-lb" cx="150" cy="290" r="15" fill="white"/>
    <circle data-zone="pattern-rb" cx="250" cy="290" r="15" fill="white"/>
    <!-- body -->
    <ellipse cx="200" cy="230" rx="12" ry="65" fill="#333" stroke="#222" stroke-width="4"/>
    <!-- head -->
    <circle cx="200" cy="155" r="14" fill="#333"/>
    <!-- antennae -->
    <path d="M195,142 Q170,100 155,85" stroke-width="3"/>
    <circle cx="155" cy="85" r="5" fill="#333"/>
    <path d="M205,142 Q230,100 245,85" stroke-width="3"/>
    <circle cx="245" cy="85" r="5" fill="#333"/>
  </g>
`);

/* ----------------------------------------------------------
   Super-hero SVGs — original characters, no copyright
   ---------------------------------------------------------- */
const SVG_HERO_FLYING = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- cape -->
    <path data-zone="cape" d="M160,170 Q100,260 80,370 L200,320 L320,370 Q300,260 240,170Z" fill="white"/>
    <!-- body -->
    <rect data-zone="torso" x="155" y="140" width="90" height="100" rx="15" fill="white"/>
    <!-- chest emblem -->
    <polygon data-zone="emblem" points="200,155 188,185 200,178 212,185" fill="white" stroke-width="3"/>
    <!-- head -->
    <circle data-zone="head" cx="200" cy="105" r="45" fill="white"/>
    <!-- mask -->
    <path data-zone="mask" d="M165,95 Q200,80 235,95 Q235,110 200,115 Q165,110 165,95Z" fill="white" stroke-width="3"/>
    <!-- eyes -->
    <ellipse cx="185" cy="100" rx="8" ry="6" fill="#222"/>
    <ellipse cx="215" cy="100" rx="8" ry="6" fill="#222"/>
    <!-- belt -->
    <rect data-zone="belt" x="155" y="230" width="90" height="15" rx="5" fill="white" stroke-width="3"/>
    <!-- arms stretched -->
    <path data-zone="arm-l" d="M155,165 L80,120 L65,115" stroke-width="8"/>
    <circle cx="62" cy="113" r="10" fill="white"/>
    <path data-zone="arm-r" d="M245,165 L320,120 L335,115" stroke-width="8"/>
    <circle cx="338" cy="113" r="10" fill="white"/>
    <!-- legs -->
    <path data-zone="leg-l" d="M180,240 L155,340 L145,360" stroke-width="8"/>
    <ellipse cx="142" cy="362" rx="14" ry="8" fill="white"/>
    <path data-zone="leg-r" d="M220,240 L245,340 L255,360" stroke-width="8"/>
    <ellipse cx="258" cy="362" rx="14" ry="8" fill="white"/>
  </g>
`);

const SVG_ROBOT_HERO = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- body -->
    <rect data-zone="body" x="140" y="165" width="120" height="130" rx="15" fill="white"/>
    <!-- chest panel -->
    <rect data-zone="chest" x="165" y="185" width="70" height="50" rx="8" fill="white" stroke-width="3"/>
    <circle data-zone="core" cx="200" cy="210" r="15" fill="white" stroke-width="3"/>
    <!-- head -->
    <rect data-zone="head" x="150" y="65" width="100" height="85" rx="20" fill="white"/>
    <!-- antenna -->
    <line x1="200" y1="65" x2="200" y2="40"/>
    <circle data-zone="antenna" cx="200" cy="35" r="8" fill="white"/>
    <!-- eyes -->
    <rect x="170" y="90" width="22" height="18" rx="4" fill="#44DDFF"/>
    <rect x="208" y="90" width="22" height="18" rx="4" fill="#44DDFF"/>
    <!-- mouth -->
    <rect x="178" y="122" width="44" height="10" rx="4" fill="none" stroke-width="3"/>
    <line x1="190" y1="122" x2="190" y2="132" stroke-width="2"/>
    <line x1="200" y1="122" x2="200" y2="132" stroke-width="2"/>
    <line x1="210" y1="122" x2="210" y2="132" stroke-width="2"/>
    <!-- arms -->
    <rect data-zone="arm-l" x="90" y="175" width="45" height="25" rx="10" fill="white"/>
    <circle data-zone="hand-l" cx="85" cy="188" r="16" fill="white"/>
    <rect data-zone="arm-r" x="265" y="175" width="45" height="25" rx="10" fill="white"/>
    <circle data-zone="hand-r" cx="315" cy="188" r="16" fill="white"/>
    <!-- legs -->
    <rect data-zone="leg-l" x="155" y="300" width="35" height="60" rx="10" fill="white"/>
    <rect data-zone="leg-r" x="210" y="300" width="35" height="60" rx="10" fill="white"/>
    <!-- feet -->
    <ellipse data-zone="foot-l" cx="172" cy="365" rx="25" ry="12" fill="white"/>
    <ellipse data-zone="foot-r" cx="228" cy="365" rx="25" ry="12" fill="white"/>
    <!-- bolts -->
    <circle cx="148" cy="200" r="5" fill="#888"/>
    <circle cx="252" cy="200" r="5" fill="#888"/>
  </g>
`);

const SVG_NINJA = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- body -->
    <path data-zone="body" d="M150,180 L140,310 Q200,330 260,310 L250,180Z" fill="white"/>
    <!-- head -->
    <circle data-zone="head" cx="200" cy="120" r="60" fill="white"/>
    <!-- bandana -->
    <path data-zone="bandana" d="M140,110 Q200,85 260,110 Q260,130 200,125 Q140,130 140,110Z" fill="white"/>
    <!-- bandana tails -->
    <path data-zone="bandana-tail" d="M260,115 Q290,108 310,120 Q300,130 280,125" fill="white" stroke-width="4"/>
    <!-- eyes -->
    <ellipse cx="182" cy="118" rx="10" ry="6" fill="#222"/>
    <ellipse cx="218" cy="118" rx="10" ry="6" fill="#222"/>
    <!-- scarf covering mouth -->
    <path data-zone="scarf" d="M150,135 Q200,155 250,135 Q260,160 200,170 Q140,160 150,135Z" fill="white"/>
    <!-- belt/sash -->
    <path data-zone="belt" d="M142,240 Q200,255 258,240" stroke-width="8" fill="none"/>
    <!-- arms -->
    <path data-zone="arm-l" d="M150,195 L90,240 L70,230" stroke-width="7"/>
    <!-- star/shuriken in hand -->
    <polygon data-zone="star" points="70,230 60,220 65,232 53,228 65,235 58,245 68,237 70,250 72,237 82,245" fill="white" stroke-width="2"/>
    <path data-zone="arm-r" d="M250,195 L310,170 L330,165" stroke-width="7"/>
    <!-- sword on back -->
    <line x1="230" y1="100" x2="270" y2="320" stroke-width="4"/>
    <rect x="225" y="92" width="12" height="20" rx="3" fill="white" stroke-width="3"/>
    <!-- legs -->
    <path data-zone="leg-l" d="M170,310 L160,370 L150,380" stroke-width="7"/>
    <path data-zone="leg-r" d="M230,310 L240,370 L250,380" stroke-width="7"/>
    <!-- feet -->
    <ellipse data-zone="foot-l" cx="146" cy="382" rx="18" ry="8" fill="white"/>
    <ellipse data-zone="foot-r" cx="254" cy="382" rx="18" ry="8" fill="white"/>
  </g>
`);

const SVG_SUPER_CAT = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- cape -->
    <path data-zone="cape" d="M155,190 Q100,280 90,380 L200,340 L310,380 Q300,280 245,190Z" fill="white"/>
    <!-- body -->
    <ellipse data-zone="body" cx="200" cy="260" rx="65" ry="80" fill="white"/>
    <!-- head -->
    <circle data-zone="head" cx="200" cy="140" r="65" fill="white"/>
    <!-- ears -->
    <polygon data-zone="ear-l" points="155,90 135,35 175,70" fill="white"/>
    <polygon data-zone="ear-r" points="245,90 265,35 225,70" fill="white"/>
    <!-- mask -->
    <path data-zone="mask" d="M155,125 Q200,108 245,125 Q245,145 200,150 Q155,145 155,125Z" fill="white" stroke-width="4"/>
    <!-- eyes -->
    <ellipse cx="180" cy="132" rx="10" ry="12" fill="#44FF44"/>
    <ellipse cx="180" cy="132" rx="5" ry="10" fill="#222"/>
    <ellipse cx="220" cy="132" rx="10" ry="12" fill="#44FF44"/>
    <ellipse cx="220" cy="132" rx="5" ry="10" fill="#222"/>
    <!-- nose -->
    <polygon points="200,150 194,160 206,160" fill="#FF9999"/>
    <!-- emblem on chest -->
    <path data-zone="emblem" d="M185,220 L200,200 L215,220 L200,240Z" fill="white" stroke-width="3"/>
    <!-- belt -->
    <ellipse data-zone="belt" cx="200" cy="300" rx="65" ry="10" fill="white" stroke-width="3"/>
    <!-- arms -->
    <path data-zone="arm-l" d="M135,220 Q100,240 80,230" stroke-width="7"/>
    <circle cx="77" cy="228" r="12" fill="white"/>
    <path data-zone="arm-r" d="M265,220 Q300,200 320,195" stroke-width="7"/>
    <circle cx="323" cy="193" r="12" fill="white"/>
    <!-- legs -->
    <ellipse data-zone="paw-l" cx="170" cy="345" rx="25" ry="15" fill="white"/>
    <ellipse data-zone="paw-r" cx="230" cy="345" rx="25" ry="15" fill="white"/>
    <!-- tail -->
    <path data-zone="tail" d="M265,290 Q310,270 330,240 Q340,230 330,225" stroke-width="7" fill="none"/>
  </g>
`);

/* ----------------------------------------------------------
   Simple drawings for enfants / debutant / ecole
   ---------------------------------------------------------- */
const SVG_STAR = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <polygon data-zone="star" points="200,50 230,150 340,150 250,210 280,320 200,255 120,320 150,210 60,150 170,150" fill="white"/>
    <circle cx="185" cy="170" r="6" fill="#222"/>
    <circle cx="215" cy="170" r="6" fill="#222"/>
    <path d="M190,190 Q200,200 210,190"/>
  </g>
`);

const SVG_HOUSE = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- roof -->
    <polygon data-zone="roof" points="200,50 70,180 330,180" fill="white"/>
    <!-- walls -->
    <rect data-zone="wall" x="100" y="180" width="200" height="170" fill="white"/>
    <!-- door -->
    <rect data-zone="door" x="175" y="260" width="50" height="90" rx="5" fill="white"/>
    <circle cx="215" cy="310" r="4" fill="#222"/>
    <!-- windows -->
    <rect data-zone="window-l" x="120" y="210" width="40" height="40" rx="4" fill="white"/>
    <line x1="140" y1="210" x2="140" y2="250" stroke-width="3"/>
    <line x1="120" y1="230" x2="160" y2="230" stroke-width="3"/>
    <rect data-zone="window-r" x="240" y="210" width="40" height="40" rx="4" fill="white"/>
    <line x1="260" y1="210" x2="260" y2="250" stroke-width="3"/>
    <line x1="240" y1="230" x2="280" y2="230" stroke-width="3"/>
    <!-- chimney -->
    <rect data-zone="chimney" x="250" y="70" width="30" height="70" fill="white"/>
    <!-- sun -->
    <circle data-zone="sun" cx="60" cy="60" r="30" fill="white"/>
  </g>
`);

const SVG_FLOWER = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- stem -->
    <line data-zone="stem" x1="200" y1="220" x2="200" y2="370" stroke-width="8" stroke="#222"/>
    <!-- leaves -->
    <path data-zone="leaf-l" d="M200,290 Q150,270 130,300 Q140,320 200,300" fill="white"/>
    <path data-zone="leaf-r" d="M200,260 Q250,240 270,270 Q260,290 200,270" fill="white"/>
    <!-- petals -->
    <ellipse data-zone="petal1" cx="200" cy="120" rx="30" ry="50" fill="white"/>
    <ellipse data-zone="petal2" cx="200" cy="120" rx="30" ry="50" fill="white" transform="rotate(60 200 170)"/>
    <ellipse data-zone="petal3" cx="200" cy="120" rx="30" ry="50" fill="white" transform="rotate(120 200 170)"/>
    <ellipse data-zone="petal4" cx="200" cy="120" rx="30" ry="50" fill="white" transform="rotate(180 200 170)"/>
    <ellipse data-zone="petal5" cx="200" cy="120" rx="30" ry="50" fill="white" transform="rotate(240 200 170)"/>
    <ellipse data-zone="petal6" cx="200" cy="120" rx="30" ry="50" fill="white" transform="rotate(300 200 170)"/>
    <!-- center -->
    <circle data-zone="center" cx="200" cy="170" r="28" fill="white"/>
    <!-- smiley -->
    <circle cx="190" cy="165" r="4" fill="#222"/>
    <circle cx="210" cy="165" r="4" fill="#222"/>
    <path d="M190,178 Q200,186 210,178" stroke-width="3"/>
  </g>
`);

const SVG_ROCKET = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- body -->
    <path data-zone="body" d="M170,140 Q200,40 230,140 L230,300 L170,300Z" fill="white"/>
    <!-- nose cone -->
    <path data-zone="nose" d="M170,140 Q200,40 230,140Z" fill="white" stroke-width="4"/>
    <!-- window -->
    <circle data-zone="window" cx="200" cy="190" r="25" fill="white"/>
    <circle cx="200" cy="190" r="15" fill="none" stroke-width="3"/>
    <!-- left fin -->
    <path data-zone="fin-l" d="M170,260 L120,320 L170,300Z" fill="white"/>
    <!-- right fin -->
    <path data-zone="fin-r" d="M230,260 L280,320 L230,300Z" fill="white"/>
    <!-- bottom -->
    <rect data-zone="bottom" x="175" y="300" width="50" height="20" rx="5" fill="white"/>
    <!-- flames -->
    <path data-zone="flame1" d="M180,320 Q175,360 200,380 Q225,360 220,320" fill="white"/>
    <path data-zone="flame2" d="M188,320 Q190,350 200,360 Q210,350 212,320" fill="white"/>
    <!-- stars -->
    <circle cx="80" cy="100" r="4" fill="#222"/>
    <circle cx="320" cy="160" r="4" fill="#222"/>
    <circle cx="100" cy="280" r="3" fill="#222"/>
    <circle cx="300" cy="80" r="5" fill="#222"/>
  </g>
`);

const SVG_RAINBOW = svgWrap(`
  <g fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- rainbow arcs -->
    <path data-zone="arc1" d="M50,350 Q50,100 200,100 Q350,100 350,350" stroke="#222" fill="none" stroke-width="6"/>
    <path data-zone="arc2" d="M80,350 Q80,135 200,135 Q320,135 320,350" stroke="#222" fill="none" stroke-width="6"/>
    <path data-zone="arc3" d="M110,350 Q110,170 200,170 Q290,170 290,350" stroke="#222" fill="none" stroke-width="6"/>
    <path data-zone="arc4" d="M140,350 Q140,205 200,205 Q260,205 260,350" stroke="#222" fill="none" stroke-width="6"/>
    <path data-zone="arc5" d="M170,350 Q170,240 200,240 Q230,240 230,350" stroke="#222" fill="none" stroke-width="6"/>
    <!-- Fill zones between arcs -->
    <path data-zone="band1" d="M50,350 Q50,100 200,100 Q350,100 350,350 L320,350 Q320,135 200,135 Q80,135 80,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <path data-zone="band2" d="M80,350 Q80,135 200,135 Q320,135 320,350 L290,350 Q290,170 200,170 Q110,170 110,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <path data-zone="band3" d="M110,350 Q110,170 200,170 Q290,170 290,350 L260,350 Q260,205 200,205 Q140,205 140,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <path data-zone="band4" d="M140,350 Q140,205 200,205 Q260,205 260,350 L230,350 Q230,240 200,240 Q170,240 170,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <!-- clouds -->
    <ellipse data-zone="cloud-l" cx="60" cy="355" rx="55" ry="30" fill="white" stroke="#222" stroke-width="5"/>
    <ellipse data-zone="cloud-r" cx="340" cy="355" rx="55" ry="30" fill="white" stroke="#222" stroke-width="5"/>
  </g>
`);

/* ----------------------------------------------------------
   Drawings registry
   ---------------------------------------------------------- */
const DRAWINGS = [
  // Animaux
  { id: 'cat',       name: 'Chat',           svg: SVG_CAT,        categories: ['animaux','enfants','debutant'], thumbnail: '🐱' },
  { id: 'dog',       name: 'Chien',          svg: SVG_DOG,        categories: ['animaux','enfants','debutant'], thumbnail: '🐶' },
  { id: 'lion',      name: 'Lion',           svg: SVG_LION,       categories: ['animaux','debutant'],           thumbnail: '🦁' },
  { id: 'elephant',  name: 'Éléphant',       svg: SVG_ELEPHANT,   categories: ['animaux','ecole'],              thumbnail: '🐘' },
  { id: 'fish',      name: 'Poisson',        svg: SVG_FISH,       categories: ['animaux','enfants'],            thumbnail: '🐟' },
  { id: 'butterfly', name: 'Papillon',       svg: SVG_BUTTERFLY,  categories: ['animaux','debutant','ecole'],   thumbnail: '🦋' },
  // Super-héros
  { id: 'hero',      name: 'Héros volant',   svg: SVG_HERO_FLYING, categories: ['super-heros','ecole'],         thumbnail: '🦸' },
  { id: 'robot',     name: 'Robot héroïque', svg: SVG_ROBOT_HERO,  categories: ['super-heros'],                 thumbnail: '🤖' },
  { id: 'ninja',     name: 'Ninja',          svg: SVG_NINJA,       categories: ['super-heros'],                 thumbnail: '🥷' },
  { id: 'supercat',  name: 'Super Chat',     svg: SVG_SUPER_CAT,   categories: ['super-heros','animaux'],       thumbnail: '😺' },
  // Enfants / Débutant / École
  { id: 'star',      name: 'Étoile',         svg: SVG_STAR,        categories: ['enfants','debutant'],           thumbnail: '⭐' },
  { id: 'house',     name: 'Maison',         svg: SVG_HOUSE,       categories: ['enfants','ecole'],              thumbnail: '🏠' },
  { id: 'flower',    name: 'Fleur',          svg: SVG_FLOWER,      categories: ['enfants','debutant','ecole'],   thumbnail: '🌸' },
  { id: 'rocket',    name: 'Fusée',          svg: SVG_ROCKET,      categories: ['ecole','debutant'],             thumbnail: '🚀' },
  { id: 'rainbow',   name: 'Arc-en-ciel',    svg: SVG_RAINBOW,     categories: ['enfants','debutant'],           thumbnail: '🌈' },
];
