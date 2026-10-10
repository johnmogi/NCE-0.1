import { catalog, findContent, recordsOf } from "@/content/catalog";
import { BOARD_SETTINGS, type ContentRecord, type LogEntry, type RunState, type Tile } from "./types";
import { createRng, hashSeed } from "./rng";
import { findPath } from "./path";
import { createEmptyBoard, assignRoomTypes } from "./board";
import { validateRun } from "./validate";

export const CONTENT_VERSION = "classic-0.1-content-1";
export const RULES_VERSION = "checkpoint-1-no-resolution";

function shuffled<T>(items: T[], seed: number): T[] {
  const rng = createRng(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = rng.int(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function chooseUnique(records: ContentRecord[], count: number, seed: number): ContentRecord[] {
  return shuffled(records, seed).slice(0, count);
}

function addLog(action: string, message: string, index: number, extra: Partial<LogEntry> = {}): LogEntry {
  return { id: `log-${String(index).padStart(3, "0")}`, action, message, ...extra };
}

export function generateRun(seed: number, heroId: string): RunState {
  if (!Number.isInteger(seed)) throw new Error("Seed must be an integer");
  const hero = findContent(heroId);
  if (!hero || hero.type !== "hero") throw new Error("Invalid Hero ID");
  const settings = BOARD_SETTINGS;
  const typedBoard = assignRoomTypes(createEmptyBoard(settings), hashSeed(seed, "room-types"), settings);
  const route = findPath(typedBoard, settings.rows, settings.cols);
  if (!route) throw new Error("Generated board has no valid path");

  const used = new Set<string>();
  const royal = chooseUnique(recordsOf("royal"), 1, hashSeed(seed, "royal"))[0];
  used.add(royal.id);
  const selected = {
    treasure: chooseUnique(recordsOf("treasure"), settings.roomMix.treasure, hashSeed(seed, "treasures")),
    barrier: chooseUnique(recordsOf("barrier"), settings.roomMix.barrier, hashSeed(seed, "barriers")),
    challenger: chooseUnique(recordsOf("challenger"), settings.roomMix.challenger, hashSeed(seed, "challengers")),
  };
  Object.values(selected).flat().forEach((record) => used.add(record.id));

  const byType: Record<string, ContentRecord[]> = {
    treasure: [...selected.treasure],
    barrier: [...selected.barrier],
    challenger: [...selected.challenger],
  };
  const tiles: Tile[] = typedBoard.map((tile) => {
    if (tile.roomType === "start") return tile;
    if (tile.roomType === "royal") return { ...tile, contentId: royal.id, content: royal };
    const record = byType[tile.roomType].shift();
    if (!record || used.has(`placed:${record.id}`)) throw new Error(`Unable to place ${tile.roomType}`);
    used.add(`placed:${record.id}`);
    return { ...tile, contentId: record.id, content: record };
  });

  const run: RunState = {
    runId: `run-${Math.abs(seed)}`,
    seed,
    contentVersion: CONTENT_VERSION,
    rulesVersion: RULES_VERSION,
    heroId: hero.id,
    settings,
    tiles,
    route,
    routeValid: true,
    log: [
      addLog("generate", `Generated NCE Classic board from seed ${seed}.`, 1),
      addLog("validate", `Validated orthogonal route with ${route.length} tiles.`, 2),
    ],
    createdAt: new Date().toISOString(),
  };
  const errors = validateRun(run, catalog);
  if (errors.length) throw new Error(errors.join("; "));
  return run;
}

export function inspectTile(run: RunState, roomId: string): RunState {
  const tile = run.tiles.find((candidate) => candidate.roomId === roomId);
  if (!tile) throw new Error("Room not found");
  const log = addLog("inspect", `Inspected ${tile.content?.name ?? tile.roomType}.`, run.log.length + 1, {
    roomId: tile.roomId,
    contentId: tile.contentId,
  });
  return {
    ...run,
    tiles: run.tiles.map((candidate) => candidate.roomId === roomId ? { ...candidate, inspected: true } : candidate),
    log: [...run.log, log],
  };
}

export function exportableRun(run: RunState): RunState {
  return JSON.parse(JSON.stringify(run)) as RunState;
}
