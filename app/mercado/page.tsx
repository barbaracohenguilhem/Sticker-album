"use client";

import { StickerFace } from "@/components/sticker";
import { useWorld } from "@/components/world";
import { CONDITION_LABEL, MATERIAL_LABEL, REPRINT_PRICE, historyLine, scarText, tariffLine } from "@/lib/labels";

export default function MercadoPage() {
  const { world, pending, act } = useWorld();
  if (!world) return null;
  const user = world.users.find((item) => item.id === world.activeUserId);
  if (!user) return null;
  const commons = world.archetypes.filter((item) => item.common);

  return (
    <section className="market">
      <div className="split">
        <div>
          <h2>Revenda</h2>
          <p className="meta">Quem compra leva esta peça: origem, cicatriz e donos. Não é uma cópia nova.</p>
          <div className="spinner">
            {world.listings.map((listing) => {
              const instance = world.instances.find((item) => item.id === listing.instanceId);
              const archetype = world.archetypes.find((item) => item.id === instance?.archetypeId);
              const seller = world.users.find((item) => item.id === listing.sellerId);
              if (!instance || !archetype || !seller) return null;
              const mine = seller.id === user.id;
              return (
                <article key={listing.id} className="offer">
                  <StickerFace motif={archetype.motif} hue={archetype.hue} material={instance.material} marked={instance.condition === "marcado"} />
                  <strong>{archetype.name}</strong>
                  <p className="meta">{MATERIAL_LABEL[instance.material]} · {instance.originLabel}</p>
                  <p className="meta">{CONDITION_LABEL[instance.condition]}{instance.condition === "marcado" ? ` · ${scarText(instance.material)}` : ""}</p>
                  <p className="meta">Donos: {historyLine(instance, world.users)}</p>
                  <p className="meta">{tariffLine(instance.material, user.tariff)}</p>
                  <p>{listing.price} troco · {seller.name}</p>
                  {mine ? (
                    <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "cancelList", listingId: listing.id })}>
                      Tirar {archetype.name} da venda
                    </button>
                  ) : (
                    <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "buyListing", listingId: listing.id })}>
                      Comprar a peça de {seller.name} por {listing.price} troco
                    </button>
                  )}
                </article>
              );
            })}
            {world.listings.length === 0 ? <p>Ninguém pôs peça à venda.</p> : null}
          </div>
        </div>
        <div>
          <h2>Prateleira</h2>
          <p className="meta">Reimpressão de desenho comum. Outras pessoas também terão. Não esvazia o spinner da calçada e não vende viagem, feira, 3D nem veludo.</p>
          <div className="spinner">
            {commons.map((archetype) => (
              <article key={archetype.id} className="reprint">
                <StickerFace motif={archetype.motif} hue={archetype.hue} material="gelatina" />
                <strong>{archetype.name}</strong>
                <div className="row">
                  <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "buyReprint", archetypeId: archetype.id, material: "gelatina" })}>
                    Reimprimir {archetype.name} em gelatina por {REPRINT_PRICE.gelatina} troco
                  </button>
                  <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "buyReprint", archetypeId: archetype.id, material: "holografico" })}>
                    Reimprimir {archetype.name} holográfico por {REPRINT_PRICE.holografico} troco
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
