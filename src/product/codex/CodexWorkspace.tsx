"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { catalog } from "@/content/catalog";
import { CodexFilters } from "./CodexFilters";
import { CodexList } from "./CodexList";
import { CodexRecord } from "./CodexRecord";
import { CodexSidebar } from "./CodexSidebar";
import { EMPTY_QUERY, describeQuery, distinctArtStatuses, distinctFamilies, distinctRanks, distinctValues, filterCodex, type CodexQuery } from "./codex";

export function CodexWorkspace({ onNotice }: { onNotice: (code: string, detail: string) => void }) {
  const [query, setQuery] = useState<CodexQuery>(EMPTY_QUERY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const loaded = useRef(false);
  const announcedQuery = useRef<string | null>(null);
  const visible = useMemo(() => filterCodex(catalog, query), [query]);
  const selected = catalog.find((record) => record.id === selectedId) ?? null;

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    onNotice("CODEX_LOADED", `records=${catalog.length}`);
  }, [onNotice]);

  const queryDetail = describeQuery(query);
  useEffect(() => {
    if (announcedQuery.current === null || announcedQuery.current === queryDetail) {
      announcedQuery.current = queryDetail;
      return;
    }
    announcedQuery.current = queryDetail;
    onNotice("FILTER_CHANGED", queryDetail);
  }, [queryDetail, onNotice]);

  return (
    <div className="codex">
      <CodexSidebar records={catalog} query={query} onChange={setQuery} />
      <section className="codex-list" aria-label="Content list">
        <header>
          <p className="codex-kicker">Field guide</p>
          <h1>Codex</h1>
        </header>
        <CodexFilters
          query={query}
          families={distinctFamilies(catalog)}
          ranks={distinctRanks(catalog)}
          values={distinctValues(catalog)}
          artStatuses={distinctArtStatuses(catalog)}
          shown={visible.length}
          total={catalog.length}
          onChange={setQuery}
          onClear={() => setQuery(EMPTY_QUERY)}
        />
        <CodexList
          records={visible}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            onNotice("RECORD_SELECTED", `id=${id}`);
          }}
        />
      </section>
      <CodexRecord record={selected} />
    </div>
  );
}
