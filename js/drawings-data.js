/* ============================================================
   drawings-data.js — SVG drawings & categories database
   ALL shapes CLOSED with fill="white" — no gaps for bucket fill
   ============================================================ */

const CATEGORIES = [
  { id: 'enfants',      name: 'Enfants',       icon: '👶', description: 'Dessins simples pour les petits' },
  { id: 'debutant',     name: 'Débutant',      icon: '🎓', description: 'Idéal pour commencer' },
  { id: 'animaux',      name: 'Animaux',       icon: '🐾', description: 'Chat, chien, lion...' },
  { id: 'ecole',        name: 'École',         icon: '🏫', description: 'Thèmes scolaires' },
  { id: 'super-heros',  name: 'Super-héros',   icon: '🦸', description: 'Héros originaux' }
];

function svgWrap(inner, vb = '0 0 400 400') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="400" height="400">${inner}</svg>`;
}

/* ==========================================================
   ANIMAUX
   ========================================================== */

const SVG_CAT = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : queue, pattes arrière -->
    <path data-zone="tail" d="M300,275 Q340,248 348,208 Q352,182 338,178 Q325,180 330,202 Q328,238 300,268Z" fill="white"/>
    <ellipse data-zone="paw-bl" cx="130" cy="345" rx="28" ry="14" fill="white"/>
    <ellipse data-zone="paw-br" cx="270" cy="345" rx="28" ry="14" fill="white"/>
    <!-- pattes avant (devant le corps, en bas) -->
    <rect data-zone="paw-fl" x="158" y="310" width="28" height="48" rx="12" fill="white"/>
    <rect data-zone="paw-fr" x="214" y="310" width="28" height="48" rx="12" fill="white"/>
    <!-- corps (couvre haut pattes) -->
    <ellipse data-zone="body" cx="200" cy="268" rx="98" ry="78" fill="white"/>
    <!-- oreilles derrière tête -->
    <polygon data-zone="ear-l" points="142,82 118,15 178,56" fill="white"/>
    <polygon data-zone="ear-r" points="258,82 282,15 222,56" fill="white"/>
    <!-- tête -->
    <circle data-zone="head" cx="200" cy="138" r="72" fill="white"/>
    <!-- visage -->
    <ellipse cx="176" cy="125" rx="10" ry="13" fill="#222"/>
    <ellipse cx="224" cy="125" rx="10" ry="13" fill="#222"/>
    <polygon points="200,145 194,155 206,155" fill="#FF9999"/>
    <path d="M194,155 Q200,165 206,155" fill="none"/>
    <line x1="132" y1="140" x2="170" y2="143"/>
    <line x1="132" y1="152" x2="170" y2="152"/>
    <line x1="230" y1="143" x2="268" y2="140"/>
    <line x1="230" y1="152" x2="268" y2="152"/>
  </g>
`);

const SVG_DOG = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : queue -->
    <path data-zone="tail" d="M312,248 Q345,222 352,185 Q355,165 340,162 Q328,165 332,188 Q330,218 308,240Z" fill="white"/>
    <!-- pattes arrière -->
    <rect data-zone="leg-bl" x="130" y="322" width="32" height="50" rx="14" fill="white"/>
    <rect data-zone="leg-br" x="238" y="322" width="32" height="50" rx="14" fill="white"/>
    <!-- pattes avant (visibles devant le corps en bas) -->
    <rect data-zone="leg-fl" x="162" y="308" width="28" height="52" rx="12" fill="white"/>
    <rect data-zone="leg-fr" x="210" y="308" width="28" height="52" rx="12" fill="white"/>
    <!-- corps -->
    <ellipse data-zone="body" cx="200" cy="268" rx="112" ry="78" fill="white"/>
    <!-- oreilles tombantes -->
    <path data-zone="ear-l" d="M135,108 Q110,60 95,110 Q88,145 120,148Z" fill="white"/>
    <path data-zone="ear-r" d="M265,108 Q290,60 305,110 Q312,145 280,148Z" fill="white"/>
    <!-- tête -->
    <circle data-zone="head" cx="200" cy="138" r="76" fill="white"/>
    <!-- museau -->
    <ellipse cx="200" cy="165" rx="32" ry="22" fill="white" stroke-width="4"/>
    <!-- yeux -->
    <circle cx="178" cy="122" r="8" fill="#222"/>
    <circle cx="222" cy="122" r="8" fill="#222"/>
    <!-- nez -->
    <ellipse cx="200" cy="155" rx="10" ry="7" fill="#333"/>
    <!-- bouche -->
    <path d="M190,178 Q200,190 210,178" fill="none"/>
  </g>
