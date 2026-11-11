import {
  CARE_TROCO,
  PAGE_LIMIT,
  PAGE_PRICE,
  POCKETS,
  REPRINT_PRICE,
  STICKERS_PER_PAGE,
  TRADE_FEE,
} from "./labels";
import type {
  Action,
  Album,
  Archetype,
  Instance,
  Material,
  Place,
  Tariff,
  User,
  World,
} from "./types";

const DEFAULT_TARIFF: Tariff = {
  veludoEm3d: 4,
  tresdEmHolografico: 2,
  holograficoEmGelatina: 3,
};

export function dayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function activeUser(world: World): User {
  const user = world.users.find((item) => item.id === world.activeUserId);
  if (!user) throw new Error("Não há ninguém segurando o álbum.");
  return user;
}

export function museumAlbum(world: World, userId: string): Album {
  const album = world.albums.find((item) => item.userId === userId && item.kind === "museu");
  if (!album) throw new Error("O caderno sumiu.");
  return album;
}

export function gelatinThickness(world: World, userId: string): number {
  return world.instances.filter(
    (item) => item.ownerId === userId && item.home === "moeda" && item.material === "gelatina",
  ).length;
}

function hash(seed: string): number {
  let value = 2166136261;
  for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T extends { weight: number }>(rng: () => number, items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

const ARCHETYPES: Archetype[] = [
  { id: "concha", name: "Concha", motif: "concha", hue: 18, common: true },
  { id: "lua", name: "Lua torta", motif: "lua", hue: 214, common: true },
  { id: "peixe", name: "Peixe", motif: "peixe", hue: 168, common: true },
  { id: "estrela", name: "Estrela cadente", motif: "estrela", hue: 42, common: true },
  { id: "cereja", name: "Cereja", motif: "cereja", hue: 352, common: true },
  { id: "onda", name: "Onda", motif: "onda", hue: 196, common: true },
  { id: "saturno", name: "Saturno", motif: "saturno", hue: 262, common: false },
  { id: "gato", name: "Gato dormindo", motif: "gato", hue: 28, common: false },
  { id: "raio", name: "Raio", motif: "raio", hue: 46, common: false },
  { id: "borboleta", name: "Borboleta", motif: "borboleta", hue: 322, common: false },
];

const PLACES: Place[] = [
  {
    id: "quiosque",
    kind: "quiosque",
    name: "Quiosque da Esquina",
    blurb: "Gelatina e holográfico sem graça. O desenho volta amanhã. A sua cópia de hoje, não.",
    open: true,
    visitTroco: 8,
  },
  {
    id: "papelaria",
    kind: "papelaria",
    name: "Papelaria Grossa",
    blurb: "Folha pesada para o caderno. De vez em quando, veludo no spinner.",
    open: true,
    visitTroco: 8,
  },
  {
    id: "bancada",
    kind: "bancada",
    name: "Bancada que Inclina",
    blurb: "Holográfico bom e 3D. O spinner é curto e gira devagar.",
    open: true,
    visitTroco: 8,
  },
  {
    id: "feira",
    kind: "feira",
    name: "Feira de Sábado",
    blurb: "Só arma no sábado, e nunca no mesmo canto. A peça daqui o jogo não reimprime.",
    open: true,
    visitTroco: 8,
  },
  {
    id: "viagem",
    kind: "viagem",
    name: "Quiosque de Viagem",
    blurb: "Só existe quando você vai até outro lugar. A origem fica carimbada.",
    open: true,
    visitTroco: 8,
  },
  {
    id: "artista",
    kind: "artista",
    name: "Banca do artista",
    blurb: "Aparece se alguém publicar uma arte e cobrar dinheiro de verdade. Troco não compra.",
    open: true,
    visitTroco: 0,
  },
  {
    id: "causa",
    kind: "causa",
    name: "Ponto de causa",
    blurb: "Reciclagem e doação, quando der para verificar. Não é loja. Ainda não paga.",
    open: true,
    visitTroco: 0,
  },
];

type RecipeOption = {
  material: Material;
  price: number;
  weight: number;
  commonOnly?: boolean;
};

const RECIPES: Record<string, { count: number; options: RecipeOption[] }> = {
  quiosque: {
    count: 6,
    options: [
      { material: "gelatina", price: 4, weight: 4, commonOnly: true },
      { material: "holografico", price: 9, weight: 1, commonOnly: true },
    ],
  },
  papelaria: {
    count: 3,
    options: [
      { material: "gelatina", price: 4, weight: 2, commonOnly: true },
      { material: "holografico", price: 9, weight: 1, commonOnly: true },
      { material: "veludo", price: 22, weight: 1 },
    ],
  },
  bancada: {
    count: 3,
    options: [
      { material: "holografico", price: 14, weight: 1 },
      { material: "tresd", price: 18, weight: 1 },
    ],
  },
  feira: {
    count: 2,
    options: [
      { material: "gelatina", price: 5, weight: 1, commonOnly: true },
      { material: "holografico", price: 11, weight: 1 },
    ],
  },
  viagem: {
    count: 2,
    options: [
      { material: "gelatina", price: 6, weight: 1 },
      { material: "holografico", price: 13, weight: 1, commonOnly: true },
    ],
  },
  artista: {
    count: 1,
    options: [{ material: "veludo", price: 28, weight: 1 }],
  },
  causa: {
    count: 1,
    options: [{ material: "gelatina", price: 3, weight: 1, commonOnly: true }],
  },
};

export function placeIsOpen(place: Place, date = new Date()): boolean {
  if (!place.open) return false;
  if (place.kind === "feira") {
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
    }).format(date);
    return weekday === "Sat";
  }
  return true;
}

