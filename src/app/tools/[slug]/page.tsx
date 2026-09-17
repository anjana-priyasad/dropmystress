import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ToolCard from "@/components/ToolCard";
import ListenButton from "@/components/ListenButton";
import { FavouriteButton, RecordToolVisit, ShareButton } from "@/components/ToolActivity";
import VoiceToggle, { VoiceProblemNotice } from "@/components/VoiceToggle";
import { TOOL_COMPONENTS } from "@/components/tools";
import { Panel } from "@/components/ui";
import { SITE_NAME, SITE_URL, absoluteUrl, pageMetadata } from "@/lib/site";
import { CATEGORIES, TOOLS, getTool, relatedTools } from "@/lib/tools";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  return tool ? pageMetadata({ title: tool.name, description: tool.description, path: `/tools/${tool.slug}`, ownShareImage: true }) : {};
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = getTool(slug);
  const ToolComponent = TOOL_COMPONENTS[slug];
  if (!tool || !ToolComponent) notFound();

  const category = CATEGORIES[tool.category];
  const Icon = tool.icon;

  return (
    <main className="min-h-dvh">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${tool.name} · ${SITE_NAME}`,
            description: tool.description,
            url: absoluteUrl(`/tools/${tool.slug}`),
            isAccessibleForFree: true,
            inLanguage: "en",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@type": "Thing", name: category.label },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
              { "@type": "ListItem", position: 3, name: tool.name, item: absoluteUrl(`/tools/${tool.slug}`) },
            ],
          },
        ]}
      />
      <RecordToolVisit slug={tool.slug} />
      <div className="mx-auto max-w-5xl px-4 pt-3 pb-6 sm:px-8">
        <SiteHeader />

        <div className="pt-10 pb-8 sm:pt-14">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-mist/50">
              <li>
                <Link href="/tools" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
                  <ArrowLeft className="size-4" /> All tools
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className={category.accent}>{category.label}</li>
            </ol>
          </nav>
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
            <span aria-hidden className={`pointer-events-none absolute -top-10 -left-10 size-48 rounded-full opacity-50 blur-3xl ${category.glow}`} />
            <span className={`relative flex size-16 shrink-0 items-center justify-center rounded-3xl ring-1 ring-ink/10 ${category.iconBg}`}>
              <Icon className={`size-7 ${category.accent}`} aria-hidden />
            </span>
            <div className="relative">
              <p className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full bg-ink/5 px-2.5 py-1 tracking-widest uppercase ${category.accent}`}>{category.label}</span>
                <span className="rounded-full bg-ink/5 px-2.5 py-1 text-mist/60">{tool.duration}</span>
              </p>
              <h1 className="mb-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">{tool.name}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-mist/70">{tool.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <FavouriteButton slug={tool.slug} />
                <ListenButton text={`${tool.name}. ${tool.description}`} label="Listen to intro" />
                <ShareButton title={`${tool.name} · ${SITE_NAME}`} path={`/tools/${tool.slug}`} />
                <VoiceToggle />
                <VoiceProblemNotice />
              </div>
            </div>
          </div>
        </div>

        <Panel>
          <ToolComponent />
        </Panel>

        <section aria-labelledby="related" className="pt-20">
          <h2 id="related" className="mb-6 font-serif text-3xl text-ink">
            You might also like
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {relatedTools(tool).map((t) => (
              <li key={t.slug}>
                <ToolCard tool={t} />
              </li>
            ))}
          </ul>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
