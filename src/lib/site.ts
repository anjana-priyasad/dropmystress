import type { Metadata } from "next";

/** Public site URL, e.g. https://dropmystress.com. Set NEXT_PUBLIC_SITE_URL at build time. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dropmystress.com").replace(/\/+$/, "");
export const SITE_NAME = "DropMyStress";
export const SITE_TAGLINE = "Vent anonymously, let it go, and breathe";
export const SITE_DESCRIPTION =
  "Type out what's stressing you, watch it burn away, and get a calm, kind message back. Plus 20 free, private stress-relief tools: breathing exercises, grounding, journaling, soundscapes and more.";

export const absoluteUrl = (path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;

/** The site-wide share image (app/opengraph-image.tsx). Routes with their own image file override it. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "DropMyStress — vent anonymously, let it go, and breathe",
};

/**
 * Metadata for a single page. Child `openGraph` objects replace the parent's
 * rather than merging, so every page gets the full set here.
 */
export function pageMetadata({
  title,
  description,
  path,
  ownShareImage = false,
}: {
  title: string;
  description: string;
  path: string;
  /** True when the route has its own opengraph-image file; an explicit image here would override it. */
  ownShareImage?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: `${title} · ${SITE_NAME}`,
      description,
      ...(!ownShareImage && { images: [DEFAULT_SHARE_IMAGE] }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      ...(!ownShareImage && { images: [DEFAULT_SHARE_IMAGE.url] }),
    },
  };
}
