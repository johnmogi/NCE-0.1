"use client";

import { useState } from "react";
import { chooseTreasure, commitCard, getLegalMoves, moveHero, resetRuntime, startRuntime } from "@/engine/runtime/actions";
import { relationText } from "@/engine/runtime/elements";
import { encounterTarget, projectCheck, roundsRequired } from "@/engine/runtime/resolver";
import type { GameplayEvent, RuntimeState, SupportCard } from "@/engine/runtime/types";
import { PROTOTYPE_RULES_VERSION } from "@/engine/runtime/types";
import type { ContentRecord, RunState, Tile } from "@/engine/types";

const roomLabels = { start: "START", royal: "ROYAL", challenger: "CHALLENGE", barrier: "BARRIER", treasure: "TREASURE" } as const;
const elementGlyph: Record<string, string> = { air: "◈", fire: "✦", water: "≈", earth: "◆" };

export function PlayView({ run, hero, heroes, seed, heroId, runtime, onSeed, onHero, onGenerate, onRuntime }: {
  run: RunState | null;
  hero: ContentRecord;
  heroes: ContentRecord[];
  seed: string;
  heroId: string;
  runtime: RuntimeState | null;
  onSeed: (seed: string) => void;
  onHero: (heroId: string) => void;
  onGenerate: () => void;
  onRuntime: (runtime: RuntimeState | null) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keepId, setKeepId] = useState<string | null>(null);
  const board = run;
  const legal = board && runtime ? getLegalMoves(board, runtime) : [];
  const pending = board && runtime?.pendingRoomId ? board.tiles.find((tile) => tile.roomId === runtime.pendingRoomId) : undefined;
  const selected = runtime?.hand.find((card) => card.id === selectedId) ?? null;
  const here = board?.tiles.find((tile) => tile.roomId === runtime?.currentRoomId);

  function move(roomId: string) {
    if (!board || !runtime || !legal.includes(roomId)) return;
    setSelectedId(null);
    setKeepId(null);
    onRuntime(moveHero(board, runtime, roomId));
  }

  function commit() {
    if (!board || !runtime || !selected) return;
    setSelectedId(null);
    onRuntime(commitCard(board, runtime, selected.id));
  }

  function keep(cardId: string) {
    if (!board || !runtime) return;
    if (runtime.hand.length >= 6) {
      setKeepId(cardId);
      return;
    }
    setKeepId(null);
    onRuntime(chooseTreasure(board, runtime, cardId));
  }

  function discardForTreasure(cardId: string) {
    if (!board || !runtime || !keepId) return;
    setKeepId(null);
    setSelectedId(null);
    onRuntime(chooseTreasure(board, runtime, keepId, cardId));
  }

  return <section className="play-view">
    <div className="preview-banner">
      <div>
        <div className="section-kicker">NCE</div>
        <h1>PLAY <em>Prototype Rules 0.1</em></h1>
        <p>Prototype playtest. Support cards, health, and targets are temporary numbers, not catalog canon. {PROTOTYPE_RULES_VERSION}</p>
      </div>
      <div className="play-setup">
        <label>SEED <input aria-label="Run seed" value={seed} onChange={(event) => onSeed(event.target.value)} /></label>
        <div className="play-aces">{heroes.map((ace) => <button key={ace.id} className={ace.id === heroId ? "active" : ""} onClick={() => onHero(ace.id)}>{ace.element.toUpperCase()}</button>)}</div>
        <button className="button-primary" onClick={onGenerate}>GENERATE WORLD</button>
        {board && !runtime && <button onClick={() => onRuntime(startRuntime(board))}>START PLAY</button>}
        {board && runtime && runtime.status !== "ended" && <button onClick={() => { setSelectedId(null); setKeepId(null); onRuntime(resetRuntime(board)); }}>RESTART SAME WORLD</button>}
      </div>
    </div>
    {!board ? <div className="empty-board"><div className="empty-glyph">◌</div><h2>NO WORLD YET</h2><p>Choose an Ace, set a seed, and generate. The board stays fixed until you generate again.</p></div> : <div className="play-screen">
      <aside className="play-side">
        <div className="section-kicker">HERO</div>
        <div className="player-icon">{elementGlyph[hero.element]}</div>
        <h2>{hero.name}</h2>
        <p>{hero.element.toUpperCase()} · BASE POWER 1</p>
        <div className="hp" aria-label={`${runtime?.health ?? 3} health`}>
          {Array.from({ length: runtime?.maxHealth ?? 3 }, (_, index) => <span key={index} className={runtime && index >= runtime.health ? "spent" : ""}>♥</span>)}
        </div>
        <div className="fake-stats">
          <span>ROOM <b>{runtime && here ? `${here.roomId.replace("room-", "#")} ${roomLabels[here.roomType]}` : "—"}</b></span>
          <span>STATUS <b>{runtime?.status ?? "ready"}</b></span>
          <span>TURN <b>{runtime ? String(runtime.turn).padStart(2, "0") : "—"}</b></span>
        </div>
        <div className="section-kicker">HAND</div>
        {runtime ? <div className="hand">{runtime.hand.map((card) => <button key={card.id} className={`support-card element-${card.element}${selectedId === card.id || keepId === card.id ? " selected" : ""}`} onClick={() => (runtime.status === "treasure-choice" && keepId ? discardForTreasure(card.id) : setSelectedId(card.id))}><span>{card.element.toUpperCase()}</span><strong>{card.value}</strong></button>)}</div> : <p className="note-line">Four cards are dealt at the start.</p>}
        <p className="note-line">{runtime ? `${runtime.drawPile.length} draw · ${runtime.discardPile.length} discard · max 6` : "Draw pile waits for START PLAY."}</p>
        {keepId && <p className="note-line">Hand is full. Choose a card in hand to discard.</p>}
      </aside>
      <div className="play-map">
        <div className="section-kicker">BOARD <span>3 × 5</span></div>
        <div className="board-wrap play-board"><div className="board-axis"><span>0</span><span>1</span><span>2</span></div><div className="board"><div className="row-axis"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div>{board.tiles.map((tile) => {
          const isLegal = legal.includes(tile.roomId);
          const isHero = tile.roomId === runtime?.currentRoomId;
          const resolved = runtime?.resolvedRoomIds.includes(tile.roomId);
          return <button key={tile.roomId} className={`tile tile-${tile.roomType}${isHero ? " is-hero" : ""}${isLegal ? " is-legal" : ""}${runtime?.visitedRoomIds.includes(tile.roomId) ? " is-visited" : ""}${resolved ? " is-resolved" : ""}${runtime?.pendingRoomId === tile.roomId ? " is-pending" : ""}`} disabled={!isLegal} onClick={() => move(tile.roomId)}><span className="tile-corner">{tile.roomId.replace("room-", "#")}</span><span className="tile-symbol">{tile.roomType === "start" ? "⌄" : tile.roomType === "royal" ? "♛" : tile.roomType === "treasure" ? "◇" : tile.roomType === "barrier" ? "▥" : "✧"}</span><span className="tile-type">{roomLabels[tile.roomType]}{isHero ? " · HERO" : ""}{resolved ? " · OK" : ""}</span>{tile.content && <span className="tile-name">{tile.content.name}</span>}</button>;
        })}</div></div>
        <p className="note-line">{runtime ? "Orthogonal moves. Green rooms are legal. A pending encounter locks the path." : "Generate, then start at E1."}</p>
      </div>
      <aside className="play-encounter">
        {!runtime && <div className="encounter-panel"><div className="section-kicker">ENCOUNTER</div><h2>Ready</h2><p>The world is generated. Start play to deal the support hand and stand on E1.</p></div>}
        {runtime?.status === "ended" && runtime.outcome && <EndPanel runtime={runtime} onRestart={() => { setSelectedId(null); setKeepId(null); onRuntime(resetRuntime(board)); }} onGenerate={onGenerate} />}
        {runtime && runtime.status !== "ended" && <Encounter tile={pending} runtime={runtime} selected={selected} keepId={keepId} onCommit={commit} onKeep={keep} />}
      </aside>
      <div className="play-log"><div className="section-kicker">GAME LOG</div><div>{runtime ? runtime.events.slice(-12).map((event) => <p key={event.id}><b>{event.id.replace("play-", "#")}</b> {describe(event)}</p>) : <p className="note-line">Gameplay notes appear after the first move.</p>}</div></div>
    </div>}
  </section>;
}

