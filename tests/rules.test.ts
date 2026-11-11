import assert from "node:assert/strict";
import test from "node:test";
import { ensureSpinner, gelatinThickness, perform, placeIsOpen, seedWorld, syncPlaces } from "../lib/logic";

const WEDNESDAY = new Date("2026-11-11T15:00:00-03:00");
const SATURDAY = new Date("2026-11-14T10:00:00-03:00");

test("o primeiro dia tem os dois álbuns e meia dúzia de gelatinas", () => {
  const world = seedWorld();
  const bia = world.users.find((user) => user.id === "bia");
  assert.ok(bia);
  assert.equal(bia.tariff.veludoEm3d, 4);
  assert.equal(world.albums.filter((album) => album.userId === "bia").length, 2);
  assert.equal(gelatinThickness(world, "bia"), 6);
  assert.equal(
    world.instances.filter((item) => item.ownerId === "bia" && item.home === "museu").length,
    0,
  );
  for (const kind of ["feira", "viagem", "artista", "causa"] as const) {
    assert.equal(world.places.find((place) => place.kind === kind)?.open, true);
  }
  assert.equal(world.places.length, 7);
  assert.equal(
    world.places.filter((place) => placeIsOpen(place, WEDNESDAY)).length,
    6,
  );
  const feira = world.places.find((place) => place.id === "feira");
  assert.ok(feira);
  assert.equal(placeIsOpen(feira, WEDNESDAY), false);
  assert.equal(placeIsOpen(feira, SATURDAY), true);
  assert.ok(world.listings.some((listing) => listing.sellerId === "teo"));
});

test("syncPlaces alinha open e visitTroco sem apagar progresso", () => {
  const world = seedWorld();
  world.users[0].troco = 99;
  world.presence.bia = "quiosque";
  const feira = world.places.find((place) => place.id === "feira");
  const artista = world.places.find((place) => place.id === "artista");
  const causa = world.places.find((place) => place.id === "causa");
  assert.ok(feira && artista && causa);
  feira.open = false;
  feira.visitTroco = 1;
  artista.visitTroco = 8;
  causa.visitTroco = 8;
  assert.equal(syncPlaces(world), true);
  assert.equal(feira.open, true);
  assert.equal(feira.visitTroco, 8);
  assert.equal(artista.visitTroco, 0);
  assert.equal(causa.visitTroco, 0);
  assert.equal(world.users[0].troco, 99);
  assert.equal(world.presence.bia, "quiosque");
  assert.equal(syncPlaces(world), false);
});

test("viagem solidifica, paga calçada e enche o spinner", () => {
  const start = seedWorld();
  ensureSpinner(start, "2026-11-11");
  const walked = perform(start, { type: "approach", placeId: "viagem" }, WEDNESDAY);
  assert.equal(walked.world.users.find((user) => user.id === "bia")?.troco, 44);
  assert.equal(
    walked.world.spinner.filter((slot) => slot.shopId === "viagem" && slot.day === "2026-11-11").length,
    2,
  );
  const piece = walked.world.instances.find(
    (item) => item.shopId === "viagem" && item.mintedOn === "2026-11-11",
  );
  assert.equal(piece?.originLabel, "Quiosque de Viagem");
});

test("artista e causa abrem sem troco de calçada", () => {
  let world = seedWorld();
  ensureSpinner(world, "2026-11-11");
  const artist = perform(world, { type: "approach", placeId: "artista" }, WEDNESDAY);
  assert.equal(artist.world.users.find((user) => user.id === "bia")?.troco, 36);
  assert.equal(artist.world.presence.bia, "artista");
  world = artist.world;
  const cause = perform(world, { type: "approach", placeId: "causa" }, WEDNESDAY);
  assert.equal(cause.world.users.find((user) => user.id === "bia")?.troco, 36);
  assert.equal(
    cause.world.spinner.filter((slot) => slot.shopId === "causa" && slot.day === "2026-11-11").length,
    1,
  );
});

test("a calçada paga uma vez por loja no dia, e loja fechada não solidifica", () => {
  const start = seedWorld();
  const closed = () => perform(start, { type: "approach", placeId: "feira" }, WEDNESDAY);
  assert.throws(closed, /não solidifica/);
  assert.equal(start.users[0].troco, 36);

  const first = perform(start, { type: "approach", placeId: "quiosque" }, WEDNESDAY);
  assert.equal(first.world.users.find((user) => user.id === "bia")?.troco, 44);
  assert.equal(first.world.presence.bia, "quiosque");
  const second = perform(first.world, { type: "approach", placeId: "quiosque" }, WEDNESDAY);
  assert.equal(second.world.users.find((user) => user.id === "bia")?.troco, 44);
  assert.match(second.notice, /não paga de novo/);
});

