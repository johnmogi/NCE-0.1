import { findContent } from "../../content/catalog";
import { neighbors, roomId } from "../path";
import type { RunState, Tile } from "../types";
import { shuffleSupportDeck } from "./deck";
import { encounterTarget, HERO_HEALTH, projectCheck, roundsRequired, STARTING_HAND } from "./resolver";
import type { GameplayEvent, GameplayEventCode, PlayCommand, RuntimeState, SupportCard } from "./types";
import { PROTOTYPE_RULES_VERSION } from "./types";

export function startRoomId(run: RunState): string {
  return roomId(run.settings.rows - 1, Math.floor(run.settings.cols / 2));
}

function tileById(run: RunState, id: string): Tile | undefined {
  return run.tiles.find((tile) => tile.roomId === id);
}

function append(events: GameplayEvent[], code: GameplayEventCode, fields: Record<string, string | number>): GameplayEvent[] {
  return [...events, { id: `play-${String(events.length + 1).padStart(3, "0")}`, code, fields }];
}

function emptyStats(): RuntimeState["stats"] {
  return { barriersResolved: 0, treasuresFound: 0, challengersDefeated: 0, cardsUsed: 0 };
}

function drawCards(state: RuntimeState, count: number): { state: RuntimeState; drawn: SupportCard[] } | { lost: RuntimeState } {
  if (state.drawPile.length < count) {
    return { lost: finish(state, "lost", "DECK_EXHAUSTED") };
  }
  const drawn = state.drawPile.slice(0, count);
  let events = state.events;
  for (const card of drawn) {
    events = append(events, "CARD_DRAWN", { card: card.id, element: card.element, value: card.value });
  }
  return { state: { ...state, drawPile: state.drawPile.slice(count), events }, drawn };
}

function finish(state: RuntimeState, result: "won" | "lost", reason: NonNullable<RuntimeState["outcome"]>["reason"]): RuntimeState {
  const code = result === "won" ? "RUN_WON" : "RUN_LOST";
  return {
    ...state,
    status: "ended",
    pendingRoomId: undefined,
    treasureOffer: undefined,
    outcome: { result, reason },
    events: append(state.events, code, { reason }),
  };
}

export function startRuntime(run: RunState): RuntimeState {
  const start = startRoomId(run);
  if (!tileById(run, start)) throw new Error("Start room is missing");
  const hero = findContent(run.heroId);
  if (!hero) throw new Error("Hero is missing");
  const deck = shuffleSupportDeck(run.seed, run.heroId);
  const opened: RuntimeState = {
    rulesVersion: PROTOTYPE_RULES_VERSION,
    status: "exploring",
    heroId: run.heroId,
    heroElement: hero.element,
    heroRoomId: start,
    currentRoomId: start,
    visitedRoomIds: [start],
    resolvedRoomIds: [],
    turn: 0,
    health: HERO_HEALTH,
    maxHealth: HERO_HEALTH,
    drawPile: deck,
    hand: [],
    discardPile: [],
    encounterProgress: 0,
    stats: emptyStats(),
    events: append([], "PLAY_STARTED", { hero: run.heroId, room: start, rules: PROTOTYPE_RULES_VERSION }),
  };
  const dealt = drawCards(opened, STARTING_HAND);
  if ("lost" in dealt) return dealt.lost;
  return { ...dealt.state, hand: dealt.drawn };
}

export function getLegalMoves(run: RunState, runtime: RuntimeState): string[] {
  if (runtime.status !== "exploring") return [];
  const here = tileById(run, runtime.currentRoomId);
  if (!here) return [];
  return neighbors(here, run.settings.rows, run.settings.cols).filter((id) => tileById(run, id));
}

function moved(runtime: RuntimeState, destination: Tile, events: GameplayEvent[]): RuntimeState {
  return {
    ...runtime,
    heroRoomId: destination.roomId,
    currentRoomId: destination.roomId,
    visitedRoomIds: runtime.visitedRoomIds.includes(destination.roomId) ? runtime.visitedRoomIds : [...runtime.visitedRoomIds, destination.roomId],
    pendingRoomId: undefined,
    treasureOffer: undefined,
    encounterProgress: 0,
    turn: runtime.turn + 1,
    events,
  };
}

export function moveHero(run: RunState, runtime: RuntimeState, roomIdTarget: string): RuntimeState {
  const legal = getLegalMoves(run, runtime);
  if (!legal.includes(roomIdTarget)) throw new Error("Illegal move");
  const destination = tileById(run, roomIdTarget);
  if (!destination) throw new Error("Room not found");
  let events = append(runtime.events, "HERO_MOVED", { from: runtime.currentRoomId, to: roomIdTarget });
  events = append(events, "ROOM_ENTERED", { room: roomIdTarget, type: destination.roomType, content: destination.contentId ?? "none" });
  const next = moved(runtime, destination, events);
  const clear = destination.roomType === "start" || runtime.resolvedRoomIds.includes(roomIdTarget);
  if (clear) return { ...next, status: "exploring" };
  if (destination.roomType === "treasure") {
    const dealt = drawCards(next, 2);
    if ("lost" in dealt) return dealt.lost;
    return {
      ...dealt.state,
      status: "treasure-choice",
      pendingRoomId: roomIdTarget,
      treasureOffer: dealt.drawn,
      events: append(dealt.state.events, "TREASURE_DRAWN", {
        room: roomIdTarget,
        first: dealt.drawn[0].id,
        second: dealt.drawn[1].id,
      }),
    };
  }
  return {
    ...next,
    status: "awaiting-resolution",
    pendingRoomId: roomIdTarget,
    events: append(events, "ENCOUNTER_PENDING", { type: destination.roomType, room: roomIdTarget }),
  };
}