`);

const SVG_LION = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : queue avec touffe -->
    <path data-zone="tail" d="M276,300 Q330,278 342,240 Q348,220 334,218 Q322,222 328,245 Q318,272 276,292Z" fill="white"/>
    <circle cx="340" cy="222" r="12" fill="white" stroke-width="5"/>
    <!-- pattes (derrière corps) -->
    <rect data-zone="paw-l" x="138" y="330" width="32" height="45" rx="14" fill="white"/>
    <rect data-zone="paw-r" x="230" y="330" width="32" height="45" rx="14" fill="white"/>
    <!-- corps horizontal (lion couché/debout) -->
    <ellipse data-zone="body" cx="200" cy="305" rx="82" ry="52" fill="white"/>
    <!-- crinière (grande, en zigzag autour de la face) -->
    <path data-zone="mane" d="M200,52 Q216,28 232,55 Q252,30 262,60 Q284,38 286,70 Q308,55 304,88 Q324,78 315,112 Q332,110 318,140 Q334,145 315,168 Q328,176 310,192 Q318,208 298,212 Q302,232 278,228 Q276,248 256,240 Q248,258 230,245 Q216,260 200,245 Q184,260 170,245 Q152,258 144,240 Q124,248 122,228 Q98,232 102,212 Q82,208 90,192 Q72,176 85,168 Q66,145 82,140 Q68,110 85,112 Q76,78 96,88 Q92,55 114,70 Q116,38 138,60 Q148,30 168,55 Q184,28 200,52Z" fill="white"/>
    <!-- face ronde -->
    <circle data-zone="face" cx="200" cy="158" r="68" fill="white"/>
    <!-- yeux -->
    <ellipse cx="178" cy="145" rx="9" ry="11" fill="#222"/>
    <ellipse cx="222" cy="145" rx="9" ry="11" fill="#222"/>
    <!-- museau -->
    <ellipse cx="200" cy="172" rx="22" ry="16" fill="white" stroke-width="4"/>
    <!-- nez -->
    <polygon points="200,166 195,175 205,175" fill="#CC7744"/>
    <!-- bouche -->
    <path d="M195,175 Q200,185 205,175" fill="none"/>
    <!-- petits traits de moustache -->
    <line x1="162" y1="168" x2="178" y2="170"/>
    <line x1="222" y1="170" x2="238" y2="168"/>
  </g>
`);

const SVG_TURTLE = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- Patte avant gauche -->
    <path data-zone="leg-fl" d="M148,200 Q128,214 118,236 Q114,252 126,258 Q140,262 150,244 Q160,224 166,208 Z" fill="white"/>
    <!-- Patte avant droite -->
    <path data-zone="leg-fr" d="M190,208 Q174,222 170,248 Q168,264 182,266 Q196,266 200,248 Q204,230 202,212 Z" fill="white"/>
    <!-- Patte arrière gauche -->
    <path data-zone="leg-bl" d="M318,204 Q304,218 300,244 Q298,260 312,262 Q326,262 330,244 Q334,226 332,208 Z" fill="white"/>
    <!-- Patte arrière droite -->
    <path data-zone="leg-br" d="M360,196 Q348,210 346,236 Q344,254 358,256 Q372,256 374,238 Q378,218 372,200 Z" fill="white"/>
    <!-- Queue -->
    <path d="M390,170 Q420,162 432,148 Q438,138 430,132 Q420,128 410,140 Q398,154 386,168 Z" fill="white"/>
    <!-- Rebord carapace -->
    <ellipse data-zone="shell" cx="262" cy="168" rx="142" ry="78" fill="white" stroke-width="5"/>
    <!-- Dôme carapace -->
    <ellipse cx="262" cy="154" rx="128" ry="66" fill="white" stroke-width="5"/>
    <!-- Plaques -->
    <polygon fill="white" stroke-width="3.5" points="262,104 302,126 302,168 262,190 222,168 222,126"/>
    <polygon fill="white" stroke-width="3.5" points="222,126 188,108 176,140 196,162 222,168"/>
    <polygon fill="white" stroke-width="3.5" points="302,126 336,108 348,140 328,162 302,168"/>
    <polygon fill="white" stroke-width="3.5" points="222,168 196,162 184,190 208,204 234,198"/>
    <polygon fill="white" stroke-width="3.5" points="302,168 328,162 340,190 316,204 290,198"/>
    <polygon fill="white" stroke-width="3.5" points="234,198 208,204 218,220 262,224 306,220 316,204 290,198 262,190"/>
    <!-- Tête -->
    <ellipse data-zone="head" cx="100" cy="162" rx="52" ry="40" fill="white"/>
    <!-- Oeil -->
    <circle cx="84" cy="148" r="11" fill="#222" stroke="none"/>
    <circle cx="81" cy="145" r="4" fill="white" stroke="none"/>
    <!-- Sourire -->
    <path d="M62,172 Q82,190 108,178" fill="none" stroke-width="4"/>
  </g>