function Encounter({ tile, runtime, selected, keepId, onCommit, onKeep }: {
  tile?: Tile;
  runtime: RuntimeState;
  selected: SupportCard | null;
  keepId: string | null;
  onCommit: () => void;
  onKeep: (cardId: string) => void;
}) {
  if (runtime.status === "exploring" || !tile?.content) {
    return <div className="encounter-panel"><div className="section-kicker">ENCOUNTER</div><h2>{runtime.status === "exploring" ? "Choose a route" : "Waiting"}</h2><p>{runtime.currentRoomId === runtime.heroRoomId ? "Move into an adjacent room. Resolved rooms and Start can be crossed again." : ""}</p></div>;
  }
  const content = tile.content;
  if (runtime.status === "treasure-choice" && runtime.treasureOffer) {
    return <div className="encounter-panel"><div className="section-kicker">TREASURE</div><h2>{content.name}</h2><p>Flavor only. Keep one support card. The other is discarded.</p><div className="hand">{runtime.treasureOffer.map((card) => <button key={card.id} className={`support-card element-${card.element}${keepId === card.id ? " selected" : ""}`} onClick={() => onKeep(card.id)}><span>{card.element.toUpperCase()}</span><strong>{card.value}</strong><small>KEEP</small></button>)}</div></div>;
  }
  const target = encounterTarget(tile.roomType, content.value);
  const rounds = roundsRequired(tile.roomType);
  const preview = selected ? projectCheck(selected, content.element, target) : null;
  return <div className="encounter-panel">
    <div className="section-kicker">{tile.roomType === "royal" ? "ROYAL" : tile.roomType.toUpperCase()}</div>
    <h2>{content.name}</h2>
    <p>{content.element.toUpperCase()} · {content.tier ?? "encounter"} · ROUND {runtime.encounterProgress + 1} / {rounds}</p>
    <p>{tile.roomType === "royal" ? `TARGET ${target} · catalog ${content.value} − 3` : `TARGET ${target}`}</p>
    {selected && preview ? <div className="formula">
      <div><span>SELECTED {selected.element.toUpperCase()} {selected.value}</span></div>
      <div><span>Hero</span><b>+{preview.base}</b></div>
      <div><span>Card</span><b>+{preview.cardValue}</b></div>
      <div><span>{relationText(selected.element, content.element)}</span><b>{preview.modifier > 0 ? `+${preview.modifier}` : preview.modifier === 0 ? "+0" : preview.modifier}</b></div>
      <div className="formula-total"><span>TOTAL</span><b>{preview.total}</b></div>
      <div><span>TARGET</span><b>{preview.target}</b></div>
      <strong className={preview.success ? "projected-win" : "projected-loss"}>PROJECTED: {preview.success ? "SUCCESS" : "FAILURE"}</strong>
    </div> : <p className="note-line">Select one card. The total is shown before you commit.</p>}
    <button className="button-primary" disabled={!selected} onClick={onCommit}>PLAY CARD</button>
  </div>;
}

