import type { ElementName } from "../types";

const BEATS: Record<ElementName, ElementName> = {
  water: "fire",
  fire: "earth",
  earth: "air",
  air: "water",
};

/** Prototype rules v0.1. Advantage +2, neutral 0, disadvantage -2. */
export function elementModifier(card: ElementName, encounter: ElementName): -2 | 0 | 2 {
  if (BEATS[card] === encounter) return 2;
  if (BEATS[encounter] === card) return -2;
  return 0;
}

export function relationText(card: ElementName, encounter: ElementName): string {
  const modifier = elementModifier(card, encounter);
  if (modifier === 2) return `${card} beats ${encounter}`;
  if (modifier === -2) return `${encounter} beats ${card}`;
  return "neutral";
}
