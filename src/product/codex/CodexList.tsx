"use client";

import type { ContentRecord } from "@/engine/types";
import { productTypeLabel } from "./codex";

const glyph: Record<ContentRecord["element"], string> = { air: "◈", fire: "✦", water: "≈", earth: "◆" };

export function CodexList({
  records,
  selectedId,
  onSelect,
}: {
  records: ContentRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (records.length === 0) {
    return <p className="codex-empty">No records match this filter.</p>;
  }
  return (
    <ul className="codex-entries">
      {records.map((record) => (
        <li key={record.id}>
          <button
            type="button"
            className={record.id === selectedId ? "is-on" : ""}
            onClick={() => onSelect(record.id)}
          >
            <span className={`mark element-${record.element}`} aria-hidden="true">{glyph[record.element]}</span>
            <span>
              <strong>{record.name}</strong>
              <em>{record.element} · {productTypeLabel(record.type)} · {record.rank} / {record.value}</em>
              <small>{record.family}</small>
              <small>{record.tags.join(" · ") || "no tags"} · {record.artStatus}</small>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
