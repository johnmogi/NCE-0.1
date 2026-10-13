import { catalog, findContent } from "@/content/catalog";
import { generateRun } from "@/engine/generate";
import { describe, expect, it } from "vitest";
import { codexRecordForContent, generationNotices, poolSummary, worldManifest } from "./forge";

describe("forge helpers", () => {
  it("summarizes the catalog pool the generator can draw from", () => {
    expect(poolSummary(catalog)).toEqual([
      { label: "Heroes", count: 4, used: true },
      { label: "Monsters", count: 32, used: true },
      { label: "Royals", count: 12, used: true },
      { label: "Barriers", count: 12, used: true },
      { label: "Treasures", count: 12, used: true },
      { label: "Champions", count: 4, used: false },
    ]);
  });

  it("builds a 15-room manifest from a real generated world", () => {
    const manifest = worldManifest(generateRun(1048576, "hero-air-a"));
    expect(manifest.rooms).toHaveLength(15);
    expect(manifest.heroName).toBe("Ace of Air");
    expect(manifest.royalName).toBe("Coral Prince");
    expect(manifest.contentCount).toBe(14);
    expect(manifest.uniqueContent).toBe(true);
    expect(manifest.routePass).toBe(true);
    expect(manifest.routeLength).toBe(5);
    expect(manifest.rooms.find((room) => room.coordinate === "A1")?.name).toBe("Coral Prince");
  });

  it("resolves generated content to the same Codex record", () => {
    const run = generateRun(1048576, "hero-air-a");
    const beetle = run.tiles.find((tile) => tile.content?.name === "Cursed Golden Coffee-Dung Beetle");
    const resolved = codexRecordForContent(beetle?.contentId);
    expect(resolved?.id).toBe("earth-4-challenger");
    expect(resolved).toBe(findContent("earth-4-challenger"));
    expect(resolved).toBe(beetle?.content);
  });

  it("reproduces the same world from the same seed and hero", () => {
    const first = generateRun(1048576, "hero-air-a");
    const replay = generateRun(1048576, "hero-air-a");
    expect(replay.tiles.map((tile) => [tile.roomId, tile.roomType, tile.contentId])).toEqual(
      first.tiles.map((tile) => [tile.roomId, tile.roomType, tile.contentId]),
    );
    const notices = generationNotices(replay, catalog);
    expect(notices[0]).toMatchObject({ kind: "generation", code: "WORLD_GENERATED", detail: "tiles=15" });
    expect(notices.find((notice) => notice.code === "ROYAL_SELECTED")?.detail).toBe("royal=water-j-royal");
    expect(notices.at(-1)?.detail).toBe("PASS");
  });
});