/** Refresh seed fields on persisted places without wiping player progress. */
export function syncPlaces(world: World): boolean {
  let changed = false;
  const seeds = new Map(PLACES.map((place) => [place.id, place]));
  for (const place of world.places) {
    const seed = seeds.get(place.id);
    if (!seed) continue;
    if (place.open !== seed.open) {
      place.open = seed.open;
      changed = true;
    }
    if (place.visitTroco !== seed.visitTroco) {
      place.visitTroco = seed.visitTroco;
      changed = true;
    }
  }
  return changed;
}

function blankInstance(partial: Pick<Instance, "id" | "archetypeId" | "material" | "originLabel"> & Partial<Instance>): Instance {
  return {
    shopId: null,
    mintedOn: dayKey(),
    condition: "circulado",
    ownerId: null,
    home: "moeda",
    pageId: null,
    pocket: null,
    x: 50,
    y: 50,
    rotation: 0,
    wasInMuseum: false,
    reprint: false,
    history: [],
    ...partial,
  };
}

export function seedWorld(): World {
  const world: World = {
    users: [
      {
        id: "bia",
        name: "Bia",
        troco: 36,
        tariff: { ...DEFAULT_TARIFF },
        visits: {},
        cared: [],
      },
      {
        id: "teo",
        name: "Teo",
        troco: 50,
        tariff: { veludoEm3d: 3, tresdEmHolografico: 2, holograficoEmGelatina: 2 },
        visits: {},
        cared: [],
      },
    ],
    albums: [
      { id: "bia-museu", userId: "bia", kind: "museu", pageIds: ["bia-folha-0", "bia-folha-1"] },
      { id: "bia-moeda", userId: "bia", kind: "moeda", pageIds: [] },
      { id: "teo-museu", userId: "teo", kind: "museu", pageIds: ["teo-folha-0", "teo-folha-1"] },
      { id: "teo-moeda", userId: "teo", kind: "moeda", pageIds: [] },
    ],
    pages: [
      { id: "bia-folha-0", albumId: "bia-museu", index: 0, ghosts: [] },
      { id: "bia-folha-1", albumId: "bia-museu", index: 1, ghosts: [] },
      { id: "teo-folha-0", albumId: "teo-museu", index: 0, ghosts: [] },
      { id: "teo-folha-1", albumId: "teo-museu", index: 1, ghosts: [] },
    ],
    archetypes: ARCHETYPES.map((item) => ({ ...item })),
    instances: [],
    places: PLACES.map((item) => ({ ...item })),
    spinner: [],
    listings: [],
    activeUserId: "bia",
    presence: { bia: null, teo: null },
  };

  ARCHETYPES.slice(0, 6).forEach((archetype, index) => {
    world.instances.push(
      blankInstance({
        id: `bia-g-${index}`,
        archetypeId: archetype.id,
        material: "gelatina",
        shopId: "quiosque",
        originLabel: "Quiosque da Esquina",
        mintedOn: "2026-11-02",
        ownerId: "bia",
        pocket: index,
        history: [{ userId: "bia", at: "2026-11-02" }],
      }),
    );
  });

  world.instances.push(
    blankInstance({
      id: "teo-g-0",
      archetypeId: "onda",
      material: "gelatina",
      shopId: "quiosque",
      originLabel: "Quiosque da Esquina",
      mintedOn: "2026-11-03",
      ownerId: "teo",
      pocket: 0,
      history: [{ userId: "teo", at: "2026-11-03" }],
    }),
    blankInstance({
      id: "teo-h-0",
      archetypeId: "lua",
      material: "holografico",
      shopId: "bancada",
      originLabel: "Bancada que Inclina",
      mintedOn: "2026-11-04",
      ownerId: "teo",
      home: "venda",
      pocket: null,
      history: [{ userId: "teo", at: "2026-11-04" }],
    }),
  );

  world.listings.push({
    id: "list-teo-h-0",
    instanceId: "teo-h-0",
    sellerId: "teo",
    price: 11,
    createdAt: "2026-11-10",
  });

  ensureSpinner(world);
  return world;
}

