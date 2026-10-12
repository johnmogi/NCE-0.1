import { createRng, hashSeed } from "../rng";
import type { ElementName } from "../types";
import type { SupportCard } from "./types";

const ELEMENTS: ElementName[] = ["air", "fire", "water", "earth"];

/** Gameplay support deck. This is not the encounter catalog. */
export function createSupportDeck(): SupportCard[] {
  const cards: SupportCard[] = [];
  for (const element of ELEMENTS) {
    for (let value = 2; value <= 9; value += 1) {
      cards.push({ id: `support-${element}-${value}`, element, value });
    }
  }
  return cards;
}

/**
 * Shuffle with a seed stream that is not used by board generation.
 * Same seed and hero always deal the same deck.
 */
export function shuffleSupportDeck(seed: number, heroId: string): SupportCard[] {
  const cards = createSupportDeck();
  const rng = createRng(hashSeed(seed, `support:${heroId}`));
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const swap = rng.int(index + 1);
    const current = cards[index];
    cards[index] = cards[swap];
    cards[swap] = current;
  }
  return cards;
}
