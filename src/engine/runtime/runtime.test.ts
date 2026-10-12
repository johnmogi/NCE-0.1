import { describe, expect, it } from "vitest";
import { generateRun } from "../generate";
import { applyCommand, commitCard, getLegalMoves, moveHero, resetRuntime, startRoomId, startRuntime } from "./actions";
import { encounterTarget, projectCheck } from "./resolver";

const run = generateRun(1048576, "hero-air-a");

describe("playable runtime", () => {
  it("starts the hero at Start with a hand and full health", () => {
    const runtime = startRuntime(run);
    expect(startRoomId(run)).toBe("room-4-1");
    expect(runtime.heroRoomId).toBe("room-4-1");
    expect(runtime.currentRoomId).toBe("room-4-1");
    expect(runtime.status).toBe("exploring");
    expect(runtime.visitedRoomIds).toEqual(["room-4-1"]);
    expect(runtime.resolvedRoomIds).toEqual([]);
    expect(runtime.health).toBe(3);
    expect(runtime.hand).toHaveLength(4);
    expect(runtime.rulesVersion).toBe("prototype-rules-0.1");
    expect(runtime.events[0]).toMatchObject({ code: "PLAY_STARTED", fields: { hero: "hero-air-a", room: "room-4-1" } });
    expect(runtime.events.slice(1).map((event) => event.code)).toEqual(["CARD_DRAWN", "CARD_DRAWN", "CARD_DRAWN", "CARD_DRAWN"]);
  });

  it("lists only orthogonal neighbors from E1", () => {
    const runtime = startRuntime(run);
    expect(getLegalMoves(run, runtime).sort()).toEqual(["room-3-1", "room-4-0", "room-4-2"]);
    expect(getLegalMoves(run, runtime)).not.toContain("room-3-0");
    expect(getLegalMoves(run, runtime)).not.toContain("room-3-2");
  });

  it("locks movement when a barrier is entered", () => {
    const barrier = run.tiles.find((tile) => tile.roomId === "room-4-0");
    expect(barrier?.roomType).toBe("barrier");
    const moved = moveHero(run, startRuntime(run), "room-4-0");
    expect(moved.heroRoomId).toBe("room-4-0");
    expect(moved.turn).toBe(1);
    expect(moved.status).toBe("awaiting-resolution");
    expect(moved.pendingRoomId).toBe("room-4-0");
    expect(moved.events.map((event) => event.code)).toEqual([
      "PLAY_STARTED",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "HERO_MOVED",
      "ROOM_ENTERED",
      "ENCOUNTER_PENDING",
    ]);
    expect(getLegalMoves(run, moved)).toEqual([]);
    expect(() => moveHero(run, moved, "room-4-1")).toThrow(/Illegal move/);
  });

  it("rejects a non-adjacent move", () => {
    const started = startRuntime(run);
    expect(() => moveHero(run, started, "room-3-0")).toThrow(/Illegal move/);
    expect(() => moveHero(run, started, "room-2-1")).toThrow(/Illegal move/);
  });

  it("resets play without regenerating the board", () => {
    const moved = moveHero(run, startRuntime(run), "room-4-0");
    const contentBefore = run.tiles.map((tile) => tile.contentId);
    const reset = resetRuntime(run);
    expect(run.tiles.map((tile) => tile.contentId)).toEqual(contentBefore);
    expect(reset.heroRoomId).toBe("room-4-1");
    expect(reset.status).toBe("exploring");
    expect(reset.pendingRoomId).toBeUndefined();
    expect(reset.health).toBe(3);
    expect(reset.hand).toHaveLength(4);
    expect(reset.events.map((event) => event.code)).toEqual(["PLAY_STARTED", "CARD_DRAWN", "CARD_DRAWN", "CARD_DRAWN", "CARD_DRAWN"]);
    expect(moved.heroRoomId).toBe("room-4-0");
  });

  it("repeats the same seed, hero, and action sequence", () => {
    const firstRun = generateRun(1048576, "hero-air-a");
    const secondRun = generateRun(1048576, "hero-air-a");
    const first = applyCommand(firstRun, startRuntime(firstRun), { type: "MOVE", roomId: "room-4-2" });
    const second = applyCommand(secondRun, startRuntime(secondRun), { type: "MOVE", roomId: "room-4-2" });
    expect(second).toEqual(first);
    const tile = firstRun.tiles.find((item) => item.roomId === "room-4-2");
    const content = tile?.content;
    if (!tile || !content) throw new Error("Expected an encounter");
    const target = encounterTarget(tile.roomType, content.value);
    const choice = first.hand.map((item) => item.id).sort()[0];
    const playedFirst = commitCard(firstRun, first, choice);
    const playedSecond = commitCard(secondRun, second, choice);
    expect(playedSecond).toEqual(playedFirst);
    expect(projectCheck(first.hand.find((item) => item.id === choice)!, content.element, target).total).toBeGreaterThan(0);
  });
});
