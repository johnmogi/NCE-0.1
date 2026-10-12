"use client";

import type { ArtStatus, ElementName } from "@/engine/types";
import { CREATURE_ELEMENTS, type CodexQuery } from "./codex";

export function CodexFilters({
  query,
  families,
  ranks,
  values,
  artStatuses,
  shown,
  total,
  onChange,
  onClear,
}: {
  query: CodexQuery;
  families: string[];
  ranks: string[];
  values: number[];
  artStatuses: ArtStatus[];
  shown: number;
  total: number;
  onChange: (query: CodexQuery) => void;
  onClear: () => void;
}) {
  const set = (patch: Partial<CodexQuery>) => onChange({ ...query, ...patch });
  return (
    <div className="codex-filters">
      <label>
        Search
        <input
          value={query.text}
          placeholder="Name, id, family, tag"
          onChange={(event) => set({ text: event.target.value })}
        />
      </label>
      <label>
        Type
        <select value={query.type ?? ""} onChange={(event) => set({ type: (event.target.value || null) as CodexQuery["type"] })}>
          <option value="">Any</option>
          <option value="challenger">Monsters</option>
          <option value="royal">Royals</option>
          <option value="champion">Champions</option>
          <option value="barrier">Barriers</option>
          <option value="treasure">Treasures</option>
          <option value="hero">Heroes</option>
        </select>
      </label>
      <label>
        Element
        <select value={query.element ?? ""} onChange={(event) => set({ element: (event.target.value || null) as ElementName | null })}>
          <option value="">Any</option>
          {CREATURE_ELEMENTS.map((element) => <option key={element} value={element}>{element}</option>)}
        </select>
      </label>
      <label>
        Family
        <select value={query.family ?? ""} onChange={(event) => set({ family: event.target.value || null })}>
          <option value="">Any</option>
          {families.map((family) => <option key={family} value={family}>{family}</option>)}
        </select>
      </label>
      <label>
        Rank
        <select value={query.rank ?? ""} onChange={(event) => set({ rank: event.target.value || null })}>
          <option value="">Any</option>
          {ranks.map((rank) => <option key={rank} value={rank}>{rank}</option>)}
        </select>
      </label>
      <label>
        Value
        <select value={query.value ?? ""} onChange={(event) => set({ value: event.target.value === "" ? null : Number(event.target.value) })}>
          <option value="">Any</option>
          {values.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label>
        Art status
        <select value={query.artStatus ?? ""} onChange={(event) => set({ artStatus: (event.target.value || null) as ArtStatus | null })}>
          <option value="">Any</option>
          {artStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <p className="codex-shown">{shown} of {total}</p>
      <button type="button" onClick={onClear}>Clear</button>
    </div>
  );
}
