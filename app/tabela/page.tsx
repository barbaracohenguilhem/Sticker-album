"use client";

import { useWorld } from "@/components/world";

export default function TabelaPage() {
  const { world, pending, act } = useWorld();
  if (!world) return null;
  const user = world.users.find((item) => item.id === world.activeUserId);
  if (!user) return null;

  return (
    <section className="table-form">
      <h2>Tabela de {user.name}</h2>
      <p className="meta">Isto não é o preço da loja nem o anúncio da revenda. É o quanto esta peça vale para você.</p>
      <form
        className="rates"
        key={`${user.id}-${user.tariff.veludoEm3d}-${user.tariff.tresdEmHolografico}-${user.tariff.holograficoEmGelatina}`}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void act({
            type: "setTariff",
            veludoEm3d: Number(data.get("veludo")),
            tresdEmHolografico: Number(data.get("tresd")),
            holograficoEmGelatina: Number(data.get("holo")),
          });
        }}
      >
        <label>
          1 veludo vale quantos 3D
          <input name="veludo" type="number" min={1} max={12} defaultValue={user.tariff.veludoEm3d} />
        </label>
        <label>
          1 3D vale quantos holográficos
          <input name="tresd" type="number" min={1} max={12} defaultValue={user.tariff.tresdEmHolografico} />
        </label>
        <label>
          1 holográfico vale quantas gelatinas
          <input name="holo" type="number" min={1} max={12} defaultValue={user.tariff.holograficoEmGelatina} />
        </label>
        <button className="buy" type="submit" disabled={pending}>Guardar a tabela</button>
      </form>
    </section>
  );
}
