"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { playPop } from "@/lib/audio";
import { Button } from "@/components/ui";

const COLUMNS = 8;
const ROWS = 7;
const TOTAL = COLUMNS * ROWS;
const FRESH_SHEET = Array<boolean>(TOTAL).fill(false);

export default function BubbleWrap() {
  const [popped, setPopped] = useState<boolean[]>(FRESH_SHEET);
  const [sheet, setSheet] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [sound, setSound] = useState(true);
  const [pressing, setPressing] = useState(false);

  const remaining = popped.filter((p) => !p).length;

  useEffect(() => {
    if (remaining > 0) return;
    const id = setTimeout(() => {
      setPopped(FRESH_SHEET);
      setSheet((s) => s + 1);
    }, 900);
    return () => clearTimeout(id);
  }, [remaining]);

  useEffect(() => {
    const stop = () => setPressing(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  function pop(i: number) {
    if (popped[i]) return;
    setPopped((prev) => prev.map((p, idx) => (idx === i ? true : p)));
    setLifetime((n) => n + 1);
    if (sound) playPop();
    navigator.vibrate?.(8);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-sm text-mist/55">
        <span className="tabular-nums">{lifetime} popped</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">Sheet {sheet + 1}</span>
      </div>

      <motion.div
        key={sheet}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid w-full max-w-lg touch-none gap-1.5 rounded-3xl border border-mist/10 bg-gradient-to-br from-sky-200/10 to-transparent p-4 select-none sm:gap-3 sm:p-6"
        style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
        onPointerLeave={() => setPressing(false)}
      >
        {popped.map((isPopped, i) => (
          <motion.button
            key={i}
            type="button"
            aria-label={isPopped ? "Popped bubble" : "Pop bubble"}
            disabled={isPopped}
            onPointerDown={(e) => {
              (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
              setPressing(true);
              pop(i);
            }}
            onPointerEnter={() => pressing && pop(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                pop(i);
              }
            }}
            animate={isPopped ? { scale: [1, 1.15, 0.82], opacity: 0.55 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className={`aspect-square w-full max-w-12 rounded-full ${
              isPopped
                ? "border border-mist/10 bg-mist/5"
                : "cursor-pointer border border-white/25 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.7),rgba(186,230,253,0.25)_30%,rgba(125,211,192,0.08)_70%)] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.25),0_4px_10px_rgba(0,0,0,0.25)] hover:brightness-110"
            }`}
          />
        ))}
      </motion.div>

      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setSound(!sound)} aria-pressed={sound}>
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />} {sound ? "Sound on" : "Sound off"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setPopped(FRESH_SHEET);
            setSheet((s) => s + 1);
          }}
        >
          <RotateCcw className="size-4" /> New sheet
        </Button>
      </div>
    </div>
  );
}
