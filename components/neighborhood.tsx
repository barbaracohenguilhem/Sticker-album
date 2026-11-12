"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { dayKey, placeIsOpen } from "@/lib/logic";
import { MATERIAL_LABEL, PAGE_PRICE, POCKETS } from "@/lib/labels";
import type { Motif, Place, World } from "@/lib/types";
import { GameIcon } from "./game-icon";
import { NeighborhoodScene } from "./neighborhood-scene";
import { StickerFace } from "./sticker";
import { useWorld } from "./world";

type Point = { x: number; y: number };
const START: Point = { x: 515, y: 560 };
// Scene coordinates for the fictional neighborhood, not geographic locations.
const LANDMARKS: Record<string, Point & { motif: Motif; hue: number; label: string }> = {
  quiosque: { x: 420, y: 405, motif: "lua", hue: 215, label: "A esquina" },
  papelaria: { x: 700, y: 355, motif: "estrela", hue: 38, label: "Papelaria" },
  bancada: { x: 245, y: 535, motif: "saturno", hue: 267, label: "A bancada" },
  feira: { x: 700, y: 665, motif: "cereja", hue: 350, label: "Feira de sábado" },
  viagem: { x: 850, y: 240, motif: "onda", hue: 192, label: "Lá do outro lado" },
  artista: { x: 430, y: 200, motif: "borboleta", hue: 317, label: "O artista" },
  causa: { x: 370, y: 730, motif: "peixe", hue: 159, label: "Ponto de encontro" },
};

function positionAt(placeId: string | null | undefined): Point {
  const landmark = placeId ? LANDMARKS[placeId] : undefined;
  return landmark ? { x: landmark.x + 18, y: landmark.y + 64 } : START;
}

