import { OG_SIZE, renderOgImage } from "@/lib/og";
import { CATEGORIES, TOOLS, getTool } from "@/lib/tools";

export const alt = "A free stress-relief tool from DropMyStress";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    return renderOgImage({ eyebrow: "Tools", title: "Tools for calmer days", subtitle: "20 free, private stress-relief tools." });
  }
  return renderOgImage({
    eyebrow: `${CATEGORIES[tool.category].label} · ${tool.duration}`,
    title: tool.name,
    subtitle: tool.tagline,
  });
}
