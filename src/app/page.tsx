import Link from "next/link";
import { ArrowRight, Flame, HeartHandshake, PenLine, Wind } from "lucide-react";
import Faq from "@/components/Faq";
import FeelingPicker from "@/components/FeelingPicker";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import ToolCard from "@/components/ToolCard";
import VentExperience from "@/components/VentExperience";
import WallOfHope from "@/components/WallOfHope";
import { HOME_FAQ } from "@/lib/faq";
import { TOOLS, getTool } from "@/lib/tools";

const FEATURED_SLUGS = ["breathing", "brain-dump", "unsent-letter", "bubble-wrap", "mood-tracker", "sand-garden"];

const STEPS = [
  { icon: PenLine, title: "Write it down", text: "Pour out whatever's on your mind. No one sees it — not even us.", tone: "text-lavender bg-lavender/12" },
  { icon: Flame, title: "Watch it burn", text: "Your words catch fire and drift away. A small, real ritual of letting go.", tone: "text-ember bg-ember/12" },
  { icon: HeartHandshake, title: "Hear something kind", text: "A calm, caring message written for exactly what you shared.", tone: "text-rose-500 bg-rose-300/12" },
  { icon: Wind, title: "Breathe & reset", text: "Follow the breathing bubble, then pick a tool if you need a little more.", tone: "text-calm bg-calm/12" },
];

export default function Home() {
  const featured = FEATURED_SLUGS.map((slug) => getTool(slug)).filter((t) => t !== undefined);

  return (
    <main className="relative overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQ.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />

      <VentExperience />

      <FeelingPicker />

      <section aria-labelledby="how-title" className="mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs tracking-[0.25em] text-calm uppercase">How it works</p>
          <h2 id="how-title" className="font-serif text-3xl text-ink sm:text-4xl">
            Four gentle steps to lighter
          </h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text, tone }, i) => (
            <li key={title} className="glass relative rounded-3xl p-6">
              <span className="absolute top-5 right-6 font-serif text-4xl text-ink/10 italic">{i + 1}</span>
              <span className={`mb-5 flex size-12 items-center justify-center rounded-2xl ring-1 ring-ink/10 ${tone}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mb-2 font-medium text-ink">{title}</h3>
              <p className="text-sm leading-relaxed text-mist/60">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="more-tools" aria-labelledby="more-tools-title" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 pt-24 sm:px-6">
        <div className="mb-10 flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:items-end sm:text-left">
          <div>
            <p className="mb-3 text-xs tracking-[0.25em] text-calm uppercase">The toolkit</p>
            <h2 id="more-tools-title" className="font-serif text-3xl text-ink sm:text-4xl">
              {TOOLS.length} tools for calmer days
            </h2>
            <p className="mt-3 max-w-lg text-mist/60">
              Breathe, ground yourself, sort your thoughts, or just pop some bubble wrap. Private, free, and no sign-up.
            </p>
          </div>
          <Link
            href="/tools"
            className="glass inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-mist/85 transition-colors hover:text-ink"
          >
            See all {TOOLS.length} tools <ArrowRight className="size-4" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tool) => (
            <li key={tool.slug}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      </section>

      <WallOfHope />

      <Faq items={HOME_FAQ} />

      <SiteFooter />
    </main>
  );
}
