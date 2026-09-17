import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared social-share card: soft morning-sky background, soft bubble, title and subtitle. */
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
          background: "linear-gradient(135deg, #dff0ec 0%, #eceff8 55%, #f8efe6 100%)",
          color: "#1d2a3a",
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
            border: "18px solid rgba(31, 127, 113, 0.35)",
            background: "radial-gradient(circle, rgba(95,99,201,0.14) 0%, rgba(31,127,113,0.05) 60%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div style={{ position: "absolute", right: 250, bottom: 70, width: 44, height: 44, borderRadius: 9999, background: "#e0691f" }} />
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: "#1f7f71" }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: "#1d2a3a" }}>{title}</div>
          <div style={{ marginTop: 28, fontSize: 36, lineHeight: 1.35, color: "rgba(59, 74, 92, 0.9)" }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, color: "rgba(59, 74, 92, 0.75)" }}>
          DropMyStress · free & private
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
