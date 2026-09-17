"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame, Send } from "lucide-react";
import ReleaseAnimation from "@/components/ReleaseAnimation";
import { createBurnScene, type BurnScene } from "@/lib/burn-scene";
import { VENT_SURFACE_CLASS } from "@/lib/vent-surface";
import { Button, inputClass } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

const INTRO_SPEECH =
  "Write the letter you'll never send. To a person, a situation, or your younger self. Say everything. When you're done, burn it, or let it float away. Nothing is saved.";

type Stage = "write" | "burning" | "floating" | "done";

const CLOSING_LINES = {
  burning: "It's said. It's gone. You don't have to carry those words anymore.",
  floating: "You said what you needed to say. Let it drift somewhere far away from you.",
};

export default function UnsentLetter() {
  const reduceMotion = useReducedMotion();
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [stage, setStage] = useState<Stage>("write");
  const [method, setMethod] = useState<"burning" | "floating">("burning");
  const [scene, setScene] = useState<BurnScene | null>(null);
  const [floatingText, setFloatingText] = useState("");

  const letter = `${to.trim() ? `Dear ${to.trim()},\n\n` : ""}${body}`;
  const canRelease = body.trim().length > 0;
  useSpeakOnChange(stage === "done" ? CLOSING_LINES[method] : null);

  function burn() {
    setScene(createBurnScene(letter));
    setMethod("burning");
    clear();
    setStage("burning");
  }

  function floatAway() {
    setFloatingText(letter);
    setMethod("floating");
    clear();
    setStage("floating");
  }

  function clear() {
    setTo("");
    setBody("");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <AnimatePresence mode="wait">
        {stage === "write" && (
          <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.01 } }} className="flex flex-col gap-4">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To… (a person, a place, a feeling, your younger self)"
              aria-label="Who is this letter to?"
              className={inputClass}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Your letter"
              placeholder="Say everything you never got to say. No one will ever read this."
              className={`${VENT_SURFACE_CLASS} resize-none font-serif outline-none placeholder:text-mist/30 focus:border-calm/30`}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ListenButton text={INTRO_SPEECH} />
                <p className="text-xs text-mist/40">Nothing is saved or sent anywhere.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={floatAway} disabled={!canRelease}>
                  <Send className="size-4" /> Let it float away
                </Button>
                <Button variant="warm" onClick={burn} disabled={!canRelease}>
                  <Flame className="size-4" /> Burn it
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === "burning" && scene && (
          <motion.div key="burning" exit={{ opacity: 0 }}>
            <ReleaseAnimation
              scene={scene}
              onComplete={() => {
                setScene(null);
                setStage("done");
              }}
            />
          </motion.div>
        )}

        {stage === "floating" && (
          <motion.div
            key="floating"
            className={`${VENT_SURFACE_CLASS} overflow-hidden font-serif`}
            initial={{ y: 0, rotate: 0, scale: 1, opacity: 1 }}
            animate={
              reduceMotion
                ? { opacity: 0 }
                : { y: [0, 20, -700], x: [0, -10, 60], rotate: [0, -2, 8], scale: [1, 0.9, 0.35], opacity: [1, 1, 0] }
            }
            transition={{ duration: reduceMotion ? 0.8 : 3.2, times: reduceMotion ? undefined : [0, 0.2, 1], ease: "easeIn" }}
            onAnimationComplete={() => {
              setFloatingText("");
              setStage("done");
            }}
            aria-hidden
          >
            {floatingText}
          </motion.div>
        )}

        {stage === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex min-h-[45vh] flex-col items-center justify-center gap-6 text-center"
          >
            <p className="max-w-lg font-serif text-2xl leading-snug text-ink/90 italic sm:text-3xl">{CLOSING_LINES[method]}</p>
            <Button onClick={() => setStage("write")}>Write another letter</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
