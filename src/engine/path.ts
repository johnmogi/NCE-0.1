import type { Tile } from "./types";

export function roomId(row: number, col: number): string {
  return `room-${row}-${col}`;
}

export function neighbors(tile: Tile, rows: number, cols: number): string[] {
  const candidates = [
    [tile.row - 1, tile.col],
    [tile.row + 1, tile.col],
    [tile.row, tile.col - 1],
    [tile.row, tile.col + 1],
  ];
  return candidates
    .filter(([row, col]) => row >= 0 && row < rows && col >= 0 && col < cols)
    .map(([row, col]) => roomId(row, col));
}

export function findPath(tiles: Tile[], rows: number, cols: number): string[] | null {
  const byId = new Map(tiles.map((tile) => [tile.roomId, tile]));
  const start = roomId(rows - 1, Math.floor(cols / 2));
  const exit = roomId(0, Math.floor(cols / 2));
  const queue = [start];
  const previous = new Map<string, string | null>([[start, null]]);

  while (queue.length) {
    const current = queue.shift()!;
    if (current === exit) break;
    const tile = byId.get(current);
    if (!tile) continue;
    for (const next of neighbors(tile, rows, cols)) {
      if (!previous.has(next)) {
        previous.set(next, current);
        queue.push(next);
      }
    }
  }

  if (!previous.has(exit)) return null;
  const path: string[] = [];
  let cursor: string | null = exit;
  while (cursor) {
    path.unshift(cursor);
    cursor = previous.get(cursor) ?? null;
  }
  return path;
}

export function validatePath(tiles: Tile[], rows: number, cols: number): boolean {
  return findPath(tiles, rows, cols) !== null;
}
