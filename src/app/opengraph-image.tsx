import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "DropMyStress — vent anonymously, let it go, and breathe";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Stress relief, online",
    title: "Put it down here. Let it go.",
    subtitle: "Vent anonymously, watch it burn away, and breathe. Plus 20 free calming tools.",
  });
}
