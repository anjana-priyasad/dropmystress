import { renderSand } from "./sand";
import { SPRITE_MAP, spriteUrl } from "./sprites";
import { GARDEN_HEIGHT, GARDEN_WIDTH, type Garden } from "./types";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadSprite(kind: string): Promise<HTMLImageElement> {
  let pending = imageCache.get(kind);
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = spriteUrl(kind);
    });
    imageCache.set(kind, pending);
  }
  return pending;
}

export const ATMOSPHERE_TINT = {
  sunset: { color: "rgba(255, 130, 80, 0.38)", blend: "soft-light" as const, wash: "rgba(255, 180, 120, 0.1)" },
  night: { color: "rgba(40, 52, 120, 0.62)", blend: "multiply" as const, wash: "rgba(10, 16, 40, 0.18)" },
};

/** Renders the garden (sand, items, lighting) to a canvas at the given pixel width. */
export async function renderGardenImage(garden: Garden, width: number, { watermark = true } = {}): Promise<HTMLCanvasElement> {
  const scale = width / GARDEN_WIDTH;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(GARDEN_WIDTH * scale);
  canvas.height = Math.round(GARDEN_HEIGHT * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  renderSand(ctx, garden);

  const items = [...garden.items].filter((i) => SPRITE_MAP[i.kind]).sort((a, b) => a.z - b.z);
  const images = await Promise.all(items.map((i) => loadSprite(i.kind).catch(() => null)));
  items.forEach((item, index) => {
    const img = images[index];
    const sprite = SPRITE_MAP[item.kind];
    if (!img) return;
    const w = sprite.size * item.scale;
    const h = w / sprite.aspect;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.scale(item.flip ? -1 : 1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  });

  if (garden.atmosphere !== "day") {
    const tint = ATMOSPHERE_TINT[garden.atmosphere];
    ctx.globalCompositeOperation = tint.blend;
    ctx.fillStyle = tint.color;
    ctx.fillRect(0, 0, GARDEN_WIDTH, GARDEN_HEIGHT);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = tint.wash;
    ctx.fillRect(0, 0, GARDEN_WIDTH, GARDEN_HEIGHT);

    if (garden.atmosphere === "night") {
      ctx.globalCompositeOperation = "screen";
      items.forEach((item) => {
        const sprite = SPRITE_MAP[item.kind];
        if (!sprite.glow) return;
        const w = sprite.size * item.scale;
        const h = w / sprite.aspect;
        const gx = item.x;
        const gy = item.y + sprite.glow.y * h;
        const radius = w * 1.4;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
        glow.addColorStop(0, "rgba(255, 200, 120, 0.55)");
        glow.addColorStop(1, "rgba(255, 200, 120, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(gx - radius, gy - radius, radius * 2, radius * 2);
      });
      ctx.globalCompositeOperation = "source-over";
    }
  }

  if (watermark) {
    ctx.font = "600 22px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("DropMyStress", GARDEN_WIDTH - 24, GARDEN_HEIGHT - 22);
  }
  return canvas;
}
