/**
 * Garden items, drawn as small SVG illustrations. Each renders the same way in the
 * page (as an <img>) and in exported images (drawn onto a canvas).
 */

export type SpriteCategory = "plants" | "flowers" | "water" | "animals" | "decor";
export type SpriteAnimation = "none" | "sway" | "sway-soft" | "bob" | "swim" | "flutter" | "hop" | "breathe";
export type SpriteSound = "rustle" | "water" | "bird" | "frog" | "tap" | "chime" | "soft";

export type Sprite = {
  kind: string;
  name: string;
  category: SpriteCategory;
  /** Default width in logical garden units. */
  size: number;
  /** Width / height of the artwork. */
  aspect: number;
  /** Stacking group: 0 ground, 1 water, 2 on water, 3 standing, 4 animals, 5 flying. */
  layer: number;
  animation: SpriteAnimation;
  sound: SpriteSound;
  /** Glows at night; y offset of the light as a fraction of height from the centre. */
  glow?: { y: number };
  svg: string;
};

export const SPRITE_CATEGORIES: { id: SpriteCategory; label: string }[] = [
  { id: "plants", label: "Trees & plants" },
  { id: "flowers", label: "Flowers" },
  { id: "water", label: "Water & stone" },
  { id: "animals", label: "Animals" },
  { id: "decor", label: "Decor" },
];

