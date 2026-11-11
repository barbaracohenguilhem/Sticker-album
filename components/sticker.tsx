import type { Motif } from "@/lib/types";

const PATHS: Record<Motif, string> = {
  concha: "M8 30c8-16 24-16 32 0-10 2-22 2-32 0z M14 30c6 8 14 8 20 0",
  lua: "M30 8a14 14 0 1 0 8 24 11 11 0 1 1-8-24z",
  peixe: "M6 24c10-8 18-8 26 0-8 8-16 8-26 0z M32 24l10-7v14z M12 24h2",
  estrela: "M24 6l4 10 11 1-8 7 2 11-9-6-9 6 2-11-8-7 11-1z",
  cereja: "M18 28a6 6 0 1 0 .1 0 M28 26a6 6 0 1 0 .1 0 M18 22c4-10 12-10 12-2",
  onda: "M6 28c4-8 8-8 12 0s8 8 12 0 8-8 12 0",
  saturno: "M24 24m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0 M8 26c6-8 26-8 32 0-6 4-26 4-32 0z",
  gato: "M12 20l4-8 4 6 8 0 4-6 4 8v10a8 8 0 0 1-8 6h-8a8 8 0 0 1-8-6z M20 26h2 M28 26h2",
  raio: "M26 4L12 26h10l-4 18 18-24H24z",
  borboleta: "M24 14c-8-10-18-2-14 8s14 6 14 6-10 4-14 6 6 18 14 8c8 10 18 2 14-8s-14-6-14-6 10-4 14-6-6-18-14-8z",
};

export function StickerFace({
  motif,
  hue,
  material,
  marked = false,
}: {
  motif: Motif;
  hue: number;
  material: "gelatina" | "holografico" | "tresd" | "veludo";
  marked?: boolean;
}) {
  return (
    <span
      className={`sticker ${material}${marked ? " marcado" : ""}`}
      style={{ ["--h" as string]: hue }}
    >
      <span className="face" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
          <path d={PATHS[motif]} />
        </svg>
      </span>
    </span>
  );
}
