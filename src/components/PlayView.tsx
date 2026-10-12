"use client";

import { getLegalMoves, moveHero, resetRuntime, startRuntime } from "@/engine/runtime/actions";
import type { RuntimeState } from "@/engine/runtime/types";
import type { ContentRecord, RunState } from "@/engine/types";

const roomLabels = { start: "START", royal: "ROYAL", challenger: "CHALLENGE", barrier: "BARRIER", treasure: "TREASURE" } as const;
const elementGlyph: Record<string, string> = { air: "◈", fire: "✦", water: "≈", earth: "◆" };
const deferredCopy = {
  barrier: "RESOLUTION NOT IMPLEMENTED",
  treasure: "TREASURE RESOLUTION DEFERRED",
  challenger: "CHALLENGER RESOLUTION DEFERRED",
  royal: "ROYAL RESOLUTION DEFERRED",
  start: "START REQUIRES NO RESOLUTION",
} as const;

export function PlayView({ run, hero, runtime, onRuntime }: { run: RunState | null; hero: ContentRecord; runtime: RuntimeState | null; onRuntime: (runtime: RuntimeState | null) => void }) {
  if (!run) {
    return <section className="play-view"><div className="preview-banner"><div><div className="section-kicker">PLAY <span>03</span></div><h1>PLAY</h1><p>Generate a run in GODMODE first. Starting play does not create a new board.</p></div></div></section>;
  }
  const board = run;
  const legal = runtime ? getLegalMoves(board, runtime) : [];
  const pending = runtime?.pendingRoomId ? board.tiles.find((tile) => tile.roomId === runtime.pendingRoomId) : undefined;
  function move(roomId: string) {
    if (!runtime || !legal.includes(roomId)) return;
    onRuntime(moveHero(board, runtime, roomId));
  }
  return <section className="play-view"><div className="preview-banner"><div><div className="section-kicker">PLAY / RUNTIME <span>03</span></div><h1>PLAY</h1><p>Move into an adjacent room. The encounter waits. Nothing is resolved.</p></div><div className="actions">{!runtime ? <button className="button-primary" onClick={() => onRuntime(startRuntime(board))}>START PLAY</button> : <button onClick={() => onRuntime(resetRuntime(board))}>RESET PLAY</button>}</div></div>
    <div className="play-layout"><div className="player-card"><div className="section-kicker">ACTIVE ACE</div><div className="player-icon">{elementGlyph[hero.element]}</div><h2>{hero.name}</h2><p>{hero.element} lineage</p><div className="fake-stats"><span>ROOM <b>{runtime?.currentRoomId ?? "—"}</b></span><span>STATUS <b>{runtime?.status ?? "ready"}</b></span><span>TURN <b>{runtime?.turn ?? "—"}</b></span></div></div>
      <div className="path-preview"><div className="section-kicker">BOARD</div>{runtime ? <div className="board-wrap play-board"><div className="board-axis"><span>0</span><span>1</span><span>2</span></div><div className="board"><div className="row-axis"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div>{board.tiles.map((tile) => {
        const isLegal = legal.includes(tile.roomId);
        const isHero = tile.roomId === runtime.currentRoomId;
        return <button key={tile.roomId} className={`tile tile-${tile.roomType}${isHero ? " is-hero" : ""}${isLegal ? " is-legal" : ""}${runtime.visitedRoomIds.includes(tile.roomId) ? " is-visited" : ""}${runtime.pendingRoomId === tile.roomId ? " is-pending" : ""}`} disabled={!isLegal} onClick={() => move(tile.roomId)}><span className="tile-corner">{tile.roomId.replace("room-", "#")}</span><span className="tile-symbol">{tile.roomType === "start" ? "⌄" : tile.roomType === "royal" ? "♛" : tile.roomType === "treasure" ? "◇" : tile.roomType === "barrier" ? "▥" : "✧"}</span><span className="tile-type">{roomLabels[tile.roomType]}{isHero ? " · HERO" : ""}</span>{tile.content && <span className="tile-name">{tile.content.name}</span>}</button>;
      })}</div></div> : <p className="preview-note">Press START PLAY to place the Ace on the Start room.</p>}
        {pending && <div className="encounter-panel"><div className="section-kicker">{pending.roomType.toUpperCase()} ENCOUNTER</div><h2>{pending.content?.name ?? pending.roomType}</h2><p>{pending.content ? `${pending.content.element} · ${pending.content.tier ? `Tier: ${pending.content.tier} · ` : ""}Value: ${pending.content.value}` : "No content"}</p><strong>{deferredCopy[pending.roomType]}</strong><p className="note-line">Movement is locked until a later checkpoint resolves this room.</p></div>}
        <div className="play-log"><div className="section-kicker">RUNTIME LOG</div>{runtime?.events.map((entry) => <pre key={entry.id}><b>{entry.id.replace("play-", "#")} {entry.code}</b>{"\n"}{Object.entries(entry.fields).map(([key, value]) => `${key}=${value}`).join("\n")}</pre>) ?? <p className="note-line">Gameplay events appear after START PLAY.</p>}</div>
      </div></div></section>;
}
