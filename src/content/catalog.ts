import raw from "./classic.json";
import type { ContentRecord } from "@/engine/types";

const groups = ["heroes", "challengers", "royals", "champions", "barriers", "treasures"] as const;

export const catalog: ContentRecord[] = groups.flatMap((group) =>
  raw[group].map((record) => ({
    ...record,
    artStatus: "NOT_STARTED" as const,
    artPrompt: "",
    referenceImage: "",
    finalFilename: "",
  }) as ContentRecord),
);

export function recordsOf(type: ContentRecord["type"]): ContentRecord[] {
  return catalog.filter((record) => record.type === type);
}

export function findContent(id: string): ContentRecord | undefined {
  return catalog.find((record) => record.id === id);
}