`);

const SVG_FISH = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : nageoires derrière le corps -->
    <path data-zone="fin-top" d="M180,128 Q205,60 235,90 Q248,105 240,128Z" fill="white"/>
    <path data-zone="fin-bottom" d="M180,272 Q200,335 230,310 Q245,295 235,272Z" fill="white"/>
    <path data-zone="fin-side" d="M145,220 Q112,252 120,272 Q132,278 155,252 Q162,238 155,222Z" fill="white"/>
    <!-- queue -->
    <polygon data-zone="tail" points="310,200 375,138 375,262" fill="white"/>
    <!-- corps ovale (couvre base nageoires) -->
    <ellipse data-zone="body" cx="190" cy="200" rx="125" ry="72" fill="white"/>
    <!-- oeil grand et expressif -->
    <circle cx="118" cy="182" r="20" fill="white" stroke-width="5"/>
    <circle cx="120" cy="180" r="10" fill="#222"/>
    <circle cx="124" cy="176" r="4" fill="white"/>
    <!-- bouche souriante -->
    <path d="M72,200 Q62,212 72,225" fill="none" stroke-width="4"/>
    <!-- écailles déco -->
    <path d="M172,158 Q182,150 192,158" fill="none" stroke-width="3"/>
    <path d="M202,172 Q212,164 222,172" fill="none" stroke-width="3"/>
    <path d="M232,158 Q242,150 252,158" fill="none" stroke-width="3"/>
    <path d="M180,198 Q190,190 200,198" fill="none" stroke-width="3"/>
    <path d="M218,195 Q228,187 238,195" fill="none" stroke-width="3"/>
    <path d="M190,232 Q200,224 210,232" fill="none" stroke-width="3"/>
    <path d="M228,228 Q238,220 248,228" fill="none" stroke-width="3"/>
  </g>
`);

const SVG_BUTTERFLY = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : ailes (derrière le corps) -->
    <path data-zone="wing-lt" d="M200,176 Q116,76 56,136 Q26,176 76,220 Q126,250 200,196Z" fill="white"/>
    <path data-zone="wing-rt" d="M200,176 Q284,76 344,136 Q374,176 324,220 Q274,250 200,196Z" fill="white"/>
    <path data-zone="wing-lb" d="M200,206 Q126,256 96,310 Q80,350 126,340 Q166,330 200,266Z" fill="white"/>
    <path data-zone="wing-rb" d="M200,206 Q274,256 304,310 Q320,350 274,340 Q234,330 200,266Z" fill="white"/>
    <!-- spots sur les ailes -->
    <circle data-zone="spot-lt" cx="126" cy="166" r="20" fill="white"/>
    <circle data-zone="spot-rt" cx="274" cy="166" r="20" fill="white"/>
    <circle data-zone="spot-lb" cx="146" cy="290" r="14" fill="white"/>
    <circle data-zone="spot-rb" cx="254" cy="290" r="14" fill="white"/>
    <!-- DEVANT : corps + tête (couvre les ailes au centre) -->
    <ellipse cx="200" cy="226" rx="11" ry="62" fill="#333" stroke-width="4"/>
    <circle cx="200" cy="154" r="13" fill="#333"/>
    <!-- antennes -->
    <path d="M194,142 Q166,96 150,80" stroke-width="3"/><circle cx="150" cy="80" r="5" fill="#333"/>
    <path d="M206,142 Q234,96 250,80" stroke-width="3"/><circle cx="250" cy="80" r="5" fill="#333"/>
  </g>
