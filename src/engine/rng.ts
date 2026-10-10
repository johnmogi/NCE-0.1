export function createRng(seed: number) {
  let state = (seed >>> 0) || 1;
  return {
    next(): number {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    },
    int(maxExclusive: number): number {
      if (maxExclusive <= 0) throw new Error("maxExclusive must be positive");
      return Math.floor(this.next() * maxExclusive);
    },
    pick<T>(items: readonly T[]): T {
      if (!items.length) throw new Error("Cannot pick from an empty list");
      return items[this.int(items.length)];
    },
  };
}

export function hashSeed(seed: number, label: string): number {
  let hash = seed >>> 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = Math.imul(hash ^ label.charCodeAt(i), 16777619) >>> 0;
  }
  return hash || 1;
}
