"use client";

import { worldManifest } from "./forge";
import { useWorld } from "@/product/session/WorldContext";

export function ForgeManifest() {
  const world = useWorld();
  if (!world.run) return null;
  const manifest = worldManifest(world.run);
  return (
    <section className="forge-manifest" aria-label="World manifest">
      <p className="codex-kicker">World manifest</p>
      <dl>
        <div><dt>Seed</dt><dd>{manifest.seed}</dd></div>
        <div><dt>Hero</dt><dd>{manifest.heroName}</dd></div>
        <div><dt>Royal</dt><dd>{manifest.royalName}</dd></div>
        <div><dt>Generated content</dt><dd>{manifest.contentCount}</dd></div>
        <div><dt>Unique content</dt><dd>{manifest.uniqueContent ? "PASS" : "FAIL"}</dd></div>
        <div><dt>Start to Royal route</dt><dd>{manifest.routePass ? "PASS" : "FAIL"}</dd></div>
        <div><dt>Route length</dt><dd>{manifest.routeLength}</dd></div>
      </dl>
      <ol>
        {manifest.rooms.map((room) => (
          <li key={room.roomId}><b>{room.coordinate}</b> {room.name}</li>
        ))}
      </ol>
    </section>
  );
}
