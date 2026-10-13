"use client";

import { catalog, recordsOf } from "@/content/catalog";
import { elementCounts } from "@/product/codex/codex";
import { lockedBoard, poolSummary } from "./forge";
import { useWorld } from "@/product/session/WorldContext";

export function ForgeControls() {
  const world = useWorld();
  const heroes = recordsOf("hero");
  const locked = lockedBoard();
  const pool = poolSummary(catalog);
  const elements = elementCounts(catalog);

  return (
    <aside className="forge-input">
      <p className="codex-kicker">Input</p>
      <h1>Forge</h1>
      <label className="forge-seed">
        Seed
        <input value={world.seedInput} inputMode="numeric" onChange={(event) => world.setSeedInput(event.target.value)} />
      </label>
      <p className="codex-kicker">Ace hero</p>
      <div className="forge-heroes">
        {heroes.map((hero) => (
          <button key={hero.id} type="button" className={hero.id === world.heroId ? "is-on" : ""} onClick={() => world.setHeroId(hero.id)}>
            <span>{hero.name}</span>
            <small>{hero.element}</small>
          </button>
        ))}
      </div>
      <button className="forge-generate" type="button" onClick={world.generate}>Generate world</button>
      {world.error && <p className="forge-error">{world.error}</p>}

      <p className="codex-kicker">Generator rules</p>
      <p className="codex-note">Locked. The generator cannot honor other values.</p>
      <dl className="forge-locked">
        <div><dt>Board</dt><dd>{locked.board}</dd></div>
        <div><dt>Start</dt><dd>{locked.start}</dd></div>
        <div><dt>Royal</dt><dd>{locked.royal}</dd></div>
      </dl>
      <ul className="codex-summary">
        {locked.rooms.map((room) => <li key={room.label}><span>{room.label}</span><b>{room.count}</b></li>)}
      </ul>

      <p className="codex-kicker">Content pool</p>
      <ul className="codex-summary">
        {pool.map((row) => (
          <li key={row.label}>
            <span>{row.label}{row.used ? "" : " · not used"}</span>
            <b>{row.count}</b>
          </li>
        ))}
      </ul>
      <ul className="codex-summary">
        {elements.map((row) => <li key={row.element}><span>{row.element}</span><b>{row.count}</b></li>)}
      </ul>

      <p className="codex-kicker">Recent worlds</p>
      {world.recent.length === 0 && <p className="codex-note">None this session.</p>}
      <div className="forge-recent">
        {world.recent.map((item) => (
          <button key={`${item.seed}-${item.heroId}`} type="button" onClick={() => world.replay(item.seed, item.heroId)}>
            <span>{item.seed} · {item.element}</span>
            <small>Royal: {item.royalName}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}
