import { Fraunces, Literata } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/shell";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const text = Literata({ subsets: ["latin"], variable: "--font-text" });

export const metadata: Metadata = {
  title: "Dois álbuns",
  description: "Caderno-museu, álbum de fotos e lojas-holograma de adesivos.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#17202b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${text.variable}`}>
      <body style={{ fontFamily: "var(--font-text), Georgia, serif" }}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
