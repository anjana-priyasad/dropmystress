"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createRakeSound, playStoneDrop, type RakeSound } from "@/lib/audio";
import { ATMOSPHERE_TINT } from "@/lib/garden/export";
import { clamp } from "@/lib/garden/layout";
import { hashString, mulberry32 } from "@/lib/garden/rng";
import { drawRakeSegment, drawRippleStone, renderSand } from "@/lib/garden/sand";
import { SPRITE_MAP, spriteUrl } from "@/lib/garden/sprites";
import { GARDEN_HEIGHT, GARDEN_WIDTH, type Garden, type GardenEffect, type Point, type RippleStone } from "@/lib/garden/types";

export type GardenMode = "rake" | "stone" | "arrange" | "place";

export const GARDEN_DRAG_TYPE = "application/x-dropmystress-garden-item";

type Props = {
  garden: Garden;
  mode: GardenMode;
  placingKind: string | null;
  selectedId: string | null;
  sound: boolean;
  onSelect: (id: string | null) => void;
  onAddStroke: (points: number[]) => void;
  onAddStone: (stone: Omit<RippleStone, "id">) => void;
  onPlace: (kind: string, x: number, y: number) => void;
  onBeginMove: () => void;
  onMoveItem: (id: string, x: number, y: number) => void;
};

const REST_MS = 90;
const MIN_POINT_DISTANCE = 4;
const round = (n: number) => Math.round(n * 10) / 10;

/** Every placed stone gets a slightly different size and orientation. */
function randomStone(point: Point): Omit<RippleStone, "id"> {
  return { x: round(point.x), y: round(point.y), r: 18 + Math.random() * 14, angle: Math.random() * Math.PI };
}