test("no sábado a feira arma dois slots e a calçada paga", () => {
  const start = seedWorld();
  ensureSpinner(start, "2026-11-14");
  assert.equal(
    start.spinner.filter((slot) => slot.shopId === "feira" && slot.day === "2026-11-14").length,
    2,
  );
  const walked = perform(start, { type: "approach", placeId: "feira" }, SATURDAY);
  assert.equal(walked.world.users.find((user) => user.id === "bia")?.troco, 44);
  assert.equal(walked.world.presence.bia, "feira");
  const slot = walked.world.spinner.find(
    (item) => item.shopId === "feira" && item.day === "2026-11-14" && !item.sold,
  );
  assert.ok(slot);
  const bought = perform(walked.world, { type: "buySlot", slotId: slot.id }, SATURDAY);
  assert.equal(bought.world.instances.find((item) => item.id === slot.instanceId)?.ownerId, "bia");
  assert.equal(bought.world.spinner.find((item) => item.id === slot.id)?.sold, true);
});

test("comprar exige a calçada e o spinner acaba", () => {
  let world = seedWorld();
  const slot = world.spinner.find((item) => item.shopId === "quiosque" && !item.sold);
  assert.ok(slot);
  assert.throws(() => perform(world, { type: "buySlot", slotId: slot.id }), /calçada/);
  world = perform(world, { type: "approach", placeId: "quiosque" }).world;
  const bought = perform(world, { type: "buySlot", slotId: slot.id });
  const piece = bought.world.instances.find((item) => item.id === slot.instanceId);
  assert.equal(piece?.ownerId, "bia");
  assert.equal(piece?.home, "moeda");
  assert.equal(piece?.condition, "novo");
  assert.equal(bought.world.spinner.find((item) => item.id === slot.id)?.sold, true);
  assert.throws(() => perform(bought.world, { type: "buySlot", slotId: slot.id }), /já saiu/);
});

test("colar paga o cuidado uma vez, descolar deixa fantasma e mover de bolso não marca de novo", () => {
  let world = perform(seedWorld(), { type: "approach", placeId: "quiosque" }).world;
  const loose = world.instances.find((item) => item.id === "bia-g-0");
  assert.ok(loose);
  const before = world.users.find((user) => user.id === "bia")?.troco ?? 0;
  const stuck = perform(world, {
    type: "stick",
    instanceId: loose.id,
    pageId: "bia-folha-0",
    x: 40,
    y: 36,
    rotation: -4,
  });
  const onPage = stuck.world.instances.find((item) => item.id === loose.id);
  assert.equal(onPage?.home, "museu");
  assert.equal(onPage?.condition, "museu");
  assert.equal(stuck.world.users.find((user) => user.id === "bia")?.troco, before + 3);
  assert.throws(
    () => perform(stuck.world, { type: "list", instanceId: loose.id, price: 8 }),
    /caderno/,
  );

  const peeled = perform(stuck.world, { type: "unstick", instanceId: loose.id });
  const marked = peeled.world.instances.find((item) => item.id === loose.id);
  assert.equal(marked?.condition, "marcado");
  assert.equal(marked?.home, "moeda");
  assert.equal(peeled.world.pages.find((page) => page.id === "bia-folha-0")?.ghosts.length, 1);

  const moved = perform(peeled.world, { type: "movePocket", instanceId: loose.id, pocket: 11 });
  const after = moved.world.instances.find((item) => item.id === loose.id);
  assert.equal(after?.pocket, 11);
  assert.equal(after?.condition, "marcado");
  assert.equal(moved.world.pages.find((page) => page.id === "bia-folha-0")?.ghosts.length, 1);
});

test("revenda transfere a instância e a prateleira fabrica outra", () => {
  const start = seedWorld();
  const listing = start.listings[0];
  const biaBefore = start.users.find((user) => user.id === "bia")?.troco ?? 0;
  const teoBefore = start.users.find((user) => user.id === "teo")?.troco ?? 0;
  const bought = perform(start, { type: "buyListing", listingId: listing.id });
  const piece = bought.world.instances.find((item) => item.id === listing.instanceId);
  assert.equal(piece?.ownerId, "bia");
  assert.equal(piece?.reprint, false);
  assert.deepEqual(
    piece?.history.map((entry) => entry.userId),
    ["teo", "bia"],
  );
  assert.equal(bought.world.users.find((user) => user.id === "bia")?.troco, biaBefore - listing.price);
  assert.equal(bought.world.users.find((user) => user.id === "teo")?.troco, teoBefore + listing.price - 1);
  assert.equal(bought.world.listings.some((item) => item.id === listing.id), false);

  assert.throws(
    () => perform(start, { type: "buyReprint", archetypeId: "saturno", material: "gelatina" }),
    /não reimprime/,
  );
  const reprint = perform(start, { type: "buyReprint", archetypeId: "concha", material: "gelatina" });
  assert.match(reprint.notice, /Outras pessoas também terão/);
  const copy = reprint.world.instances.find((item) => item.reprint && item.ownerId === "bia");
  assert.ok(copy);
  assert.equal(copy?.originLabel, "Prateleira online");
  assert.notEqual(copy?.id, "bia-g-0");
});
