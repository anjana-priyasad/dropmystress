"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Coffee, Ear, Eye, Flower2, Hand, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, ProgressBar, inputClass } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

const NUMBER_WORDS = ["", "One", "Two", "Three", "Four", "Five"];
const DONE_SPEECH = "You're here. Right now. And right now, you're okay. Take one slow breath before you go back to your day.";

type Sense = { count: number; verb: string; hint: string; icon: LucideIcon };

const SENSES: Sense[] = [
  { count: 5, verb: "see", hint: "A shadow, a colour, something small you'd normally miss.", icon: Eye },
  { count: 4, verb: "feel", hint: "Your feet on the floor, the fabric of your clothes, the air on your skin.", icon: Hand },
  { count: 3, verb: "hear", hint: "Distant traffic, a fan, your own breathing.", icon: Ear },
  { count: 2, verb: "smell", hint: "Coffee, soap, fresh air — or just the room around you.", icon: Flower2 },
  { count: 1, verb: "taste", hint: "Toothpaste, a sip of water, or simply the inside of your mouth.", icon: Coffee },
];

const EMPTY_ANSWERS = SENSES.map((s) => Array<string>(s.count).fill(""));

export default function Grounding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[][]>(EMPTY_ANSWERS);

  const finished = step === SENSES.length;
  const sense = SENSES[Math.min(step, SENSES.length - 1)];
  const speech = finished
    ? DONE_SPEECH
    : `${NUMBER_WORDS[sense.count]} ${sense.count === 1 ? "thing" : "things"} you can ${sense.verb}. ${sense.hint}`;
  useSpeakOnChange(speech);

  function update(i: number, value: string) {
    setAnswers((prev) => prev.map((row, r) => (r === step ? row.map((v, c) => (c === i ? value : v)) : row)));
  }

  function restart() {
    setAnswers(EMPTY_ANSWERS);
    setStep(0);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <ProgressBar value={step / SENSES.length} label="Grounding progress" />

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.form
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(step + 1);
            }}
          >
            <div className="text-center">
              <sense.icon className="mx-auto mb-3 size-6 text-calm/60" aria-hidden />
              <p className="mb-2 font-serif text-6xl text-calm/90">{sense.count}</p>
              <h3 className="font-serif text-2xl text-white/90">
                {sense.count === 1 ? "thing" : "things"} you can {sense.verb}
              </h3>
              <p className="mt-2 text-mist/55">{sense.hint}</p>
              <ListenButton text={speech} className="mt-4" />
            </div>

            <div className="flex flex-col gap-2">
              {answers[step].map((value, i) => (
                <input
                  key={i}
                  value={value}
                  onChange={(e) => update(i, e.target.value)}
                  placeholder={`${i + 1}. Something you can ${sense.verb}…`}
                  aria-label={`Thing ${i + 1} you can ${sense.verb}`}
                  autoFocus={i === 0}
                  className={inputClass}
                />
              ))}
              <p className="text-center text-xs text-mist/40">
                Typing is optional — you can simply notice each one and move on.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button type="submit" variant="primary">
                {step === SENSES.length - 1 ? "Finish" : "Next"} <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <p className="font-serif text-3xl text-white/90 italic">You&apos;re here. Right now. And right now, you&apos;re okay.</p>
            <p className="text-mist/60">Take one slow breath before you go back to your day.</p>
            <Button onClick={restart}>
              <RotateCcw className="size-4" /> Start again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
