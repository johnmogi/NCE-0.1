"use client";

import type { ContentRecord, ElementName } from "@/engine/types";
import {
  CODEX_CATEGORIES,
  CREATURE_ELEMENTS,
  artStatusCounts,
  elementCounts,
  familyCounts,
  type CodexQuery,
  typeCounts,
} from "./codex";

const summaryOrder = [
  ["hero", "Heroes"],
  ["challenger", "Monsters"],
  ["royal", "Royals"],
  ["champion", "Champions"],
  ["barrier", "Barriers"],
  ["treasure", "Treasures"],
] as const;

export function CodexSidebar({
  records,
  query,
  onChange,
}: {
  records: ContentRecord[];
  query: CodexQuery;
  onChange: (query: CodexQuery) => void;
}) {
  const types = typeCounts(records);
  const countOf = (type: ContentRecord["type"] | null) => type === null ? records.length : types.find((entry) => entry.type === type)?.count ?? 0;
  const monstersByElement = (element: ElementName) => records.filter((record) => record.type === "challenger" && record.element === element).length;
  const families = familyCounts(records);
  const elements = elementCounts(records);
  const art = artStatusCounts(records);

  return (
    <aside className="codex-side">
      <p className="codex-kicker">Dataset</p>
      <p className="codex-total"><b>{records.length}</b> records</p>
      <ul className="codex-summary">
        {summaryOrder.map(([type, label]) => (
          <li key={type}><span>{label}</span><b>{countOf(type)}</b></li>
        ))}
      </ul>

      <nav aria-label="Codex categories">
        {CODEX_CATEGORIES.map((category) => {
          const active = query.type === category.type && query.element === null && query.family === null;
          return (
            <div key={category.label}>
              <button
                type="button"
                className={active ? "is-on" : ""}
                onClick={() => onChange({ ...query, type: category.type, element: null, family: null })}
              >
                <span>{category.label}</span>
                <b>{countOf(category.type)}</b>
              </button>
              {category.type === "challenger" && (
                <div className="codex-sub">
                  {CREATURE_ELEMENTS.map((element) => (
                    <button
                      key={element}
                      type="button"
                      className={query.type === "challenger" && query.element === element && query.family === null ? "is-on" : ""}
                      onClick={() => onChange({ ...query, type: "challenger", element, family: null })}
                    >
                      <span>{element}</span>
                      <b>{monstersByElement(element)}</b>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <p className="codex-kicker">Families</p>
      <p className="codex-note">{families.length} stored family values. Nothing added.</p>
      <div className="codex-families">
        {families.map((entry) => (
          <button
            key={entry.family}
            type="button"
            className={query.family === entry.family ? "is-on" : ""}
            onClick={() => onChange({ ...query, family: entry.family, type: null, element: null })}
          >
            <span>{entry.family}</span>
            <b>{entry.count}</b>
          </button>
        ))}
      </div>

      <p className="codex-kicker">By element</p>
      <ul className="codex-summary">
        {elements.map((entry) => <li key={entry.element}><span>{entry.element}</span><b>{entry.count}</b></li>)}
      </ul>
      <p className="codex-kicker">By art status</p>
      <ul className="codex-summary">
        {art.map((entry) => <li key={entry.artStatus}><span>{entry.artStatus}</span><b>{entry.count}</b></li>)}
      </ul>
    </aside>
  );
}
