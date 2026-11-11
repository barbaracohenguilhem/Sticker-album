"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorldProvider, useWorld } from "./world";

const LINKS = [
  ["/", "Bairro"],
  ["/caderno", "Caderno"],
  ["/album", "Álbum de fotos"],
  ["/tabela", "Tabela"],
  ["/mercado", "Mercado"],
];

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { world, notice, error, pending, act } = useWorld();
  const user = world?.users.find((item) => item.id === world.activeUserId);

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <h1>Dois álbuns</h1>
          <p>O caderno é exposição. O álbum de fotos é moeda. Nenhum dos dois tem figurinha 27.</p>
        </div>
        <div className="who">
          {user ? <span className="troco">{user.troco} troco</span> : null}
          {world?.users.map((person) => (
            <button
              key={person.id}
              className="person"
              type="button"
              aria-pressed={person.id === world.activeUserId}
              disabled={pending}
              onClick={() => act({ type: "switchUser", userId: person.id })}
            >
              {person.name}
            </button>
          ))}
        </div>
      </header>
      <nav className="nav" aria-label="Álbum">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      {notice ? <p className="notice" role="status">{notice}</p> : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
      <main>{world ? children : <p>Abrindo o caderno…</p>}</main>
      <footer className="foot">
        <button className="text-button" type="button" disabled={pending} onClick={() => act({ type: "reset" })}>
          Recomeçar o bairro
        </button>
      </footer>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <WorldProvider>
      <Frame>{children}</Frame>
    </WorldProvider>
  );
}
