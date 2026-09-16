import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import ToolCard from "@/components/ToolCard";
import VentExperience from "@/components/VentExperience";
import WallOfHope from "@/components/WallOfHope";
import { HOME_FAQ } from "@/lib/faq";
import { TOOLS, getTool } from "@/lib/tools";

const FEATURED_SLUGS = ["breathing", "brain-dump", "unsent-letter", "bubble-wrap", "mood-tracker", "sand-garden"];

export default function Home() {
  const featured = FEATURED_SLUGS.map((slug) => getTool(slug)).filter((t) => t !== undefined);

  return (
    <main className="relative overflow-x-hidden">
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
      <BackgroundGlow />

      <VentExperience />

      <section id="more-tools" aria-labelledby="more-tools-title" className="mx-auto w-full max-w-5xl scroll-mt-8 px-6 pt-24">
        <div className="mb-10 text-center">
          <h2 id="more-tools-title" className="mb-3 font-serif text-3xl text-white/85">
            {TOOLS.length} tools for calmer days
          </h2>
          <p className="mx-auto max-w-lg text-mist/55">
            Breathe, ground yourself, sort your thoughts, or just pop some bubble wrap. Private, free, and no sign-up.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tool) => (
            <li key={tool.slug}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-full border border-mist/15 px-5 py-2.5 text-mist/80 transition-colors hover:border-mist/30 hover:text-white"
          >
            See all {TOOLS.length} tools <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <Faq items={HOME_FAQ} />

      <WallOfHope />

      <SiteFooter />
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-lavender/[0.06] blur-3xl" />
      <div className="absolute -bottom-52 -left-32 size-[36rem] rounded-full bg-calm/[0.05] blur-3xl" />
    </div>
  );
}