`);

/* ==========================================================
   SUPER-HÉROS — personnages bien dessinés, formes connectées
   ========================================================== */

const SVG_HERO_FLYING = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : cape -->
    <path data-zone="cape" d="M148,170 Q100,260 75,380 L200,325 L325,380 Q300,260 252,170Z" fill="white"/>
    <!-- jambes (derrière le corps) -->
    <path data-zone="leg-l" d="M165,310 L158,358 Q155,372 170,372 L190,372 Q198,372 195,358 L190,310Z" fill="white"/>
    <path data-zone="leg-r" d="M210,310 L205,358 Q202,372 218,372 L238,372 Q245,372 242,358 L235,310Z" fill="white"/>
    <!-- bras (derrière le corps) -->
    <path data-zone="arm-l" d="M135,200 Q95,180 80,200 Q70,215 85,225 Q100,232 135,225Z" fill="white"/>
    <path data-zone="arm-r" d="M265,200 Q305,180 320,200 Q330,215 315,225 Q300,232 265,225Z" fill="white"/>
    <!-- MILIEU : corps (couvre haut jambes + base bras) -->
    <ellipse data-zone="body" cx="200" cy="240" rx="65" ry="80" fill="white"/>
    <!-- ceinture (au niveau du ventre, pas trop large) -->
    <rect x="148" y="268" width="104" height="12" rx="5" fill="white" stroke-width="3"/>
    <polygon points="200,195 190,215 200,210 210,215" fill="white" stroke-width="3"/>
    <!-- masque derrière la tête -->
    <path data-zone="mask" d="M152,100 Q200,80 248,100 Q248,120 200,128 Q152,120 152,100Z" fill="white" stroke-width="4"/>
    <!-- DEVANT : tête (couvre tout) -->
    <circle data-zone="head" cx="200" cy="115" r="65" fill="white"/>
    <!-- masque redessiné par-dessus la tête -->
    <path d="M152,100 Q200,80 248,100 Q248,120 200,128 Q152,120 152,100Z" fill="none" stroke-width="4"/>
    <!-- yeux -->
    <ellipse cx="185" cy="108" rx="8" ry="7" fill="#222"/>
    <ellipse cx="215" cy="108" rx="8" ry="7" fill="#222"/>
  </g>
`);

const SVG_ROBOT_HERO = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : jambes + pieds connectés -->
    <path data-zone="leg-l" d="M160,298 L160,348 Q158,368 172,370 L192,370 Q200,368 198,348 L198,298Z" fill="white"/>
    <path data-zone="leg-r" d="M202,298 L202,348 Q200,368 214,370 L234,370 Q242,368 240,348 L240,298Z" fill="white"/>
    <!-- bras + mains (derrière le corps) -->
    <path data-zone="arm-l" d="M135,182 L95,182 Q78,182 78,200 L78,225 Q78,242 95,242 L135,242Z" fill="white"/>
    <circle cx="68" cy="212" r="18" fill="white"/>
    <path data-zone="arm-r" d="M265,182 L305,182 Q322,182 322,200 L322,225 Q322,242 305,242 L265,242Z" fill="white"/>
    <circle cx="332" cy="212" r="18" fill="white"/>
    <!-- corps -->
    <rect data-zone="body" x="135" y="162" width="130" height="138" rx="18" fill="white"/>
    <!-- coeur énergie -->
    <circle data-zone="core" cx="200" cy="220" r="18" fill="white" stroke-width="3"/>
    <!-- boulons -->
    <circle cx="145" cy="212" r="5" fill="#888"/>
    <circle cx="255" cy="212" r="5" fill="#888"/>
    <!-- antenne -->
    <circle data-zone="antenna" cx="200" cy="28" r="12" fill="white"/>
    <line x1="200" y1="40" x2="200" y2="50" stroke-width="4"/>
    <!-- tête -->
    <rect data-zone="head" x="145" y="48" width="110" height="100" rx="22" fill="white"/>
    <!-- yeux -->
    <rect x="168" y="80" width="22" height="26" rx="5" fill="#44DDFF"/>
    <rect x="210" y="80" width="22" height="26" rx="5" fill="#44DDFF"/>
    <!-- bouche -->
    <rect x="178" y="120" width="44" height="12" rx="4" fill="none" stroke-width="3"/>
    <line x1="190" y1="120" x2="190" y2="132" stroke-width="2"/>
    <line x1="200" y1="120" x2="200" y2="132" stroke-width="2"/>
    <line x1="210" y1="120" x2="210" y2="132" stroke-width="2"/>
  </g>
