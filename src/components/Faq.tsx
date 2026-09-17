import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/faq";

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-title" className="mx-auto w-full max-w-3xl px-4 pt-24 sm:px-6">
      <p className="mb-3 text-center text-xs tracking-[0.25em] text-calm uppercase">FAQ</p>
      <h2 id="faq-title" className="mb-8 text-center font-serif text-3xl text-ink sm:text-4xl">
        Questions, answered
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <details key={item.question} className="glass group rounded-2xl transition-colors open:border-calm/25">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4.5 text-ink/90 [&::-webkit-details-marker]:hidden">
              <h3 className="font-medium">{item.question}</h3>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink/5 transition-colors group-open:bg-calm/15"><ChevronDown className="size-4 text-mist/60 transition-transform group-open:rotate-180 group-open:text-calm" aria-hidden /></span>
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-mist/70">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
