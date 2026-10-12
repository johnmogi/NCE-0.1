import type { ElementName, RoomType } from "../types";
import { elementModifier } from "./elements";
import type { SupportCard } from "./types";

/** Prototype rules v0.1. Replaceable. Not permanent canon. */
export const HERO_BASE_POWER = 1;
export const HERO_HEALTH = 3;
export const STARTING_HAND = 4;
export const HAND_MAX = 6;

export interface CheckProjection {
  base: number;
  cardValue: number;
  modifier: -2 | 0 | 2;
  total: number;
  target: number;
  success: boolean;
  relation: "advantage" | "neutral" | "disadvantage";
}

export function roundsRequired(roomType: RoomType): number {
  if (roomType === "barrier") return 1;
  if (roomType === "challenger") return 2;
  if (roomType === "royal") return 3;
  throw new Error("Room has no check");
}

/** Royal uses catalog value minus 3. Jack 10 → 7, Queen 11 → 8, King 12 → 9. */
export function encounterTarget(roomType: RoomType, contentValue: number): number {
  return roomType === "royal" ? contentValue - 3 : contentValue;
}

export function projectCheck(card: SupportCard, encounterElement: ElementName, target: number): CheckProjection {
  const modifier = elementModifier(card.element, encounterElement);
  const total = HERO_BASE_POWER + card.value + modifier;
  return {
    base: HERO_BASE_POWER,
    cardValue: card.value,
    modifier,
    total,
    target,
    success: total >= target,
    relation: modifier === 2 ? "advantage" : modifier === -2 ? "disadvantage" : "neutral",
  };
}
