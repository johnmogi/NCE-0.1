"use client";

import type { ContentRecord } from "@/engine/types";
import { typeLine } from "./codex";

export function CodexRecord({ record }: { record: ContentRecord | null }) {
  if (!record) {
    return (
      <article className="codex-record codex-record-idle">
        <p className="codex-kicker">Record</p>
        <h2>Select an entry</h2>
        <p>The specimen shows the fields stored on that catalog record.</p>
      </article>
    );
  }
  return (
    <article className="codex-record">
      <p className="codex-kicker">{typeLine(record.type)}</p>
      <h2>{record.name}</h2>
      <div className="art-slot">
        {record.referenceImage
          ? <img src={record.referenceImage} alt="" />
          : <span>ART NOT STARTED</span>}
      </div>
      <dl>
        <div><dt>Type</dt><dd>{typeLine(record.type)}</dd></div>
        <div><dt>Engine type</dt><dd>{record.type}</dd></div>
        <div><dt>Element</dt><dd>{record.element}</dd></div>
        <div><dt>Rank</dt><dd>{record.rank}</dd></div>
        <div><dt>Value</dt><dd>{record.value}</dd></div>
        <div><dt>Tier</dt><dd>{record.tier ?? "—"}</dd></div>
        <div><dt>Family</dt><dd>{record.family}</dd></div>
        <div><dt>Tags</dt><dd>{record.tags.join(" · ") || "—"}</dd></div>
        <div><dt>Art</dt><dd>{record.artStatus}</dd></div>
        <div><dt>Content id</dt><dd>{record.id}</dd></div>
      </dl>
      <details>
        <summary>Raw record</summary>
        <pre>{JSON.stringify(record, null, 2)}</pre>
      </details>
    </article>
  );
}
