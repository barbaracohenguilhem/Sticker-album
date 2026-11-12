import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/shell";
import "./globals.css";
import "./game.css";

export const metadata: Metadata = {
  title: "Dois álbuns",
  description: "Explore o bairro, descubra adesivos e guarde as histórias dos seus achados.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#acd4ad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
