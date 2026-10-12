import { neighbors, roomId } from "../path";
import type { RunState, Tile } from "../types";
import type { GameplayEvent, RuntimeState } from "./types";

export function startRoomId(run: RunState): string {
  return roomId(run.settings.rows - 1, Math.floor(run.settings.cols / 2));
}

function tileById(run: RunState, id: string): Tile | undefined {
  return run.tiles.find((tile) => tile.roomId === id);
}

function event(index: number, code: GameplayEvent["code"], fields: Record<string, string | number>): GameplayEvent {
  return { id: `play-${String(index).padStart(3, "0")}`, code, fields };
}

export function startRuntime(run: RunState): RuntimeState {
  const start = startRoomId(run);
  if (!tileById(run, start)) throw new Error("Start room is missing");
  return {
    status: "exploring",
    heroId: run.heroId,
    heroRoomId: start,
    currentRoomId: start,
    visitedRoomIds: [start],
    resolvedRoomIds: [],
    turn: 0,
    events: [event(1, "PLAY_STARTED", { hero: run.heroId, room: start })],
  };
}

export function getLegalMoves(run: RunState, runtime: RuntimeState): string[] {
  if (runtime.status !== "exploring") return [];
  const here = tileById(run, runtime.currentRoomId);
  if (!here) return [];
  return neighbors(here, run.settings.rows, run.settings.cols);
}

export function moveHero(run: RunState, runtime: RuntimeState, roomIdTarget: string): RuntimeState {
  const legal = getLegalMoves(run, runtime);
  if (!legal.includes(roomIdTarget)) throw new Error("Illegal move");
  const destination = tileById(run, roomIdTarget);
  if (!destination) throw new Error("Room not found");
  const from = runtime.currentRoomId;
  const turn = runtime.turn + 1;
  const needsResolution = destination.roomType !== "start";
  const events = [
    ...runtime.events,
    event(runtime.events.length + 1, "HERO_MOVED", { from, to: roomIdTarget }),
    event(runtime.events.length + 2, "ROOM_ENTERED", {
      room: roomIdTarget,
      type: destination.roomType,
      content: destination.contentId ?? "none",
    }),
  ];
  if (needsResolution) {
    events.push(event(events.length + 1, "ENCOUNTER_PENDING", { type: destination.roomType, room: roomIdTarget }));
  }
  return {
    ...runtime,
    status: needsResolution ? "awaiting-resolution" : "exploring",
    heroRoomId: roomIdTarget,
    currentRoomId: roomIdTarget,
    pendingRoomId: needsResolution ? roomIdTarget : undefined,
    visitedRoomIds: runtime.visitedRoomIds.includes(roomIdTarget) ? runtime.visitedRoomIds : [...runtime.visitedRoomIds, roomIdTarget],
    turn,
    events,
  };
}

export function resetRuntime(run: RunState): RuntimeState {
  return startRuntime(run);
}
