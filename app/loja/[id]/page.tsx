"use client";

import { useParams } from "next/navigation";
import { StickerFace } from "@/components/sticker";
import { useWorld } from "@/components/world";
import { PAGE_PRICE } from "@/lib/labels";
import { dayKey } from "@/lib/logic";

export default function LojaPage() {
  const params = useParams<{ id: string }>();
  const { world, pending, act } = useWorld();
  if (!world) return null;
  const place = world.places.find((item) => item.id === params.id);
  if (!place) return <p>Esse holograma não está no bairro.</p>;
  if (!place.open) {
    return (
      <section className="counter">
        <h2>{place.name}</h2>
        <p>{place.blurb}</p>
        <p>Sem balcão. Sem spinner. O lugar existe no mapa e ainda não abre.</p>
      </section>
    );
  }

  const near = world.presence[world.activeUserId] === place.id;
  const today = dayKey();
  const slots = world.spinner.filter((slot) => slot.shopId === place.id && slot.day === today);

  return (
    <section className="counter">
      <div className={`counter-card ${near ? "shop near" : "shop far"}`}>
        <span className="kicker">{near ? "Solidificado" : "Cintilando"}</span>
        <h2>{place.name}</h2>
        <p>{place.blurb}</p>
        {near ? (
          <p>Você está na calçada.</p>
        ) : (
          <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "approach", placeId: place.id })}>
            Estou na calçada
          </button>
        )}
      </div>
      {near ? (
        <div className="spinner">
          {slots.map((slot) => {
            const instance = world.instances.find((item) => item.id === slot.instanceId);
            const archetype = world.archetypes.find((item) => item.id === instance?.archetypeId);
            if (!instance || !archetype) return null;
            return (
              <article key={slot.id} className={slot.sold ? "slot gone" : "slot"}>
                <StickerFace motif={archetype.motif} hue={archetype.hue} material={instance.material} />
                <strong>{archetype.name}</strong>
                <p className="meta">{instance.material === "tresd" ? "3D" : instance.material === "holografico" ? "Holográfico" : instance.material === "veludo" ? "Veludo" : "Gelatina"} · {slot.price} troco</p>
                {slot.sold ? (
                  <p>Já saiu hoje.</p>
                ) : (
                  <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "buySlot", slotId: slot.id })}>
                    Levar {archetype.name} por {slot.price} troco
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <p>O spinner não abre daqui. {slots.filter((slot) => !slot.sold).length} peças ainda estão no balcão.</p>
      )}
      {place.id === "papelaria" && near ? (
        <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "buyPage" })}>
          Folha nova do caderno — {PAGE_PRICE} troco
        </button>
      ) : null}
    </section>
  );
}
