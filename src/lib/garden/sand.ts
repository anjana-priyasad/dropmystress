import { mulberry32 } from "./rng";
import { GARDEN_HEIGHT, GARDEN_WIDTH, type Point, type RippleStone, type Stroke } from "./types";

const SAND = "#b9a888";
const GROOVE = "rgba(80, 64, 40, 0.28)";
const RIDGE = "rgba(255, 248, 230, 0.22)";
const TINES = 5;
const TINE_GAP = 8;

/** Drawing functions work in logical garden units; callers set the canvas transform. */
export function paintSand(ctx: CanvasRenderingContext2D, seed: number) {
  const random = mulberry32(seed);
  ctx.fillStyle = SAND;
  ctx.fillRect(0, 0, GARDEN_WIDTH, GARDEN_HEIGHT);
  const grains = (GARDEN_WIDTH * GARDEN_HEIGHT) / 50;
  for (let i = 0; i < grains; i++) {
    ctx.fillStyle = random() < 0.5 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
    ctx.fillRect(random() * GARDEN_WIDTH, random() * GARDEN_HEIGHT, 1.2, 1.2);
  }
}

function line(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, style: string) {
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = style;
  ctx.stroke();
}

/** Parallel grooves left by the rake's tines between two points. */
export function drawRakeSegment(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 0.5) return;
  const nx = -dy / length;
  const ny = dx / length;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  for (let t = 0; t < TINES; t++) {
    const k = (t - (TINES - 1) / 2) * TINE_GAP;
    const ox = nx * k;
    const oy = ny * k;
    line(ctx, from.x + ox + 1, from.y + oy + 1, to.x + ox + 1, to.y + oy + 1, RIDGE);
    line(ctx, from.x + ox, from.y + oy, to.x + ox, to.y + oy, GROOVE);
  }
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const p = stroke.points;
  for (let i = 2; i + 1 < p.length; i += 2) {
    drawRakeSegment(ctx, { x: p[i - 2], y: p[i - 1] }, { x: p[i], y: p[i + 1] });
  }
}

export function drawRippleStone(ctx: CanvasRenderingContext2D, stone: RippleStone) {
  const { x, y, r, angle } = stone;
  ctx.lineWidth = 2.4;
  for (let ring = 1; ring <= 4; ring++) {
    const radius = r + ring * TINE_GAP * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = RIDGE;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = GROOVE;
    ctx.stroke();
  }
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  const gradient = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 6, x, y, r);
  gradient.addColorStop(0, "#8b8f94");
  gradient.addColorStop(1, "#3f4449");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.82, angle, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function renderSand(ctx: CanvasRenderingContext2D, garden: { seed: number; strokes: Stroke[]; stones: RippleStone[] }) {
  paintSand(ctx, garden.seed);
  garden.strokes.forEach((s) => drawStroke(ctx, s));
  garden.stones.forEach((s) => drawRippleStone(ctx, s));
}