export function ensureSpinner(world: World, day = dayKey()): boolean {
  let changed = false;
  const spinnerDay = new Date(`${day}T12:00:00-03:00`);
  for (const place of world.places) {
    const recipe = RECIPES[place.id];
    if (!placeIsOpen(place, spinnerDay) || !recipe) continue;
    if (world.spinner.some((slot) => slot.shopId === place.id && slot.day === day)) continue;
    const rng = mulberry32(hash(`${place.id}:${day}`));
    for (let index = 0; index < recipe.count; index += 1) {
      const option = pickWeighted(rng, recipe.options);
      const pool = world.archetypes.filter((item) => (option.commonOnly ? item.common : true));
      const archetype = pool[Math.floor(rng() * pool.length)];
      const instanceId = `spin-${place.id}-${day}-${index}`;
      world.instances.push({
        id: instanceId,
        archetypeId: archetype.id,
        material: option.material,
        shopId: place.id,
        originLabel: place.name,
        mintedOn: day,
        condition: "novo",
        ownerId: null,
        home: "balcao",
        pageId: null,
        pocket: null,
        x: 50,
        y: 50,
        rotation: Math.round(rng() * 16 - 8),
        wasInMuseum: false,
        reprint: false,
        history: [],
      });
      world.spinner.push({
        id: `slot-${place.id}-${day}-${index}`,
        shopId: place.id,
        day,
        instanceId,
        price: option.price,
        sold: false,
      });
      changed = true;
    }
  }
  return changed;
}

function requireUser(world: World): User {
  return activeUser(world);
}

function owned(world: World, instanceId: string): Instance {
  const user = requireUser(world);
  const instance = world.instances.find((item) => item.id === instanceId);
  if (!instance || instance.ownerId !== user.id) throw new Error("Esse adesivo não está com você.");
  return instance;
}

function freePocket(world: World, userId: string): number | null {
  const used = new Set(
    world.instances.filter((item) => item.ownerId === userId && item.home === "moeda").map((item) => item.pocket),
  );
  for (let pocket = 0; pocket < POCKETS; pocket += 1) {
    if (!used.has(pocket)) return pocket;
  }
  return null;
}

