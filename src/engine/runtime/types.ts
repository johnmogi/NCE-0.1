import type { RunState } from "../types";

export type RuntimeStatus = "ready" | "exploring" | "awaiting-resolution" | "ended";

export interface GameplayEvent {
  id: string;
  code: "PLAY_STARTED" | "HERO_MOVED" | "ROOM_ENTERED" | "ENCOUNTER_PENDING";
  fields: Record<string, string | number>;
}

export interface RuntimeState {
  status: RuntimeStatus;
  heroId: string;
  heroRoomId: string;
  currentRoomId: string;
  pendingRoomId?: string;
  visitedRoomIds: string[];
  resolvedRoomIds: string[];
  turn: number;
  events: GameplayEvent[];
}

export interface PlayCommand {
  type: "START_PLAY" | "MOVE" | "RESET_PLAY";
  roomId?: string;
}
