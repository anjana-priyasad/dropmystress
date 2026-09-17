"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button, ProgressBar } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

// Perceived Stress Scale, 4-item version (Cohen, Kamarck & Mermelstein, 1983).
const QUESTIONS = [
  { text: "In the last month, how often have you felt that you were unable to control the important things in your life?", reverse: false },
  { text: "In the last month, how often have you felt confident about your ability to handle your personal problems?", reverse: true },
  { text: "In the last month, how often have you felt that things were going your way?", reverse: true },
  { text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?", reverse: false },
];

const OPTIONS = ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"];
const MAX_SCORE = 16;

type Result = { score: number; at: string };
const NO_RESULT: Result | null = null;

// The PSS has no official cut-offs; these bands are only a rough guide for reflection.
function band(score: number) {
  if (score <= 5)
    return {
      label: "Lower stress",
      fill: "#11a594",
      message: "You've been handling things fairly well lately. Keep making room for what helps you stay steady.",
      tools: [
        { slug: "gratitude-jar", name: "Gratitude jar" },
        { slug: "meditation-timer", name: "Meditation timer" },
      ],
    };
  if (score <= 10)
    return {
      label: "Moderate stress",
      fill: "#d69e2e",
      message: "Things have felt heavy at times. Small, regular breaks for your mind and body can make a real difference.",
      tools: [
        { slug: "breathing", name: "Breathing patterns" },
        { slug: "worry-sorter", name: "Worry sorter" },
        { slug: "brain-dump", name: "Brain dump" },
      ],
    };
  return {
    label: "Higher stress",
    fill: "#e05a6d",
    message:
      "It sounds like you've been carrying a lot. Please be gentle with yourself — and consider talking to someone you trust or a professional.",
    tools: [
      { slug: "grounding", name: "5-4-3-2-1 grounding" },
      { slug: "self-compassion", name: "Self-compassion break" },
    ],
  };
}

export default function StressCheck() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [lastResult, setLastResult] = useLocalStorage("dms.stress-check", NO_RESULT);
  const [previous, setPrevious] = useState<Result | null>(null);

  const index = answers.length;
  const done = index === QUESTIONS.length;
  const score = answers.reduce((sum, a, i) => sum + (QUESTIONS[i].reverse ? 4 - a : a), 0);
  const result = band(score);
  const speech = done
    ? `Your score is ${score} out of ${MAX_SCORE}. ${result.label}. ${result.message}`
    : `${QUESTIONS[index].text} Never, almost never, sometimes, fairly often, or very often?`;
  useSpeakOnChange(speech);

  function answer(value: number) {
    const next = [...answers, value];
    setAnswers(next);
    if (next.length === QUESTIONS.length) {
      const total = next.reduce((sum, a, i) => sum + (QUESTIONS[i].reverse ? 4 - a : a), 0);
      setPrevious(lastResult);
      setLastResult({ score: total, at: new Date().toISOString() });
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {!done && <ProgressBar value={index / QUESTIONS.length} label="Questions answered" />}

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs tracking-widest text-mist/40 uppercase">
                Question {index + 1} of {QUESTIONS.length}
              </p>
              <ListenButton text={speech} />
            </div>
            <h3 className="font-serif text-2xl leading-snug text-ink/90">{QUESTIONS[index].text}</h3>
            <div className="flex flex-col gap-2" role="group" aria-label="Your answer">
              {OPTIONS.map((option, value) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => answer(value)}
                  className="rounded-2xl border border-mist/10 px-5 py-3.5 text-left text-mist/85 transition-colors hover:border-calm/40 hover:bg-calm/5 focus-visible:outline-2 focus-visible:outline-calm/70"
                >
                  {option}
                </button>
              ))}
            </div>
            <Button variant="ghost" className="self-start" disabled={index === 0} onClick={() => setAnswers(answers.slice(0, -1))}>
              <ArrowLeft className="size-4" /> Back
            </Button>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <div className="text-center">
              <p className="text-sm text-mist/55">Your score</p>
              <p className="text-6xl font-semibold text-ink tabular-nums">
                {score}
                <span className="text-2xl font-normal text-mist/40"> / {MAX_SCORE}</span>
              </p>
              <p className="mt-1 text-lg text-ink/85">{result.label}</p>
            </div>

            <div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-mist/10"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={MAX_SCORE}
                aria-valuenow={score}
                aria-label={`Stress score ${score} of ${MAX_SCORE}, ${result.label}`}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: result.fill }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / MAX_SCORE) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-mist/40" aria-hidden>
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>

            <p className="text-center leading-relaxed text-mist/75">{result.message}</p>
            <ListenButton text={speech} className="self-center" />

            {previous && (
              <p className="text-center text-sm text-mist/50">
                Last time ({new Date(previous.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}) you scored{" "}
                <span className="text-ink tabular-nums">{previous.score}</span>.
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              {result.tools.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="rounded-full border border-calm/30 px-4 py-2 text-sm text-calm transition-colors hover:bg-calm/10"
                >
                  Try {t.name} →
                </Link>
              ))}
            </div>

            <Button className="self-center" onClick={() => setAnswers([])}>
              <RotateCcw className="size-4" /> Take it again
            </Button>

            <p className="rounded-2xl border border-mist/10 bg-canvas/40 p-4 text-xs leading-relaxed text-mist/50">
              This uses the 4-item Perceived Stress Scale (Cohen, Kamarck &amp; Mermelstein, 1983). It measures how stressful
              your life has felt recently. It is not a diagnosis, and the bands above are only a rough guide. If stress is
              affecting your sleep, work, or relationships, a doctor or counsellor can help.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
