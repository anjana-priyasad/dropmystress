"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, EyeOff, Lock, RotateCcw, Sparkles } from "lucide-react";
import VentBox from "@/components/VentBox";
import ReleaseAnimation from "@/components/ReleaseAnimation";
import EmpathyMessage from "@/components/EmpathyMessage";
import BreathingBubble from "@/components/BreathingBubble";
import SoundToggle from "@/components/SoundToggle";
import VoiceToggle from "@/components/VoiceToggle";
import { speak, stopSpeaking } from "@/lib/voice";
import SiteHeader from "@/components/SiteHeader";
import ToolCard from "@/components/ToolCard";
import { getTool } from "@/lib/tools";
import { createBurnScene, type BurnScene } from "@/lib/burn-scene";
import { fetchEmpathyMessage } from "@/lib/empathy-client";

type Phase = "vent" | "releasing" | "released";

const AFTER_RELEASE_SLUGS = ["grounding", "worry-sorter", "soundscapes"];
const pick = (slugs: string[]) => slugs.map((slug) => getTool(slug)).filter((t) => t !== undefined);

export default function VentExperience() {
  const [phase, setPhase] = useState<Phase>("vent");
  const [text, setText] = useState("");
  const [scene, setScene] = useState<BurnScene | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pendingRequest = useRef<AbortController | null>(null);

  // Read the comforting message aloud once it's on screen.
  useEffect(() => {
    if (phase === "released" && message) void speak(message);
  }, [phase, message]);

  function handleRelease() {
    const vent = text.trim();
    if (!vent) return;

    // Ask for the empathy message now so it's ready when the flames die down.
    pendingRequest.current?.abort();
    const controller = new AbortController();
    pendingRequest.current = controller;
    setMessage(null);
    fetchEmpathyMessage(vent, controller.signal)
      .then(setMessage)
      .catch(() => {
        /* aborted because the user started over */
      });

    setScene(createBurnScene(text));
    setText(""); // the words are gone the moment they hit the fire
    setPhase("releasing");
  }

  function handleBurnComplete() {
    setScene(null);
    setPhase("released");
  }

  function ventAgain() {
    stopSpeaking();
    pendingRequest.current?.abort();
    setMessage(null);
    setPhase("vent");
  }

  return (
    <section className="relative flex min-h-dvh flex-col px-4 pt-3 pb-6 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SiteHeader>
          <VoiceToggle />
          <SoundToggle />
        </SiteHeader>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-10 sm:py-14">
        <AnimatePresence mode="wait">
          {phase === "vent" && (
            <motion.div
              key="vent"
              className="flex flex-col gap-9"
              exit={{ opacity: 0, transition: { duration: 0.01 } }}
            >
              <motion.div
                className="flex flex-col items-center gap-5 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-mist/80">
                  <span className="relative flex size-2">
                    <span className="ripple absolute inset-0 rounded-full bg-calm" />
                    <span className="relative size-2 rounded-full bg-calm" />
                  </span>
                  Anonymous · no sign-up · nothing saved
                </span>
                <h1 className="font-serif text-[2.6rem] leading-[1.05] tracking-tight text-ink sm:text-6xl">
                  Drop your stress <br className="hidden sm:block" />
                  <span className="text-gradient italic">right here.</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-mist/70 sm:text-lg">
                  Type out whatever&apos;s weighing on you. Watch it burn away, get a kind word back, and breathe.
                </p>
              </motion.div>
              <VentBox value={text} onChange={setText} onRelease={handleRelease} />
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mist/55">
                {[
                  { icon: EyeOff, text: "Never stored" },
                  { icon: Lock, text: "No account needed" },
                  { icon: Sparkles, text: "A calm reply, just for you" },
                ].map(({ icon: Icon, text: label }) => (
                  <li key={label} className="inline-flex items-center gap-1.5">
                    <Icon className="size-3.5 text-calm/80" aria-hidden /> {label}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {phase === "releasing" && scene && (
            <motion.div
              key="releasing"
              className="flex flex-col gap-8"
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
              <motion.p
                className="text-center font-serif text-3xl text-ink/60 italic sm:text-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 3, times: [0, 0.2, 0.7, 1] }}
              >
                Letting it go…
              </motion.p>
              <ReleaseAnimation scene={scene} onComplete={handleBurnComplete} />
              {/* Holds the space of the vent box's button row so the box doesn't jump. */}
              <div aria-hidden className="h-[4.5rem]" />
            </motion.div>
          )}

          {phase === "released" && (
            <motion.div
              key="released"
              className="flex flex-col items-center gap-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <EmpathyMessage message={message} />

              <motion.div
                className="flex flex-col items-center gap-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
              >
                <BreathingBubble />

                <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={ventAgain}
                    className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-mist/80 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-calm/60"
                  >
                    <RotateCcw className="size-4" />
                    Let go of something else
                  </button>
                  <a
                    href="#more-tools"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-mist/50 transition-colors hover:text-mist focus-visible:outline-2 focus-visible:outline-calm/60"
                  >
                    <ArrowDown className="size-4" />
                    More ways to unwind
                  </a>
                </div>

                <div className="w-full">
                  <p className="mb-3 text-center text-sm text-mist/45">Still feeling it? Try one of these next.</p>
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {pick(AFTER_RELEASE_SLUGS).map((tool) => (
                      <li key={tool.slug}>
                        <ToolCard tool={tool} />
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