`);

const SVG_NINJA = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : jambes -->
    <path data-zone="leg-l" d="M165,328 L160,370 Q158,382 172,382 L192,382 Q200,382 198,370 L195,328Z" fill="white"/>
    <path data-zone="leg-r" d="M205,328 L202,370 Q200,382 215,382 L235,382 Q242,382 240,370 L235,328Z" fill="white"/>
    <!-- bras (derrière le corps) -->
    <path data-zone="arm-l" d="M148,190 Q108,195 85,215 Q75,228 90,235 Q105,238 140,225Z" fill="white"/>
    <path data-zone="arm-r" d="M252,190 Q292,195 315,215 Q325,228 310,235 Q295,238 260,225Z" fill="white"/>
    <!-- MILIEU : corps (couvre haut jambes + base bras) -->
    <path data-zone="body" d="M148,175 L140,320 Q140,330 155,330 L245,330 Q260,330 260,320 L252,175Z" fill="white"/>
    <!-- ceinture -->
    <rect data-zone="belt" x="142" y="248" width="116" height="14" rx="6" fill="white"/>
    <!-- bandeau tail derrière tête -->
    <path data-zone="bandana-tail" d="M262,110 L310,100 Q320,105 315,115 L268,120Z" fill="white"/>
    <!-- DEVANT : tête (couvre intersection corps) -->
    <circle data-zone="head" cx="200" cy="118" r="62" fill="white"/>
    <!-- bandeau par-dessus la tête -->
    <path data-zone="bandana" d="M138,105 Q200,78 262,105 L262,125 Q200,115 138,125Z" fill="white"/>
    <!-- foulard -->
    <path data-zone="scarf" d="M145,132 Q200,155 255,132 Q262,160 200,170 Q138,160 145,132Z" fill="white"/>
    <!-- yeux -->
    <ellipse cx="182" cy="115" rx="10" ry="6" fill="#222"/>
    <ellipse cx="218" cy="115" rx="10" ry="6" fill="#222"/>
  </g>
`);

const SVG_SUPER_CAT = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- ARRIÈRE : cape -->
    <path data-zone="cape" d="M148,185 Q95,275 80,385 L200,335 L320,385 Q305,275 252,185Z" fill="white"/>
    <!-- queue + pattes -->
    <path data-zone="tail" d="M262,275 Q302,255 315,222 Q322,205 308,202 Q296,206 300,228 Q292,255 262,268Z" fill="white"/>
    <rect data-zone="paw-l" x="155" y="315" width="28" height="42" rx="12" fill="white"/>
    <rect data-zone="paw-r" x="217" y="315" width="28" height="42" rx="12" fill="white"/>
    <!-- corps -->
    <ellipse data-zone="body" cx="200" cy="258" rx="65" ry="78" fill="white"/>
    <!-- ceinture -->
    <rect x="138" y="298" width="124" height="11" rx="5" fill="white" stroke-width="3"/>
    <!-- emblème losange -->
    <path d="M188,225 L200,208 L212,225 L200,242Z" fill="none" stroke-width="3"/>
    <!-- oreilles -->
    <polygon data-zone="ear-l" points="150,82 126,18 180,58" fill="white"/>
    <polygon data-zone="ear-r" points="250,82 274,18 220,58" fill="white"/>
    <!-- tête -->
    <circle data-zone="head" cx="200" cy="130" r="66" fill="white"/>
    <!-- masque -->
    <path d="M150,116 Q200,98 250,116 Q250,138 200,145 Q150,138 150,116Z" fill="none" stroke-width="4"/>
    <!-- yeux chat -->
    <ellipse cx="180" cy="124" rx="10" ry="13" fill="#44FF44"/>
    <ellipse cx="180" cy="124" rx="4" ry="11" fill="#222"/>
    <ellipse cx="220" cy="124" rx="10" ry="13" fill="#44FF44"/>
    <ellipse cx="220" cy="124" rx="4" ry="11" fill="#222"/>
    <!-- nez -->
    <polygon points="200,143 196,152 204,152" fill="#FF9999"/>
    <!-- moustaches -->
    <line x1="142" y1="138" x2="170" y2="140"/>
    <line x1="142" y1="150" x2="170" y2="148"/>
    <line x1="230" y1="140" x2="258" y2="138"/>
    <line x1="230" y1="148" x2="258" y2="150"/>
  </g>
