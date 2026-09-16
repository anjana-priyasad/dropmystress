import type { Metadata, Viewport } from "next";
import { Geist, Lora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "DropMyStress — let it go", template: "%s · DropMyStress" },
  description:
    "Type out what's weighing on you, watch it burn away, and take a quiet breath.",
};

export const viewport: Viewport = {
  themeColor: "#070b16",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-night font-sans text-mist">{children}</body>
    </html>
  );
}
