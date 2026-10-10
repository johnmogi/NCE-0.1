# NCE CLASSIC v0.1

## Checkpoint 1 Developer Task

**Implementation authority:** `brief/nce-classic-v01-checkpoint-1.md`  
**Status:** Ready for implementation  
**Milestone:** Initial deterministic Admin / GODMODE engine skeleton

---

## Task

Implement `brief/nce-classic-v01-checkpoint-1.md` exactly.

The milestone must generate a deterministic 15-tile NCE Classic board, guarantee an orthogonal route from the bottom-center Start to the top-center Royal Boss / Exit, populate the approved room distribution, allow the Admin to choose one Ace Hero, render the complete board transparently in GODMODE, inspect tile content without resolving gameplay, log actions, and export the complete state as JSON.

---

## Authority and conflict rule

If any other file conflicts with the Checkpoint 1 contract, the Checkpoint 1 contract wins.

`brief/nce-classic-v01-decision-interview.md` is non-binding. It contains recommendations and unresolved design questions only.

Do not implement any proposed rules from that interview unless they are explicitly approved in a later checkpoint.

---

## Do not implement yet

Do not add or infer:

- Elemental bonuses or penalties
- Barrier resolution
- Challenger resolution
- Dice mechanics
- Health changes
- Hand, deck, or discard mechanics
- Treasure effects
- Item or Spell use
- Inventory
- Hero evolution
- Simulation policies or win statistics
- Gameplay movement resolution
- Room exhaustion as gameplay state
- Player fog of war
- Database persistence
- Dungeo or Sugarbound rules

`PLAY` and `SIMULATE` may be visible in the UI, but they must be disabled and labeled `COMING SOON`.

---

## Required engineering properties

### Determinism

Same seed + same settings + same content version + same rules version must produce identical board and content placement.

The timestamp may differ and must never influence generated content.

### Path validation

Path validation must be implemented in engine code, not only in the UI. A generated board cannot be returned as valid unless a legal orthogonal Start-to-Exit path exists.

### Content separation

Content catalogs must remain separate from generation logic. The engine reads static JSON; it does not modify the catalogs.

### Stable identity

Every generated room has a stable `roomId`. Every placed content record has a stable `contentId`. These IDs must appear in the inspector, event log, and exported state.

### Content uniqueness

A content record may appear at most once in a generated run unless its content definition explicitly permits duplication. The current NCE Classic package does not permit duplication.

### Engine isolation

The generation engine must be runnable and testable independently of React and Next.js UI components. React components must not contain board-generation algorithms.

---

## Minimum content package

Load the approved NCE Classic catalogs:

- 4 Ace Heroes
- 32 Challengers
- 12 Royal Bosses
- 4 Joker Champions
- 12 Barriers
- 12 Treasures / Item / Spell reward records

Joker Champions may be loaded for catalog completeness, but they have no gameplay behavior in this milestone.

Content fields must support future art production, including:

```text
id
type
rank
value
element
name
family
tags
artStatus
artPrompt
referenceImage
finalFilename
```

---

## Minimum engine modules

Use a simple architecture with pure engine modules, for example:

```text
src/
  engine/
    rng.ts
    types.ts
    board.ts
    path.ts
    generate.ts
    validate.ts
  content/
    classic/
      heroes.json
      challengers.json
      barriers.json
      treasures.json
      royals.json
      champions.json
  app/
    admin/
    godmode/
  tests/
```

Exact filenames may differ, but the separation must remain.

---

## Required tests

Add automated tests for:

1. Seeded RNG repeatability.
2. Exact 3 x 5 board dimensions.
3. Exact room distribution.
4. Bottom-center Start placement.
5. Top-center Royal Boss / Exit placement.
6. Orthogonal path validation.
7. Invalid board rejection.
8. Stable room and content IDs.
9. No duplicate content records in a run.
10. Same seed/settings/version producing the same generated state.
11. Timestamp not affecting deterministic content.
12. JSON export containing the full state.

---

## Required report before stopping

Deliver the milestone in small commits. Before stopping, report:

1. Files created or changed.
2. Architecture used.
3. Tests added.
4. Test command and output.
5. One example generated seed and state summary.
6. Assumptions made.
7. Anything in the contract that could not be implemented exactly.

Do not continue to Barrier mechanics after Checkpoint 1 passes.