`);

/* ==========================================================
   SIMPLES — enfants / débutant / école
   ========================================================== */

const SVG_STAR = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <polygon data-zone="star" points="200,48 232,148 338,148 252,208 282,318 200,252 118,318 148,208 62,148 168,148" fill="white"/>
    <circle cx="186" cy="168" r="5" fill="#222"/>
    <circle cx="214" cy="168" r="5" fill="#222"/>
    <path d="M192,188 Q200,198 208,188" fill="none"/>
  </g>
`);

const SVG_HOUSE = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <polygon data-zone="roof" points="200,48 68,178 332,178" fill="white"/>
    <rect data-zone="wall" x="98" y="178" width="204" height="172" fill="white"/>
    <rect data-zone="door" x="174" y="258" width="52" height="92" rx="4" fill="white"/>
    <circle cx="216" cy="308" r="4" fill="#222"/>
    <rect data-zone="window-l" x="118" y="208" width="42" height="42" rx="4" fill="white"/>
    <line x1="139" y1="208" x2="139" y2="250" stroke-width="3"/>
    <line x1="118" y1="229" x2="160" y2="229" stroke-width="3"/>
    <rect data-zone="window-r" x="240" y="208" width="42" height="42" rx="4" fill="white"/>
    <line x1="261" y1="208" x2="261" y2="250" stroke-width="3"/>
    <line x1="240" y1="229" x2="282" y2="229" stroke-width="3"/>
    <rect data-zone="chimney" x="252" y="68" width="28" height="72" fill="white"/>
    <circle data-zone="sun" cx="58" cy="58" r="28" fill="white"/>
  </g>
`);

const SVG_FLOWER = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <rect data-zone="stem" x="194" y="218" width="12" height="155" rx="4" fill="white"/>
    <path data-zone="leaf-l" d="M200,288 Q148,268 128,298 Q138,318 200,298Z" fill="white"/>
    <path data-zone="leaf-r" d="M200,258 Q252,238 272,268 Q262,288 200,268Z" fill="white"/>
    <ellipse data-zone="petal1" cx="200" cy="118" rx="28" ry="48" fill="white"/>
    <ellipse data-zone="petal2" cx="200" cy="118" rx="28" ry="48" fill="white" transform="rotate(60 200 168)"/>
    <ellipse data-zone="petal3" cx="200" cy="118" rx="28" ry="48" fill="white" transform="rotate(120 200 168)"/>
    <ellipse data-zone="petal4" cx="200" cy="118" rx="28" ry="48" fill="white" transform="rotate(180 200 168)"/>
    <ellipse data-zone="petal5" cx="200" cy="118" rx="28" ry="48" fill="white" transform="rotate(240 200 168)"/>
    <ellipse data-zone="petal6" cx="200" cy="118" rx="28" ry="48" fill="white" transform="rotate(300 200 168)"/>
    <circle data-zone="center" cx="200" cy="168" r="26" fill="white"/>
    <circle cx="191" cy="163" r="4" fill="#222"/>
    <circle cx="209" cy="163" r="4" fill="#222"/>
    <path d="M192,176 Q200,184 208,176" stroke-width="3" fill="none"/>
  </g>
`);

