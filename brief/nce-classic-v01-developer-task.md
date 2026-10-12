# NCE CLASSIC

## Freeze order

**Status:** in force  
**Authority:** `brief/nce-classic-v01-checkpoint-1.md`  
**Build to keep:** commit `44` (`897c766`)

---

## Task

Do not implement the next feature.

The playable prototype passed review. The next work is manual play, recorded in `brief/game-production-interview.md`.

Play 5 to 10 runs. Change the Ace and the seed. Fill one observation row per run. Answer the three questions at the bottom of that sheet.

---

## Do not add

- Champion gameplay
- Hero abilities
- Equipment
- Treasure effects beyond keep-one
- New monster mechanics
- XP or leveling
- Animation, sound, or fog
- Walls, one-way paths, or a maze
- Admin or diagnostic screens
- A balance framework
- A reshuffle
- A second meaning for royal values 10, 11, and 12 outside `encounterTarget()`
- A cleanup that merges `heroRoomId` and `currentRoomId`

---

## Do not treat as authority

These files are parked or open. They do not authorize code:

- `dungeo-game-overview.md`
- `dungeo-master-lore-bible.md`
- `dungeo-mvp-specification.md`
- `nce-classic-v01-decision-interview.md`
- `1.md`, `2.md`, `D1.md`

Creature grammar stays in the decision interview until it is explicitly approved. Approval means a new written order. It does not mean editing `src/content/classic.json` to make the prototype feel more canonical.

---

## When the freeze may lift

Only after the playtest sheet has real runs, and the three questions have answers:

1. Does choosing a card feel like a decision?
2. Does choosing a route matter?
3. Does Treasure change the next decision?

If those answers are mostly no, the next design change is structural. Changing +2 to +1, or HP 3 to HP 4, is not the first move.

If those answers are mostly yes, balancing and presentation can be discussed. They are still a new order, not an implied one.
