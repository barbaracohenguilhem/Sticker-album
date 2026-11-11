import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ensureSpinner, perform, seedWorld } from "./logic";
import type { Action, World } from "./types";

const file = path.join(process.cwd(), "data", "album.sqlite");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  troco INTEGER NOT NULL,
  tariff_json TEXT NOT NULL,
  visits_json TEXT NOT NULL,
  cared_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  page_ids_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL,
  idx INTEGER NOT NULL,
  ghosts_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS archetypes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  motif TEXT NOT NULL,
  hue INTEGER NOT NULL,
  common INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS instances (
  id TEXT PRIMARY KEY,
  archetype_id TEXT NOT NULL,
  material TEXT NOT NULL,
  shop_id TEXT,
  origin_label TEXT NOT NULL,
  minted_on TEXT NOT NULL,
  condition TEXT NOT NULL,
  owner_id TEXT,
  home TEXT NOT NULL,
  page_id TEXT,
  pocket INTEGER,
  x REAL NOT NULL,
  y REAL NOT NULL,
  rotation REAL NOT NULL,
  was_in_museum INTEGER NOT NULL,
  reprint INTEGER NOT NULL,
  history_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  blurb TEXT NOT NULL,
  open INTEGER NOT NULL,
  visit_troco INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS spinner (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,
  day TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  sold INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  instance_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  active_user_id TEXT NOT NULL,
  presence_json TEXT NOT NULL
);
`;

let database: DatabaseSync | null = null;

function connection(): DatabaseSync {
  if (!database) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    database = new DatabaseSync(file);
    database.exec(SCHEMA);
  }
  return database;
}

type Row = Record<string, unknown>;

function saveWorld(world: World): void {
  const db = connection();
  db.exec("BEGIN");
  try {
    for (const table of ["users", "albums", "pages", "archetypes", "instances", "places", "spinner", "listings"]) {
      db.exec(`DELETE FROM ${table}`);
    }
    const user = db.prepare(
      "INSERT INTO users (id, name, troco, tariff_json, visits_json, cared_json) VALUES (?, ?, ?, ?, ?, ?)",
    );
    for (const item of world.users) {
      user.run(item.id, item.name, item.troco, JSON.stringify(item.tariff), JSON.stringify(item.visits), JSON.stringify(item.cared));
    }
    const album = db.prepare("INSERT INTO albums (id, user_id, kind, page_ids_json) VALUES (?, ?, ?, ?)");
    for (const item of world.albums) album.run(item.id, item.userId, item.kind, JSON.stringify(item.pageIds));
    const page = db.prepare("INSERT INTO pages (id, album_id, idx, ghosts_json) VALUES (?, ?, ?, ?)");
    for (const item of world.pages) page.run(item.id, item.albumId, item.index, JSON.stringify(item.ghosts));
    const archetype = db.prepare("INSERT INTO archetypes (id, name, motif, hue, common) VALUES (?, ?, ?, ?, ?)");
    for (const item of world.archetypes) archetype.run(item.id, item.name, item.motif, item.hue, item.common ? 1 : 0);
    const instance = db.prepare(
      `INSERT INTO instances (
        id, archetype_id, material, shop_id, origin_label, minted_on, condition, owner_id, home,
        page_id, pocket, x, y, rotation, was_in_museum, reprint, history_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const item of world.instances) {
      instance.run(
        item.id,
        item.archetypeId,
        item.material,
        item.shopId,
        item.originLabel,
        item.mintedOn,
        item.condition,
        item.ownerId,
        item.home,
        item.pageId,
        item.pocket,
        item.x,
        item.y,
        item.rotation,
        item.wasInMuseum ? 1 : 0,
        item.reprint ? 1 : 0,
        JSON.stringify(item.history),
      );
    }
    const place = db.prepare("INSERT INTO places (id, kind, name, blurb, open, visit_troco) VALUES (?, ?, ?, ?, ?, ?)");
    for (const item of world.places) {
      place.run(item.id, item.kind, item.name, item.blurb, item.open ? 1 : 0, item.visitTroco);
    }
    const slot = db.prepare("INSERT INTO spinner (id, shop_id, day, instance_id, price, sold) VALUES (?, ?, ?, ?, ?, ?)");
    for (const item of world.spinner) {
      slot.run(item.id, item.shopId, item.day, item.instanceId, item.price, item.sold ? 1 : 0);
    }
    const listing = db.prepare(
      "INSERT INTO listings (id, instance_id, seller_id, price, created_at) VALUES (?, ?, ?, ?, ?)",
    );
    for (const item of world.listings) {
      listing.run(item.id, item.instanceId, item.sellerId, item.price, item.createdAt);
    }
    db.prepare(
      `INSERT INTO session (id, active_user_id, presence_json) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET active_user_id = excluded.active_user_id, presence_json = excluded.presence_json`,
    ).run(world.activeUserId, JSON.stringify(world.presence));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function readWorld(): World | null {
  const db = connection();
  const users = db.prepare("SELECT * FROM users").all() as Row[];
  if (users.length === 0) return null;
  const session = db.prepare("SELECT * FROM session WHERE id = 1").get() as Row | undefined;
  const albums = db.prepare("SELECT * FROM albums").all() as Row[];
  const pages = db.prepare("SELECT * FROM pages").all() as Row[];
  const archetypes = db.prepare("SELECT * FROM archetypes").all() as Row[];
  const instances = db.prepare("SELECT * FROM instances").all() as Row[];
  const places = db.prepare("SELECT * FROM places").all() as Row[];
  const spinner = db.prepare("SELECT * FROM spinner").all() as Row[];
  const listings = db.prepare("SELECT * FROM listings").all() as Row[];
  return {
    users: users.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      troco: Number(row.troco),
      tariff: JSON.parse(String(row.tariff_json)),
      visits: JSON.parse(String(row.visits_json)),
      cared: JSON.parse(String(row.cared_json)),
    })),
    albums: albums.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      kind: row.kind === "museu" ? "museu" : "moeda",
      pageIds: JSON.parse(String(row.page_ids_json)),
    })),
    pages: pages.map((row) => ({
      id: String(row.id),
      albumId: String(row.album_id),
      index: Number(row.idx),
      ghosts: JSON.parse(String(row.ghosts_json)),
    })),
    archetypes: archetypes.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      motif: row.motif as World["archetypes"][number]["motif"],
      hue: Number(row.hue),
      common: Number(row.common) === 1,
    })),
    instances: instances.map((row) => ({
      id: String(row.id),
      archetypeId: String(row.archetype_id),
      material: row.material as World["instances"][number]["material"],
      shopId: row.shop_id === null ? null : String(row.shop_id),
      originLabel: String(row.origin_label),
      mintedOn: String(row.minted_on),
      condition: row.condition as World["instances"][number]["condition"],
      ownerId: row.owner_id === null ? null : String(row.owner_id),
      home: row.home as World["instances"][number]["home"],
      pageId: row.page_id === null ? null : String(row.page_id),
      pocket: row.pocket === null ? null : Number(row.pocket),
      x: Number(row.x),
      y: Number(row.y),
      rotation: Number(row.rotation),
      wasInMuseum: Number(row.was_in_museum) === 1,
      reprint: Number(row.reprint) === 1,
      history: JSON.parse(String(row.history_json)),
    })),
    places: places.map((row) => ({
      id: String(row.id),
      kind: row.kind as World["places"][number]["kind"],
      name: String(row.name),
      blurb: String(row.blurb),
      open: Number(row.open) === 1,
      visitTroco: Number(row.visit_troco),
    })),
    spinner: spinner.map((row) => ({
      id: String(row.id),
      shopId: String(row.shop_id),
      day: String(row.day),
      instanceId: String(row.instance_id),
      price: Number(row.price),
      sold: Number(row.sold) === 1,
    })),
    listings: listings.map((row) => ({
      id: String(row.id),
      instanceId: String(row.instance_id),
      sellerId: String(row.seller_id),
      price: Number(row.price),
      createdAt: String(row.created_at),
    })),
    activeUserId: session ? String(session.active_user_id) : "bia",
    presence: session ? JSON.parse(String(session.presence_json)) : {},
  };
}

export function loadWorld(): World {
  const existing = readWorld();
  const world = existing ?? seedWorld();
  const spun = ensureSpinner(world);
  if (!existing || spun) saveWorld(world);
  return world;
}

export function applyAction(action: Action): { world: World; notice: string } {
  if (action.type === "reset") {
    const world = seedWorld();
    saveWorld(world);
    return { world, notice: "O bairro recomeçou. Os dois álbuns voltaram ao primeiro dia." };
  }
  const result = perform(loadWorld(), action);
  saveWorld(result.world);
  return result;
}
