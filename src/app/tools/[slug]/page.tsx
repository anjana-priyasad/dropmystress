import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ToolCard from "@/components/ToolCard";
import ListenButton from "@/components/ListenButton";
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
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
        <SiteHeader />

        <div className="pt-8 pb-8 sm:pt-12">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm text-mist/50 transition-colors hover:text-white">
              <ArrowLeft className="size-4" /> All tools
            </Link>
          </nav>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${category.iconBg}`}>
              <Icon className={`size-6 ${category.accent}`} aria-hidden />
            </span>
            <div>
              <p className={`mb-1 text-xs tracking-widest uppercase ${category.accent} opacity-80`}>
                {category.label} · {tool.duration}
              </p>
              <h1 className="mb-2 font-serif text-3xl text-white/90 sm:text-4xl">{tool.name}</h1>
              <p className="max-w-2xl leading-relaxed text-mist/60">{tool.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ListenButton text={`${tool.name}. ${tool.description}`} label="Listen to intro" />
                <VoiceToggle />
                <VoiceProblemNotice />
              </div>
            </div>
          </div>
        </div>

        <Panel>
          <ToolComponent />
        </Panel>

        <section aria-labelledby="related" className="py-16">
          <h2 id="related" className="mb-5 font-serif text-2xl text-white/85">
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
