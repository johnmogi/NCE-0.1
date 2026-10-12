import { catalog } from "@/content/catalog";
import { describe, expect, it } from "vitest";
import { EMPTY_QUERY, familyCounts, filterCodex, monsterRecords, typeCounts } from "./codex";

describe("codex catalog view", () => {
  it("loads the 76 records currently in the catalog", () => {
    expect(catalog).toHaveLength(76);
    const counts = Object.fromEntries(typeCounts(catalog).map((entry) => [entry.type, entry.count]));
    expect(counts).toEqual({ hero: 4, challenger: 32, royal: 12, champion: 4, barrier: 12, treasure: 12 });
  });

  it("treats the 32 challenger records as monsters without renaming the engine type", () => {
    const monsters = monsterRecords(catalog);
    expect(monsters).toHaveLength(32);
    expect(monsters.every((record) => record.type === "challenger")).toBe(true);
  });

  it("filters by element", () => {
    const earth = filterCodex(catalog, { ...EMPTY_QUERY, element: "earth" });
    expect(earth).toHaveLength(19);
    expect(earth.every((record) => record.element === "earth")).toBe(true);
  });

  it("counts families from the stored family field", () => {
    const counts = familyCounts(catalog);
    expect(counts.reduce((total, entry) => total + entry.count, 0)).toBe(76);
    expect(counts.find((entry) => entry.family === "earth-folklore")?.count).toBe(8);
    expect(counts.find((entry) => entry.family === "faery-sky")?.count).toBe(1);
    expect(counts.some((entry) => entry.family === "insect")).toBe(false);
  });

  it("searches name, id, family, and tags", () => {
    expect(filterCodex(catalog, { ...EMPTY_QUERY, text: "coffee" }).map((record) => record.id)).toEqual(["earth-4-challenger"]);
    expect(filterCodex(catalog, { ...EMPTY_QUERY, text: "beetle" }).map((record) => record.id)).toEqual(["earth-4-challenger"]);
    expect(filterCodex(catalog, { ...EMPTY_QUERY, text: "earth-folklore" }).every((record) => record.family === "earth-folklore")).toBe(true);
    expect(filterCodex(catalog, { ...EMPTY_QUERY, text: "earth-4-challenger" })).toHaveLength(1);
  });
});
