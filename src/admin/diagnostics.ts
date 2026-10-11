import type { ContentRecord, ElementName, RoomType, RunState } from "@/engine/types";
import { validateRun } from "@/engine/validate";

const ROOM_ORDER: RoomType[] = ["start", "royal", "treasure", "barrier", "challenger"];
const ELEMENTS: ElementName[] = ["air", "fire", "water", "earth"];

export interface CountRow {
  key: string;
  count: number;
}

export interface ValidationCheck {
  label: string;
  pass: boolean;
}

export interface RunSummary {
  seed: number;
  heroId: string;
  runId: string;
  contentVersion: string;
  rulesVersion: string;
  createdAt: string;
  tileCount: number;
  routeValid: boolean;
  routeLength: number;
  startRoom: string;
  exitRoom: string;
  royalId: string;
  royalName: string;
}

export interface DiagnosticLine {
  id: string;
  code: string;
  fields: Record<string, string | number>;
}

export interface RunComparison {
  currentSeed: number;
  previousSeed: number;
  currentHero: string;
  previousHero: string;
  currentRoyal: string;
  previousRoyal: string;
  placementChanges: number;
  currentElements: CountRow[];
  previousElements: CountRow[];
  currentRouteLength: number;
  previousRouteLength: number;
}

function expectedStartId(run: RunState): string {
  return `room-${run.settings.rows - 1}-${Math.floor(run.settings.cols / 2)}`;
}

function expectedExitId(run: RunState): string {
  return `room-0-${Math.floor(run.settings.cols / 2)}`;
}

export function coordinateLabel(row: number, col: number): string {
  return `${String.fromCharCode(65 + row)}${col}`;
}

export function getRoomDistribution(run: RunState): CountRow[] {
  return ROOM_ORDER.map((key) => ({ key, count: run.tiles.filter((tile) => tile.roomType === key).length }));
}

export function getElementDistribution(run: RunState): CountRow[] {
  return ELEMENTS.map((key) => ({ key, count: run.tiles.filter((tile) => tile.content?.element === key).length }));
}

export function getValueDistribution(run: RunState): CountRow[] {
  const counts = new Map<number, number>();
  for (const tile of run.tiles) {
    if (tile.content == null) continue;
    counts.set(tile.content.value, (counts.get(tile.content.value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([value, count]) => ({ key: String(value), count }));
}

export function getRankDistribution(run: RunState): CountRow[] {
  const counts = new Map<string, number>();
  for (const tile of run.tiles) {
    if (!tile.content) continue;
    counts.set(tile.content.rank, (counts.get(tile.content.rank) ?? 0) + 1);
  }
  return [...counts.entries()].map(([key, count]) => ({ key, count }));
}

export function getRunSummary(run: RunState): RunSummary {
  const royal = run.tiles.find((tile) => tile.roomType === "royal");
  return {
    seed: run.seed,
    heroId: run.heroId,
    runId: run.runId,
    contentVersion: run.contentVersion,
    rulesVersion: run.rulesVersion,
    createdAt: run.createdAt,
    tileCount: run.tiles.length,
    routeValid: run.routeValid,
    routeLength: run.route.length,
    startRoom: run.tiles.find((tile) => tile.roomType === "start")?.roomId ?? "—",
    exitRoom: royal?.roomId ?? "—",
    royalId: royal?.contentId ?? "—",
    royalName: royal?.content?.name ?? "—",
  };
}

export function getValidationSummary(run: RunState, catalog: ContentRecord[]): ValidationCheck[] {
  const errors = validateRun(run, catalog);
  const start = run.tiles.find((tile) => tile.roomType === "start");
  const royal = run.tiles.find((tile) => tile.roomType === "royal");
  const startId = expectedStartId(run);
  const exitId = expectedExitId(run);
  const roomIds = run.tiles.map((tile) => tile.roomId);
  const contentIds = run.tiles.map((tile) => tile.contentId).filter((id): id is string => Boolean(id));
  const missingContent = contentIds.filter((id) => !catalog.some((record) => record.id === id));
  const startTile = run.tiles.find((tile) => tile.roomId === startId);
  const exitTile = run.tiles.find((tile) => tile.roomId === exitId);
  const startCoord = startTile ? coordinateLabel(startTile.row, startTile.col) : "—";
  const exitCoord = exitTile ? coordinateLabel(exitTile.row, exitTile.col) : "—";
  return [
    { label: `${run.settings.rows * run.settings.cols} rooms`, pass: !errors.some((error) => error === "Invalid tile count") },
    { label: "exactly one Start", pass: start != null && run.tiles.filter((tile) => tile.roomType === "start").length === 1 },
    { label: "exactly one Royal", pass: royal != null && run.tiles.filter((tile) => tile.roomType === "royal").length === 1 },
    { label: `Start at ${startCoord}`, pass: start?.roomId === startId && start.roomType === "start" },
    { label: `Royal at ${exitCoord}`, pass: royal?.roomId === exitId && royal.roomType === "royal" },
    { label: "unique room IDs", pass: new Set(roomIds).size === roomIds.length },
    { label: "unique generated content IDs", pass: new Set(contentIds).size === contentIds.length && !errors.includes("Duplicate content record in run") },
    { label: "valid orthogonal route", pass: run.routeValid && run.route.length > 0 && !errors.includes("No valid Start-to-Exit path") },
    { label: "content IDs exist in catalog", pass: missingContent.length === 0 },
  ];
}

export function getDiagnosticLines(run: RunState, catalog: ContentRecord[]): DiagnosticLine[] {
  const summary = getRunSummary(run);
  const rooms = getRoomDistribution(run);
  const checks = getValidationSummary(run, catalog);
  const royal = run.tiles.find((tile) => tile.roomType === "royal");
  return [
    { id: "diag-001", code: "RUN_CREATED", fields: { seed: summary.seed, hero: summary.heroId, run: summary.runId } },
    { id: "diag-002", code: "BOARD_GENERATED", fields: { tiles: summary.tileCount, start: summary.startRoom, exit: summary.exitRoom } },
    { id: "diag-003", code: "ROOM_TYPES_ASSIGNED", fields: Object.fromEntries(rooms.map((row) => [row.key, row.count])) },
    { id: "diag-004", code: "ROYAL_SELECTED", fields: { id: royal?.contentId ?? "—", name: royal?.content?.name ?? "—" } },
    { id: "diag-005", code: "CONTENT_PLACED", fields: { placed: run.tiles.filter((tile) => tile.contentId).length } },
    { id: "diag-006", code: "ROUTE_VALIDATED", fields: { length: summary.routeLength, status: summary.routeValid ? "PASS" : "FAIL" } },
    { id: "diag-007", code: "RUN_VALIDATED", fields: { status: checks.every((check) => check.pass) ? "PASS" : "FAIL", checks: checks.length } },
  ];
}

export function compareRuns(current: RunState, previous: RunState): RunComparison {
  const byId = new Map(previous.tiles.map((tile) => [tile.roomId, tile]));
  const placementChanges = current.tiles.filter((tile) => {
    const other = byId.get(tile.roomId);
    return !other || other.roomType !== tile.roomType || other.contentId !== tile.contentId;
  }).length;
  return {
    currentSeed: current.seed,
    previousSeed: previous.seed,
    currentHero: current.heroId,
    previousHero: previous.heroId,
    currentRoyal: getRunSummary(current).royalName,
    previousRoyal: getRunSummary(previous).royalName,
    placementChanges,
    currentElements: getElementDistribution(current),
    previousElements: getElementDistribution(previous),
    currentRouteLength: current.route.length,
    previousRouteLength: previous.route.length,
  };
}
