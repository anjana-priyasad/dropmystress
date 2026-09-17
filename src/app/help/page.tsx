import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Phone, Siren, Users } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import SiteHeader from "@/components/SiteHeader";
import { absoluteUrl, pageMetadata } from "@/lib/site";
import { Panel } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Get Help Now — Crisis Helplines",
  description:
    "If you're in crisis, you don't have to go through it alone. Find crisis helplines and emergency numbers for Sri Lanka, the US, the UK and Ireland, and more.",
  path: "/help",
});

const HELPLINES = [
  { region: "Sri Lanka", name: "National Mental Health Helpline", contact: "1926", href: "tel:1926", detail: "Free, 24 hours" },
  { region: "United States", name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", href: "tel:988", detail: "24 hours" },
  { region: "UK & Ireland", name: "Samaritans", contact: "116 123", href: "tel:116123", detail: "Free, 24 hours" },
];

export default function HelpPage() {
  return (
    <main className="min-h-dvh">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Get help now", item: absoluteUrl("/help") },
          ],
        }}
      />
      <div className="mx-auto max-w-3xl px-4 pt-3 pb-6 sm:px-8">
        <SiteHeader />

        <div className="py-12 sm:py-16">
          <h1 className="mb-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">You don&apos;t have to go through this alone.</h1>
          <p className="text-lg leading-relaxed text-mist/70">
            The tools on this site are for everyday stress. If you&apos;re thinking about harming yourself, or you feel
            unsafe, please reach out to a real person right now.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Panel className="border-rose-400/30 bg-rose-500/5">
            <div className="flex gap-4">
              <Siren className="mt-1 size-6 shrink-0 text-rose-500" aria-hidden />
              <div>
                <h2 className="mb-1 text-lg font-medium text-ink">In immediate danger?</h2>
                <p className="text-mist/75">
                  Call your local emergency number now (for example <strong className="text-ink">1990</strong> for an
                  ambulance in Sri Lanka, <strong className="text-ink">911</strong> in the US, <strong className="text-ink">999</strong>{" "}
                  in the UK, or <strong className="text-ink">112</strong> in the EU), or go to the nearest hospital
                  emergency department.
                </p>
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="mb-5 flex items-center gap-2 text-lg font-medium text-ink">
              <Phone className="size-5 text-calm" aria-hidden /> Crisis helplines
            </h2>
            <ul className="flex flex-col divide-y divide-mist/10">
              {HELPLINES.map((line) => (
                <li key={line.region} className="flex flex-col gap-1 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs tracking-widest text-mist/45 uppercase">{line.region}</p>
                    <p className="text-ink/90">{line.name}</p>
                    <p className="text-sm text-mist/50">{line.detail}</p>
                  </div>
                  <a
                    href={line.href}
                    className="inline-flex items-center gap-2 self-start rounded-full bg-calm/15 px-4 py-2 font-medium text-calm transition-colors hover:bg-calm/25 sm:self-auto"
                  >
                    <Phone className="size-4" aria-hidden /> {line.contact}
                  </a>
                </li>
              ))}
              <li className="flex flex-col gap-1 py-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs tracking-widest text-mist/45 uppercase">Anywhere else</p>
                  <p className="text-ink/90">Find A Helpline</p>
                  <p className="text-sm text-mist/50">Free, confidential support lines in many countries</p>
                </div>
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-full border border-mist/15 px-4 py-2 text-mist/80 transition-colors hover:border-mist/30 hover:text-ink sm:self-auto"
                >
                  findahelpline.com <ExternalLink className="size-4" aria-hidden />
                </a>
              </li>
            </ul>
          </Panel>

          <Panel>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-medium text-ink">
              <Users className="size-5 text-lavender" aria-hidden /> Other ways to reach out
            </h2>
            <ul className="list-inside list-disc space-y-2 text-mist/70">
              <li>Tell someone you trust how you&apos;re really feeling — a friend, family member, teacher, or colleague.</li>
              <li>Book an appointment with a doctor or counsellor. Ongoing stress is a health issue, and it&apos;s treatable.</li>
              <li>If talking feels too hard, text or write it down and show it to someone.</li>
            </ul>
          </Panel>
        </div>

        <p className="py-12 text-center text-sm text-mist/45">
          When you feel ready, the <Link href="/tools/grounding" className="text-mist/70 underline underline-offset-2 hover:text-ink">grounding exercise</Link>{" "}
          or <Link href="/tools/breathing" className="text-mist/70 underline underline-offset-2 hover:text-ink">breathing patterns</Link> can
          help in the moment.
        </p>
      </div>
    </main>
  );
}
