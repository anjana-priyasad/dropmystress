"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Eraser, Volume2, VolumeX, Waypoints } from "lucide-react";
import { createRakeSound, playSandSweep, playStoneDrop, type RakeSound } from "@/lib/audio";
import { Button, Chip } from "@/components/ui";

type Mode = "rake" | "stone";
type Point = { x: number; y: number };

/** If the rake hasn't moved for this long, it's resting in the sand and falls silent. */
const REST_MS = 90;

const SAND = "#b9a888";
const GROOVE = "rgba(80, 64, 40, 0.28)";
const RIDGE = "rgba(255, 248, 230, 0.22)";
const TINES = 5;
const TINE_GAP = 7;

function paintSand(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = SAND;
  ctx.fillRect(0, 0, width, height);
  // Fine grain so the sand doesn't look flat.
  for (let i = 0; i < (width * height) / 60; i++) {
    const shade = Math.random() < 0.5 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
    ctx.fillStyle = shade;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }
}

function drawGroove(ctx: CanvasRenderingContext2D, from: Point, to: Point, offset: Point) {
  ctx.beginPath();
  ctx.moveTo(from.x + offset.x + 1, from.y + offset.y + 1);
  ctx.lineTo(to.x + offset.x + 1, to.y + offset.y + 1);
  ctx.strokeStyle = RIDGE;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(from.x + offset.x, from.y + offset.y);
  ctx.lineTo(to.x + offset.x, to.y + offset.y);
  ctx.strokeStyle = GROOVE;
  ctx.stroke();
}

function drawStone(ctx: CanvasRenderingContext2D, { x, y }: Point) {
  const r = 14 + Math.random() * 12;
  ctx.lineWidth = 2;
  for (let ring = 1; ring <= 4; ring++) {
    ctx.beginPath();
    ctx.arc(x, y, r + ring * TINE_GAP * 1.4, 0, Math.PI * 2);
    ctx.strokeStyle = RIDGE;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r + ring * TINE_GAP * 1.4 - 1, 0, Math.PI * 2);
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
  ctx.ellipse(x, y, r, r * 0.82, Math.random() * Math.PI, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function SandGarden() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<Point | null>(null);
  const lastMoveAt = useRef(0);
  const rakeSound = useRef<RakeSound | null>(null);
  const restTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [mode, setMode] = useState<Mode>("rake");
  const [sound, setSound] = useState(true);

  useEffect(() => {
    return () => {
      clearTimeout(restTimer.current);
      rakeSound.current?.stop();
    };
  }, []);

  function silenceRake() {
    clearTimeout(restTimer.current);
    rakeSound.current?.setSpeed(0);
  }

  function toggleSound() {
    if (sound) silenceRake();
    setSound(!sound);
  }

  const context = () => canvasRef.current?.getContext("2d") ?? null;

  const smooth = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    paintSand(ctx, width, height);
  }, []);

  function smoothWithSound() {
    if (sound) playSandSweep();
    smooth();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      paintSand(ctx, width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function pointFrom(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = context();
    if (!ctx) return;
    const point = pointFrom(e);
    if (mode === "stone") {
      drawStone(ctx, point);
      if (sound) playStoneDrop();
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPoint.current = point;
    lastMoveAt.current = e.timeStamp;
    // Created on the first stroke: browsers only allow audio after a user gesture.
    if (sound) rakeSound.current ??= createRakeSound();
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = context();
    const from = lastPoint.current;
    if (!ctx || !from) return;
    const to = pointFrom(e);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 2) return;

    // Tines sit side by side, perpendicular to the direction of the rake.
    const normal = { x: -dy / length, y: dx / length };
    ctx.lineWidth = 2.2;
    for (let t = 0; t < TINES; t++) {
      const k = (t - (TINES - 1) / 2) * TINE_GAP;
      drawGroove(ctx, from, to, { x: normal.x * k, y: normal.y * k });
    }
    lastPoint.current = to;

    if (sound && rakeSound.current) {
      const elapsedMs = Math.max(8, e.timeStamp - lastMoveAt.current);
      rakeSound.current.setSpeed((length / elapsedMs) * 1000);
      clearTimeout(restTimer.current);
      restTimer.current = setTimeout(silenceRake, REST_MS);
    }
    lastMoveAt.current = e.timeStamp;
  }

  function onPointerUp() {
    lastPoint.current = null;
    silenceRake();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label="Garden tool">
          <Chip selected={mode === "rake"} onClick={() => setMode("rake")}>
            <Waypoints className="mr-1.5 inline size-4" /> Rake
          </Chip>
          <Chip selected={mode === "stone"} onClick={() => setMode("stone")}>
            <Circle className="mr-1.5 inline size-4" /> Place stones
          </Chip>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" onClick={toggleSound} aria-pressed={sound}>
            {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />} {sound ? "Sound on" : "Sound off"}
          </Button>
          <Button variant="ghost" onClick={smoothWithSound}>
            <Eraser className="size-4" /> Smooth the sand
          </Button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Sand garden canvas. Drag to rake lines, or tap to place stones."
        className={`h-[60vh] min-h-80 w-full touch-none rounded-3xl shadow-inner shadow-black/40 ${
          mode === "stone" ? "cursor-copy" : "cursor-crosshair"
        }`}
      />
      <p className="text-center text-sm text-mist/45">
        Move slowly. There&apos;s no goal here — only the next line.
      </p>
    </div>
  );
}