export default function GardenStage(props: Props) {
  const { garden, mode, placingKind, selectedId, sound } = props;
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scaleRef = useRef(1);
  const stroke = useRef<number[] | null>(null);
  const lastMoveAt = useRef(0);
  const rakeSound = useRef<RakeSound | null>(null);
  const restTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef<{ id: string; pointerId: number; offset: Point; moved: boolean } | null>(null);
  const [ghost, setGhost] = useState<Point | null>(null);

  // Keep the latest garden for the resize observer without re-subscribing on every change.
  const gardenRef = useRef(garden);
  useEffect(() => {
    gardenRef.current = garden;
  });

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, 0, 0);
    renderSand(ctx, gardenRef.current);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      scaleRef.current = (width * dpr) / GARDEN_WIDTH;
      canvas.width = Math.round(GARDEN_WIDTH * scaleRef.current);
      canvas.height = Math.round(GARDEN_HEIGHT * scaleRef.current);
      redraw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    redraw();
  }, [garden.seed, garden.strokes, garden.stones]);

  useEffect(() => {
    return () => {
      clearTimeout(restTimer.current);
      rakeSound.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!sound) {
      clearTimeout(restTimer.current);
      rakeSound.current?.setSpeed(0);
    }
  }, [sound]);

  function toGarden(clientX: number, clientY: number): Point {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: clamp(((clientX - rect.left) / rect.width) * GARDEN_WIDTH, 0, GARDEN_WIDTH),
      y: clamp(((clientY - rect.top) / rect.height) * GARDEN_HEIGHT, 0, GARDEN_HEIGHT),
    };
  }

  function silenceRake() {
    clearTimeout(restTimer.current);
    rakeSound.current?.setSpeed(0);
  }

  function onStagePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const point = toGarden(e.clientX, e.clientY);
    switch (mode) {
      case "rake": {
        e.currentTarget.setPointerCapture(e.pointerId);
        stroke.current = [round(point.x), round(point.y)];
        lastMoveAt.current = e.timeStamp;
        // Created on the first stroke: browsers only allow audio after a user gesture.
        if (sound) rakeSound.current ??= createRakeSound();
        break;
      }
      case "stone": {
        const stone = randomStone(point);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) drawRippleStone(ctx, { id: "preview", ...stone });
        if (sound) playStoneDrop();
        props.onAddStone(stone);
        break;
      }
      case "place":
        if (placingKind) props.onPlace(placingKind, point.x, point.y);
        break;
      case "arrange":
        props.onSelect(null);
        break;
    }
  }

  function onStagePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const point = toGarden(e.clientX, e.clientY);
    if (mode === "place" && e.pointerType === "mouse") setGhost(point);

    const points = stroke.current;
    if (mode !== "rake" || !points) return;
    const lastX = points[points.length - 2];
    const lastY = points[points.length - 1];
    const distance = Math.hypot(point.x - lastX, point.y - lastY);
    if (distance < MIN_POINT_DISTANCE) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawRakeSegment(ctx, { x: lastX, y: lastY }, point);
    points.push(round(point.x), round(point.y));

    if (sound && rakeSound.current) {
      const rect = stageRef.current!.getBoundingClientRect();
      const cssDistance = (distance / GARDEN_WIDTH) * rect.width;
      const elapsed = Math.max(8, e.timeStamp - lastMoveAt.current);
      rakeSound.current.setSpeed((cssDistance / elapsed) * 1000);
      clearTimeout(restTimer.current);
      restTimer.current = setTimeout(silenceRake, REST_MS);
    }
    lastMoveAt.current = e.timeStamp;
  }

  function onStagePointerUp() {
    const points = stroke.current;
    stroke.current = null;
    silenceRake();
    if (points && points.length >= 4) props.onAddStroke(points);
  }

  function onItemPointerDown(e: React.PointerEvent<HTMLDivElement>, id: string) {
    if (mode !== "arrange" || e.button !== 0) return;
    e.stopPropagation();
    const item = garden.items.find((i) => i.id === id);
    if (!item) return;
    const point = toGarden(e.clientX, e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id, pointerId: e.pointerId, offset: { x: item.x - point.x, y: item.y - point.y }, moved: false };
    props.onSelect(id);
  }

  function onItemPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const point = toGarden(e.clientX, e.clientY);
    if (!d.moved) {
      d.moved = true;
      props.onBeginMove();
    }
    props.onMoveItem(d.id, clamp(round(point.x + d.offset.x), 0, GARDEN_WIDTH), clamp(round(point.y + d.offset.y), 0, GARDEN_HEIGHT));
  }

  function onItemPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === e.pointerId) drag.current = null;
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    const kind = e.dataTransfer.getData(GARDEN_DRAG_TYPE);
    if (!kind || !SPRITE_MAP[kind]) return;
    e.preventDefault();
    const point = toGarden(e.clientX, e.clientY);
    props.onPlace(kind, point.x, point.y);
  }

  const items = useMemo(() => [...garden.items].filter((i) => SPRITE_MAP[i.kind]).sort((a, b) => a.z - b.z), [garden.items]);
  const arranging = mode === "arrange";
  const ghostSprite = mode === "place" && placingKind ? SPRITE_MAP[placingKind] : null;

  return (
    <div
      ref={stageRef}
      className={`relative aspect-[3/2] w-full touch-none overflow-hidden rounded-3xl shadow-inner shadow-black/40 select-none ${
        mode === "rake" ? "cursor-crosshair" : mode === "arrange" ? "cursor-default" : "cursor-copy"
      }`}
      onPointerDown={onStagePointerDown}
      onPointerMove={onStagePointerMove}
      onPointerUp={onStagePointerUp}
      onPointerCancel={onStagePointerUp}
      onPointerLeave={() => setGhost(null)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(GARDEN_DRAG_TYPE)) e.preventDefault();
      }}
      onDrop={onDrop}
      role="application"
      aria-label="Zen garden. Rake the sand, place stones, or arrange garden items."
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className={`absolute inset-0 ${arranging ? "" : "pointer-events-none"}`}>
        {items.map((item, index) => {
          const sprite = SPRITE_MAP[item.kind];
          const selected = item.id === selectedId;
          const delay = (hashString(item.id) % 6000) / 1000;
          return (
            <div
              key={item.id}
              role={arranging ? "button" : undefined}
              tabIndex={arranging ? 0 : -1}
              aria-label={arranging ? `${sprite.name}${selected ? ", selected" : ""}` : undefined}
              aria-pressed={arranging ? selected : undefined}
              onPointerDown={(e) => onItemPointerDown(e, item.id)}
              onPointerMove={onItemPointerMove}
              onPointerUp={onItemPointerUp}
              onPointerCancel={onItemPointerUp}
              onFocus={() => arranging && props.onSelect(item.id)}
              className={`absolute outline-none ${arranging ? "cursor-grab active:cursor-grabbing" : ""}`}
              style={{
                left: `${(item.x / GARDEN_WIDTH) * 100}%`,
                top: `${(item.y / GARDEN_HEIGHT) * 100}%`,
                width: `${((sprite.size * item.scale) / GARDEN_WIDTH) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scaleX(${item.flip ? -1 : 1})`,
                zIndex: index + 1,
              }}
            >
              <div className={`garden-anim-${sprite.animation}`} style={{ animationDelay: `-${delay}s` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={spriteUrl(item.kind)} alt="" draggable={false} className="pointer-events-none block w-full select-none" />
              </div>
              {selected && arranging && (
                <div className="pointer-events-none absolute -inset-1.5 rounded-xl border-2 border-dashed border-white/85 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
              )}
            </div>
          );
        })}
      </div>

      <AtmosphereLayer garden={garden} items={items} />
      <GardenEffects effect={garden.effect} />

      {ghostSprite && ghost && (
        <div
          className="pointer-events-none absolute opacity-60"
          style={{
            left: `${(ghost.x / GARDEN_WIDTH) * 100}%`,
            top: `${(ghost.y / GARDEN_HEIGHT) * 100}%`,
            width: `${(ghostSprite.size / GARDEN_WIDTH) * 100}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spriteUrl(ghostSprite.kind)} alt="" draggable={false} className="block w-full" />
        </div>
      )}
    </div>
  );
}

function AtmosphereLayer({ garden, items }: { garden: Garden; items: Garden["items"] }) {
  if (garden.atmosphere === "day") return null;
  const tint = ATMOSPHERE_TINT[garden.atmosphere];
  return (
    <div className="pointer-events-none absolute inset-0 transition-opacity duration-700" style={{ zIndex: 900 }}>
      <div className="absolute inset-0" style={{ backgroundColor: tint.color, mixBlendMode: tint.blend }} />
      <div className="absolute inset-0" style={{ backgroundColor: tint.wash }} />
      {garden.atmosphere === "night" &&
        items.map((item) => {
          const sprite = SPRITE_MAP[item.kind];
          if (!sprite.glow) return null;
          const w = sprite.size * item.scale;
          const h = w / sprite.aspect;
          const size = w * 2.8;
          return (
            <div
              key={item.id}
              className="absolute rounded-full"
              style={{
                left: `${(item.x / GARDEN_WIDTH) * 100}%`,
                top: `${((item.y + sprite.glow.y * h) / GARDEN_HEIGHT) * 100}%`,
                width: `${(size / GARDEN_WIDTH) * 100}%`,
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(255,200,120,0.55) 0%, rgba(255,200,120,0) 70%)",
                mixBlendMode: "screen",
              }}
            />
          );
        })}
    </div>
  );
}

const EFFECT_COUNTS: Record<GardenEffect, number> = { none: 0, petals: 22, rain: 70, fireflies: 26, snow: 45 };

function GardenEffects({ effect }: { effect: GardenEffect }) {
  const particles = useMemo(() => {
    const random = mulberry32(hashString(effect));
    return Array.from({ length: EFFECT_COUNTS[effect] }, () => ({
      left: random() * 100,
      top: random() * 100,
      delay: random() * 10,
      duration: random(),
      drift: (random() - 0.5) * 2,
      spin: random() * 720 - 360,
      size: random(),
    }));
  }, [effect]);

  if (effect === "none") return null;

  return (
    <div className="garden-effects pointer-events-none absolute inset-0 overflow-hidden [container-type:size]" style={{ zIndex: 950 }} aria-hidden>
      {particles.map((p, i) => {
        if (effect === "fireflies") {
          return (
            <span
              key={i}
              className="absolute rounded-full bg-yellow-200"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: 4 + p.size * 3,
                height: 4 + p.size * 3,
                boxShadow: "0 0 10px 4px rgba(253, 230, 138, 0.7)",
                animation: `garden-firefly ${6 + p.duration * 6}s ease-in-out ${-p.delay}s infinite`,
              }}
            />
          );
        }
        const common = {
          left: `${p.left}%`,
          top: 0,
          "--drift": `${p.drift * (effect === "rain" ? 20 : 120)}px`,
          "--spin": `${effect === "petals" ? p.spin : 0}deg`,
        } as React.CSSProperties;
        if (effect === "rain") {
          return (
            <span
              key={i}
              className="absolute w-px rounded-full bg-sky-100/60"
              style={{ ...common, height: 14 + p.size * 16, animation: `garden-fall ${0.55 + p.duration * 0.35}s linear ${-p.delay}s infinite` }}
            />
          );
        }
        if (effect === "snow") {
          return (
            <span
              key={i}
              className="absolute rounded-full bg-white/90"
              style={{ ...common, width: 3 + p.size * 5, height: 3 + p.size * 5, animation: `garden-fall ${7 + p.duration * 7}s linear ${-p.delay}s infinite` }}
            />
          );
        }
        return (
          <span
            key={i}
            className="absolute rounded-[60%_10%_60%_10%] bg-pink-200/90"
            style={{ ...common, width: 8 + p.size * 6, height: 6 + p.size * 4, animation: `garden-fall ${8 + p.duration * 8}s linear ${-p.delay}s infinite` }}
          />
        );
      })}
    </div>
  );
}
