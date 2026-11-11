"use client";

import { useState } from "react";
import { StickerFace } from "@/components/sticker";
import { useWorld } from "@/components/world";
import { CONDITION_LABEL, MATERIAL_LABEL, POCKETS, scarText, tariffLine } from "@/lib/labels";
import { gelatinThickness } from "@/lib/logic";

export default function AlbumPage() {
  const { world, pending, act } = useWorld();
  const [selected, setSelected] = useState<string | null>(null);
  const [price, setPrice] = useState(8);
  if (!world) return null;
  const user = world.users.find((item) => item.id === world.activeUserId);
  if (!user) return null;
  const thickness = gelatinThickness(world, user.id);
  const mine = world.instances.filter((item) => item.ownerId === user.id && item.home === "moeda");
  const chosen = mine.find((item) => item.id === selected);

  return (
    <section>
      <h2>Álbum de fotos</h2>
      <p className="meta">Bolso sem compromisso. A lombada engrossa com gelatina. Daqui se negocia.</p>
      <div className="album-layout">
        <div className="spine" style={{ width: 28 + thickness * 4 }}>
          {thickness} gelatinas
        </div>
        <div className="vinyl">
          <div className="pockets">
            {Array.from({ length: POCKETS }, (_, pocket) => {
              const instance = mine.find((item) => item.pocket === pocket);
              const archetype = world.archetypes.find((item) => item.id === instance?.archetypeId);
              return (
                <button
                  key={pocket}
                  className="pocket"
                  type="button"
                  aria-pressed={instance ? selected === instance.id : false}
                  onClick={() => {
                    if (instance) {
                      setSelected(instance.id);
                      return;
                    }
                    if (chosen) void act({ type: "movePocket", instanceId: chosen.id, pocket });
                  }}
                >
                  {instance && archetype ? (
                    <>
                      <StickerFace motif={archetype.motif} hue={archetype.hue} material={instance.material} marked={instance.condition === "marcado"} />
                      <strong>{archetype.name}</strong>
                      <span className="meta">{MATERIAL_LABEL[instance.material]}</span>
                    </>
                  ) : (
                    <span className="empty-pocket">Bolso {pocket + 1} vazio{chosen ? ". Mover para cá" : ""}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {chosen ? (
        <div className="row" style={{ marginTop: "1rem" }}>
          <p className="meta">
            {CONDITION_LABEL[chosen.condition]} · {chosen.originLabel}
            {chosen.reprint ? " · reimpressão" : ""}
            {chosen.condition === "marcado" ? ` · ${scarText(chosen.material)}` : ""}
            {" "}
            {tariffLine(chosen.material, user.tariff)}
          </p>
          <label>
            Preço em troco
            <input type="number" min={2} max={999} value={price} onChange={(event) => setPrice(Number(event.target.value))} />
          </label>
          <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "list", instanceId: chosen.id, price })}>
            Pôr {world.archetypes.find((item) => item.id === chosen.archetypeId)?.name} à venda
          </button>
        </div>
      ) : (
        <p className="meta">O que está no caderno não aparece aqui.</p>
      )}
    </section>
  );
}
