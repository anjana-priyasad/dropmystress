"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BurnScene } from "@/lib/burn-scene";
import { VENT_SURFACE_CLASS } from "@/lib/vent-surface";

const TOTAL_SECONDS = 3;

type Props = {
  scene: BurnScene;
  onComplete: () => void;
};

export default function ReleaseAnimation({ scene, onComplete }: Props) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <motion.div
        className={`${VENT_SURFACE_CLASS} overflow-hidden`}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={onComplete}
      >
        {scene.tokens.map((t) => t.text).join("")}
      </motion.div>
    );
  }

  return (
    <div className="relative" aria-hidden>
      {/* The box itself: glows warm from below, then its frame fades away. */}
      <motion.div
        className={`${VENT_SURFACE_CLASS} relative overflow-visible`}
        initial={{ borderColor: "rgba(29,42,58,0.1)" }}
        animate={{
          borderColor: [
            "rgba(29,42,58,0.1)",
            "rgba(251,146,60,0.45)",
            "rgba(251,146,60,0)",
          ],
          backgroundColor: [
            "rgba(255,255,255,0.8)",
            "rgba(255,237,213,0.9)",
            "rgba(255,255,255,0)",
          ],
        }}
        transition={{ duration: TOTAL_SECONDS, times: [0, 0.35, 1], ease: "easeInOut" }}
        onAnimationComplete={onComplete}
      >
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 rounded-b-3xl bg-gradient-to-t from-orange-500/35 via-rose-500/10 to-transparent blur-xl"
          initial={{ opacity: 0, scaleY: 0.2 }}
          animate={{ opacity: [0, 1, 0], scaleY: [0.2, 1.3, 1.6] }}
          transition={{ duration: TOTAL_SECONDS * 0.85, times: [0, 0.4, 1] }}
          style={{ originY: 1 }}
        />

        <p className="relative">
          {scene.tokens.map((token, i) =>
            token.kind === "space" ? (
              <span key={i}>{token.text}</span>
            ) : (
              <motion.span
                key={i}
                className="inline-block will-change-transform"
                initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
                animate={{
                  opacity: [1, 1, 0],
                  x: token.dx,
                  y: token.dy,
                  rotate: token.rotate,
                  scale: 0.5,
                  filter: "blur(8px)",
                  color: ["#e2e8f0", "#fdba74", "#ea580c"],
                }}
                transition={{
                  duration: 1.4,
                  delay: token.delay,
                  ease: [0.4, 0, 0.9, 0.6],
                  opacity: { duration: 1.4, delay: token.delay, times: [0, 0.3, 1] },
                }}
              >
                {token.text}
              </motion.span>
            ),
          )}
        </p>
      </motion.div>

      {/* Embers drifting up out of the fire. */}
      <div className="pointer-events-none absolute inset-0">
        {scene.embers.map((ember, i) => (
          <motion.span
            key={i}
            className="absolute bottom-4 rounded-full bg-orange-300 shadow-[0_0_8px_2px] shadow-orange-500/60"
            style={{ left: `${ember.left}%`, width: ember.size, height: ember.size }}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 1, 0], y: -ember.rise, x: ember.drift }}
            transition={{ duration: ember.duration, delay: ember.delay, ease: "easeOut" }}
          />
        ))}
      </div>
    </div>
  );
}
