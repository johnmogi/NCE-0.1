import type { ElementName } from "../types";

/** Temporary playtest rules. Not catalog canon. */
export const PROTOTYPE_RULES_VERSION = "prototype-rules-0.1";

export type RuntimeStatus = "ready" | "exploring" | "awaiting-resolution" | "treasure-choice" | "ended";

export type GameplayEventCode =
  | "PLAY_STARTED"
  | "CARD_DRAWN"
  | "HERO_MOVED"
  | "ROOM_ENTERED"
  | "ENCOUNTER_PENDING"
  | "CARD_COMMITTED"
  | "CHECK_RESOLVED"
  | "DAMAGE_TAKEN"
  | "ROOM_RESOLVED"
  | "TREASURE_DRAWN"
  | "TREASURE_SELECTED"
  | "ROYAL_DEFEATED"
  | "RUN_WON"
  | "RUN_LOST";

export interface GameplayEvent {
  id: string;
  code: GameplayEventCode;
  fields: Record<string, string | number>;
}

export interface SupportCard {
  id: string;
  element: ElementName;
  value: number;
}

export interface RunStats {
  barriersResolved: number;
  treasuresFound: number;
  challengersDefeated: number;
  cardsUsed: number;
}

export interface RunOutcome {
  result: "won" | "lost";
  reason: "ROYAL_DEFEATED" | "HEALTH_DEPLETED" | "DECK_EXHAUSTED";
}

export interface RuntimeState {
  rulesVersion: typeof PROTOTYPE_RULES_VERSION;
  status: RuntimeStatus;
  heroId: string;
  heroElement: ElementName;
  heroRoomId: string;
  currentRoomId: string;
  pendingRoomId?: string;
  visitedRoomIds: string[];
  resolvedRoomIds: string[];
  turn: number;
  health: number;
  maxHealth: number;
  drawPile: SupportCard[];
  hand: SupportCard[];
  discardPile: SupportCard[];
  encounterProgress: number;
  treasureOffer?: SupportCard[];
  outcome?: RunOutcome;
  stats: RunStats;
  events: GameplayEvent[];
}

export interface PlayCommand {
  type: "START_PLAY" | "MOVE" | "COMMIT_CARD" | "CHOOSE_TREASURE" | "RESET_PLAY";
  roomId?: string;
  cardId?: string;
  discardCardId?: string;
}
