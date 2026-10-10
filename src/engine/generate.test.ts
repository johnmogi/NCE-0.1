import { describe, expect, it } from "vitest";
import { catalog, recordsOf } from "@/content/catalog";
import { findPath, validatePath } from "./path";
import { generateRun, CONTENT_VERSION, RULES_VERSION } from "./generate";
import { createRng } from "./rng";

function stable(run: ReturnType<typeof generateRun>) {
  const { createdAt: _createdAt, ...withoutTimestamp } = run;
  return withoutTimestamp;
}

describe("NCE Classic Checkpoint 1", () => {
  it("loads the approved 76-record content package", () => {
    expect(catalog).toHaveLength(76);
    expect(recordsOf("hero")).toHaveLength(4);
    expect(recordsOf("challenger")).toHaveLength(32);
    expect(recordsOf("royal")).toHaveLength(12);
    expect(recordsOf("champion")).toHaveLength(4);
    expect(recordsOf("barrier")).toHaveLength(12);
    expect(recordsOf("treasure")).toHaveLength(12);
  });

  it("has a repeatable seeded RNG", () => {
    const first = createRng(42);
    const second = createRng(42);
    expect([first.next(), first.next(), first.next()]).toEqual([second.next(), second.next(), second.next()]);
  });

  it("generates the approved 3 x 5 room mix", () => {
    const run = generateRun(12345, "hero-earth-a");
    expect(run.tiles).toHaveLength(15);
    expect(run.tiles.filter((tile) => tile.roomType === "start")).toHaveLength(1);
    expect(run.tiles.filter((tile) => tile.roomType === "royal")).toHaveLength(1);
    expect(run.tiles.filter((tile) => tile.roomType === "treasure")).toHaveLength(4);
    expect(run.tiles.filter((tile) => tile.roomType === "barrier")).toHaveLength(4);
    expect(run.tiles.filter((tile) => tile.roomType === "challenger")).toHaveLength(5);
    expect(run.tiles.find((tile) => tile.roomId === "room-4-1")?.roomType).toBe("start");
    expect(run.tiles.find((tile) => tile.roomId === "room-0-1")?.roomType).toBe("royal");
  });

  it("validates an orthogonal Start-to-Exit route", () => {
    const run = generateRun(7, "hero-air-a");
    expect(validatePath(run.tiles, 5, 3)).toBe(true);
    expect(findPath(run.tiles, 5, 3)).toEqual(run.route);
    expect(run.route[0]).toBe("room-4-1");
    expect(run.route.at(-1)).toBe("room-0-1");
  });

  it("reproduces board and content placement for the same seed and settings", () => {
    const first = generateRun(98765, "hero-water-a");
    const second = generateRun(98765, "hero-water-a");
    expect(stable(first)).toEqual(stable(second));
    expect(first.contentVersion).toBe(CONTENT_VERSION);
    expect(first.rulesVersion).toBe(RULES_VERSION);
  });

  it("uses unique stable room and content IDs", () => {
    const run = generateRun(88, "hero-fire-a");
    expect(new Set(run.tiles.map((tile) => tile.roomId)).size).toBe(15);
    const contentIds = run.tiles.map((tile) => tile.contentId).filter(Boolean);
    expect(new Set(contentIds).size).toBe(contentIds.length);
    expect(run.tiles.every((tile) => tile.roomId.startsWith("room-"))).toBe(true);
  });

  it("inspects content without implementing gameplay resolution", () => {
    const run = generateRun(101, "hero-air-a");
    expect(run.log).toHaveLength(2);
    expect(run.tiles.some((tile) => tile.inspected)).toBe(false);
    expect(run.tiles.some((tile) => tile.content?.type === "royal")).toBe(true);
    expect(run.rulesVersion).toContain("no-resolution");
  });
});
