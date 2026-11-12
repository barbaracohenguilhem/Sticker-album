"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Action, World } from "@/lib/types";

type WorldApi = {
  world: World | null;
  notice: string | null;
  error: string | null;
  pending: boolean;
  act: (action: Action) => Promise<boolean>;
  dismissNotice: () => void;
};

const WorldContext = createContext<WorldApi | null>(null);

export function WorldProvider({ children }: { children: React.ReactNode }) {
  const [world, setWorld] = useState<World | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/world")
      .then((response) => {
        if (!response.ok) throw new Error("O bairro não abriu. Tente novamente.");
        return response.json();
      })
      .then((data: World) => {
        if (!cancelled) setWorld(data);
      })
      .catch(() => {
        if (!cancelled) setError("O bairro não abriu. Confira a conexão e tente novamente.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const act = useCallback(async (action: Action) => {
    if (inFlight.current) return false;
    inFlight.current = true;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/act", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Não deu.");
        return false;
      }
      setWorld(data.world);
      setNotice(data.notice ?? null);
      return true;
    } catch {
      setError("O bairro não respondeu. Confira a conexão e tente novamente.");
      return false;
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }, []);

  return <WorldContext.Provider value={{ world, notice, error, pending, act, dismissNotice: () => setNotice(null) }}>{children}</WorldContext.Provider>;
}

export function useWorld(): WorldApi {
  const value = useContext(WorldContext);
  if (!value) throw new Error("Fora do bairro.");
  return value;
}
