import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared social-share card: dark calm background, soft bubble, title and subtitle. */
export function renderOgImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #070b16 0%, #0e1528 60%, #13203a 100%)",
          color: "#e2e8f0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -280,
            top: 55,
            width: 520,
            height: 520,
            borderRadius: 9999,
            border: "18px solid rgba(125, 211, 192, 0.45)",
            background: "radial-gradient(circle, rgba(165,180,252,0.18) 0%, rgba(125,211,192,0.05) 60%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div style={{ position: "absolute", right: 250, bottom: 70, width: 44, height: 44, borderRadius: 9999, background: "#fb923c" }} />
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: "#7dd3c0" }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: "#ffffff" }}>{title}</div>
          <div style={{ marginTop: 28, fontSize: 36, lineHeight: 1.35, color: "rgba(203, 213, 225, 0.85)" }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, color: "rgba(203, 213, 225, 0.75)" }}>
          DropMyStress · free & private
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
