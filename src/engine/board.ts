import { createRng } from "./rng";
import { roomId } from "./path";
import type { BoardSettings, RoomType, Tile } from "./types";

const roomTypes: Array<keyof BoardSettings["roomMix"]> = ["treasure", "barrier", "challenger"];

export function createEmptyBoard(settings: BoardSettings): Tile[] {
  const tiles: Tile[] = [];
  for (let row = 0; row < settings.rows; row += 1) {
    for (let col = 0; col < settings.cols; col += 1) {
      const isStart = row === settings.rows - 1 && col === Math.floor(settings.cols / 2);
      const isExit = row === 0 && col === Math.floor(settings.cols / 2);
      tiles.push({
        roomId: roomId(row, col),
        row,
        col,
        roomType: isStart ? "start" : isExit ? "royal" : "start",
        inspected: false,
      });
    }
  }
  return tiles;
}

export function assignRoomTypes(tiles: Tile[], seed: number, settings: BoardSettings): Tile[] {
  const rng = createRng(seed);
  const mutable = tiles.map((tile) => ({ ...tile }));
  const startId = roomId(settings.rows - 1, Math.floor(settings.cols / 2));
  const open = mutable.filter((tile) => tile.roomType === "start" && tile.roomId !== startId);
  const shuffled = [...open];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = rng.int(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const requested = roomTypes.flatMap((type) => Array.from({ length: settings.roomMix[type] }, () => type));
  if (requested.length !== shuffled.length) throw new Error("Room mix does not fit board");
  shuffled.forEach((tile, index) => { tile.roomType = requested[index]; });
  return mutable;
}