function Encounter({ place, world, onClose }: { place: Place; world: World; onClose: () => void }) {
  const { act, pending, error } = useWorld();
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [collected, setCollected] = useState<string | null>(null);
  const [pageAdded, setPageAdded] = useState(false);
  const today = dayKey();
  const near = world.presence[world.activeUserId] === place.id;
  const open = placeIsOpen(place);
  const user = world.users.find((item) => item.id === world.activeUserId)!;
  const slots = world.spinner.filter((slot) => slot.shopId === place.id && slot.day === today && !slot.sold);
  const slot = slots[index % Math.max(1, slots.length)];
  const instance = world.instances.find((item) => item.id === (collected ?? slot?.instanceId));
  const archetype = world.archetypes.find((item) => item.id === instance?.archetypeId);
  const full = world.instances.filter((item) => item.ownerId === user.id && item.home === "moeda").length >= POCKETS;
  const marker = LANDMARKS[place.id];

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog ref={dialog} className="encounter" aria-labelledby="encounter-title" onCancel={onClose}>
      <button className="icon-button encounter-close" type="button" onClick={onClose} aria-label="Voltar ao passeio">
        <GameIcon name="close" />
      </button>
      <div className="encounter-heading">
        <h2 id="encounter-title">{collected ? "Um novo achado!" : place.name}</h2>
        <p>{collected ? "Essa cópia agora faz parte da sua história." : near && open ? "Olhe com calma. Cada peça daqui é única." : "Um lugar, outras descobertas."}</p>
      </div>
      <div className={`encounter-stage${collected ? " is-collected" : ""}`}>
        <div className="sticker-plinth">
          {near && open && instance && archetype ? (
            <StickerFace motif={archetype.motif} hue={archetype.hue} material={instance.material} />
          ) : (
            <StickerFace motif={marker.motif} hue={marker.hue} material="holografico" />
          )}
        </div>
        {near && open && !collected && slots.length > 1 ? (
          <>
            <button className="icon-button carousel-prev" type="button" aria-label="Adesivo anterior" disabled={pending} onClick={() => setIndex((index + slots.length - 1) % slots.length)}>
              <GameIcon name="back" />
            </button>
            <button className="icon-button carousel-next" type="button" aria-label="Próximo adesivo" disabled={pending} onClick={() => setIndex((index + 1) % slots.length)}>
              <GameIcon name="arrow" />
            </button>
          </>
        ) : null}
        <span className="stage-caption">
          {collected ? "Guardado no álbum" : !open ? "A feira volta no sábado" : near ? `${slots.length} ${slots.length === 1 ? "achado disponível" : "achados disponíveis"}` : "Há algo para descobrir aqui"}
        </span>
      </div>
      {error ? <p className="encounter-error" role="alert">{error}</p> : null}
      <div className="encounter-content">
        {!open ? (
          <>
            <h3>Ainda não é dia de feira.</h3>
            <p>Esse ponto abre aos sábados, no horário de São Paulo. Enquanto isso, tem um bairro inteiro para explorar.</p>
            <button className="game-action" type="button" onClick={onClose}>Continuar o passeio <GameIcon name="arrow" /></button>
          </>
        ) : !near ? (
          <>
            <p>{slots.length ? `${slots.length} adesivos esperam por um álbum neste ponto.` : "Os adesivos de hoje já encontraram um álbum. Você ainda pode visitar."}</p>
            {place.visitTroco > 0 && user.visits[place.id] !== today ? (
              <p className="visit-reward"><GameIcon name="coin" /> +{place.visitTroco} troco na primeira visita do dia</p>
            ) : null}
            <button className="game-action" type="button" disabled={pending} onClick={() => act({ type: "approach", placeId: place.id })}>
              {pending ? "Chegando…" : "Explorar este ponto"} <GameIcon name="arrow" />
            </button>
            <p className="simulation-note">Deslocamento simulado no bairro fictício. Não usa GPS.</p>
          </>
        ) : collected && archetype && instance ? (
          <>
            <h3>{archetype.name}</h3>
            <p>{MATERIAL_LABEL[instance.material]} · {instance.originLabel}</p>
            <Link className="game-action" href="/album">Ver no meu álbum <GameIcon name="album" /></Link>
            <button className="quiet-button" type="button" onClick={() => { setCollected(null); setIndex(0); }}>Ver outros achados</button>
          </>
        ) : slot && instance && archetype ? (
          <>
            <h3>{archetype.name}</h3>
            <p>{MATERIAL_LABEL[instance.material]} · {index % slots.length + 1} de {slots.length}</p>
            <button
              className="game-action"
              type="button"
              disabled={pending || full || user.troco < slot.price}
              onClick={async () => {
                if (await act({ type: "buySlot", slotId: slot.id })) setCollected(instance.id);
              }}
            >
              {pending ? "Guardando…" : `Guardar por ${slot.price} troco`} <GameIcon name="plus" />
            </button>
            {full ? <p>Seu álbum está cheio. <Link href="/caderno">Cole uma peça no caderno</Link> para liberar um bolso.</p> : <p className="simulation-note">Você tem {user.troco} troco.{user.troco < slot.price ? " Explore outros pontos para juntar mais." : " A peça sai do balcão quando você a guarda."}</p>}
          </>
        ) : (
          <>
            <h3>Por hoje, todo mundo foi.</h3>
            <p>As peças deste ponto já encontraram um álbum. Amanhã tem outras.</p>
            <button className="game-action" type="button" onClick={onClose}>Explorar outro ponto <GameIcon name="arrow" /></button>
          </>
        )}
        {near && open && place.id === "papelaria" && !collected ? (
          <>
            <button className="quiet-button" type="button" disabled={pending} onClick={async () => {
              setPageAdded(false);
              if (await act({ type: "buyPage" })) setPageAdded(true);
            }}>Uma folha nova para o caderno · {PAGE_PRICE} troco</button>
            {pageAdded ? <p role="status">Folha nova guardada no caderno.</p> : null}
          </>
        ) : null}
      </div>
    </dialog>
  );
}

