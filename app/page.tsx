"use client";

import Link from "next/link";
import { dayKey, placeIsOpen } from "@/lib/logic";
import { useWorld } from "@/components/world";

export default function BairroPage() {
  const { world } = useWorld();
  if (!world) return null;
  const today = dayKey();
  const here = world.presence[world.activeUserId];
  const open = world.places.filter((place) => placeIsOpen(place));
  const later = world.places.filter((place) => !placeIsOpen(place));

  return (
    <section className="street">
      <div className="street-head">
        <h2>O bairro</h2>
        <p>De longe a loja cintila. Na calçada ela solidifica e o spinner do dia é de todo mundo: quem chega depois leva o que sobrou.</p>
      </div>
      <div className="shops">
        {open.map((place) => {
          const left = world.spinner.filter((slot) => slot.shopId === place.id && slot.day === today && !slot.sold).length;
          return (
            <Link key={place.id} href={`/loja/${place.id}`} className={`shop ${here === place.id ? "near" : "far"}`}>
              <span className="kicker">{here === place.id ? "Na calçada" : "Holograma"}</span>
              <h3>{place.name}</h3>
              <p>{place.blurb}</p>
              <p>{left} no spinner de hoje</p>
            </Link>
          );
        })}
      </div>
      <h2>Ainda não abrem</h2>
      <div className="later">
        {later.map((place) => (
          <article key={place.id} className="closed">
            <span className="kicker">{place.kind}</span>
            <h3>{place.name}</h3>
            <p>{place.blurb}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
