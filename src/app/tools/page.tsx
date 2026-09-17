import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ToolsDirectory from "@/components/ToolsDirectory";
import { SITE_NAME, absoluteUrl, pageMetadata } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = pageMetadata({
  title: "20 Free Stress Relief Tools",
  description:
    "Free, private stress relief tools you can use right now: breathing exercises, grounding, muscle relaxation, a worry sorter, journaling, mood tracking, calming soundscapes and more.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <main className="min-h-dvh">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Stress relief tools · ${SITE_NAME}`,
            url: absoluteUrl("/tools"),
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: TOOLS.length,
              itemListElement: TOOLS.map((tool, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: tool.name,
                url: absoluteUrl(`/tools/${tool.slug}`),
              })),
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
            ],
          },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 pt-3 pb-6 sm:px-8">
        <SiteHeader />
        <div className="py-14 text-center sm:py-20">
          <p className="mb-4 text-xs tracking-[0.25em] text-calm uppercase">The toolkit</p>
          <h1 className="mb-4 font-serif text-4xl tracking-tight text-ink sm:text-6xl">
            Tools for <span className="text-gradient italic">calmer days</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-mist/65">
            Twenty small, private tools to help you breathe, think clearly, let things out, and check in with yourself.
            No accounts. Nothing leaves your device.
          </p>
        </div>
        <ToolsDirectory />
      </div>
      <SiteFooter />
    </main>
  );
}
