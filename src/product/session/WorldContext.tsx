"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { findContent, recordsOf } from "@/content/catalog";
import { catalog } from "@/content/catalog";
import { coordinateLabel } from "@/admin/diagnostics";
import { generateRun } from "@/engine/generate";
import type { RunState } from "@/engine/types";
import { generationNotices } from "@/product/forge/forge";
import type { NoticeKind } from "@/product/terminal/TerminalDock";
import type { SurfaceId } from "@/product/navigation";

export interface RecentWorld {
  seed: number;
  heroId: string;
  element: string;
  royalName: string;
}

export interface CodexFocus {
  id: string;
  token: number;
}

interface WorldSession {
  seedInput: string;
  setSeedInput: (value: string) => void;
  heroId: string;
  setHeroId: (heroId: string) => void;
  run: RunState | null;
  error: string;
  selectedRoomId: string | null;
  recent: RecentWorld[];
  codexFocus: CodexFocus | null;
  generate: () => void;
  replay: (seed: number, heroId: string) => void;
  selectRoom: (roomId: string) => void;
  openInCodex: (contentId: string) => void;
}

const WorldContext = createContext<WorldSession | null>(null);

export function WorldProvider({
  children,
  notify,
  onSurface,
}: {
  children: ReactNode;
  notify: (kind: NoticeKind, code: string, detail: string) => void;
  onSurface: (surface: SurfaceId) => void;
}) {
  const [seedInput, setSeedInput] = useState("1048576");
  const [heroId, setHeroId] = useState(recordsOf("hero")[0].id);
  const [run, setRun] = useState<RunState | null>(null);
  const [error, setError] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentWorld[]>([]);
  const [codexFocus, setCodexFocus] = useState<CodexFocus | null>(null);

  const produce = (seedText: string, nextHeroId: string) => {
    const seed = Number(seedText);
    try {
      const next = generateRun(seed, nextHeroId);
      const hero = findContent(nextHeroId);
      const royal = next.tiles.find((tile) => tile.roomType === "royal");
      setRun(next);
      setError("");
      setSelectedRoomId(null);
      setSeedInput(String(seed));
      setHeroId(nextHeroId);
      setRecent((current) => [
        { seed, heroId: nextHeroId, element: hero?.element ?? "", royalName: royal?.content?.name ?? "—" },
        ...current.filter((item) => item.seed !== seed || item.heroId !== nextHeroId),
      ].slice(0, 8));
      notify("product", "FORGE_GENERATE", `seed=${seed} hero=${nextHeroId}`);
      for (const event of generationNotices(next, catalog)) notify(event.kind, event.code, event.detail);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The generator rejected this input.");
    }
  };

  const value = useMemo<WorldSession>(() => ({
    seedInput,
    setSeedInput,
    heroId,
    setHeroId,
    run,
    error,
    selectedRoomId,
    recent,
    codexFocus,
    generate: () => produce(seedInput, heroId),
    replay: (seed, nextHeroId) => produce(String(seed), nextHeroId),
    selectRoom: (roomId) => {
      const tile = run?.tiles.find((candidate) => candidate.roomId === roomId);
      if (!tile) return;
      setSelectedRoomId(roomId);
      notify("product", "ROOM_SELECTED", `room=${coordinateLabel(tile.row, tile.col)}`);
    },
    openInCodex: (contentId) => {
      setCodexFocus({ id: contentId, token: Date.now() });
      onSurface("codex");
      notify("product", "OPEN_CODEX", `content=${contentId}`);
    },
  }), [seedInput, heroId, run, error, selectedRoomId, recent, codexFocus, notify, onSurface]);

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld(): WorldSession {
  const session = useContext(WorldContext);
  if (!session) throw new Error("Forge requires the shared world session");
  return session;
}
