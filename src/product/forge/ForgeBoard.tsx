"use client";

import { coordinateLabel } from "@/admin/diagnostics";
import type { Tile } from "@/engine/types";
import { useWorld } from "@/product/session/WorldContext";

const typeLabel = { start: "START", royal: "ROYAL", treasure: "TREASURE", barrier: "BARRIER", challenger: "MONSTER" } as const;

function TileFace({ tile, selected, onSelect }: { tile: Tile; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" className={`forge-tile is-${tile.roomType}${selected ? " is-on" : ""}`} onClick={onSelect}>
      <span className="forge-coord">{coordinateLabel(tile.row, tile.col)}</span>
      <span className="forge-type">{typeLabel[tile.roomType]}</span>
      <strong>{tile.content?.name ?? "Start"}</strong>
      {tile.content && <em>{tile.content.element} · {tile.content.value}</em>}
    </button>
  );
}

export function ForgeBoard() {
  const world = useWorld();
  const run = world.run;
  if (!run) {
    return (
      <section className="forge-world forge-world-empty">
        <p className="codex-kicker">World</p>
        <h2>No world yet</h2>
        <p>Set a seed and an ace, then generate.</p>
      </section>
    );
  }
  const columns = run.settings.cols;
  return (
    <section className="forge-world" aria-label="Generated world">
      <p className="codex-kicker">World</p>
      <h2>Seed {run.seed}</h2>
      <div className="forge-board" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {run.tiles.map((tile) => (
          <TileFace
            key={tile.roomId}
            tile={tile}
            selected={tile.roomId === world.selectedRoomId}
            onSelect={() => world.selectRoom(tile.roomId)}
          />
        ))}
      </div>
    </section>
  );
}
