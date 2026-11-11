import type { Condition, Instance, Material, Tariff, User } from "./types";

export const POCKETS = 12;
export const PAGE_LIMIT = 8;
export const STICKERS_PER_PAGE = 8;
export const CARE_TROCO = 3;
export const PAGE_PRICE = 6;
export const TRADE_FEE = 1;
export const REPRINT_PRICE: Record<"gelatina" | "holografico", number> = {
  gelatina: 7,
  holografico: 12,
};

export const MATERIAL_LABEL: Record<Material, string> = {
  gelatina: "Gelatina",
  holografico: "Holográfico",
  tresd: "3D",
  veludo: "Veludo",
};

export const CONDITION_LABEL: Record<Condition, string> = {
  novo: "Novo",
  museu: "No museu",
  circulado: "Circulado",
  marcado: "Marcado",
};

export function scarText(material: Material): string {
  switch (material) {
    case "veludo":
      return "O pelo ficou careca num canto.";
    case "tresd":
      return "A lente rachou.";
    case "holografico":
      return "O arco-íris arranhou.";
    case "gelatina":
      return "A gelatina ficou opaca na borda.";
  }
}

export function tariffLine(material: Material, tariff: Tariff): string {
  switch (material) {
    case "veludo":
      return `Na sua tabela, 1 veludo vale ${tariff.veludoEm3d} × 3D.`;
    case "tresd":
      return `Na sua tabela, 1 3D vale ${tariff.tresdEmHolografico} × holográfico.`;
    case "holografico":
      return `Na sua tabela, 1 holográfico vale ${tariff.holograficoEmGelatina} × gelatina.`;
    case "gelatina":
      return "Gelatina é a massa da troca. O preço afetivo começa nela.";
  }
}

export function historyLine(instance: Instance, users: User[]): string {
  if (instance.history.length === 0) return "Ainda sem dono.";
  return instance.history
    .map((entry) => users.find((user) => user.id === entry.userId)?.name ?? "Alguém")
    .join(" → ");
}