function EndPanel({ runtime, onRestart, onGenerate }: { runtime: RuntimeState; onRestart: () => void; onGenerate: () => void }) {
  const won = runtime.outcome?.result === "won";
  return <div className="encounter-panel"><div className="section-kicker">{won ? "VICTORY" : "DEFEAT"}</div><h2>{won ? "Royal defeated" : runtime.outcome?.reason}</h2><div className="fake-stats">
    <span>TURNS <b>{runtime.turn}</b></span>
    <span>ROOMS VISITED <b>{runtime.visitedRoomIds.length}</b></span>
    <span>BARRIERS <b>{runtime.stats.barriersResolved}</b></span>
    <span>TREASURES <b>{runtime.stats.treasuresFound}</b></span>
    <span>CHALLENGERS <b>{runtime.stats.challengersDefeated}</b></span>
    <span>CARDS USED <b>{runtime.stats.cardsUsed}</b></span>
    <span>HP REMAINING <b>{runtime.health}</b></span>
  </div><div className="actions"><button className="button-primary" onClick={onRestart}>RESTART SAME WORLD</button><button onClick={onGenerate}>GENERATE NEW WORLD</button></div></div>;
}

function describe(event: GameplayEvent): string {
  const fields = event.fields;
  switch (event.code) {
    case "PLAY_STARTED": return `Play started at ${fields.room}.`;
    case "CARD_DRAWN": return `Drew ${fields.element} ${fields.value}.`;
    case "HERO_MOVED": return `Moved ${fields.from} → ${fields.to}.`;
    case "ROOM_ENTERED": return `Entered ${fields.type} ${fields.content}.`;
    case "ENCOUNTER_PENDING": return `${fields.type} is pending. Movement is locked.`;
    case "CARD_COMMITTED": return `Committed ${fields.element} ${fields.value}.`;
    case "CHECK_RESOLVED": return `Total ${fields.total} vs target ${fields.target}: ${fields.result}.`;
    case "DAMAGE_TAKEN": return `Lost 1 HP. ${fields.health} remaining.`;
    case "ROOM_RESOLVED": return `${fields.type} resolved.`;
    case "TREASURE_DRAWN": return `Treasure offered ${fields.first} and ${fields.second}.`;
    case "TREASURE_SELECTED": return `Kept ${fields.keep}. Discarded ${fields.discard}.`;
    case "ROYAL_DEFEATED": return "The Royal is defeated.";
    case "RUN_WON": return "Run won.";
    case "RUN_LOST": return `Run lost: ${fields.reason}.`;
    default: return event.code;
  }
}
