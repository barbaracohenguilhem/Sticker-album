"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GameIcon } from "./game-icon";
import { WorldProvider, useWorld } from "./world";

const LINKS = [
  { href: "/", label: "Explorar", icon: "explore" },
  { href: "/album", label: "Meu álbum", icon: "album" },
  { href: "/caderno", label: "Caderno", icon: "notebook" },
  { href: "/mercado", label: "Trocas", icon: "trade" },
] as const;

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { world, notice, error, pending, act, dismissNotice } = useWorld();
  const user = world?.users.find((item) => item.id === world.activeUserId);
  const exploring = pathname === "/";
  const collection = world?.instances.filter((item) => item.ownerId === user?.id).length ?? 0;

  return (
    <div className={`game-shell${exploring ? " is-exploring" : " is-inventory"}`}>
      <a className="skip-link" href="#game-main">Pular para o jogo</a>
      <header className="game-hud">
        <Link className="game-brand" href="/" aria-label="Dois álbuns, voltar ao bairro">
          <span className="brand-sticker"><GameIcon name="star" /></span>
          <span>dois<br />álbuns<span className="brand-dot">.</span></span>
        </Link>
        <div className="player-hud">
          {user ? <span className="coin-balance" aria-label={`${user.troco} troco`}><GameIcon name="coin" /><strong>{user.troco}</strong><span>troco</span></span> : null}
          <details className="player-menu">
            <summary aria-label="Perfil e opções"><span className="profile-avatar">{user?.name.slice(0, 1) ?? "·"}</span><span className="profile-name">{user?.name ?? "Abrindo…"}</span></summary>
            <div className="player-menu-content">
              <strong>Quem vai passear?</strong>
              <p>Perfis locais deste protótipo.</p>
              <div className="row">
                {world?.users.map((person) => (
                  <button key={person.id} className="person" type="button" aria-pressed={person.id === world.activeUserId} disabled={pending} onClick={() => act({ type: "switchUser", userId: person.id })}>{person.name}</button>
                ))}
              </div>
              <Link href="/tabela">Minha tabela de trocas <GameIcon name="arrow" /></Link>
              <button className="quiet-button" type="button" disabled={pending} onClick={() => {
                if (window.confirm("Recomeçar apaga as coleções e o progresso de todos os perfis deste bairro. Continuar?")) void act({ type: "reset" });
              }}>Recomeçar o bairro</button>
            </div>
          </details>
        </div>
      </header>
      {notice ? <div className="game-toast" role="status"><GameIcon name="check" /><p>{notice}</p><button className="icon-button" type="button" aria-label="Dispensar aviso" onClick={dismissNotice}><GameIcon name="close" /></button></div> : null}
      {error && world ? <p className="game-error" role="alert">{error}</p> : null}
      <main id="game-main" className={exploring ? "game-main" : "game-panel"}>
        {!exploring ? <Link className="return-to-map" href="/"><GameIcon name="back" /> Voltar ao passeio</Link> : null}
        {world ? children : <div className="game-loading" role={error ? "alert" : "status"}>
          <GameIcon name="explore" />
          <h1>{error ? "O bairro não abriu." : "Um mundo de pequenos achados…"}</h1>
          <p>{error ?? "Preparando seu passeio."}</p>
          {error ? <button className="game-action" type="button" onClick={() => window.location.reload()}>Tentar novamente</button> : null}
        </div>}
      </main>
      <nav className="game-dock" aria-label="Jogo">
        {LINKS.map(({ href, label, icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
            <span className="dock-icon"><GameIcon name={icon} />{href === "/album" && world ? <span className="collection-count">{collection}</span> : null}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
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
