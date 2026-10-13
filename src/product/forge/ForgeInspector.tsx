"use client";

import { coordinateLabel } from "@/admin/diagnostics";
import { productTypeLabel } from "@/product/codex/codex";
import { useWorld } from "@/product/session/WorldContext";

export function ForgeInspector() {
  const world = useWorld();
  const tile = world.run?.tiles.find((candidate) => candidate.roomId === world.selectedRoomId) ?? null;
  if (!tile) {
    return (
      <aside className="forge-inspector">
        <p className="codex-kicker">Inspector</p>
        <h2>Select a room</h2>
        <p>The room shows the content the generator placed there.</p>
      </aside>
    );
  }
  const content = tile.content;
  return (
    <aside className="forge-inspector">
      <p className="codex-kicker">{coordinateLabel(tile.row, tile.col)}</p>
      <h2>{content?.name ?? "Start"}</h2>
      <dl>
        <div><dt>Coordinate</dt><dd>{coordinateLabel(tile.row, tile.col)}</dd></div>
        <div><dt>Room id</dt><dd>{tile.roomId}</dd></div>
        <div><dt>Room type</dt><dd>{tile.roomType}</dd></div>
        {content && (
          <>
            <div><dt>Content name</dt><dd>{content.name}</dd></div>
            <div><dt>Content id</dt><dd>{content.id}</dd></div>
            <div><dt>Type</dt><dd>{productTypeLabel(content.type)}</dd></div>
            <div><dt>Engine type</dt><dd>{content.type}</dd></div>
            <div><dt>Element</dt><dd>{content.element}</dd></div>
            <div><dt>Rank</dt><dd>{content.rank}</dd></div>
            <div><dt>Value</dt><dd>{content.value}</dd></div>
            <div><dt>Tier</dt><dd>{content.tier ?? "—"}</dd></div>
            <div><dt>Family</dt><dd>{content.family}</dd></div>
            <div><dt>Tags</dt><dd>{content.tags.join(" · ") || "—"}</dd></div>
          </>
        )}
      </dl>
      {!content && <p className="codex-note">Start has no content record.</p>}
      {content && <button type="button" className="forge-codex-link" onClick={() => world.openInCodex(content.id)}>Open in Codex</button>}
    </aside>
  );
}
