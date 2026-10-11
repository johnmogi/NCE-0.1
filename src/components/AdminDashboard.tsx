"use client";

import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { compareRuns, getDiagnosticLines, getElementDistribution, getRankDistribution, getRoomDistribution, getRunSummary, getValidationSummary, getValueDistribution, type RunComparison } from "@/admin/diagnostics";
import { catalog, recordsOf } from "@/content/catalog";
import { exportableRun, generateRun } from "@/engine/generate";
import type { ContentRecord, RunState } from "@/engine/types";

const heroes = recordsOf("hero");
const roomLabels = { start: "START", royal: "ROYAL", challenger: "CHALLENGE", barrier: "BARRIER", treasure: "TREASURE" } as const;
const elementGlyph: Record<string, string> = { air: "◈", fire: "✦", water: "≈", earth: "◆" };

interface RecentRun { seed: number; heroId: string; element: string; royalName: string }
interface UiNote { id: string; code: string; detail: string }

function json(value: unknown) { return JSON.stringify(value, null, 2); }
function fields(record: Record<string, string | number>) { return Object.entries(record).map(([key, value]) => `${key}=${value}`).join("\n"); }

export default function AdminDashboard() {
  const [seed, setSeed] = useState("1048576");
  const [heroId, setHeroId] = useState(heroes[0].id);
  const [run, setRun] = useState<RunState | null>(null);
  const [previousRun, setPreviousRun] = useState<RunState | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<"godmode" | "compendium" | "play" | "data">("godmode");
  const [compendiumFilter, setCompendiumFilter] = useState<ContentRecord["type"] | "all">("all");
  const [recent, setRecent] = useState<RecentRun[]>([]);
  const [notes, setNotes] = useState<UiNote[]>([]);
  const [failures, setFailures] = useState(0);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleHeight, setConsoleHeight] = useState(210);
  const activeHero = heroes.find((hero) => hero.id === heroId) ?? heroes[0];
  const selectedTile = run?.tiles.find((tile) => tile.roomId === selectedRoomId);
  const selected = selectedTile?.content ?? null;
  const visibleRecords = compendiumFilter === "all" ? catalog : catalog.filter((record) => record.type === compendiumFilter);
  const summary = run ? getRunSummary(run) : null;
  const checks = run ? getValidationSummary(run, catalog) : [];
  const diagnostics = run ? getDiagnosticLines(run, catalog) : [];
  const comparison = run && previousRun ? compareRuns(run, previousRun) : null;
  const royalFrequency = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of recent) counts.set(entry.royalName, (counts.get(entry.royalName) ?? 0) + 1);
    return [...counts.entries()];
  }, [recent]);

  function remember(next: RunState) {
    const hero = heroes.find((item) => item.id === next.heroId);
    const royalName = next.tiles.find((tile) => tile.roomType === "royal")?.content?.name ?? "—";
    const entry = { seed: next.seed, heroId: next.heroId, element: hero?.element ?? "air", royalName };
    setRecent((current) => [entry, ...current.filter((item) => item.seed !== entry.seed || item.heroId !== entry.heroId)].slice(0, 8));
  }

  function generate(nextSeed = seed, nextHero = heroId) {
    try {
      const next = generateRun(Number(nextSeed), nextHero);
      setPreviousRun(run);
      setRun(next);
      setSelectedRoomId(null);
      setError("");
      setSeed(String(next.seed));
      setHeroId(next.heroId);
      remember(next);
    } catch (cause) {
      setFailures((count) => count + 1);
      setError(cause instanceof Error ? cause.message : "Generation failed");
    }
  }

  function note(code: string, detail: string) {
    setNotes((current) => [...current, { id: `ui-${current.length + 1}`, code, detail }]);
  }

  async function copyJson() {
    if (!run) return;
    await navigator.clipboard.writeText(json(exportableRun(run)));
    note("EXPORT_CREATED", `copy seed=${run.seed}`);
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
    note("EXPORT_CREATED", `file=${run.runId}.json`);
  }

  function reset() {
    setRun(null);
    setPreviousRun(null);
    setSelectedRoomId(null);
    setError("");
    setView("godmode");
  }

  function resizeConsole(event: ReactPointerEvent<HTMLButtonElement>) {
    const startY = event.clientY;
    const startHeight = consoleHeight;
    function move(next: PointerEvent) {
      setConsoleHeight(Math.min(420, Math.max(120, startHeight + (startY - next.clientY))));
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return <main className="app-shell"><div className="scanline" aria-hidden="true" /><section className="console-frame">
    <header className="topbar"><div className="brand-lockup"><div className="brand-mark">N</div><div><div className="brand-name">NCE <span>/</span> ADAM&apos;S BORING FIELD GUIDE</div><div className="brand-sub">NEXUS CENTRAL ENGINE · CLASSIC v0.1 · WORKBENCH</div></div></div><div className="top-meta"><span className="live-dot" /> <span>ADMIN WORKBENCH</span><span className="meta-divider" />SEED {run?.seed ?? "——"}</div></header>
    <nav className="mode-tabs" aria-label="Console views">{([["godmode", "GODMODE"], ["compendium", "CONTENT COMPENDIUM"], ["play", "PLAY / PREVIEW"], ["data", "RUN DATA"]] as const).map(([key, label], index) => <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}><span>0{index + 1}</span> {label}</button>)}<div className="tab-spacer" /><span className="build-chip">WORKBENCH 0.2 · NO RESOLUTION</span></nav>
    <div className="actionbar"><div className="action-group"><button className="button-primary" onClick={() => generate()}><span className="button-glyph">+</span> GENERATE RUN</button><button onClick={reset}>RESET</button><button disabled title="Gameplay simulation is deferred">SIMULATE <em>DEFERRED</em></button></div><div className="action-group"><button disabled={!run} onClick={() => { void copyJson(); }}>COPY JSON</button><button disabled={!run} onClick={exportJson}>EXPORT RUN <span className="button-glyph">↗</span></button></div></div>
    {view === "godmode" && <div className="godmode-layout"><aside className="control-rail"><div className="section-kicker">RUN SETUP <span>01</span></div><h2>SETTINGS</h2><div className="field"><label htmlFor="seed">RUN SEED <span>INTEGER</span></label><input id="seed" value={seed} onChange={(event) => setSeed(event.target.value)} /></div><div className="field"><label>BOARD PRESET <span>LOCKED</span></label><div className="setting-readout"><strong>3 × 5</strong><span>15 TILE GRID</span></div></div><div className="field"><label>ROOM MIX <span>FIXED</span></label><div className="mix-list"><span><i className="legend-dot treasure" />TREASURE <b>04</b></span><span><i className="legend-dot barrier" />BARRIER <b>04</b></span><span><i className="legend-dot challenger" />CHALLENGER <b>05</b></span></div></div><div className="field"><label>ACE HERO <span>SELECT ONE</span></label><div className="hero-stack">{heroes.map((hero) => <button key={hero.id} className={`hero-option ${hero.id === heroId ? "selected" : ""}`} onClick={() => setHeroId(hero.id)}><span className="hero-glyph">{elementGlyph[hero.element]}</span><span><strong>{hero.name}</strong><small>{hero.element} lineage · base value 1</small></span><b className="hero-check">{hero.id === heroId ? "●" : "○"}</b></button>)}</div></div><div className="recent-runs"><div className="section-kicker">RECENT RUNS</div>{recent.length === 0 ? <p>Seeds from this browser session appear here.</p> : recent.map((entry) => <button key={`${entry.seed}-${entry.heroId}`} className="recent-run" onClick={() => generate(String(entry.seed), entry.heroId)}><b>{entry.seed}</b><span>/ {entry.element.toUpperCase()}</span></button>)}</div></aside>
      <section className="board-stage"><div className="stage-heading"><div><div className="section-kicker">MASTER GENERATOR <span>02</span></div><h1>GRID <span>/</span> GODMODE</h1><p>Every room revealed. Inspection does not resolve the room.</p></div><div className="run-badge"><span className={run ? "signal-on" : "signal-off"} />{run ? "RUN ACTIVE" : "AWAITING RUN"}<small>{run ? run.runId : "NO OUTPUT"}</small></div></div>{!run ? <div className="empty-board"><div className="empty-glyph">◌</div><h2>NO RUN IN MEMORY</h2><p>Select an Ace Hero, set a seed, and generate the first deterministic board.</p><button className="button-primary" onClick={() => generate()}>GENERATE FIRST RUN <span className="button-glyph">→</span></button></div> : <><div className="board-wrap"><div className="board-axis top"><span>0</span><span>1</span><span>2</span></div><div className="board"><div className="row-axis"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div>{run.tiles.map((tile) => <button key={tile.roomId} className={`tile tile-${tile.roomType} ${selectedRoomId === tile.roomId ? "focused" : ""}`} onClick={() => setSelectedRoomId(tile.roomId)}><span className="tile-corner">{tile.roomId.replace("room-", "#")}</span><span className="tile-symbol">{tile.roomType === "start" ? "⌄" : tile.roomType === "royal" ? "♛" : tile.roomType === "treasure" ? "◇" : tile.roomType === "barrier" ? "▥" : "✧"}</span><span className="tile-type">{roomLabels[tile.roomType]}</span>{tile.content && <><span className="tile-value">{tile.content.value || "—"}</span><span className="tile-name">{tile.content.name}</span><span className="tile-element">{elementGlyph[tile.content.element]} {tile.content.element.toUpperCase()}</span></>}</button>)}</div></div><div className="route-strip"><span className="route-label">VALID ROUTE</span><span>{run.route.map((roomId, index) => <span key={roomId}><b>{roomId.replace("room-", "")}</b>{index < run.route.length - 1 && <i>→</i>}</span>)}</span><span className="route-ok">{run.routeValid ? "ORTHOGONAL · PASS" : "ORTHOGONAL · FAIL"}</span></div></>}{error && <div className="error">ERROR / {error}</div>}</section>
      <aside className="inspector-rail"><div className="section-kicker">LIVE OUTPUT <span>03</span></div><div className="inspector-title"><h2>INSPECTOR</h2><span className="inspector-status">{selectedTile ? "SELECTED" : "IDLE"}</span></div>{selectedTile ? <InspectorBody tile={selectedTile} content={selected} /> : <div className="inspector-idle"><div className="idle-bracket">[&nbsp; ? &nbsp;]</div><strong>SELECT A TILE</strong><p>Click any generated room. Selection stays in the workbench and does not change the run.</p></div>}<Diagnostics summary={summary} checks={checks} run={run} comparison={comparison} recentCount={recent.length} failures={failures} royalFrequency={royalFrequency} /></aside>
      <section className="run-console" style={{ height: consoleOpen ? consoleHeight : 42 }}><button className="console-resize" aria-label="Resize console" onPointerDown={resizeConsole} /><div className="console-bar"><button onClick={() => setConsoleOpen((open) => !open)}>{consoleOpen ? "HIDE CONSOLE" : "SHOW CONSOLE"}</button><strong>RUN CONSOLE</strong><span>DIAGNOSTICS · NOT GAMEPLAY</span></div>{consoleOpen && <div className="console-body"><div><div className="section-kicker">DERIVED FROM RUN</div>{diagnostics.map((line) => <pre key={line.id}><b>{line.id.replace("diag-", "#")} {line.code}</b>{"\n"}{fields(line.fields)}</pre>)}{diagnostics.length === 0 && <p>Generate a run to derive diagnostic lines.</p>}</div><div><div className="section-kicker">ENGINE LOG</div>{run?.log.map((entry) => <pre key={entry.id}><b>{entry.id.replace("log-", "#")} {entry.action}</b>{"\n"}{entry.message}</pre>) ?? <p>The engine log is empty.</p>}<div className="section-kicker">WORKBENCH</div>{notes.map((entry) => <pre key={entry.id}><b>{entry.code}</b>{"\n"}{entry.detail}</pre>)}{notes.length === 0 && <p>Copy and export notes appear here.</p>}</div></div>}</section></div>}
    {view === "compendium" && <Compendium records={visibleRecords} filter={compendiumFilter} setFilter={setCompendiumFilter} />}
    {view === "play" && <PlayPreview run={run} hero={activeHero} />}
    {view === "data" && <RunData run={run} onCopy={() => { void copyJson(); }} onExport={exportJson} />}
  </section><footer className="app-footer"><span>NCE // ADMIN WORKBENCH v0.2</span><span>CONTENT v1 · RULES v1 · LOCAL SESSION</span></footer></main>;
}

