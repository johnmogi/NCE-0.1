import { findContent } from "@/content/catalog";
import { coordinateLabel, getValidationSummary } from "@/admin/diagnostics";
import { BOARD_SETTINGS, type ContentRecord, type ContentType, type RunState } from "@/engine/types";
import type { NoticeKind } from "@/product/terminal/TerminalDock";

const POOL: { type: ContentType; label: string; used: boolean }[] = [
  { type: "hero", label: "Heroes", used: true },
  { type: "challenger", label: "Monsters", used: true },
  { type: "royal", label: "Royals", used: true },
  { type: "barrier", label: "Barriers", used: true },
  { type: "treasure", label: "Treasures", used: true },
  { type: "champion", label: "Champions", used: false },
];

export interface PoolRow {
  label: string;
  count: number;
  used: boolean;
}

export interface ManifestRoom {
  coordinate: string;
  roomId: string;
  roomType: RunState["tiles"][number]["roomType"];
  name: string;
  contentId?: string;
}

export interface WorldManifest {
  seed: number;
  heroName: string;
  heroId: string;
  royalName: string;
  royalId: string;
  contentCount: number;
  uniqueContent: boolean;
  routePass: boolean;
  routeLength: number;
  rooms: ManifestRoom[];
}

export interface GenerationNotice {
  kind: NoticeKind;
  code: string;
  detail: string;
}

export function poolSummary(records: ContentRecord[]): PoolRow[] {
  return POOL.map((row) => ({
    label: row.label,
    count: records.filter((record) => record.type === row.type).length,
    used: row.used,
  }));
}

export function lockedBoard(settings = BOARD_SETTINGS) {
  const middle = Math.floor(settings.cols / 2);
  return {
    board: `${settings.cols} × ${settings.rows}`,
    start: coordinateLabel(settings.rows - 1, middle),
    royal: coordinateLabel(0, middle),
    rooms: [
      { label: "Treasure", count: settings.roomMix.treasure },
      { label: "Barrier", count: settings.roomMix.barrier },
      { label: "Monster", count: settings.roomMix.challenger },
      { label: "Royal", count: 1 },
      { label: "Start", count: 1 },
    ],
  };
}

export function worldManifest(run: RunState): WorldManifest {
  const hero = findContent(run.heroId);
  const royal = run.tiles.find((tile) => tile.roomType === "royal");
  const contentIds = run.tiles.map((tile) => tile.contentId).filter((id): id is string => Boolean(id));
  return {
    seed: run.seed,
    heroName: hero?.name ?? run.heroId,
    heroId: run.heroId,
    royalName: royal?.content?.name ?? "—",
    royalId: royal?.contentId ?? "—",
    contentCount: contentIds.length,
    uniqueContent: new Set(contentIds).size === contentIds.length,
    routePass: run.routeValid && run.route.length > 0,
    routeLength: run.route.length,
    rooms: run.tiles.map((tile) => ({
      coordinate: coordinateLabel(tile.row, tile.col),
      roomId: tile.roomId,
      roomType: tile.roomType,
      name: tile.content?.name ?? "Start",
      contentId: tile.contentId,
    })),
  };
}

export function codexRecordForContent(contentId: string | undefined): ContentRecord | undefined {
  return contentId ? findContent(contentId) : undefined;
}

export function generationNotices(run: RunState, records: ContentRecord[]): GenerationNotice[] {
  const checks = getValidationSummary(run, records);
  const royal = run.tiles.find((tile) => tile.roomType === "royal");
  const failed = checks.filter((check) => !check.pass).map((check) => check.label);
  const placed = run.tiles
    .filter((tile) => tile.contentId)
    .map((tile) => ({
      kind: "generation" as const,
      code: "ROOM_PLACED",
      detail: `room=${coordinateLabel(tile.row, tile.col)} content=${tile.contentId}`,
    }));
  return [
    { kind: "generation", code: "WORLD_GENERATED", detail: `tiles=${run.tiles.length}` },
    ...placed,
    { kind: "generation", code: "ROYAL_SELECTED", detail: `royal=${royal?.contentId ?? "—"}` },
    { kind: "generation", code: "VALIDATION", detail: failed.length === 0 ? "PASS" : `FAIL ${failed.join("; ")}` },
  ];
}
