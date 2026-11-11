export type Material = "gelatina" | "holografico" | "tresd" | "veludo";
export type Condition = "novo" | "museu" | "circulado" | "marcado";
export type PlaceKind =
  | "quiosque"
  | "papelaria"
  | "bancada"
  | "feira"
  | "viagem"
  | "artista"
  | "causa";
export type Motif =
  | "concha"
  | "lua"
  | "peixe"
  | "estrela"
  | "cereja"
  | "onda"
  | "saturno"
  | "gato"
  | "raio"
  | "borboleta";
export type Home = "moeda" | "museu" | "balcao" | "venda";

export interface Tariff {
  veludoEm3d: number;
  tresdEmHolografico: number;
  holograficoEmGelatina: number;
}

export interface User {
  id: string;
  name: string;
  troco: number;
  tariff: Tariff;
  visits: Record<string, string>;
  cared: string[];
}

export interface Ghost {
  id: string;
  material: Material;
  archetypeName: string;
  x: number;
  y: number;
  rotation: number;
}

export interface Page {
  id: string;
  albumId: string;
  index: number;
  ghosts: Ghost[];
}

export interface Album {
  id: string;
  userId: string;
  kind: "museu" | "moeda";
  pageIds: string[];
}

export interface Archetype {
  id: string;
  name: string;
  motif: Motif;
  hue: number;
  common: boolean;
}

export interface HistoryEntry {
  userId: string;
  at: string;
}

export interface Instance {
  id: string;
  archetypeId: string;
  material: Material;
  shopId: string | null;
  originLabel: string;
  mintedOn: string;
  condition: Condition;
  ownerId: string | null;
  home: Home;
  pageId: string | null;
  pocket: number | null;
  x: number;
  y: number;
  rotation: number;
  wasInMuseum: boolean;
  reprint: boolean;
  history: HistoryEntry[];
}

export interface Place {
  id: string;
  kind: PlaceKind;
  name: string;
  blurb: string;
  open: boolean;
  visitTroco: number;
}

export interface SpinnerSlot {
  id: string;
  shopId: string;
  day: string;
  instanceId: string;
  price: number;
  sold: boolean;
}

export interface Listing {
  id: string;
  instanceId: string;
  sellerId: string;
  price: number;
  createdAt: string;
}

export interface World {
  users: User[];
  albums: Album[];
  pages: Page[];
  archetypes: Archetype[];
  instances: Instance[];
  places: Place[];
  spinner: SpinnerSlot[];
  listings: Listing[];
  activeUserId: string;
  presence: Record<string, string | null>;
}

export type Action =
  | { type: "approach"; placeId: string }
  | { type: "buySlot"; slotId: string }
  | { type: "buyPage" }
  | {
      type: "stick";
      instanceId: string;
      pageId: string;
      x: number;
      y: number;
      rotation: number;
    }
  | { type: "moveOnPage"; instanceId: string; x: number; y: number; rotation: number }
  | { type: "unstick"; instanceId: string }
  | { type: "movePocket"; instanceId: string; pocket: number }
  | {
      type: "setTariff";
      veludoEm3d: number;
      tresdEmHolografico: number;
      holograficoEmGelatina: number;
    }
  | { type: "list"; instanceId: string; price: number }
  | { type: "cancelList"; listingId: string }
  | { type: "buyListing"; listingId: string }
  | { type: "buyReprint"; archetypeId: string; material: "gelatina" | "holografico" }
  | { type: "switchUser"; userId: string }
  | { type: "reset" };
