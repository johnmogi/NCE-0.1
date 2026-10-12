import { describe, expect, it } from "vitest";
import { roomId } from "../path";
import { BOARD_SETTINGS, type ContentRecord, type RoomType, type RunState, type Tile } from "../types";
import { chooseTreasure, commitCard, getLegalMoves, moveHero, startRuntime } from "./actions";
import { elementModifier } from "./elements";
import { encounterTarget, projectCheck } from "./resolver";
import type { RuntimeState, SupportCard } from "./types";

function card(element: SupportCard["element"], value: number, id = `support-${element}-${value}`): SupportCard {
  return { id, element, value };
}

function record(type: ContentRecord["type"], element: ContentRecord["element"], value: number): ContentRecord {
  return {
    id: `${type}-${element}-${value}`,
    type,
    rank: "A",
    value,
    element,
    name: `${type} ${element} ${value}`,
    family: "fixture",
    tags: [],
    artStatus: "NOT_STARTED",
    artPrompt: "",
    referenceImage: "",
    finalFilename: "",
  };
}

function cell(row: number, col: number, roomType: RoomType, content?: ContentRecord): Tile {
  return { roomId: roomId(row, col), row, col, roomType, contentId: content?.id, content, inspected: false };
}

function board(encounters: Tile[]): RunState {
  return {
    runId: "fixture",
    seed: 7,
    contentVersion: "test",
    rulesVersion: "test",
    heroId: "hero-air-a",
    settings: BOARD_SETTINGS,
    tiles: [cell(4, 1, "start"), ...encounters],
    route: ["room-4-1"],
    routeValid: true,
    log: [],
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

function enter(run: RunState, room: string, hand: SupportCard[], draw: SupportCard[]): RuntimeState {
  return { ...moveHero(run, startRuntime(run), room), hand, drawPile: draw, discardPile: [] };
}

describe("prototype element cycle", () => {
  it("scores the four advantages and the matching penalties", () => {
    expect(elementModifier("water", "fire")).toBe(2);
    expect(elementModifier("fire", "earth")).toBe(2);
    expect(elementModifier("earth", "air")).toBe(2);
    expect(elementModifier("air", "water")).toBe(2);
    expect(elementModifier("fire", "water")).toBe(-2);
    expect(elementModifier("earth", "fire")).toBe(-2);
    expect(elementModifier("air", "earth")).toBe(-2);
    expect(elementModifier("water", "air")).toBe(-2);
    expect(elementModifier("air", "air")).toBe(0);
    expect(elementModifier("air", "fire")).toBe(0);
    expect(elementModifier("water", "earth")).toBe(0);
  });
});

describe("prototype encounters", () => {
  it("resolves a barrier on a successful check and draws a replacement", () => {
    const run = board([cell(3, 1, "barrier", record("barrier", "earth", 6))]);
    const played = card("fire", 4);
    const next = commitCard(run, enter(run, "room-3-1", [played], [card("water", 2)]), played.id);
    expect(projectCheck(played, "earth", 6)).toMatchObject({ modifier: 2, total: 7, success: true });
    expect(next.status).toBe("exploring");
    expect(next.resolvedRoomIds).toEqual(["room-3-1"]);
    expect(next.pendingRoomId).toBeUndefined();
    expect(next.discardPile.map((item) => item.id)).toEqual([played.id]);
    expect(next.hand.map((item) => item.id)).toEqual(["support-water-2"]);
    expect(next.health).toBe(3);
    expect(next.stats.barriersResolved).toBe(1);
  });

  it("damages on a failed barrier and leaves it pending", () => {
    const run = board([cell(3, 1, "barrier", record("barrier", "earth", 6))]);
    const played = card("air", 2);
    const next = commitCard(run, enter(run, "room-3-1", [played], [card("water", 3)]), played.id);
    expect(projectCheck(played, "earth", 6).total).toBe(1);
    expect(next.health).toBe(2);
    expect(next.status).toBe("awaiting-resolution");
    expect(next.pendingRoomId).toBe("room-3-1");
    expect(next.resolvedRoomIds).toEqual([]);
    expect(next.discardPile.map((item) => item.id)).toEqual([played.id]);
    expect(next.hand.map((item) => item.id)).toEqual(["support-water-3"]);
    expect(getLegalMoves(run, next)).toEqual([]);
  });

  it("keeps one treasure card, discards the other, and resolves the room", () => {
    const run = board([cell(3, 1, "treasure", record("treasure", "water", 8))]);
    const started = { ...startRuntime(run), drawPile: [card("water", 7, "offer-water"), card("earth", 3, "offer-earth"), card("air", 2, "offer-rest")] };
    const offered = moveHero(run, started, "room-3-1");
    expect(offered.status).toBe("treasure-choice");
    expect(offered.treasureOffer?.map((item) => item.id)).toEqual(["offer-water", "offer-earth"]);
    expect(offered.hand).toHaveLength(4);
    const kept = chooseTreasure(run, offered, "offer-water");
    expect(kept.hand.map((item) => item.id)).toContain("offer-water");
    expect(kept.hand).toHaveLength(5);
    expect(kept.discardPile.map((item) => item.id)).toEqual(["offer-earth"]);
    expect(kept.status).toBe("exploring");
    expect(kept.resolvedRoomIds).toEqual(["room-3-1"]);
    expect(kept.stats.treasuresFound).toBe(1);
    expect(getLegalMoves(run, kept).length).toBeGreaterThan(0);
  });

  it("requires a hand discard when keeping a treasure would exceed 6", () => {
    const run = board([cell(3, 1, "treasure", record("treasure", "water", 8))]);
    const full = [1, 2, 3, 4, 5, 6].map((value) => card("air", value, `hand-${value}`));
    const started = { ...startRuntime(run), hand: full, drawPile: [card("water", 7, "offer-water"), card("earth", 3, "offer-earth")] };
    const offered = moveHero(run, started, "room-3-1");
    expect(() => chooseTreasure(run, offered, "offer-water")).toThrow(/Discard a card from hand/);
    const kept = chooseTreasure(run, offered, "offer-water", "hand-2");
    expect(kept.hand).toHaveLength(6);
    expect(kept.hand.map((item) => item.id)).toContain("offer-water");
    expect(kept.hand.map((item) => item.id)).not.toContain("hand-2");
    expect(kept.discardPile.map((item) => item.id)).toEqual(expect.arrayContaining(["offer-earth", "hand-2"]));
    expect(kept.status).toBe("exploring");
  });

  it("resolves a challenger only after two successful rounds", () => {
    const run = board([cell(3, 1, "challenger", record("challenger", "earth", 9))]);
    const first = card("fire", 8, "round-1");
    const second = card("fire", 8, "round-2");
    const opened = enter(run, "room-3-1", [first, second], [card("air", 2, "draw-a"), card("air", 3, "draw-b")]);
    const once = commitCard(run, opened, first.id);
    expect(once.status).toBe("awaiting-resolution");
    expect(once.encounterProgress).toBe(1);
    expect(once.resolvedRoomIds).toEqual([]);
    expect(once.health).toBe(3);
    const twice = commitCard(run, once, second.id);
    expect(twice.status).toBe("exploring");
    expect(twice.resolvedRoomIds).toEqual(["room-3-1"]);
    expect(twice.stats.challengersDefeated).toBe(1);
    expect(getLegalMoves(run, twice)).toContain("room-4-1");
  });

  it("does not advance a challenger round after damage", () => {
    const run = board([cell(3, 1, "challenger", record("challenger", "earth", 9))]);
    const next = commitCard(run, enter(run, "room-3-1", [card("air", 2)], [card("water", 4)]), "support-air-2");
    expect(next.health).toBe(2);
    expect(next.encounterProgress).toBe(0);
    expect(next.status).toBe("awaiting-resolution");
  });

  it("derives royal targets and wins on the third success", () => {
    expect(encounterTarget("royal", 10)).toBe(7);
    expect(encounterTarget("royal", 11)).toBe(8);
    expect(encounterTarget("royal", 12)).toBe(9);
    expect(encounterTarget("barrier", 10)).toBe(10);
    const run = board([cell(3, 1, "royal", record("royal", "water", 10))]);
    const rounds = [card("water", 6, "royal-1"), card("water", 6, "royal-2"), card("water", 6, "royal-3")];
    let runtime = enter(run, "room-3-1", rounds, [card("air", 2, "d1"), card("air", 2, "d2"), card("air", 2, "d3")]);
    expect(projectCheck(rounds[0], "water", 7)).toMatchObject({ total: 7, success: true });
    runtime = commitCard(run, runtime, "royal-1");
    runtime = commitCard(run, runtime, "royal-2");
    expect(runtime.status).toBe("awaiting-resolution");
    expect(runtime.encounterProgress).toBe(2);
    runtime = commitCard(run, runtime, "royal-3");
    expect(runtime.status).toBe("ended");
    expect(runtime.outcome).toEqual({ result: "won", reason: "ROYAL_DEFEATED" });
    expect(runtime.events.map((event) => event.code)).toContain("RUN_WON");
    expect(getLegalMoves(run, runtime)).toEqual([]);
  });

  it("ends the run at zero health", () => {
    const run = board([cell(3, 1, "barrier", record("barrier", "earth", 9))]);
    const opened = { ...enter(run, "room-3-1", [card("air", 2)], [card("water", 4)]), health: 1 };
    const next = commitCard(run, opened, "support-air-2");
    expect(next.health).toBe(0);
    expect(next.status).toBe("ended");
    expect(next.outcome).toEqual({ result: "lost", reason: "HEALTH_DEPLETED" });
    expect(next.resolvedRoomIds).toEqual([]);
  });

  it("ends the run when a required draw cannot be dealt", () => {
    const run = board([cell(3, 1, "barrier", record("barrier", "earth", 4))]);
    const opened = enter(run, "room-3-1", [card("fire", 8)], []);
    const next = commitCard(run, opened, "support-fire-8");
    expect(next.status).toBe("ended");
    expect(next.outcome).toEqual({ result: "lost", reason: "DECK_EXHAUSTED" });
    expect(next.resolvedRoomIds).toEqual([]);
  });

  it("unlocks movement through resolved rooms and blocks a pending encounter", () => {
    const run = board([cell(3, 1, "barrier", record("barrier", "earth", 4)), cell(4, 0, "barrier", record("barrier", "air", 3))]);
    const cleared = commitCard(run, enter(run, "room-3-1", [card("fire", 4)], [card("water", 2)]), "support-fire-4");
    expect(cleared.status).toBe("exploring");
    expect(getLegalMoves(run, cleared)).toContain("room-4-1");
    const back = moveHero(run, cleared, "room-4-1");
    expect(back.status).toBe("exploring");
    expect(back.pendingRoomId).toBeUndefined();
    const revisit = moveHero(run, back, "room-3-1");
    expect(revisit.status).toBe("exploring");
    expect(revisit.pendingRoomId).toBeUndefined();
    const pending = moveHero(run, back, "room-4-0");
    expect(pending.status).toBe("awaiting-resolution");
    expect(getLegalMoves(run, pending)).toEqual([]);
    expect(() => moveHero(run, pending, "room-4-1")).toThrow(/Illegal move/);
  });
});
