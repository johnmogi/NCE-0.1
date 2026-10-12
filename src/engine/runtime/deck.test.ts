import { describe, expect, it } from "vitest";
import { generateRun } from "../generate";
import { createSupportDeck, shuffleSupportDeck } from "./deck";
import { startRuntime } from "./actions";

describe("support deck", () => {
  it("contains 32 cards, values 2–9 in four elements", () => {
    const deck = createSupportDeck();
    expect(deck).toHaveLength(32);
    for (const element of ["air", "fire", "water", "earth"] as const) {
      const values = deck.filter((card) => card.element === element).map((card) => card.value).sort();
      expect(values).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    }
    expect(new Set(deck.map((card) => card.id)).size).toBe(32);
  });

  it("shuffles deterministically from the run seed and hero", () => {
    const first = shuffleSupportDeck(1048576, "hero-air-a").map((card) => card.id);
    const second = shuffleSupportDeck(1048576, "hero-air-a").map((card) => card.id);
    expect(second).toEqual(first);
    expect(first).not.toEqual(createSupportDeck().map((card) => card.id));
    expect(shuffleSupportDeck(1048576, "hero-fire-a").map((card) => card.id)).not.toEqual(first);
  });

  it("deals a starting hand of 4 without changing the generated board", () => {
    const run = generateRun(1048576, "hero-air-a");
    const before = run.tiles.map((tile) => tile.contentId);
    const runtime = startRuntime(run);
    expect(runtime.hand).toHaveLength(4);
    expect(runtime.drawPile).toHaveLength(28);
    expect(runtime.discardPile).toEqual([]);
    expect(runtime.health).toBe(3);
    expect(run.tiles.map((tile) => tile.contentId)).toEqual(before);
  });
});
