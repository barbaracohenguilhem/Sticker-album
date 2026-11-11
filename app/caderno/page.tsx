"use client";

import { useState } from "react";
import { StickerFace } from "@/components/sticker";
import { useWorld } from "@/components/world";
import { MATERIAL_LABEL, scarText } from "@/lib/labels";

export default function CadernoPage() {
  const { world, pending, act } = useWorld();
  const [pageId, setPageId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  if (!world) return null;
  const user = world.users.find((item) => item.id === world.activeUserId);
  const album = world.albums.find((item) => item.userId === world.activeUserId && item.kind === "museu");
  if (!user || !album) return null;
  const currentId = pageId && album.pageIds.includes(pageId) ? pageId : album.pageIds[0];
  const page = world.pages.find((item) => item.id === currentId);
  const loose = world.instances.filter((item) => item.ownerId === user.id && item.home === "moeda");
  const glued = world.instances.filter((item) => item.ownerId === user.id && item.home === "museu" && item.pageId === currentId);
  const chosen = world.instances.find((item) => item.id === selected && item.ownerId === user.id);

  function placeAt(x: number, y: number) {
    if (!chosen || !currentId) return;
    if (chosen.home === "moeda") {
      void act({ type: "stick", instanceId: chosen.id, pageId: currentId, x, y, rotation: chosen.rotation || -3 });
    } else if (chosen.home === "museu" && chosen.pageId === currentId) {
      void act({ type: "moveOnPage", instanceId: chosen.id, x, y, rotation: chosen.rotation });
    }
  }

  return (
    <section className="sheet-wrap">
      <div>
        <h2>Caderno grosso</h2>
        <p className="meta">Colar aqui é exposição. Descolar deixa um fantasma na folha e marca o adesivo.</p>
      </div>
      <div className="tabs">
        {album.pageIds.map((id, index) => (
          <button key={id} className="tab" type="button" aria-pressed={id === currentId} onClick={() => setPageId(id)}>
            Folha {index + 1}
          </button>
        ))}
      </div>
      {page ? (
        <div
          className="sheet"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            placeAt(x, y);
          }}
        >
          {page.ghosts.map((ghost) => (
            <span key={ghost.id} className="ghost" style={{ left: `${ghost.x}%`, top: `${ghost.y}%`, ["--tilt" as string]: `${ghost.rotation}deg` }}>
              Fantasma de {ghost.archetypeName}
            </span>
          ))}
          {glued.map((instance) => {
            const archetype = world.archetypes.find((item) => item.id === instance.archetypeId);
            if (!archetype) return null;
            return (
              <button
                key={instance.id}
                className="placed"
                type="button"
                aria-pressed={selected === instance.id}
                style={{ left: `${instance.x}%`, top: `${instance.y}%`, ["--tilt" as string]: `${instance.rotation}deg` }}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(instance.id);
                }}
              >
                <StickerFace motif={archetype.motif} hue={archetype.hue} material={instance.material} marked={instance.condition === "marcado"} />
                <span className="sr">{archetype.name}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {chosen?.home === "museu" ? (
        <div className="row">
          <button className="buy" type="button" disabled={pending} onClick={() => act({ type: "unstick", instanceId: chosen.id })}>
            Descolar {world.archetypes.find((item) => item.id === chosen.archetypeId)?.name}
          </button>
          {chosen.condition === "marcado" ? <p className="meta">{scarText(chosen.material)}</p> : null}
        </div>
      ) : null}
      <h3>Tirar do álbum de fotos</h3>
      <div className="tray">
        {loose.map((instance) => {
          const archetype = world.archetypes.find((item) => item.id === instance.archetypeId);
          if (!archetype) return null;
          return (
            <article key={instance.id}>
              <button type="button" className="text-button" aria-pressed={selected === instance.id} onClick={() => setSelected(instance.id)}>
                <StickerFace motif={archetype.motif} hue={archetype.hue} material={instance.material} marked={instance.condition === "marcado"} />
                {archetype.name}
              </button>
              <p className="meta">{MATERIAL_LABEL[instance.material]} · {instance.originLabel}</p>
              <button
                className="buy"
                type="button"
                disabled={pending || !currentId}
                onClick={() => {
                  const count = glued.length;
                  void act({
                    type: "stick",
                    instanceId: instance.id,
                    pageId: currentId!,
                    x: 28 + (count % 3) * 22,
                    y: 30 + Math.floor(count / 3) * 24,
                    rotation: -4,
                  });
                }}
              >
                Colar {archetype.name} nesta folha
              </button>
            </article>
          );
        })}
        {loose.length === 0 ? <p>O álbum de fotos não tem peça solta.</p> : null}
      </div>
    </section>
  );
}
