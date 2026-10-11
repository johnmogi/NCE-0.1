import { describe, expect, it } from "vitest";
import { catalog } from "@/content/catalog";
import { generateRun } from "@/engine/generate";
import { compareRuns, getDiagnosticLines, getElementDistribution, getRoomDistribution, getRunSummary, getValidationSummary } from "./diagnostics";

function withoutClock(run: ReturnType<typeof generateRun>) {
  const { createdAt: _createdAt, ...rest } = run;
  return rest;
}

describe("admin diagnostics", () => {
  const run = generateRun(1048576, "hero-air-a");

  it("counts rooms, elements, and route length from the generated run", () => {
    expect(getRoomDistribution(run)).toEqual([
      { key: "start", count: 1 },
      { key: "royal", count: 1 },
      { key: "treasure", count: 4 },
      { key: "barrier", count: 4 },
      { key: "challenger", count: 5 },
    ]);
    const elements = getElementDistribution(run);
    expect(elements.reduce((sum, row) => sum + row.count, 0)).toBe(14);
    expect(getRunSummary(run).routeLength).toBe(run.route.length);
    expect(getRunSummary(run).startRoom).toBe("room-4-1");
    expect(getRunSummary(run).exitRoom).toBe("room-0-1");
  });

  it("builds a validation summary from the run and catalog", () => {
    const checks = getValidationSummary(run, catalog);
    expect(checks.every((check) => check.pass)).toBe(true);
    expect(checks.map((check) => check.label)).toContain("Start at E1");
    expect(checks.map((check) => check.label)).toContain("Royal at A1");
    const broken = { ...run, tiles: run.tiles.map((tile) => tile.roomType === "start" ? { ...tile, roomType: "barrier" as const } : tile) };
    expect(getValidationSummary(broken, catalog).find((check) => check.label === "exactly one Start")?.pass).toBe(false);
  });

  it("derives diagnostic lines from run state", () => {
    const lines = getDiagnosticLines(run, catalog);
    expect(lines.map((line) => line.code)).toEqual([
      "RUN_CREATED",
      "BOARD_GENERATED",
      "ROOM_TYPES_ASSIGNED",
      "ROYAL_SELECTED",
      "CONTENT_PLACED",
      "ROUTE_VALIDATED",
      "RUN_VALIDATED",
    ]);
    expect(lines[0]?.fields.seed).toBe(1048576);
    expect(lines[0]?.fields.hero).toBe("hero-air-a");
    expect(lines[5]?.fields.status).toBe("PASS");
  });

  it("replaying the same seed and hero reproduces the run", () => {
    const again = generateRun(1048576, "hero-air-a");
    expect(withoutClock(again)).toEqual(withoutClock(run));
    const other = generateRun(88213, "hero-water-a");
    const compared = compareRuns(other, run);
    expect(compared.currentSeed).toBe(88213);
    expect(compared.previousSeed).toBe(1048576);
    expect(compared.placementChanges).toBeGreaterThan(0);
    expect(compareRuns(run, run).placementChanges).toBe(0);
  });
});
