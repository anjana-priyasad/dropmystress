"use client";

import { motion } from "framer-motion";

const QUOTES = [
  { text: "Just keep going. No feeling is final.", author: "Rainer Maria Rilke" },
  {
    text: "“Hope” is the thing with feathers — that perches in the soul.",
    author: "Emily Dickinson",
  },
  { text: "I'm not afraid of storms, for I'm learning how to sail my ship.", author: "Louisa May Alcott" },
  {
    text: "Isn't it nice to think that tomorrow is a new day with no mistakes in it yet?",
    author: "L. M. Montgomery",
  },
  { text: "This too shall pass.", author: "Persian adage" },
  {
    text: "All shall be well, and all shall be well, and all manner of thing shall be well.",
    author: "Julian of Norwich",
  },
];

export default function WallOfHope() {
  return (
    <section aria-labelledby="wall-of-hope" className="mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6">
      <p className="mb-3 text-center text-xs tracking-[0.25em] text-calm uppercase">Words to hold on to</p>
      <motion.h2
        id="wall-of-hope"
        className="mb-10 text-center font-serif text-3xl text-ink sm:text-4xl"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
      >
        Wall of Hope
      </motion.h2>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {QUOTES.map((quote, i) => (
          <motion.li
            key={quote.author}
            className="glass relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl p-7 transition-colors hover:border-lavender/30"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
          >
            <span aria-hidden className="absolute -top-4 left-4 font-serif text-8xl text-lavender/10">&ldquo;</span>
            <blockquote className="relative font-serif text-lg leading-relaxed text-ink/85 italic">
              {quote.text}
            </blockquote>
            <p className="flex items-center gap-2 text-sm text-lavender/75"><span aria-hidden className="h-px w-6 bg-lavender/40" />{quote.author}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