const SVG_ROCKET = svgWrap(`
  <g fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path data-zone="body" d="M168,138 Q200,38 232,138 L232,298 L168,298Z" fill="white"/>
    <circle data-zone="window" cx="200" cy="188" r="24" fill="white"/>
    <circle cx="200" cy="188" r="14" fill="none" stroke-width="3"/>
    <path data-zone="fin-l" d="M168,258 L118,318 L168,298Z" fill="white"/>
    <path data-zone="fin-r" d="M232,258 L282,318 L232,298Z" fill="white"/>
    <rect data-zone="bottom" x="173" y="298" width="54" height="18" rx="4" fill="white"/>
    <path data-zone="flame" d="M178,316 Q174,358 200,378 Q226,358 222,316Z" fill="white"/>
    <circle cx="78" cy="98" r="3" fill="#222"/>
    <circle cx="322" cy="158" r="3" fill="#222"/>
    <circle cx="98" cy="278" r="2" fill="#222"/>
    <circle cx="302" cy="78" r="4" fill="#222"/>
  </g>
`);

const SVG_RAINBOW = svgWrap(`
  <g fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path data-zone="band1" d="M50,350 Q50,100 200,100 Q350,100 350,350 L320,350 Q320,135 200,135 Q80,135 80,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <path data-zone="band2" d="M80,350 Q80,135 200,135 Q320,135 320,350 L290,350 Q290,170 200,170 Q110,170 110,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <path data-zone="band3" d="M110,350 Q110,170 200,170 Q290,170 290,350 L260,350 Q260,205 200,205 Q140,205 140,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <path data-zone="band4" d="M140,350 Q140,205 200,205 Q260,205 260,350 L230,350 Q230,240 200,240 Q170,240 170,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <path data-zone="band5" d="M170,350 Q170,240 200,240 Q230,240 230,350Z" fill="white" stroke="#222" stroke-width="4"/>
    <ellipse data-zone="cloud-l" cx="60" cy="355" rx="55" ry="30" fill="white" stroke="#222" stroke-width="5"/>
    <ellipse data-zone="cloud-r" cx="340" cy="355" rx="55" ry="30" fill="white" stroke="#222" stroke-width="5"/>
  </g>
`);

/* ==========================================================
   REGISTRY
   ========================================================== */
const DRAWINGS = [
  { id: 'cat',       name: 'Chat',           svg: SVG_CAT,         categories: ['animaux','enfants','debutant'], thumbnail: '🐱' },
  { id: 'dog',       name: 'Chien',          svg: SVG_DOG,         categories: ['animaux','enfants','debutant'], thumbnail: '🐶' },
  { id: 'lion',      name: 'Lion',           svg: SVG_LION,        categories: ['animaux','debutant'],           thumbnail: '🦁' },
  { id: 'turtle',    name: 'Tortue',          svg: SVG_TURTLE,      categories: ['animaux','enfants','ecole'],    thumbnail: '🐢' },
  { id: 'fish',      name: 'Poisson',        svg: SVG_FISH,        categories: ['animaux','enfants'],            thumbnail: '🐟' },
  { id: 'butterfly', name: 'Papillon',       svg: SVG_BUTTERFLY,   categories: ['animaux','debutant','ecole'],   thumbnail: '🦋' },
  { id: 'hero',      name: 'Héros volant',   svg: SVG_HERO_FLYING, categories: ['super-heros','ecole'],          thumbnail: '🦸' },
  { id: 'robot',     name: 'Robot héroïque', svg: SVG_ROBOT_HERO,  categories: ['super-heros'],                  thumbnail: '🤖' },
  { id: 'ninja',     name: 'Ninja',          svg: SVG_NINJA,       categories: ['super-heros'],                  thumbnail: '🥷' },
  { id: 'supercat',  name: 'Super Chat',     svg: SVG_SUPER_CAT,   categories: ['super-heros','animaux'],        thumbnail: '😺' },
  { id: 'star',      name: 'Étoile',         svg: SVG_STAR,        categories: ['enfants','debutant'],            thumbnail: '⭐' },
  { id: 'house',     name: 'Maison',         svg: SVG_HOUSE,       categories: ['enfants','ecole'],               thumbnail: '🏠' },
  { id: 'flower',    name: 'Fleur',          svg: SVG_FLOWER,      categories: ['enfants','debutant','ecole'],    thumbnail: '🌸' },
  { id: 'rocket',    name: 'Fusée',          svg: SVG_ROCKET,      categories: ['ecole','debutant'],              thumbnail: '🚀' },
  { id: 'rainbow',   name: 'Arc-en-ciel',    svg: SVG_RAINBOW,     categories: ['enfants','debutant'],            thumbnail: '🌈' },
];