function InspectorBody({ tile, content }: { tile: RunState["tiles"][number]; content: ContentRecord | null }) {
  return <div className="inspector-card">{content ? <div className={`inspector-card-top element-${content.element}`}><span className="large-glyph">{elementGlyph[content.element]}</span><div><span>{content.type.toUpperCase()} · {content.rank}</span><strong>{content.name}</strong></div><b>{content.value}</b></div> : <div className="inspector-card-top"><span className="large-glyph">⌄</span><div><span>START</span><strong>Entrance</strong></div><b>—</b></div>}<div className="inspector-details"><div><span>ROOM ID</span><strong>{tile.roomId}</strong></div><div><span>ROOM TYPE</span><strong>{tile.roomType}</strong></div><div><span>CONTENT ID</span><strong>{content?.id ?? "—"}</strong></div><div><span>CONTENT TYPE</span><strong>{content?.type ?? "—"}</strong></div><div><span>NAME</span><strong>{content?.name ?? "—"}</strong></div><div><span>RANK</span><strong>{content?.rank ?? "—"}</strong></div><div><span>VALUE</span><strong>{content?.value ?? "—"}</strong></div><div><span>ELEMENT</span><strong>{content?.element ?? "—"}</strong></div><div><span>TIER</span><strong>{content?.tier ?? "—"}</strong></div><div><span>FAMILY</span><strong>{content?.family ?? "—"}</strong></div><div><span>TAGS</span><strong>{content?.tags.join(" · ") || "—"}</strong></div></div>{content && <pre>{json(content)}</pre>}</div>;
}

