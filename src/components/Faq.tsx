import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/faq";

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-title" className="mx-auto w-full max-w-3xl px-6 pt-24">
      <h2 id="faq-title" className="mb-8 text-center font-serif text-3xl text-white/85">
        Questions, answered
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <details key={item.question} className="group rounded-2xl border border-mist/10 bg-dusk/40 open:bg-dusk/70">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-white/90 [&::-webkit-details-marker]:hidden">
              <h3 className="font-medium">{item.question}</h3>
              <ChevronDown className="size-4 shrink-0 text-mist/50 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-mist/70">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
