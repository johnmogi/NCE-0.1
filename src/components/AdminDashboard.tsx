"use client";

import { useMemo, useState } from "react";
import { catalog, recordsOf } from "@/content/catalog";
import { exportableRun, generateRun, inspectTile } from "@/engine/generate";
import type { ContentRecord, RunState } from "@/engine/types";

const heroes = recordsOf("hero");

function json(value: unknown) { return JSON.stringify(value, null, 2); }

export default function AdminDashboard() {
  const [seed, setSeed] = useState("1048576");
  const [heroId, setHeroId] = useState(heroes[0].id);
  const [run, setRun] = useState<RunState | null>(null);
  const [selected, setSelected] = useState<ContentRecord | null>(null);
  const [error, setError] = useState("");

  const counts = useMemo(() => {
    const values = run?.tiles.reduce<Record<string, number>>((result, tile) => {
      result[tile.roomType] = (result[tile.roomType] ?? 0) + 1;
      return result;
    }, {}) ?? {};
    return values;
  }, [run]);

  function generate() {
    try {
      const next = generateRun(Number(seed), heroId);
      setRun(next);
      setSelected(null);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Generation failed"); }
  }

  function inspect(roomId: string) {
    if (!run) return;
    const tile = run.tiles.find((candidate) => candidate.roomId === roomId);
    setSelected(tile?.content ?? null);
    setRun(inspectTile(run, roomId));
  }

  async function copyJson() {
    if (!run) return;
    await navigator.clipboard.writeText(json(exportableRun(run)));
    setRun({ ...run, log: [...run.log, { id: `log-${run.log.length + 1}`, action: "copy", message: "Copied run JSON to clipboard." }] });
  }

  function exportJson() {
    if (!run) return;
    const blob = new Blob([json(exportableRun(run))], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${run.runId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setRun({ ...run, log: [...run.log, { id: `log-${run.log.length + 1}`, action: "export", message: "Exported run JSON." }] });
  }

  function reset() { setRun(null); setSelected(null); setError(""); }

  return <main className="shell">
    <section className="crt">
      <header className="header">
        <div><h1>NCE / ADAM&apos;S BORING FIELD GUIDE</h1><small>NCE Classic v0.1 / Checkpoint 1 / GODMODE</small></div>
        <span className="status">ADMIN ENGINE ONLINE</span>
      </header>
      <nav className="toolbar">
        <button onClick={generate}>GENERATE</button>
        <button disabled>PLAY / COMING SOON</button>
        <button onClick={reset}>RESET</button>
        <button disabled>SIMULATE / COMING SOON</button>
        <button onClick={copyJson} disabled={!run}>COPY JSON</button>
        <button onClick={exportJson} disabled={!run}>EXPORT RUN</button>
      </nav>
      <div className="layout">
        <aside className="panel">
          <h2>SETTINGS</h2>
          <div className="field"><label htmlFor="seed">Seed</label><input id="seed" value={seed} onChange={(event) => setSeed(event.target.value)} /></div>
          <div className="field"><label>Board</label><div className="muted">3 columns x 5 rows / 15 tiles</div></div>
          <div className="field"><label>Room mix</label><div className="muted">Start 1 / Royal 1<br />Treasure 4 / Barrier 4<br />Challenger 5</div></div>
          <div className="field"><label>Hero selection</label>{heroes.map((hero) => <button key={hero.id} className={`hero-option ${hero.id === heroId ? "selected" : ""}`} onClick={() => setHeroId(hero.id)}><strong>{hero.name}</strong><span>{hero.element} / base value 1</span></button>)}</div>
          <div className="field"><label>Rules</label><div className="muted">Resolution deferred.<br />No dice, health, hand, or combat.</div></div>
        </aside>
        <section className="grid-wrap">
          <h2>GRID / GODMODE</h2>
          {!run ? <p className="muted">No run generated. Select an Ace Hero and press GENERATE.</p> : <>
            <div className="board">{run.tiles.map((tile) => <button key={tile.roomId} className={`tile ${tile.roomType} ${tile.inspected ? "inspected" : ""}`} onClick={() => inspect(tile.roomId)}><span className="coord">{tile.roomId}</span><span className="type">{tile.roomType}</span>{tile.content && <><span className="value">{tile.content.value || ""}</span><span className="name">{tile.content.name}</span></>}</button>)}</div>
            <div className="route">VALID ROUTE: {run.route.join(" -> ")}</div>
          </>}
          {error && <div className="error">ERROR: {error}</div>}
        </section>
        <aside className="panel">
          <h2>STATS</h2>
          <div className="stats"><div className="stat"><b>{run ? 1 : 0}</b>Runs</div><div className="stat"><b>--</b>Win %</div><div className="stat"><b>--</b>Health</div><div className="stat"><b>{run?.tiles.length ?? 0}</b>Tiles</div></div>
          {run && <><h2>RUN STATE</h2><div className="muted">Seed: {run.seed}<br />Hero: {run.heroId}<br />Route valid: {String(run.routeValid)}<br />Counts: {json(counts)}</div></>}
          <h2>INSPECTOR</h2><div className="inspector">{selected ? json(selected) : "Click a tile to inspect generated content. Inspection is GODMODE UI state only."}</div>
          <h2>EVENT LOG</h2><div className="log">{run?.log.map((entry) => <div className="log-entry" key={entry.id}>[{entry.id}] {entry.message}</div>) ?? <span className="muted">No events.</span>}</div>
        </aside>
      </div>
    </section>
    <p className="muted">Checkpoint 1 intentionally stops before Barrier resolution, Treasure use, Challenger resolution, and PLAY mode.</p>
  </main>;
}