function Diagnostics({ summary, checks, run, comparison, recentCount, failures, royalFrequency }: { summary: ReturnType<typeof getRunSummary> | null; checks: ReturnType<typeof getValidationSummary>; run: RunState | null; comparison: RunComparison | null; recentCount: number; failures: number; royalFrequency: Array<[string, number]> }) {
  const rooms = run ? getRoomDistribution(run) : [];
  const elements = run ? getElementDistribution(run) : [];
  const values = run ? getValueDistribution(run) : [];
  const ranks = run ? getRankDistribution(run) : [];
  return <div className="diagnostics"><div className="section-kicker">RUN DIAGNOSTICS</div>{summary ? <div className="diag-list"><span><b>SEED</b>{summary.seed}</span><span><b>HERO</b>{summary.heroId}</span><span><b>RUN ID</b>{summary.runId}</span><span><b>CONTENT</b>{summary.contentVersion}</span><span><b>RULES</b>{summary.rulesVersion}</span><span><b>CREATED</b>{summary.createdAt}</span><span><b>TILES</b>{summary.tileCount}</span><span><b>ROUTE</b>{summary.routeValid ? "VALID" : "INVALID"} · {summary.routeLength}</span><span><b>START</b>{summary.startRoom}</span><span><b>EXIT</b>{summary.exitRoom}</span><span><b>ROYAL</b>{summary.royalName}</span></div> : <p className="note-line">No run loaded.</p>}
    <div className="section-kicker">VALIDATION</div><div className="check-list">{checks.map((check) => <span key={check.label} className={check.pass ? "pass" : "fail"}>{check.pass ? "[PASS]" : "[FAIL]"} {check.label}</span>)}{checks.length === 0 && <span>Generate a run to validate it.</span>}</div>
    <div className="section-kicker">ROOM DISTRIBUTION</div><div className="dist-line">{rooms.map((row) => <span key={row.key}>{row.key} {row.count}</span>)}</div>
    <div className="section-kicker">ELEMENT DISTRIBUTION</div><div className="dist-line">{elements.map((row) => <span key={row.key}>{row.key} {row.count}</span>)}</div>
    <div className="section-kicker">VALUE / RANK</div><div className="dist-line">{values.map((row) => <span key={`v${row.key}`}>value {row.key}: {row.count}</span>)}{ranks.map((row) => <span key={`r${row.key}`}>rank {row.key}: {row.count}</span>)}</div>
    {comparison && <><div className="section-kicker">CURRENT VS PREVIOUS</div><div className="diag-list"><span><b>SEED</b>{comparison.previousSeed} → {comparison.currentSeed}</span><span><b>HERO</b>{comparison.previousHero} → {comparison.currentHero}</span><span><b>ROYAL</b>{comparison.previousRoyal} → {comparison.currentRoyal}</span><span><b>PLACEMENT CHANGES</b>{comparison.placementChanges}</span><span><b>ROUTE</b>{comparison.previousRouteLength} → {comparison.currentRouteLength}</span><span><b>ELEMENTS</b>{comparison.currentElements.map((row) => `${row.key} ${row.count}`).join(" / ")}</span></div></>}
    <div className="section-kicker">SESSION</div><div className="stat-grid"><div><strong>{String(recentCount).padStart(3, "0")}</strong><span>RUNS</span></div><div><strong>{String(failures).padStart(3, "0")}</strong><span>FAILURES</span></div><div><strong>{summary?.routeLength ?? "—"}</strong><span>ROUTE</span></div><div><strong>{summary?.tileCount ?? "—"}</strong><span>TILES</span></div></div>
    <p className="note-line">Royal this session: {royalFrequency.length ? royalFrequency.map(([name, count]) => `${name} ${count}`).join(" · ") : "none yet"}</p>
    <p className="deferred">DEFERRED · win % · damage · health · combat · barrier success · treasure efficiency</p></div>;
}

