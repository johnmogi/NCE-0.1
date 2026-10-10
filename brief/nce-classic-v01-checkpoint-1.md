# NCE CLASSIC v0.1

## Checkpoint 1 - Approved Admin Engine Skeleton

**Status:** APPROVED  
**Scope:** Deterministic board generation, transparent GODMODE inspection, and JSON export  
**Gameplay resolution:** Not implemented

---

## 1. Platform

- Local Next.js application
- React UI
- TypeScript engine
- Browser-based Admin interface
- No external service required
- No database required for Checkpoint 1

---

## 2. Board Contract

### Layout

- Board size: 3 columns x 5 rows
- Total tiles: 15
- Start: bottom-center tile
- Exit: top-center tile
- Movement: orthogonal only
- Diagonal movement: prohibited
- Optional branches: allowed

### Required generation mix

```text
1 Start
1 Royal Boss / Exit
4 Treasure
4 Barrier
5 Challenger
```

### Route guarantee

The generator must guarantee at least one valid orthogonal path from the bottom-center Start tile to the top-center Royal Boss / Exit tile before returning a board state.

The path validator must run as part of generation. An invalid board must be rejected and regenerated or reported as an engine error.

---

## 3. Hero Contract

The Admin chooses one of four Ace Heroes:

- Ace of Air
- Ace of Fire
- Ace of Water
- Ace of Earth

The selected Hero is stored in the generated run state and included in the export.

No hero combat, stats resolution, or card economy is implemented in this checkpoint.

---

## 4. GODMODE Contract

GODMODE renders the complete board transparently.

Clicking a tile:

- Reveals or displays its generated content.
- Opens the tile inspector.
- Displays content ID, room ID, type, element, value, name, and payload.
- Adds a UI inspection event to the event log if logging is enabled.

Clicking a tile must not:

- Resolve a Barrier.
- Resolve a Treasure.
- Resolve a Challenger.
- Spend health.
- Spend or draw cards.
- Change gameplay state.
- Mark the room as exhausted.

If the interface stores an inspected flag, it is a GODMODE UI flag only and must not be treated as gameplay state.

---

## 5. Interface Contract

The first screen contains:

```text
Header
  NCE / Adam's Boring Field Guide
  Build version
  Seed
  Generate
  Reset
  Copy JSON
  Export Run

Settings
  Seed input
  Board size display
  Selected Ace Hero
  Adventure / content package
  Rules status: resolution deferred

Grid / GODMODE
  3 x 5 board
  Start marker
  Royal boss / exit marker
  Tile type and content display
  Tile inspector

Stats
  Runs
  Win percentage: unavailable / not implemented
  Hero
  Board dimensions
  Content counts

Event Log
  Generation events
  Validation events
  Tile inspection events
  Export and reset events
```

The `PLAY / GODMODE` control may be visible, but `PLAY` is disabled and labeled `COMING SOON`.

Required actions:

- `GENERATE`
- `PLAY / GODMODE`
- `RESET`
- `SIMULATE` may be visible but disabled until gameplay resolvers exist
- `COPY JSON`
- `EXPORT RUN`

---

## 6. Content Contract

Content is static JSON and remains separate from engine logic.

The first content package contains:

- 4 Ace Heroes
- 32 Challengers
- 12 Royal Bosses
- 4 Joker Champions
- 12 Barriers
- 12 Treasures / Item / Spell reward records

Joker Champion mechanics remain deferred. They may exist in the content catalog but must not be assigned gameplay behavior by the developer.

Every room uses a stable `roomId` and a stable `contentId`.

Every content record includes future art-production fields where applicable:

```json
{
  "id": "earth-4-challenger",
  "type": "challenger",
  "rank": "4",
  "value": 4,
  "element": "earth",
  "name": "Cursed Golden Coffee-Dung Beetle",
  "family": "earth-folklore",
  "tags": ["beetle", "cursed", "folklore"],
  "artStatus": "NOT_STARTED",
  "artPrompt": "",
  "referenceImage": "",
  "finalFilename": ""
}
```

The engine may read content records, but must not modify the content catalog during generation.

---

## 7. Determinism and State

Same seed plus same settings must generate identical board and content placement.

The run state must include:

- `runId`
- `seed`
- `contentVersion`
- `rulesVersion`
- selected Hero ID
- board dimensions
- tile list
- route validation result
- event log
- generation timestamp

The timestamp must not affect deterministic content generation.

Every room must include:

- `roomId`
- grid coordinate
- room type
- content ID
- element where applicable
- value where applicable
- generated display name
- generation metadata

---

## 8. Export Contract

`COPY JSON` copies the complete current run state to the clipboard.

`EXPORT RUN` downloads the same state as a `.json` file.

The exported JSON must be sufficient to inspect the generated board without rerunning generation.

Import is not required yet, but the state shape must be versioned so import can be added later.

---

## 9. Validation and Test Gate

The engine must reject or report:

- Missing or invalid seed
- Invalid Hero ID
- Incorrect tile count
- Missing Start tile
- Missing Royal Boss / Exit tile
- Incorrect room distribution
- Duplicate room IDs
- Duplicate content IDs in positions where uniqueness is required
- Invalid tile coordinates
- No valid Start-to-Exit path
- Missing content record

Checkpoint 1 passes when:

1. The app boots locally.
2. An Admin selects one Ace Hero.
3. A seed generates a 3 x 5 board.
4. The board contains exactly the approved room mix.
5. A valid orthogonal Start-to-Exit path is confirmed.
6. Reusing the same seed and settings reproduces the same generated state.
7. GODMODE reveals tile content without resolving gameplay.
8. Stable room and content IDs appear in the inspector and event log.
9. JSON copy and export work.
10. PLAY and SIMULATE remain visibly deferred rather than partially implemented.

---

## 10. Deliberately Deferred

- Barrier resolution
- Treasure use
- Hand lifecycle
- Challenger resolution
- Combat
- Health changes
- Card drawing or discarding
- Win percentage
- Simulation statistics
- Player fog of war
- Room exhaustion as gameplay state
- Persistence beyond browser/session storage
- Database integration

The next design contract should define Barrier resolution, followed by Treasure / hand economy, followed by the Challenger loop.