function integerIn(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} precisa ser um inteiro entre ${min} e ${max}.`);
  }
  return value;
}

function coordinate(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 8 || value > 92) {
    throw new Error("A posição fica dentro da folha.");
  }
  return Math.round(value * 10) / 10;
}

function tilt(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < -30 || value > 30) {
    throw new Error("A rotação passa do que a cola segura.");
  }
  return Math.round(value);
}

function apply(world: World, action: Action, at = new Date()): string {
  const user = requireUser(world);
  const today = dayKey(at);

  switch (action.type) {
    case "approach": {
      const place = world.places.find((item) => item.id === action.placeId);
      if (!place) throw new Error("Não existe esse lugar.");
      if (!placeIsOpen(place, at)) throw new Error("Esse holograma ainda não solidifica.");
      world.presence[user.id] = place.id;
      if (user.visits[place.id] === today) {
        return "Você já passou aqui hoje. O balcão abre, mas a calçada não paga de novo.";
      }
      user.visits[place.id] = today;
      user.troco += place.visitTroco;
      return `A calçada te dá ${place.visitTroco} troco. O holograma solidificou.`;
    }
    case "buySlot": {
      const slot = world.spinner.find((item) => item.id === action.slotId);
      if (!slot || slot.day !== today) throw new Error("Esse spinner não é de hoje.");
      if (slot.sold) throw new Error("Esse já saiu hoje.");
      if (world.presence[user.id] !== slot.shopId) {
        throw new Error("De longe o holograma só cintila. Chegue na calçada.");
      }
      if (user.troco < slot.price) throw new Error("Troco curto.");
      const pocket = freePocket(world, user.id);
      if (pocket === null) throw new Error("O álbum de fotos não tem bolso livre.");
      const instance = world.instances.find((item) => item.id === slot.instanceId);
      if (!instance) throw new Error("O adesivo sumiu do balcão.");
      slot.sold = true;
      user.troco -= slot.price;
      instance.ownerId = user.id;
      instance.home = "moeda";
      instance.pocket = pocket;
      instance.history.push({ userId: user.id, at: today });
      const archetype = world.archetypes.find((item) => item.id === instance.archetypeId);
      return `${archetype?.name ?? "Adesivo"} foi para o álbum de fotos. Custou ${slot.price} troco.`;
    }
    case "buyPage": {
      if (world.presence[user.id] !== "papelaria") {
        throw new Error("A folha só se compra na Papelaria Grossa, na calçada.");
      }
      if (user.troco < PAGE_PRICE) throw new Error("Troco curto.");
      const album = museumAlbum(world, user.id);
      if (album.pageIds.length >= PAGE_LIMIT) throw new Error("O caderno não aceita mais folha.");
      const page = {
        id: `${user.id}-folha-${album.pageIds.length}`,
        albumId: album.id,
        index: album.pageIds.length,
        ghosts: [],
      };
      user.troco -= PAGE_PRICE;
      world.pages.push(page);
      album.pageIds.push(page.id);
      return "Folha nova no caderno. Ainda está vazia.";
    }
    case "stick": {
      const instance = owned(world, action.instanceId);
      if (instance.home !== "moeda") throw new Error("Só dá para colar o que está no álbum de fotos.");
      const page = world.pages.find((item) => item.id === action.pageId);
      const album = world.albums.find((item) => item.id === page?.albumId);
      if (!page || !album || album.userId !== user.id || album.kind !== "museu") {
        throw new Error("Essa folha não é do seu caderno.");
      }
      const onPage = world.instances.filter((item) => item.home === "museu" && item.pageId === page.id).length;
      if (onPage >= STICKERS_PER_PAGE) throw new Error("Essa folha já está cheia.");
      instance.home = "museu";
      instance.pageId = page.id;
      instance.pocket = null;
      instance.x = coordinate(action.x);
      instance.y = coordinate(action.y);
      instance.rotation = tilt(action.rotation);
      instance.wasInMuseum = true;
      if (instance.condition !== "marcado") instance.condition = "museu";
      if (!user.cared.includes(instance.id)) {
        user.cared.push(instance.id);
        user.troco += CARE_TROCO;
        return "Colou no caderno. O cuidado rende 3 troco. Descolar deixa fantasma.";
      }
      return "Voltou para a exposição. A marca antiga continua.";
    }
    case "moveOnPage": {
      const instance = owned(world, action.instanceId);
      if (instance.home !== "museu") throw new Error("Esse adesivo não está colado.");
      instance.x = coordinate(action.x);
      instance.y = coordinate(action.y);
      instance.rotation = tilt(action.rotation);
      return "Ajeitou na página. A cola não rasgou.";
    }
    case "unstick": {
      const instance = owned(world, action.instanceId);
      if (instance.home !== "museu" || !instance.pageId) throw new Error("Esse adesivo não está no caderno.");
      const pocket = freePocket(world, user.id);
      if (pocket === null) throw new Error("O álbum de fotos não tem bolso livre para receber a peça.");
      const page = world.pages.find((item) => item.id === instance.pageId);
      if (!page) throw new Error("A folha sumiu.");
      const archetype = world.archetypes.find((item) => item.id === instance.archetypeId);
      page.ghosts.push({
        id: `ghost-${instance.id}-${page.ghosts.length}`,
        material: instance.material,
        archetypeName: archetype?.name ?? "Adesivo",
        x: instance.x,
        y: instance.y,
        rotation: instance.rotation,
      });
      instance.condition = "marcado";
      instance.wasInMuseum = true;
      instance.home = "moeda";
      instance.pageId = null;
      instance.pocket = pocket;
      return "Descolou. A folha guardou o fantasma, e o adesivo ficou marcado.";
    }
    case "movePocket": {
      const instance = owned(world, action.instanceId);
      if (instance.home !== "moeda") throw new Error("No álbum de fotos só se move o que está solto no bolso.");
      const pocket = integerIn(action.pocket, 0, POCKETS - 1, "O bolso");
      const other = world.instances.find(
        (item) => item.ownerId === user.id && item.home === "moeda" && item.pocket === pocket && item.id !== instance.id,
      );
      if (other) other.pocket = instance.pocket;
      instance.pocket = pocket;
      return "Mudou de bolso. Sem cicatriz.";
    }
    case "setTariff": {
      user.tariff = {
        veludoEm3d: integerIn(action.veludoEm3d, 1, 12, "Veludo em 3D"),
        tresdEmHolografico: integerIn(action.tresdEmHolografico, 1, 12, "3D em holográfico"),
        holograficoEmGelatina: integerIn(action.holograficoEmGelatina, 1, 12, "Holográfico em gelatina"),
      };
      return "A tabela é sua. A loja continua com outro preço.";
    }
    case "list": {
      const instance = owned(world, action.instanceId);
      if (instance.home !== "moeda") {
        throw new Error("O que está no caderno não entra na revenda. Descolar deixa marca.");
      }
      if (world.listings.some((item) => item.instanceId === instance.id)) {
        throw new Error("Esse adesivo já está à venda.");
      }
      const price = integerIn(action.price, 2, 999, "O preço");
      instance.home = "venda";
      instance.pocket = null;
      world.listings.push({
        id: `list-${instance.id}-${today}`,
        instanceId: instance.id,
        sellerId: user.id,
        price,
        createdAt: today,
      });
      return `À venda por ${price} troco. Quem comprar leva esta peça, com a história dela.`;
    }
    case "cancelList": {
      const listing = world.listings.find((item) => item.id === action.listingId);
      if (!listing || listing.sellerId !== user.id) throw new Error("Essa venda não é sua.");
      const instance = world.instances.find((item) => item.id === listing.instanceId);
      if (!instance) throw new Error("O adesivo sumiu.");
      const pocket = freePocket(world, user.id);
      if (pocket === null) throw new Error("Não há bolso para recolher a peça.");
      instance.home = "moeda";
      instance.pocket = pocket;
      world.listings = world.listings.filter((item) => item.id !== listing.id);
      return "Tirou da revenda. Voltou para o álbum de fotos.";
    }
    case "buyListing": {
      const listing = world.listings.find((item) => item.id === action.listingId);
      if (!listing) throw new Error("Essa venda já acabou.");
      if (listing.sellerId === user.id) throw new Error("Não dá para comprar o que já é seu.");
      const seller = world.users.find((item) => item.id === listing.sellerId);
      const instance = world.instances.find((item) => item.id === listing.instanceId);
      if (!seller || !instance) throw new Error("A peça não está mais aqui.");
      if (user.troco < listing.price) throw new Error("Troco curto.");
      const pocket = freePocket(world, user.id);
      if (pocket === null) throw new Error("O álbum de fotos não tem bolso livre.");
      const fee = listing.price >= 2 ? TRADE_FEE : 0;
      user.troco -= listing.price;
      seller.troco += listing.price - fee;
      instance.ownerId = user.id;
      instance.home = "moeda";
      instance.pocket = pocket;
      instance.pageId = null;
      if (instance.condition === "novo") instance.condition = "circulado";
      instance.history.push({ userId: user.id, at: today });
      world.listings = world.listings.filter((item) => item.id !== listing.id);
      return `A peça mudou de mão. ${fee} troco saiu de circulação. A história veio junto.`;
    }
    case "buyReprint": {
      const archetype = world.archetypes.find((item) => item.id === action.archetypeId);
      if (!archetype?.common) throw new Error("A prateleira não reimprime esse desenho.");
      if (action.material !== "gelatina" && action.material !== "holografico") {
        throw new Error("A prateleira só reimprime gelatina e holográfico comum.");
      }
      const price = REPRINT_PRICE[action.material];
      if (user.troco < price) throw new Error("Troco curto.");
      const pocket = freePocket(world, user.id);
      if (pocket === null) throw new Error("O álbum de fotos não tem bolso livre.");
      user.troco -= price;
      const id = `reprint-${archetype.id}-${action.material}-${today}-${world.instances.length}`;
      world.instances.push({
        id,
        archetypeId: archetype.id,
        material: action.material,
        shopId: null,
        originLabel: "Prateleira online",
        mintedOn: today,
        condition: "novo",
        ownerId: user.id,
        home: "moeda",
        pageId: null,
        pocket,
        x: 50,
        y: 50,
        rotation: 0,
        wasInMuseum: false,
        reprint: true,
        history: [{ userId: user.id, at: today }],
      });
      return "Reimpressão. Outras pessoas também terão este desenho. Não é a peça de ninguém.";
    }
    case "switchUser": {
      const next = world.users.find((item) => item.id === action.userId);
      if (!next) throw new Error("Essa pessoa não está no bairro.");
      world.activeUserId = next.id;
      return `Agora quem folheia é ${next.name}.`;
    }
    case "reset":
      throw new Error("O recomeço fica fora da jogada.");
    default:
      throw new Error("Não entendi o gesto.");
  }
}

export function perform(input: World, action: Action, at = new Date()): { world: World; notice: string } {
  const world = structuredClone(input);
  const notice = apply(world, action, at);
  return { world, notice };
}
