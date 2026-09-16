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
    <section aria-labelledby="wall-of-hope" className="mx-auto w-full max-w-5xl px-6 py-24">
      <motion.h2
        id="wall-of-hope"
        className="mb-12 text-center font-serif text-3xl text-white/85"
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
            className="flex flex-col justify-between gap-6 rounded-2xl border border-mist/8 bg-dusk/50 p-6 transition-colors hover:border-lavender/25"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
          >
            <blockquote className="font-serif text-lg leading-relaxed text-mist/85 italic">
              {quote.text}
            </blockquote>
            <p className="text-sm text-lavender/60">— {quote.author}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
