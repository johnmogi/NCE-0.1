# NCE Classic engine map

**Status:** description of the shipped local app. Not a proposal.  
**App:** Next.js, React, TypeScript, Vitest. No database. No Prisma. No dice service.

The older dungeon-master tree, with Prisma models for characters, monsters, quests, hunger, and three theme packs, was not built. Do not recreate it from this brief.

---

## Layout

```text
src/
  app/                  Next.js shell
  components/
    AdminDashboard.tsx  PLAY, GODMODE, CONTENT, RUN DATA
    PlayView.tsx        the game screen
  content/
    classic.json        76 records, read-only
    catalog.ts
  engine/
    rng.ts              seeded RNG, no Math.random
    types.ts            board and content types
    board.ts            3×5 placement
    path.ts             orthogonal neighbors and Start-to-Royal path
    generate.ts         deterministic world
    validate.ts
    runtime/
      types.ts          play state and prototype-rules-0.1
      deck.ts           32-card support deck
      elements.ts       the cycle and ±2
      resolver.ts       projectCheck and encounterTarget
      actions.ts        start, move, commit, treasure, reset
  admin/
    diagnostics.ts      derived inspection, not gameplay
```

Generation and play are separate.

`generateRun(seed, heroId)` places catalog records. Its hash labels are the board labels already in use. Support cards use `support:${heroId}` so a draw cannot move a room.

`encounterTarget(roomType, contentValue)` is the only place a Royal's catalog value becomes a gameplay target. Barrier and Challenger targets are the catalog value. Royal subtracts 3.

---

## Runtime

`RuntimeState` holds health, the draw pile, the hand, the discard pile, the pending room, encounter progress, visited rooms, resolved rooms, status, turn, outcome, and events.

Status is `exploring`, `awaiting-resolution`, `treasure-choice`, or `ended`. `ready` exists on the type and is unused by the live loop.

A command changes state. An event records what happened. The play log renders events. The admin console renders diagnostics. Those logs are not the same list.

---

## What the UI is allowed to do

PLAY calls the runtime. GODMODE selects a tile for inspection and must not call `inspectTile` in a way that mutates the run, and must not resolve an encounter.

Restart calls `resetRuntime` and keeps the generated tiles. Generate calls `generateRun` and clears the runtime.

---

## Tests that protect this map

Board tests protect generation. Diagnostic tests protect the admin view. Runtime tests protect the rules: deck size, element cycle, barrier failure, treasure keep-one, challenger progress, royal victory, both loss reasons, movement locks, backtracking, and identical results from the same seed, hero, and actions.

A dataset change that rewrites catalog names is a content decision. A dataset change that changes ranks, values, or room types is an engine change and is outside the freeze.