function Compendium({ records, filter, setFilter }: { records: ContentRecord[]; filter: ContentRecord["type"] | "all"; setFilter: (filter: ContentRecord["type"] | "all") => void }) {
  const filters: Array<ContentRecord["type"] | "all"> = ["all", "hero", "challenger", "royal", "champion", "barrier", "treasure"];
  return <section className="compendium-view"><div className="compendium-head"><div><div className="section-kicker">NCE CLASSIC / CONTENT INDEX <span>02</span></div><h1>CONTENT COMPENDIUM</h1><p>76 records · four elemental lineages · the complete LV00 catalog.</p></div><div className="catalog-count"><strong>{records.length}</strong><span>VISIBLE RECORDS</span></div></div><div className="filter-row">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "all" ? "ALL RECORDS" : item.toUpperCase()}</button>)}</div><div className="record-grid">{records.map((record) => <article className={`record-card element-${record.element}`} key={record.id}><div className="record-meta"><span>{record.type.toUpperCase()}</span><b>{record.rank}</b></div><div className="record-icon">{elementGlyph[record.element]}</div><h2>{record.name}</h2><p>{record.family} · {record.element} lineage</p><div className="record-footer"><span>{record.id}</span><strong>VALUE {record.value}</strong></div></article>)}</div></section>;
}