function resolveRoom(state: RuntimeState, roomIdTarget: string, roomType: Tile["roomType"]): RuntimeState {
  const stats = { ...state.stats };
  if (roomType === "barrier") stats.barriersResolved += 1;
  if (roomType === "treasure") stats.treasuresFound += 1;
  if (roomType === "challenger") stats.challengersDefeated += 1;
  const resolved: RuntimeState = {
    ...state,
    stats,
    resolvedRoomIds: state.resolvedRoomIds.includes(roomIdTarget) ? state.resolvedRoomIds : [...state.resolvedRoomIds, roomIdTarget],
    pendingRoomId: undefined,
    treasureOffer: undefined,
    encounterProgress: 0,
    events: append(state.events, "ROOM_RESOLVED", { room: roomIdTarget, type: roomType }),
  };
  if (roomType !== "royal") return { ...resolved, status: "exploring" };
  const defeated = {
    ...resolved,
    events: append(resolved.events, "ROYAL_DEFEATED", { room: roomIdTarget }),
  };
  return finish(defeated, "won", "ROYAL_DEFEATED");
}

export function commitCard(run: RunState, runtime: RuntimeState, cardId: string): RuntimeState {
  if (runtime.status !== "awaiting-resolution" || !runtime.pendingRoomId) throw new Error("Illegal action");
  const tile = tileById(run, runtime.pendingRoomId);
  const content = tile?.content;
  if (!tile || !content || (tile.roomType !== "barrier" && tile.roomType !== "challenger" && tile.roomType !== "royal")) {
    throw new Error("Illegal action");
  }
  const card = runtime.hand.find((item) => item.id === cardId);
  if (!card) throw new Error("Card is not in hand");
  const target = encounterTarget(tile.roomType, content.value);
  const check = projectCheck(card, content.element, target);
  let events = append(runtime.events, "CARD_COMMITTED", { card: card.id, element: card.element, value: card.value, room: tile.roomId });
  events = append(events, "CHECK_RESOLVED", {
    total: check.total,
    target,
    result: check.success ? "success" : "failure",
    modifier: check.modifier,
    room: tile.roomId,
  });
  let health = runtime.health;
  if (!check.success) {
    health -= 1;
    events = append(events, "DAMAGE_TAKEN", { health, room: tile.roomId });
  }
  const spent: RuntimeState = {
    ...runtime,
    hand: runtime.hand.filter((item) => item.id !== card.id),
    discardPile: [...runtime.discardPile, card],
    health,
    stats: { ...runtime.stats, cardsUsed: runtime.stats.cardsUsed + 1 },
    events,
  };
  if (health <= 0) return finish(spent, "lost", "HEALTH_DEPLETED");
  const dealt = drawCards(spent, 1);
  if ("lost" in dealt) return dealt.lost;
  if (!check.success) return { ...dealt.state, hand: [...dealt.state.hand, ...dealt.drawn] };
  const progress = runtime.encounterProgress + 1;
  const advanced = { ...dealt.state, hand: [...dealt.state.hand, ...dealt.drawn], encounterProgress: progress };
  if (progress < roundsRequired(tile.roomType)) return advanced;
  return resolveRoom(advanced, tile.roomId, tile.roomType);
}

export function chooseTreasure(run: RunState, runtime: RuntimeState, keepId: string, discardHandId?: string): RuntimeState {
  if (runtime.status !== "treasure-choice" || !runtime.treasureOffer || !runtime.pendingRoomId) throw new Error("Illegal action");
  const keep = runtime.treasureOffer.find((card) => card.id === keepId);
  if (!keep) throw new Error("Card is not in the treasure offer");
  const rejected = runtime.treasureOffer.filter((card) => card.id !== keepId);
  let hand = runtime.hand;
  let discard = [...runtime.discardPile, ...rejected];
  if (hand.length >= 6) {
    if (!discardHandId) throw new Error("Discard a card from hand");
    if (!hand.some((card) => card.id === discardHandId)) throw new Error("Card is not in hand");
    const dropped = hand.find((card) => card.id === discardHandId);
    hand = hand.filter((card) => card.id !== discardHandId);
    if (dropped) discard = [...discard, dropped];
  }
  const tile = tileById(run, runtime.pendingRoomId);
  if (!tile) throw new Error("Room not found");
  const chosen: RuntimeState = {
    ...runtime,
    hand: [...hand, keep],
    discardPile: discard,
    events: append(runtime.events, "TREASURE_SELECTED", { keep: keep.id, discard: rejected.map((card) => card.id).join(",") }),
  };
  return resolveRoom(chosen, tile.roomId, tile.roomType);
}

export function resetRuntime(run: RunState): RuntimeState {
  return startRuntime(run);
}

export function applyCommand(run: RunState, runtime: RuntimeState | null, command: PlayCommand): RuntimeState {
  if (command.type === "START_PLAY" || command.type === "RESET_PLAY") return startRuntime(run);
  if (!runtime) throw new Error("Illegal action");
  if (command.type === "MOVE") {
    if (!command.roomId) throw new Error("Illegal action");
    return moveHero(run, runtime, command.roomId);
  }
  if (command.type === "COMMIT_CARD") {
    if (!command.cardId) throw new Error("Illegal action");
    return commitCard(run, runtime, command.cardId);
  }
  if (!command.cardId) throw new Error("Illegal action");
  return chooseTreasure(run, runtime, command.cardId, command.discardCardId);
}
