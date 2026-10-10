export type ElementName = "air" | "fire" | "water" | "earth";
export type ContentType = "hero" | "challenger" | "royal" | "champion" | "barrier" | "treasure";
export type RoomType = "start" | "royal" | "challenger" | "barrier" | "treasure";
export type ArtStatus = "NOT_STARTED" | "PROMPT_READY" | "GENERATED" | "REVISION" | "APPROVED";

export interface ContentRecord {
  id: string;
  type: ContentType;
  rank: string;
  value: number;
  element: ElementName;
  tier?: "common" | "epic" | "legendary";
  name: string;
  family: string;
  tags: string[];
  artStatus: ArtStatus;
  artPrompt: string;
  referenceImage: string;
  finalFilename: string;
}

export interface Tile {
  roomId: string;
  row: number;
  col: number;
  roomType: RoomType;
  contentId?: string;
  content?: ContentRecord;
  inspected: boolean;
}

export interface BoardSettings {
  rows: 5;
  cols: 3;
  roomMix: { treasure: 4; barrier: 4; challenger: 5 };
}

export interface LogEntry {
  id: string;
  action: string;
  message: string;
  roomId?: string;
  contentId?: string;
}

export interface RunState {
  runId: string;
  seed: number;
  contentVersion: string;
  rulesVersion: string;
  heroId: string;
  settings: BoardSettings;
  tiles: Tile[];
  route: string[];
  routeValid: boolean;
  log: LogEntry[];
  createdAt: string;
}

export const BOARD_SETTINGS: BoardSettings = {
  rows: 5,
  cols: 3,
  roomMix: { treasure: 4, barrier: 4, challenger: 5 },
};