const svg = (w: number, h: number, body: string, style = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${
    style ? `<style>${style}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>` : ""
  }${body}</svg>`;

const shadow = (cx: number, cy: number, rx: number, ry: number, o = 0.2) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2b2418" opacity="${o}"/>`;

const circles = (fill: string, list: [number, number, number][]) =>
  list.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`).join("");

const trunk = (color: string) =>
  `<path d="M45 93 Q47 76 39 63 L44 60 Q51 71 50 79 Q53 68 61 57 L66 60 Q57 71 56 93 Z" fill="${color}"/>`;

const SPRITES: Sprite[] = [
  // ——— Trees & plants ———
  {
    kind: "cherry-tree", name: "Cherry blossom", category: "plants", size: 230, aspect: 1, layer: 3, animation: "sway", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 93, 34, 6) + trunk("#6b4a3a") +
      circles("#e58bb0", [[36, 62, 9], [58, 63, 9]]) +
      circles("#f2a7c3", [[32, 50, 16], [50, 38, 20], [68, 48, 17], [42, 57, 13], [60, 57, 13], [22, 42, 11], [78, 36, 11]]) +
      circles("#f8c6d8", [[45, 32, 9], [63, 41, 8], [29, 45, 7], [74, 32, 5]]) +
      `<ellipse cx="20" cy="76" rx="2.2" ry="1.3" fill="#f2a7c3"/><ellipse cx="80" cy="72" rx="2.2" ry="1.3" fill="#f8c6d8"/><ellipse cx="71" cy="86" rx="2" ry="1.2" fill="#f2a7c3"/>`),
  },
  {
    kind: "pine-bonsai", name: "Bonsai pine", category: "plants", size: 170, aspect: 1, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 93, 26, 4) +
      `<rect x="27" y="78" width="46" height="5" rx="2" fill="#4d6f86"/><path d="M31 83 H69 L66 92 H34 Z" fill="#3f5e73"/>` +
      `<g fill="none" stroke="#5b4033" stroke-linecap="round"><path d="M50 79 C44 70 58 62 50 52 C45 45 54 40 60 34" stroke-width="6"/><path d="M51 59 C40 57 34 51 28 48" stroke-width="3.5"/><path d="M55 44 C64 44 70 40 76 42" stroke-width="3"/></g>` +
      `<g fill="#4f7d4c"><ellipse cx="26" cy="46" rx="15" ry="7"/><ellipse cx="76" cy="40" rx="14" ry="6.5"/><ellipse cx="58" cy="30" rx="18" ry="8"/><ellipse cx="42" cy="54" rx="10" ry="5"/></g>` +
      `<g fill="#6f9e62"><ellipse cx="24" cy="43" rx="9" ry="3.5"/><ellipse cx="74" cy="37" rx="8" ry="3"/><ellipse cx="56" cy="26" rx="11" ry="4"/></g>`),
  },
  {
    kind: "maple-tree", name: "Red maple", category: "plants", size: 220, aspect: 1, layer: 3, animation: "sway", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 93, 34, 6) + trunk("#5e3f30") +
      circles("#b83a2a", [[36, 62, 9], [60, 62, 10]]) +
      circles("#d65a3a", [[33, 50, 16], [50, 37, 20], [68, 49, 17], [44, 57, 13], [22, 41, 11], [77, 37, 11]]) +
      circles("#e8843f", [[46, 31, 9], [64, 43, 8], [30, 45, 7]]) +
      circles("#f2a65a", [[50, 28, 4], [70, 40, 3.5]])),
  },
  {
    kind: "bamboo", name: "Bamboo", category: "plants", size: 120, aspect: 0.6, layer: 3, animation: "sway", sound: "rustle",
    svg: svg(60, 100,
      shadow(30, 95, 24, 4) +
      `<g fill="#7fae5a"><rect x="11" y="12" width="6" height="82" rx="3"/><rect x="26" y="4" width="7" height="90" rx="3.5"/><rect x="41" y="16" width="6" height="78" rx="3"/></g>` +
      `<g fill="#5d8c43"><rect x="11" y="34" width="6" height="2"/><rect x="11" y="60" width="6" height="2"/><rect x="26" y="26" width="7" height="2"/><rect x="26" y="52" width="7" height="2"/><rect x="26" y="76" width="7" height="2"/><rect x="41" y="40" width="6" height="2"/><rect x="41" y="66" width="6" height="2"/></g>` +
      `<g fill="#6fa551"><ellipse cx="7" cy="30" rx="8" ry="2.4" transform="rotate(-30 7 30)"/><ellipse cx="21" cy="22" rx="8" ry="2.4" transform="rotate(35 21 22)"/><ellipse cx="38" cy="14" rx="9" ry="2.5" transform="rotate(-25 38 14)"/><ellipse cx="52" cy="36" rx="8" ry="2.4" transform="rotate(30 52 36)"/><ellipse cx="18" cy="50" rx="7" ry="2.2" transform="rotate(-40 18 50)"/><ellipse cx="50" cy="58" rx="7" ry="2.2" transform="rotate(-35 50 58)"/></g>`),
  },
  {
    kind: "shrub", name: "Round shrub", category: "plants", size: 110, aspect: 1, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 88, 38, 7) +
      circles("#4a7a3f", [[34, 66, 20], [66, 66, 20]]) +
      circles("#5c8f4d", [[50, 56, 28], [30, 62, 18], [70, 62, 18]]) +
      circles("#6fa35c", [[42, 46, 12], [60, 50, 9], [30, 56, 7]])),
  },
  {
    kind: "moss", name: "Moss patch", category: "plants", size: 170, aspect: 2, layer: 0, animation: "none", sound: "soft",
    svg: svg(100, 50,
      `<path d="M8 26 C8 12 26 6 42 9 C58 3 80 6 90 16 C99 25 94 40 78 43 C62 49 36 47 22 42 C10 38 8 32 8 26 Z" fill="#6f9a4f"/>` +
      `<path d="M20 26 C22 17 36 14 48 16 C62 12 78 16 82 24 C84 32 72 37 58 37 C42 39 26 36 20 26 Z" fill="#7fae5a"/>` +
      circles("#9cc46f", [[30, 22, 1.6], [44, 28, 1.4], [60, 20, 1.6], [72, 30, 1.3], [52, 34, 1.2], [36, 33, 1.3]])),
  },
  {
    kind: "grass", name: "Grass tuft", category: "plants", size: 70, aspect: 1, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 90, 26, 4) +
      `<g fill="#5f9147"><path d="M48 90 Q40 60 22 40 Q44 58 54 90 Z"/><path d="M52 90 Q62 58 82 38 Q66 62 58 90 Z"/><path d="M44 90 Q34 70 14 62 Q36 70 50 90 Z"/></g>` +
      `<g fill="#7cab58"><path d="M49 90 Q48 50 44 20 Q54 50 55 90 Z"/><path d="M53 90 Q72 70 88 62 Q70 74 58 90 Z"/><path d="M46 90 Q28 52 30 30 Q38 56 52 90 Z"/></g>`),
  },
  {
    kind: "fern", name: "Fern", category: "plants", size: 110, aspect: 1, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 90, 30, 5) +
      [-60, -30, 0, 30, 60].map((a, i) =>
        `<g transform="rotate(${a} 50 88)"><path d="M50 88 Q48 55 50 18" stroke="#4e8a47" stroke-width="2" fill="none"/>${
          [26, 36, 46, 56, 66, 76].map((y) => `<ellipse cx="${44 + (i % 2)}" cy="${y}" rx="6" ry="2.2" fill="${i % 2 ? "#5e9a55" : "#6aa860"}" transform="rotate(-25 ${44} ${y})"/><ellipse cx="56" cy="${y}" rx="6" ry="2.2" fill="${i % 2 ? "#6aa860" : "#5e9a55"}" transform="rotate(25 56 ${y})"/>`).join("")
        }</g>`).join("")),
  },

  // ——— Flowers ———
  {
    kind: "lotus", name: "Lotus", category: "flowers", size: 90, aspect: 1.25, layer: 2, animation: "bob", sound: "water",
    svg: svg(100, 80,
      `<path d="M50 60 L90 56 C88 70 70 78 50 78 C26 78 10 70 10 60 C10 48 28 42 50 42 C62 42 74 44 82 48 Z" fill="#4f8f5a"/><path d="M50 60 L82 50 C72 45 62 44 50 44 C30 44 16 50 14 58 C16 68 30 74 50 74 C68 74 82 68 86 58 Z" fill="#5fa169"/>` +
      [-50, -25, 25, 50].map((a) => `<path d="M50 60 C43 50 43 38 50 28 C57 38 57 50 50 60 Z" fill="#f2a1c4" transform="rotate(${a} 50 60)"/>`).join("") +
      `<path d="M50 60 C42 48 43 34 50 24 C57 34 58 48 50 60 Z" fill="#f8c1d9"/><circle cx="50" cy="52" r="4" fill="#f4c542"/>`),
  },
  {
    kind: "tulips", name: "Tulips", category: "flowers", size: 80, aspect: 1, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 92, 26, 4) +
      `<g stroke="#5a9444" stroke-width="3" fill="none" stroke-linecap="round"><path d="M32 90 Q30 64 30 46"/><path d="M50 90 Q52 56 50 34"/><path d="M68 90 Q70 66 70 50"/></g>` +
      `<g fill="#6aa551"><path d="M40 90 Q24 76 28 62 Q38 74 46 90 Z"/><path d="M58 90 Q78 78 76 64 Q64 76 54 90 Z"/></g>` +
      [[30, 46, "#e0475b"], [50, 34, "#f2c14e"], [70, 50, "#f08bb0"]].map(([x, y, c]) =>
        `<path d="M${+x - 8} ${y} C${+x - 9} ${+y - 12} ${+x - 5} ${+y - 15} ${+x - 3} ${+y - 9} L${x} ${+y - 15} L${+x + 3} ${+y - 9} C${+x + 5} ${+y - 15} ${+x + 9} ${+y - 12} ${+x + 8} ${y} C${+x + 8} ${+y + 8} ${+x - 8} ${+y + 8} ${+x - 8} ${y} Z" fill="${c}"/>`).join("")),
  },
  {
    kind: "sunflower", name: "Sunflower", category: "flowers", size: 90, aspect: 0.8, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(80, 100,
      shadow(40, 95, 18, 3) +
      `<path d="M40 95 Q38 70 40 40" stroke="#5a9444" stroke-width="4" fill="none"/><path d="M40 76 Q22 70 18 58 Q34 60 40 72 Z" fill="#6aa551"/><path d="M40 66 Q58 60 62 48 Q46 50 40 62 Z" fill="#6aa551"/>` +
      Array.from({ length: 14 }, (_, i) => `<ellipse cx="40" cy="18" rx="4.5" ry="11" fill="${i % 2 ? "#f4c542" : "#f7d25f"}" transform="rotate(${(360 / 14) * i} 40 30)"/>`).join("") +
      `<circle cx="40" cy="30" r="10" fill="#6b4226"/><circle cx="40" cy="30" r="6" fill="#553320"/>`),
  },
  {
    kind: "lavender", name: "Lavender", category: "flowers", size: 80, aspect: 1, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 92, 26, 4) +
      `<g stroke="#6f9a5a" stroke-width="2" fill="none">${[20, 34, 50, 66, 80].map((x, i) => `<path d="M50 92 Q${(x + 50) / 2} 70 ${x} ${30 + (i % 2) * 10}"/>`).join("")}</g>` +
      [20, 34, 50, 66, 80].map((x, i) => {
        const top = 30 + (i % 2) * 10;
        return [0, 1, 2, 3, 4].map((k) => `<ellipse cx="${x + (k % 2 ? 2 : -2)}" cy="${top + k * 5}" rx="3" ry="3.6" fill="${k % 2 ? "#9b7fd1" : "#b39ddb"}"/>`).join("");
      }).join("")),
  },
  {
    kind: "daisies", name: "Daisies", category: "flowers", size: 80, aspect: 1, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 90, 30, 5) +
      `<g fill="#6aa551"><ellipse cx="34" cy="80" rx="12" ry="5" transform="rotate(-20 34 80)"/><ellipse cx="66" cy="80" rx="12" ry="5" transform="rotate(20 66 80)"/></g>` +
      `<g stroke="#5a9444" stroke-width="2.5" fill="none"><path d="M50 90 Q46 60 30 44"/><path d="M50 90 Q52 56 56 30"/><path d="M50 90 Q58 70 74 56"/></g>` +
      [[30, 44], [56, 30], [74, 56]].map(([x, y]) =>
        Array.from({ length: 10 }, (_, i) => `<ellipse cx="${x}" cy="${y - 7}" rx="2.6" ry="6" fill="#ffffff" transform="rotate(${36 * i} ${x} ${y})"/>`).join("") +
        `<circle cx="${x}" cy="${y}" r="4" fill="#f4c542"/>`).join("")),
  },
  {
    kind: "hydrangea", name: "Hydrangea", category: "flowers", size: 110, aspect: 1, layer: 3, animation: "sway-soft", sound: "rustle",
    svg: svg(100, 100,
      shadow(50, 90, 36, 6) +
      `<g fill="#4f8a47"><ellipse cx="26" cy="72" rx="16" ry="9" transform="rotate(-20 26 72)"/><ellipse cx="74" cy="72" rx="16" ry="9" transform="rotate(20 74 72)"/><ellipse cx="50" cy="80" rx="18" ry="8"/></g>` +
      circles("#8fa8e8", [[36, 48, 16], [62, 46, 17], [50, 62, 16]]) +
      circles("#b59ee3", [[30, 44, 4], [40, 40, 4], [58, 38, 4], [70, 44, 4], [46, 56, 4], [56, 64, 4], [38, 54, 3.5], [66, 56, 3.5]]) +
      circles("#d3c6f2", [[34, 50, 2.5], [48, 44, 2.5], [62, 50, 2.5], [52, 58, 2.5]])),
  },
  {
    kind: "lily-pads", name: "Lily pads", category: "flowers", size: 110, aspect: 1.6, layer: 2, animation: "bob", sound: "water",
    svg: svg(160, 100,
      [[50, 58, 36, 22, "#5f9e62"], [118, 42, 28, 17, "#6aa86c"], [116, 80, 20, 12, "#58955b"]].map(([cx, cy, rx, ry, c]) => {
        // A round pad with a narrow wedge cut out, like a real lily pad.
        const a = (15 * Math.PI) / 180;
        const x1 = (+cx + +rx * Math.cos(-a)).toFixed(1), y1 = (+cy + +ry * Math.sin(-a)).toFixed(1);
        const x2 = (+cx + +rx * Math.cos(a)).toFixed(1), y2 = (+cy + +ry * Math.sin(a)).toFixed(1);
        return `<path d="M${cx} ${cy} L${x1} ${y1} A${rx} ${ry} 0 1 0 ${x2} ${y2} Z" fill="${c}"/><path d="M${cx} ${cy} L${+cx - +rx * 0.8} ${cy}" stroke="#4c8550" stroke-width="1"/>`;
      }).join("") +
      `<g transform="translate(44 50)">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="0" cy="-6" rx="3" ry="7" fill="#fdf2f7" transform="rotate(${a})"/>`).join("")}<circle r="3" fill="#f4c542"/></g>`),
  },

  // ——— Water & stone ———
  {
    kind: "pond", name: "Pond", category: "water", size: 420, aspect: 1.67, layer: 1, animation: "none", sound: "water",
    svg: svg(200, 120,
      `<ellipse cx="100" cy="60" rx="97" ry="56" fill="#8c8a7c"/>` +
      `<ellipse cx="100" cy="60" rx="90" ry="50" fill="#3f7f98"/><ellipse cx="96" cy="56" rx="78" ry="41" fill="#4d93ab"/><ellipse cx="86" cy="48" rx="46" ry="20" fill="#6fb3c9" opacity=".55"/>` +
      `<g fill="none" stroke="#e6f6fb" stroke-width="1.5"><ellipse class="r" cx="70" cy="62" rx="14" ry="7"/><ellipse class="r r2" cx="128" cy="54" rx="12" ry="6"/><ellipse class="r r3" cx="104" cy="76" rx="10" ry="5"/></g>` +
      circles("#9d9a8e", [[12, 70, 7], [30, 104, 8], [168, 18, 7], [190, 64, 6], [150, 106, 7]]) +
      `<g stroke="#5f8f47" stroke-width="2.4" stroke-linecap="round"><path d="M178 92 Q176 76 172 66"/><path d="M184 94 Q186 78 190 68"/><path d="M20 30 Q18 16 12 8"/><path d="M26 28 Q28 14 32 6"/></g>`,
      `.r{transform-box:fill-box;transform-origin:center;animation:rip 6s ease-out infinite;opacity:0}.r2{animation-delay:2s}.r3{animation-delay:4s}@keyframes rip{0%{transform:scale(.3);opacity:.7}100%{transform:scale(1.8);opacity:0}}`),
  },
  {
    kind: "stepping-stones", name: "Stepping stones", category: "water", size: 220, aspect: 2, layer: 0, animation: "none", sound: "tap",
    svg: svg(200, 100,
      [[30, 76, 22, 13], [80, 56, 20, 12], [128, 44, 21, 12], [174, 26, 18, 11]].map(([cx, cy, rx, ry]) =>
        `<ellipse cx="${cx}" cy="${+cy + 3}" rx="${rx}" ry="${ry}" fill="#2b2418" opacity=".18"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#8f8c84"/><ellipse cx="${+cx - 3}" cy="${+cy - 2}" rx="${+rx - 5}" ry="${+ry - 4}" fill="#a8a59c"/>`).join("")),
  },
  {
    kind: "big-rock", name: "Mossy rock", category: "water", size: 130, aspect: 1.25, layer: 3, animation: "none", sound: "tap",
    svg: svg(100, 80,
      shadow(50, 72, 42, 7, 0.25) +
      `<path d="M10 70 C8 50 20 26 42 18 C62 10 84 22 90 44 C95 58 90 70 80 72 Z" fill="#7a7a73"/>` +
      `<path d="M22 60 C22 42 32 28 48 24 C62 20 76 30 78 44 C70 36 56 34 44 40 C34 44 26 52 22 60 Z" fill="#9b9b93"/>` +
      `<path d="M34 24 C44 14 64 12 76 22 C68 24 58 22 50 26 C44 28 38 28 34 24 Z" fill="#6f9a4f"/>`),
  },
  {
    kind: "pebbles", name: "Pebbles", category: "water", size: 90, aspect: 1.6, layer: 0, animation: "none", sound: "tap",
    svg: svg(100, 62,
      [[20, 40, 12, 8, "#9a978f"], [44, 30, 10, 7, "#b8b2a4"], [64, 44, 13, 8, "#83817a"], [82, 26, 9, 6, "#a8a59c"], [34, 52, 7, 5, "#c4bdad"], [58, 18, 7, 5, "#8f8c84"]].map(([cx, cy, rx, ry, c]) =>
        `<ellipse cx="${cx}" cy="${+cy + 2}" rx="${rx}" ry="${ry}" fill="#2b2418" opacity=".15"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join("")),
  },
  {
    kind: "stone-lantern", name: "Stone lantern", category: "water", size: 80, aspect: 0.6, layer: 3, animation: "none", sound: "tap", glow: { y: -0.12 },
    svg: svg(60, 100,
      shadow(30, 95, 20, 3.5, 0.25) +
      `<path d="M16 94 L20 84 H40 L44 94 Z" fill="#7b7a74"/><rect x="25" y="58" width="10" height="27" fill="#8f8e88"/><rect x="14" y="52" width="32" height="7" rx="1" fill="#7b7a74"/>` +
      `<rect x="17" y="34" width="26" height="19" fill="#8f8e88"/><rect class="f" x="23" y="38" width="14" height="11" fill="#ffd88a"/><path d="M30 38 V49" stroke="#8f8e88" stroke-width="1.5"/>` +
      `<path d="M4 36 L30 18 L56 36 Z" fill="#6d6c67"/><rect x="26" y="8" width="8" height="10" rx="4" fill="#7b7a74"/>`,
      `.f{animation:fl 2.6s ease-in-out infinite}@keyframes fl{0%,100%{opacity:1}45%{opacity:.78}70%{opacity:.92}}`),
  },
  {
    kind: "bridge", name: "Arched bridge", category: "water", size: 280, aspect: 2, layer: 3, animation: "none", sound: "tap",
    svg: svg(200, 100,
      shadow(100, 90, 90, 7, 0.22) +
      `<path d="M8 84 Q100 30 192 84 L192 92 Q100 42 8 92 Z" fill="#7d3326"/>` +
      `<path d="M8 76 Q100 22 192 76 L192 86 Q100 34 8 86 Z" fill="#b5452f"/>` +
      `<g stroke="#c2553a" stroke-width="3.5" stroke-linecap="round"><path d="M14 62 Q100 6 186 62" fill="none"/>${[20, 46, 74, 100, 126, 154, 180].map((x) => {
        // Heights of the quadratic curves above (a symmetric quad Bézier is a parabola).
        const deck = 76 - 27 * (1 - Math.pow((x - 100) / 92, 2));
        const rail = 62 - 28 * (1 - Math.pow((x - 100) / 86, 2));
        return `<path d="M${x} ${rail.toFixed(1)} V${deck.toFixed(1)}"/>`;
      }).join("")}</g>`),
  },
  {
    kind: "water-basin", name: "Water basin", category: "water", size: 100, aspect: 1, layer: 3, animation: "none", sound: "water",
    svg: svg(100, 100,
      shadow(52, 90, 34, 6, 0.25) +
      `<ellipse cx="52" cy="70" rx="34" ry="18" fill="#7b7a74"/><ellipse cx="52" cy="62" rx="34" ry="16" fill="#9a998f"/><ellipse cx="52" cy="61" rx="22" ry="9" fill="#3f7f98"/><ellipse cx="48" cy="59" rx="12" ry="4" fill="#6fb3c9" opacity=".6"/>` +
      `<path d="M8 22 L60 44" stroke="#8fae5a" stroke-width="7" stroke-linecap="round"/><path d="M8 22 L60 44" stroke="#a8c46e" stroke-width="2.5" stroke-linecap="round"/>` +
      `<g fill="#9fd4e6"><ellipse class="d" cx="60" cy="50" rx="1.6" ry="2.6"/></g>`,
      `.d{animation:drop 1.8s ease-in infinite}@keyframes drop{0%{transform:translateY(0);opacity:1}80%{transform:translateY(9px);opacity:1}100%{transform:translateY(11px);opacity:0}}`),
  },

  // ——— Animals ———
  {
    kind: "koi", name: "Koi fish", category: "animals", size: 80, aspect: 1.67, layer: 2, animation: "swim", sound: "water",
    svg: svg(100, 60,
      `<g class="t"><path d="M24 30 L4 16 Q12 30 4 44 Z" fill="#f07b3f"/></g>` +
      `<ellipse cx="46" cy="18" rx="8" ry="4" fill="#f5b089" transform="rotate(-30 46 18)"/><ellipse cx="46" cy="42" rx="8" ry="4" fill="#f5b089" transform="rotate(30 46 42)"/>` +
      `<path d="M20 30 C34 13 70 14 86 30 C70 46 34 47 20 30 Z" fill="#fff4ea"/>` +
      `<ellipse cx="44" cy="26" rx="10" ry="6" fill="#f07b3f"/><ellipse cx="66" cy="33" rx="8" ry="5" fill="#f07b3f"/><ellipse cx="30" cy="32" rx="5" ry="3" fill="#e2552a"/>` +
      `<circle cx="78" cy="26" r="1.6" fill="#1f2937"/><circle cx="78" cy="34" r="1.6" fill="#1f2937"/>`,
      `.t{transform-box:view-box;transform-origin:22px 30px;animation:tail .9s ease-in-out infinite alternate}@keyframes tail{from{transform:rotate(-12deg)}to{transform:rotate(12deg)}}`),
  },
  {
    kind: "turtle", name: "Turtle", category: "animals", size: 80, aspect: 1.25, layer: 4, animation: "none", sound: "soft",
    svg: svg(100, 80,
      shadow(50, 72, 38, 5) +
      `<g fill="#9aa66a"><ellipse cx="22" cy="66" rx="8" ry="5"/><ellipse cx="74" cy="66" rx="8" ry="5"/><circle cx="88" cy="50" r="9"/><path d="M12 56 L2 60 L12 62 Z"/></g><circle cx="91" cy="47" r="1.6" fill="#1f2937"/>` +
      `<path d="M14 62 C14 36 30 22 50 22 C70 22 86 36 86 62 Z" fill="#5d7f45"/>` +
      `<g fill="none" stroke="#7fa15e" stroke-width="2"><path d="M40 62 L42 44 L58 44 L60 62"/><path d="M42 44 L36 30 M58 44 L64 30 M42 44 L26 50 M58 44 L74 50"/></g>` +
      `<rect x="12" y="60" width="76" height="5" rx="2.5" fill="#4d6b39"/>`),
  },
  {
    kind: "frog", name: "Frog", category: "animals", size: 60, aspect: 1.25, layer: 4, animation: "breathe", sound: "frog",
    svg: svg(100, 80,
      shadow(50, 74, 36, 5) +
      `<g fill="#5a9e4a"><ellipse cx="22" cy="66" rx="14" ry="8"/><ellipse cx="78" cy="66" rx="14" ry="8"/></g>` +
      `<ellipse cx="50" cy="52" rx="34" ry="22" fill="#6db35a"/><ellipse cx="50" cy="60" rx="20" ry="12" fill="#bfe3a0"/>` +
      `<circle cx="32" cy="30" r="11" fill="#6db35a"/><circle cx="68" cy="30" r="11" fill="#6db35a"/><circle cx="32" cy="29" r="6.5" fill="#fff"/><circle cx="68" cy="29" r="6.5" fill="#fff"/><circle cx="33" cy="30" r="3.5" fill="#1f2937"/><circle cx="67" cy="30" r="3.5" fill="#1f2937"/>` +
      `<path d="M38 48 Q50 56 62 48" stroke="#2f5d27" stroke-width="2" fill="none" stroke-linecap="round"/>`),
  },
  {
    kind: "duck", name: "Duck", category: "animals", size: 80, aspect: 1.25, layer: 2, animation: "bob", sound: "water",
    svg: svg(100, 80,
      `<ellipse cx="50" cy="68" rx="42" ry="8" fill="#9fd4e6" opacity=".45"/>` +
      `<path d="M10 52 C10 38 26 34 44 38 L66 40 C84 42 90 52 86 60 C80 70 60 72 40 70 C22 68 10 64 10 52 Z" fill="#fafaf5"/>` +
      `<path d="M8 46 L20 50 L12 56 Z" fill="#e8e6dc"/><path d="M36 50 C44 44 58 46 66 54 C56 58 44 58 36 50 Z" fill="#e8e6dc"/>` +
      `<circle cx="72" cy="28" r="14" fill="#fafaf5"/><path d="M84 28 L98 32 L84 36 Z" fill="#f4a13a"/><circle cx="76" cy="25" r="2" fill="#1f2937"/>` +
      `<path d="M64 36 C62 42 64 46 68 48" stroke="#fafaf5" stroke-width="10" fill="none"/>`),
  },
  {
    kind: "butterfly", name: "Butterfly", category: "animals", size: 50, aspect: 1.25, layer: 5, animation: "flutter", sound: "soft",
    svg: svg(100, 80,
      `<g class="w"><path d="M50 40 C38 10 8 8 10 30 C12 44 30 46 50 40 Z" fill="#f2a65a"/><path d="M50 42 C34 46 16 56 22 70 C30 80 46 62 50 42 Z" fill="#f4bf7a"/><path d="M50 40 C62 10 92 8 90 30 C88 44 70 46 50 40 Z" fill="#f2a65a"/><path d="M50 42 C66 46 84 56 78 70 C70 80 54 62 50 42 Z" fill="#f4bf7a"/>` +
      circles("#6b4a8f", [[24, 26, 4], [76, 26, 4], [30, 62, 3], [70, 62, 3]]) + `</g>` +
      `<ellipse cx="50" cy="44" rx="3" ry="14" fill="#3b2f2f"/><path d="M49 31 Q44 20 40 16 M51 31 Q56 20 60 16" stroke="#3b2f2f" stroke-width="1.5" fill="none"/>`,
      `.w{transform-box:view-box;transform-origin:50px 40px;animation:flap .22s ease-in-out infinite alternate}@keyframes flap{from{transform:scaleX(1)}to{transform:scaleX(.35)}}`),
  },
  {
    kind: "songbird", name: "Songbird", category: "animals", size: 50, aspect: 1.25, layer: 4, animation: "hop", sound: "bird",
    svg: svg(100, 80,
      shadow(48, 76, 22, 3) +
      `<path d="M14 40 L2 34 L6 46 Z" fill="#6b5240"/><path d="M12 42 C12 24 32 18 50 24 C66 28 72 42 64 56 C56 68 30 68 18 58 Z" fill="#8b6a4f"/>` +
      `<path d="M40 44 C52 40 64 44 64 54 C58 64 40 64 34 56 Z" fill="#e5703b"/><path d="M22 38 C30 32 42 34 46 42 C38 46 28 46 22 38 Z" fill="#6b5240"/>` +
      `<circle cx="66" cy="30" r="13" fill="#8b6a4f"/><path d="M78 28 L90 32 L78 35 Z" fill="#e8b23a"/><circle cx="70" cy="27" r="2.2" fill="#1f2937"/>` +
      `<path d="M42 64 V74 M52 64 V74" stroke="#6b5240" stroke-width="2"/>`),
  },
  {
    kind: "cat", name: "Sleeping cat", category: "animals", size: 100, aspect: 1.43, layer: 4, animation: "breathe", sound: "soft",
    svg: svg(100, 70,
      shadow(50, 64, 40, 5) +
      `<path d="M84 54 C98 50 96 28 80 30" stroke="#d98a45" stroke-width="7" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="54" cy="44" rx="36" ry="20" fill="#e9a15c"/>` +
      `<g stroke="#cf8440" stroke-width="3" stroke-linecap="round"><path d="M50 26 Q52 34 48 40"/><path d="M62 26 Q64 34 60 40"/><path d="M74 30 Q76 38 72 42"/></g>` +
      `<circle cx="26" cy="44" r="16" fill="#eeac6a"/><path d="M14 36 L12 20 L26 30 Z" fill="#e9a15c"/><path d="M30 30 L38 18 L40 34 Z" fill="#e9a15c"/>` +
      `<g stroke="#5b3a22" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M18 44 Q21 47 24 44"/><path d="M30 44 Q33 47 36 44"/></g><circle cx="27" cy="50" r="1.5" fill="#c46a6a"/>` +
      `<ellipse cx="40" cy="58" rx="10" ry="5" fill="#f4c28f"/>`),
  },
  {
    kind: "rabbit", name: "Rabbit", category: "animals", size: 60, aspect: 0.8, layer: 4, animation: "breathe", sound: "soft",
    svg: svg(80, 100,
      shadow(40, 94, 26, 4) +
      `<ellipse cx="44" cy="70" rx="26" ry="22" fill="#f5f1ea"/><circle cx="18" cy="76" r="7" fill="#ffffff"/>` +
      `<circle cx="50" cy="44" r="16" fill="#f5f1ea"/>` +
      `<ellipse cx="42" cy="18" rx="6" ry="18" fill="#f5f1ea" transform="rotate(-10 42 18)"/><ellipse cx="58" cy="18" rx="6" ry="18" fill="#f5f1ea" transform="rotate(12 58 18)"/>` +
      `<ellipse cx="42" cy="18" rx="3" ry="13" fill="#f3c1c8" transform="rotate(-10 42 18)"/><ellipse cx="58" cy="18" rx="3" ry="13" fill="#f3c1c8" transform="rotate(12 58 18)"/>` +
      `<circle cx="56" cy="42" r="2.2" fill="#1f2937"/><circle cx="64" cy="48" r="2" fill="#e79aa6"/><ellipse cx="52" cy="90" rx="10" ry="4" fill="#ebe5da"/>`),
  },
  {
    kind: "crane", name: "Crane", category: "animals", size: 110, aspect: 0.8, layer: 4, animation: "breathe", sound: "bird",
    svg: svg(80, 100,
      shadow(40, 96, 18, 3) +
      `<g stroke="#6b6b6b" stroke-width="2"><path d="M36 70 L32 96"/><path d="M44 70 L46 96"/></g>` +
      `<path d="M12 60 C14 44 32 38 48 44 C58 48 58 64 48 70 C36 76 18 72 12 60 Z" fill="#f7f7f2"/><path d="M8 58 L2 70 L20 66 Z" fill="#2b2b2b"/>` +
      `<path d="M50 50 C60 40 56 26 58 16" stroke="#f7f7f2" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M52 34 C58 30 57 24 58 18" stroke="#2b2b2b" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      `<circle cx="60" cy="14" r="6" fill="#f7f7f2"/><circle cx="60" cy="10" r="3" fill="#d23c3c"/><path d="M65 14 L78 17 L65 18 Z" fill="#b9a35b"/><circle cx="61" cy="13" r="1.2" fill="#1f2937"/>`),
  },

  // ——— Decor ———
  {
    kind: "bench", name: "Garden bench", category: "decor", size: 160, aspect: 1.75, layer: 3, animation: "none", sound: "tap",
    svg: svg(140, 80,
      shadow(70, 74, 58, 5) +
      `<g fill="#5e4230"><rect x="20" y="46" width="6" height="28"/><rect x="114" y="46" width="6" height="28"/><rect x="24" y="12" width="5" height="36"/><rect x="111" y="12" width="5" height="36"/></g>` +
      `<g fill="#9a6b47"><rect x="12" y="42" width="116" height="7" rx="2"/><rect x="14" y="51" width="112" height="5" rx="2"/><rect x="18" y="14" width="104" height="7" rx="2"/><rect x="18" y="25" width="104" height="7" rx="2"/></g>`),
  },
  {
    kind: "wind-chime", name: "Wind chime", category: "decor", size: 70, aspect: 0.6, layer: 3, animation: "none", sound: "chime",
    svg: svg(60, 100,
      shadow(20, 96, 12, 2.5) +
      `<rect x="17" y="10" width="5" height="86" fill="#6b4a3a"/><rect x="17" y="10" width="36" height="4" fill="#6b4a3a"/>` +
      `<g class="c"><path d="M46 14 V24" stroke="#555" stroke-width="1"/><ellipse cx="46" cy="26" rx="9" ry="3" fill="#8b6a4f"/>` +
      [[39, 44], [44, 50], [49, 40], [54, 46]].map(([x, len]) => `<path d="M${x} 27 V32" stroke="#666" stroke-width=".8"/><rect x="${x - 1.6}" y="32" width="3.2" height="${len - 22}" rx="1.4" fill="#c9d3d9"/>`).join("") +
      `<path d="M46 27 V62" stroke="#666" stroke-width=".8"/><ellipse cx="46" cy="66" rx="5" ry="6" fill="#d9c27a"/></g>`,
      `.c{transform-box:view-box;transform-origin:46px 14px;animation:ch 3.2s ease-in-out infinite alternate}@keyframes ch{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}`),
  },
  {
    kind: "tea-set", name: "Tea set", category: "decor", size: 90, aspect: 1.43, layer: 3, animation: "none", sound: "tap",
    svg: svg(100, 70,
      `<ellipse cx="50" cy="56" rx="46" ry="12" fill="#4a3426"/><ellipse cx="50" cy="53" rx="44" ry="10" fill="#6b4a3a"/>` +
      `<path d="M28 30 C28 18 52 18 52 30 C54 44 26 44 28 30 Z" fill="#9cc3a8"/><path d="M52 30 C60 28 62 22 66 20" stroke="#9cc3a8" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M28 28 C20 26 20 38 28 38" stroke="#87b095" stroke-width="3" fill="none"/>` +
      `<ellipse cx="40" cy="21" rx="9" ry="3" fill="#87b095"/><circle cx="40" cy="17" r="2.5" fill="#87b095"/>` +
      `<g fill="#f1ede3"><path d="M62 42 H76 L74 52 H64 Z"/><path d="M78 36 H90 L88 45 H80 Z"/></g><g fill="#b88a4a"><ellipse cx="69" cy="42" rx="7" ry="1.6"/><ellipse cx="84" cy="36" rx="6" ry="1.4"/></g>` +
      `<g class="s" stroke="#ffffff" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"><path d="M68 34 Q65 28 69 22"/><path d="M84 28 Q81 22 85 16"/></g>`,
      `.s{animation:st 3s ease-in-out infinite}@keyframes st{0%,100%{opacity:0;transform:translateY(2px)}50%{opacity:.55;transform:translateY(-2px)}}`),
  },
  {
    kind: "torii-gate", name: "Torii gate", category: "decor", size: 200, aspect: 1.1, layer: 3, animation: "none", sound: "tap",
    svg: svg(110, 100,
      shadow(55, 95, 46, 4) +
      `<g fill="#c8412f"><rect x="24" y="22" width="9" height="74"/><rect x="77" y="22" width="9" height="74"/><rect x="14" y="36" width="82" height="7"/><rect x="50" y="22" width="10" height="14"/></g>` +
      `<g fill="#8f2d21"><rect x="22" y="88" width="13" height="8"/><rect x="75" y="88" width="13" height="8"/></g>` +
      `<path d="M2 16 Q55 24 108 16 L106 8 Q55 16 4 8 Z" fill="#2b2b2b"/><rect x="8" y="16" width="94" height="7" fill="#c8412f"/>`),
  },
  {
    kind: "cushion", name: "Meditation cushion", category: "decor", size: 70, aspect: 1.43, layer: 3, animation: "none", sound: "soft",
    svg: svg(100, 70,
      shadow(50, 62, 42, 6) +
      `<ellipse cx="50" cy="48" rx="42" ry="16" fill="#3f4390"/><ellipse cx="50" cy="38" rx="42" ry="16" fill="#5b5fa8"/><ellipse cx="50" cy="36" rx="30" ry="9" fill="#6d71b8"/>` +
      `<g stroke="#4a4e99" stroke-width="1.5">${[14, 26, 38, 50, 62, 74, 86].map((x) => `<path d="M${x} ${40 + Math.abs(50 - x) * 0.1} V${52 - Math.abs(50 - x) * 0.12}"/>`).join("")}</g><circle cx="50" cy="36" r="3" fill="#4a4e99"/>`),
  },
];

export const SPRITE_MAP: Record<string, Sprite> = Object.fromEntries(SPRITES.map((s) => [s.kind, s]));
export const ALL_SPRITES = SPRITES;

const urlCache = new Map<string, string>();
export function spriteUrl(kind: string): string {
  let url = urlCache.get(kind);
  if (!url) {
    const sprite = SPRITE_MAP[kind];
    url = sprite ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sprite.svg)}` : "";
    urlCache.set(kind, url);
  }
  return url;
}
