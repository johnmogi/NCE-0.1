import type { ContentRecord, RunState } from "./types";
import { findPath } from "./path";

export function validateRun(run: RunState, catalog: ContentRecord[]): string[] {
  const errors: string[] = [];
  const { rows, cols, roomMix } = run.settings;
  if (run.tiles.length !== rows * cols) errors.push("Invalid tile count");
  if (run.tiles.filter((tile) => tile.roomType === "start").length !== 1) errors.push("Invalid start count");
  if (run.tiles.filter((tile) => tile.roomType === "royal").length !== 1) errors.push("Invalid royal count");
  for (const [type, expected] of Object.entries(roomMix)) {
    if (run.tiles.filter((tile) => tile.roomType === type).length !== expected) errors.push(`Invalid ${type} count`);
  }
  const ids = new Set<string>();
  for (const tile of run.tiles) {
    if (ids.has(tile.roomId)) errors.push(`Duplicate room ID: ${tile.roomId}`);
    ids.add(tile.roomId);
    if (tile.contentId && !catalog.some((record) => record.id === tile.contentId)) errors.push(`Missing content: ${tile.contentId}`);
  }
  const contentIds = run.tiles.map((tile) => tile.contentId).filter(Boolean) as string[];
  if (new Set(contentIds).size !== contentIds.length) errors.push("Duplicate content record in run");
  if (!findPath(run.tiles, rows, cols)) errors.push("No valid Start-to-Exit path");
  return errors;
}
