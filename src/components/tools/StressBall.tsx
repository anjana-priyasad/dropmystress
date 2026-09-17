"use client";

import { useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { playThud } from "@/lib/audio";
import { Chip } from "@/components/ui";

const COLORS = [
  { name: "Coral", ball: "from-orange-300 via-rose-400 to-rose-600" },
  { name: "Mint", ball: "from-teal-200 via-emerald-400 to-teal-700" },
  { name: "Lavender", ball: "from-indigo-200 via-violet-400 to-indigo-700" },
  { name: "Sunny", ball: "from-yellow-200 via-amber-400 to-orange-600" },
];

const SQUEEZE_MAX_MS = 1500;

export default function StressBall() {
  const [colorIndex, setColorIndex] = useState(0);
  const [squeezes, setSqueezes] = useState(0);
  const [squeezing, setSqueezing] = useState(false);
  const pressedAt = useRef(0);
  const controls = useAnimationControls();

  function press() {
    pressedAt.current = performance.now();
    setSqueezing(true);
    controls.start({
      scaleX: 1.3,
      scaleY: 0.7,
      transition: { duration: SQUEEZE_MAX_MS / 1000, ease: [0.2, 0.8, 0.2, 1] },
    });
  }

  function release() {
    if (!squeezing) return;
    setSqueezing(false);
    const intensity = Math.min(1, (performance.now() - pressedAt.current) / SQUEEZE_MAX_MS);
    setSqueezes((n) => n + 1);
    playThud(0.4 + intensity * 0.6);
    navigator.vibrate?.(Math.round(10 + intensity * 30));
    controls.start({
      scaleX: [null, 0.85, 1.06, 1],
      scaleY: [null, 1.18, 0.96, 1],
      transition: { duration: 0.55, ease: "easeOut" },
    });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-mist/60">Press and hold to squeeze. Drag and fling it if you need to.</p>

      <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-3xl border border-mist/10 bg-canvas/40">
        <motion.div
          drag
          dragSnapToOrigin
          dragElastic={0.35}
          dragTransition={{ bounceStiffness: 260, bounceDamping: 12 }}
          onPointerDown={press}
          onPointerUp={release}
          onPointerCancel={release}
          onDragEnd={() => playThud(0.6)}
          animate={controls}
          whileHover={{ scale: 1.03 }}
          role="button"
          tabIndex={0}
          aria-label="Stress ball. Press and hold to squeeze."
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !squeezing) {
              e.preventDefault();
              press();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") release();
          }}
          className={`size-44 cursor-grab touch-none rounded-full bg-gradient-to-br ${COLORS[colorIndex].ball} shadow-[inset_-18px_-22px_40px_rgba(0,0,0,0.35),inset_12px_14px_30px_rgba(255,255,255,0.35),0_30px_60px_-20px_rgba(0,0,0,0.6)] outline-none focus-visible:ring-4 focus-visible:ring-calm/40 active:cursor-grabbing`}
        />
        <div aria-hidden className="pointer-events-none absolute bottom-10 h-4 w-32 rounded-full bg-ink/13 blur-md" />
      </div>

      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Ball colour">
        {COLORS.map((c, i) => (
          <Chip key={c.name} selected={i === colorIndex} onClick={() => setColorIndex(i)}>
            {c.name}
          </Chip>
        ))}
      </div>
      <p className="text-sm text-mist/45 tabular-nums">{squeezes} {squeezes === 1 ? "squeeze" : "squeezes"}</p>
    </div>
  );
}