export function Neighborhood() {
  const { world, pending } = useWorld();
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number; camera: Point } | null>(null);
  const [size, setSize] = useState({ width: 1000, height: 800 });
  const [camera, setCamera] = useState<Point>(START);
  const [zoom, setZoom] = useState(.85);
  const [selected, setSelected] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [dragging, setDragging] = useState(false);
  const here = world?.presence[world.activeUserId];
  const player = positionAt(here);
  const place = world?.places.find((item) => item.id === selected);
  const visited = world?.users.find((item) => item.id === world.activeUserId)?.visits ?? {};

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setCamera(positionAt(here));
  }, [here, world?.activeUserId]);

  function pan(point: Point) {
    setCamera({ x: Math.max(100, Math.min(900, point.x)), y: Math.max(100, Math.min(900, point.y)) });
  }

  if (!world) return null;

  return (
    <section className="exploration" aria-label="Passeio pelo bairro">
      <div
        ref={viewport}
        className={`map-viewport${dragging ? " is-dragging" : ""}`}
        tabIndex={0}
        aria-label="Mapa do bairro fictício. Arraste ou use as setas para explorar. Use Tab para escolher um ponto."
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const directions: Record<string, Point> = { ArrowUp: { x: 0, y: -65 }, ArrowDown: { x: 0, y: 65 }, ArrowLeft: { x: -65, y: 0 }, ArrowRight: { x: 65, y: 0 } };
          const direction = directions[event.key];
          if (!direction) return;
          event.preventDefault();
          pan({ x: camera.x + direction.x, y: camera.y + direction.y });
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || (event.target instanceof Element && event.target.closest("button"))) return;
          drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, camera };
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (!drag.current || drag.current.pointerId !== event.pointerId) return;
          pan({ x: drag.current.camera.x - (event.clientX - drag.current.x) / zoom, y: drag.current.camera.y - (event.clientY - drag.current.y) / zoom });
        }}
        onPointerUp={() => { drag.current = null; setDragging(false); }}
        onPointerCancel={() => { drag.current = null; setDragging(false); }}
        onLostPointerCapture={() => { drag.current = null; setDragging(false); }}
      >
        <div className="map-world" style={{ transform: `translate(${size.width / 2 - camera.x * zoom}px, ${size.height / 2 - camera.y * zoom}px) scale(${zoom})` }}>
          <NeighborhoodScene />
          {world.places.map((place) => {
            const landmark = LANDMARKS[place.id];
            if (!landmark) return null;
            const open = placeIsOpen(place);
            const remaining = world.spinner.filter((slot) => slot.shopId === place.id && slot.day === dayKey() && !slot.sold).length;
            return (
              <button
                key={place.id}
                type="button"
                className={`map-pin${!open ? " is-closed" : ""}${here === place.id ? " is-here" : ""}`}
                style={{ left: landmark.x, top: landmark.y }}
                disabled={pending}
                aria-label={`${place.name}. ${open ? `${remaining} adesivos disponíveis` : "Fechada, abre no sábado"}.`}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) setCamera(landmark);
                }}
                onClick={() => setSelected(place.id)}
              >
                <span className="pin-piece"><StickerFace motif={landmark.motif} hue={landmark.hue} material={open ? "holografico" : "veludo"} /></span>
                <span className="pin-stem" />
                <span className="pin-label">{landmark.label}{visited[place.id] ? <GameIcon name="check" /> : null}</span>
                <span className="pin-detail">{!open ? "SÓ NO SÁBADO" : remaining ? `${remaining} ${remaining === 1 ? "ACHADO" : "ACHADOS"}` : "VOLTE AMANHÃ"}</span>
              </button>
            );
          })}
          <div className="map-player" style={{ left: player.x, top: player.y }} aria-label={`Você está ${here ? `em ${world.places.find((place) => place.id === here)?.name}` : "na praça"}`}>
            <span className="player-radius" />
            <span className="player-avatar"><span className="avatar-hair" /><span className="avatar-head" /><span className="avatar-body" /><span className="avatar-bag" /></span>
            <span className="player-label">você</span>
          </div>
        </div>
      </div>
      <div className="neighborhood-heading">
        <span className="walk-mode"><span /> Passeio livre</span>
        <h1>O bairro te espera.</h1>
        <p>Uma esquina. Um encontro. Um novo achado.</p>
      </div>
      <div className="map-controls" role="group" aria-label="Controles do mapa">
        <button className="icon-button" type="button" aria-label="Aproximar mapa" disabled={zoom >= 1.4} onClick={() => setZoom(Math.min(1.4, zoom + .15))}><GameIcon name="plus" /></button>
        <button className="icon-button" type="button" aria-label="Afastar mapa" disabled={zoom <= .55} onClick={() => setZoom(Math.max(.55, zoom - .15))}><GameIcon name="minus" /></button>
        <button className="icon-button recenter" type="button" aria-label="Voltar para minha posição" onClick={() => setCamera(player)}><GameIcon name="target" /></button>
      </div>
      <div className="explore-hint"><GameIcon name="explore" /><span>Arraste o bairro.<br /><strong>Toque em um achado.</strong></span></div>
      <div className="map-help">
        <button className="icon-button" type="button" aria-label="Como explorar" aria-expanded={help} aria-controls="walk-help" onClick={() => setHelp(!help)}><GameIcon name="help" /></button>
        {help ? <p id="walk-help">Este é um <strong>bairro fictício, sem GPS</strong>. Arraste ou use as setas para olhar ao redor. Escolha um ponto para visitar e guardar adesivos. Seu álbum e seu progresso ficam salvos neste servidor.</p> : null}
        <span>Bairro fictício · sem GPS</span>
      </div>
      {place ? <Encounter key={`${world.activeUserId}-${place.id}`} world={world} place={place} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}