function PlayPreview({ run, hero }: { run: RunState | null; hero: ContentRecord }) {
  return <section className="play-view"><div className="preview-banner"><div><div className="section-kicker">STATIC PREVIEW / FUTURE SURFACE <span>03</span></div><h1>PLAY MODE <em>DEFERRED</em></h1><p>Read-only orientation. Barrier resolution and the rest of play are not in this workbench.</p></div><div className="preview-stamp">NOT<br />CONNECTED</div></div><div className="play-layout"><div className="player-card"><div className="section-kicker">ACTIVE ACE</div><div className="player-icon">{elementGlyph[hero.element]}</div><h2>{hero.name}</h2><p>{hero.family} · {hero.element} lineage</p><div className="fake-stats"><span>HP <b>DEFERRED</b></span><span>HAND <b>DEFERRED</b></span><span>SUGAR <b>DEFERRED</b></span></div></div><div className="path-preview"><div className="section-kicker">ADVENTURE PATH / READ ONLY</div><div className="path-line">{(run?.tiles ?? []).map((tile) => <div key={tile.roomId} className={`path-node ${tile.roomType}`}><span>{tile.roomType === "royal" ? "♛" : tile.roomType === "start" ? "⌄" : "·"}</span><small>{tile.roomId.replace("room-", "")}</small></div>)}</div><div className="preview-note">The 3 × 5 board is visible here as orientation only. It does not move a hero.</div></div></div></section>;
}

function RunData({ run, onCopy, onExport }: { run: RunState | null; onCopy: () => void; onExport: () => void }) {
  const [raw, setRaw] = useState(false);
  const summary = run ? getRunSummary(run) : null;
  return <section className="data-view"><div className="data-head"><div><div className="section-kicker">DEBUG SURFACE / EXPORTABLE STATE <span>04</span></div><h1>RUN DATA <span>/ JSON INSPECTOR</span></h1><p>Summary first. Raw JSON is the exported run, with no extra display fields.</p></div><div className="data-status">{run ? "STATE LOADED" : "NO STATE"}</div></div><div className="data-actions"><button disabled={!run} onClick={() => setRaw((open) => !open)}>{raw ? "HIDE RAW JSON" : "VIEW RAW JSON"}</button><button disabled={!run} onClick={onCopy}>COPY JSON</button><button disabled={!run} onClick={onExport}>EXPORT JSON</button></div><div className="data-columns"><div className="data-summary">{summary ? Object.entries({ "RUN ID": summary.runId, SEED: summary.seed, HERO: summary.heroId, "CONTENT VERSION": summary.contentVersion, "RULES VERSION": summary.rulesVersion, "CREATED AT": summary.createdAt, TILES: summary.tileCount, ROUTE: `${summary.routeValid ? "VALID" : "INVALID"} · ${summary.routeLength}`, START: summary.startRoom, EXIT: summary.exitRoom, ROYAL: summary.royalName }).map(([label, value]) => <div className="summary-block" key={label}><span>{label}</span><strong>{value}</strong></div>) : <div className="summary-block"><span>STATE</span><strong>Generate a run to inspect it.</strong></div>}</div>{raw && <pre className="json-view">{run ? json(exportableRun(run)) : "Generate a run to inspect exportable JSON."}</pre>}</div></section>;
}
