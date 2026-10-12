import { describe, expect, it } from "vitest";
import { generateRun } from "../generate";
import { getLegalMoves, moveHero, resetRuntime, startRoomId, startRuntime } from "./actions";

const run = generateRun(1048576, "hero-air-a");

describe("gameplay foundation", () => {
  it("starts the hero at Start, exploring, with Start visited", () => {
    const runtime = startRuntime(run);
    expect(startRoomId(run)).toBe("room-4-1");
    expect(runtime.heroRoomId).toBe("room-4-1");
    expect(runtime.currentRoomId).toBe("room-4-1");
    expect(runtime.status).toBe("exploring");
    expect(runtime.visitedRoomIds).toEqual(["room-4-1"]);
    expect(runtime.resolvedRoomIds).toEqual([]);
    expect(runtime.events[0]).toMatchObject({ code: "PLAY_STARTED", fields: { hero: "hero-air-a", room: "room-4-1" } });
  });

  it("lists only orthogonal neighbors from E1", () => {
    const runtime = startRuntime(run);
    expect(getLegalMoves(run, runtime).sort()).toEqual(["room-3-1", "room-4-0", "room-4-2"]);
    expect(getLegalMoves(run, runtime)).not.toContain("room-3-0");
    expect(getLegalMoves(run, runtime)).not.toContain("room-3-2");
  });

  it("moves to a legal room and locks the encounter", () => {
    const started = startRuntime(run);
    const moved = moveHero(run, started, "room-3-1");
    const destination = run.tiles.find((tile) => tile.roomId === "room-3-1");
    expect(moved.heroRoomId).toBe("room-3-1");
    expect(moved.currentRoomId).toBe("room-3-1");
    expect(moved.turn).toBe(1);
    expect(moved.visitedRoomIds).toContain("room-3-1");
    expect(destination?.roomType).not.toBe("start");
    expect(moved.status).toBe("awaiting-resolution");
    expect(moved.pendingRoomId).toBe("room-3-1");
    expect(moved.events.map((entry) => entry.code)).toEqual(["PLAY_STARTED", "HERO_MOVED", "ROOM_ENTERED", "ENCOUNTER_PENDING"]);
    expect(getLegalMoves(run, moved)).toEqual([]);
    expect(() => moveHero(run, moved, "room-2-1")).toThrow(/Illegal move/);
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
    expect(reset.events.map((entry) => entry.code)).toEqual(["PLAY_STARTED"]);
    expect(moved.heroRoomId).toBe("room-4-0");
  });

  it("repeats the same movement sequence", () => {
    const first = moveHero(run, startRuntime(run), "room-4-2");
    const second = moveHero(run, startRuntime(run), "room-4-2");
    expect(second).toEqual(first);
  });
});
