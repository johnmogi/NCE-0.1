import type { ArtStatus, ContentRecord, ContentType, ElementName } from "@/engine/types";

export const CREATURE_ELEMENTS: ElementName[] = ["air", "fire", "water", "earth"];

export const CODEX_CATEGORIES: { type: ContentType | null; label: string }[] = [
  { type: null, label: "ALL" },
  { type: "challenger", label: "CREATURES / MONSTERS" },
  { type: "royal", label: "ROYALS" },
  { type: "champion", label: "CHAMPIONS" },
  { type: "barrier", label: "BARRIERS" },
  { type: "treasure", label: "TREASURES" },
  { type: "hero", label: "HEROES" },
];

export interface CodexQuery {
  text: string;
  type: ContentType | null;
  element: ElementName | null;
  family: string | null;
  rank: string | null;
  value: number | null;
  artStatus: ArtStatus | null;
}

export const EMPTY_QUERY: CodexQuery = {
  text: "",
  type: null,
  element: null,
  family: null,
  rank: null,
  value: null,
  artStatus: null,
};

export function productTypeLabel(type: ContentType): string {
  if (type === "challenger") return "Monster";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function typeLine(type: ContentType): string {
  if (type === "challenger") return "Challenger / Monster";
  return productTypeLabel(type);
}

export function monsterRecords(records: ContentRecord[]): ContentRecord[] {
  return records.filter((record) => record.type === "challenger");
}

export function filterCodex(records: ContentRecord[], query: CodexQuery): ContentRecord[] {
  const text = query.text.trim().toLowerCase();
  return records.filter((record) => {
    if (query.type && record.type !== query.type) return false;
    if (query.element && record.element !== query.element) return false;
    if (query.family && record.family !== query.family) return false;
    if (query.rank && record.rank !== query.rank) return false;
    if (query.value !== null && record.value !== query.value) return false;
    if (query.artStatus && record.artStatus !== query.artStatus) return false;
    if (!text) return true;
    const haystack = [record.name, record.id, record.family, ...record.tags].join("\n").toLowerCase();
    return haystack.includes(text);
  });
}

export function familyCounts(records: ContentRecord[]): { family: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const record of records) counts.set(record.family, (counts.get(record.family) ?? 0) + 1);
  return [...counts.entries()]
    .map(([family, count]) => ({ family, count }))
    .sort((a, b) => b.count - a.count || a.family.localeCompare(b.family));
}

export function elementCounts(records: ContentRecord[]): { element: ElementName; count: number }[] {
  return CREATURE_ELEMENTS.map((element) => ({
    element,
    count: records.filter((record) => record.element === element).length,
  }));
}

export function artStatusCounts(records: ContentRecord[]): { artStatus: ArtStatus; count: number }[] {
  const counts = new Map<ArtStatus, number>();
  for (const record of records) counts.set(record.artStatus, (counts.get(record.artStatus) ?? 0) + 1);
  return [...counts.entries()].map(([artStatus, count]) => ({ artStatus, count }));
}

export function typeCounts(records: ContentRecord[]): { type: ContentType; count: number }[] {
  const order: ContentType[] = ["hero", "challenger", "royal", "champion", "barrier", "treasure"];
  return order.map((type) => ({ type, count: records.filter((record) => record.type === type).length }));
}

export function distinctRanks(records: ContentRecord[]): string[] {
  return [...new Set(records.map((record) => record.rank))];
}

export function distinctValues(records: ContentRecord[]): number[] {
  return [...new Set(records.map((record) => record.value))].sort((a, b) => a - b);
}

export function distinctFamilies(records: ContentRecord[]): string[] {
  return [...new Set(records.map((record) => record.family))].sort((a, b) => a.localeCompare(b));
}

export function distinctArtStatuses(records: ContentRecord[]): ArtStatus[] {
  return [...new Set(records.map((record) => record.artStatus))];
}

export function describeQuery(query: CodexQuery): string {
  const parts: string[] = [];
  if (query.type) parts.push(`type=${query.type}`);
  if (query.element) parts.push(`element=${query.element}`);
  if (query.family) parts.push(`family=${query.family}`);
  if (query.rank) parts.push(`rank=${query.rank}`);
  if (query.value !== null) parts.push(`value=${query.value}`);
  if (query.artStatus) parts.push(`art=${query.artStatus}`);
  if (query.text.trim()) parts.push(`q=${query.text.trim()}`);
  return parts.join(" ") || "cleared";
}
