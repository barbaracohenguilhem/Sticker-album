"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Action, World } from "@/lib/types";

type WorldApi = {
  world: World | null;
  notice: string | null;
  error: string | null;
  pending: boolean;
  act: (action: Action) => Promise<void>;
};

const WorldContext = createContext<WorldApi | null>(null);

export function WorldProvider({ children }: { children: React.ReactNode }) {
  const [world, setWorld] = useState<World | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/world")
      .then((response) => response.json())
      .then((data: World) => {
        if (!cancelled) setWorld(data);
      })
      .catch(() => {
        if (!cancelled) setError("O caderno não abriu.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const act = useCallback(async (action: Action) => {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/act", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Não deu.");
        return;
      }
      setWorld(data.world);
      setNotice(data.notice ?? null);
    } catch {
      setError("A calçada não respondeu.");
    } finally {
      setPending(false);
    }
  }, []);

  return <WorldContext.Provider value={{ world, notice, error, pending, act }}>{children}</WorldContext.Provider>;
}

export function useWorld(): WorldApi {
  const value = useContext(WorldContext);
  if (!value) throw new Error("Fora do bairro.");
  return value;
}
