# NCE CLASSIC v0.1

## Decisive Engineering Interview

**Purpose:** Lock the remaining game rules before the Admin Engine is coded.  
**Status:** Working decisions from `brief/2.md` are accepted unless changed below.  
**Answer style:** Reply with the proposed decision, or write `ACCEPT DEFAULT`.

> **Non-binding design backlog:** This document contains open questions and recommendations only. It does not authorize gameplay behavior. For Checkpoint 1, `nce-classic-v01-checkpoint-1.md` is the sole implementation authority. Nothing here becomes a rule until explicitly marked `APPROVED`.

---

## A. Already settled

These are not open questions unless the creator explicitly changes them.

### Product

- The first product is NCE Classic, not Dungeo.
- The first software is the Admin / GODMODE engine.
- The engine is mechanically clean, but generated content remains folkloric, mythic, playful, and strange.
- The first game uses a finite board with a guaranteed route from start to exit.
- Infinite or mutating rooms are a later experiment.

### NCE Classic content

| Family | Count | Structure |
|---|---:|---|
| Heroes | 4 | Ace of Air, Fire, Water, Earth |
| Challengers | 32 | Values 2-9 across four elements |
| Royal bosses | 12 | Jack, Queen, King across four elements |
| Joker Champions | 4 | One Champion per element; mechanics deferred |
| Barriers | 12 | Four elements across Common, Epic, Legendary |
| Treasures | 12 | Four elements across Common, Epic, Legendary |
| **Primary card assets** | **76** | Fixed production target, names mutable during art development |

### Content grammar

The engine stores clean fields such as:

```text
element = earth
value = 4
type = challenger
```

The player sees the content expression:

```text
4 Earth - Cursed Golden Coffee-Dung Beetle
```

Challenger naming follows:

```text
elemental domain + folklore/myth root + peculiar trait
```

Treasure is the reward container. Item, Spell, and Relic are later subtypes, not separate decks in v0.1.

### Element identities

| Element | Identity |
|---|---|
| Air | speed, attack, manipulation |
| Fire | heavy attack, amplification |
| Water | healing, restoration, resurrection, flexible defense |
| Earth | protection, defense, endurance |

### Explicitly deferred

- Wise / Daydreamer / Lucid Dreamer / Shaman identities
- Fool and Magician identities
- Joker Champion mechanics
- Tarot systems
- Dungeo content package
- Sugarbound
- Infinity / mutating-room mode

---

# B. Board Contract

## 1. Board shape

**Recommended default:** 3 columns x 5 rows = 15 tiles.

Questions:

- Accept `3 x 5` as the default full-game board?
- Should the start be on the bottom row and the exit on the top row?
- Should the board orientation always be vertical in the UI?

Decision:

## 2. Board presets

**Recommended defaults:**

```text
Tutorial: 3 x 3
Default: 3 x 5
Extended test: configurable up to 5 x 5
```

Questions:

- Accept these presets?
- Should the Admin allow arbitrary rows/columns, or only safe presets?

Decision:

## 3. Route generation

**Recommended rule:** Generate the start and exit first, then carve one guaranteed legal route between them. Add optional rooms around that route only after the route is valid.

Questions:

- Should every generated board have exactly one guaranteed route, with optional branches?
- May optional branches dead-end?
- Can the route pass diagonally, or only orthogonally?

Recommended default: orthogonal movement only; dead-end branches allowed; at least one route guaranteed.

Decision:

## 4. Boss placement

**Recommended default:** The Royal boss occupies the final/exit tile.

This keeps the board at exactly 15 tiles and makes the exit encounter visible and testable.

Decision:

## 5. Room state

**Recommended default:**

```text
unrevealed -> revealed -> resolved/exhausted
```

Resolved rooms remain visible and cannot be replayed in v0.1.

Decision:

---

# C. Room Distribution Contract

## 6. Default room mix

**Recommended 15-tile distribution:**

| Room type | Count |
|---|---:|
| Start | 1 |
| Royal boss / exit | 1 |
| Treasure | 4 |
| Barrier | 4 |
| Challenger | 5 |
| **Total** | **15** |

Questions:

- Accept this fixed default distribution?
- Should Admin weights be available while the generator still enforces minimums?
- Should a 3 x 3 tutorial use the same proportions or a hand-authored layout?

Recommended default: Admin weights are allowed, but generation always enforces start, boss, at least one Treasure, at least one Barrier, and at least one Challenger.

Decision:

## 7. Room generation timing

**Recommended default:** Generate the entire hidden board at run creation. Reveal only the selected room and its permitted neighboring hints.

This gives deterministic replays and makes GODMODE useful.

Decision:

---

# D. Element Resolver

## 8. Element relationship

**Recommended cycle:**

```text
Air > Water > Fire > Earth > Air
```

Questions:

- Accept this cycle?
- Does advantage apply to both attack and defense?
- Is the opposite relationship disadvantage, or merely no advantage?

Recommended v0.1 rule:

```text
advantage = +2
disadvantage = -2
same element = 0
```

Decision:

## 9. Value meaning

Card values are magnitude, not just labels.

Recommended rule:

```text
effective value = card value + elemental modifier + temporary bonuses
```

Questions:

- Should Ace count as 1?
- Should Royal values be 10/11/12, or should Jack/Queen/King use fixed boss tiers?

Recommended default: Ace = 1; J/Q/K use boss tiers rather than ordinary numeric values.

Decision:

---

# E. Barrier Resolver

## 10. Minimal barrier equation

**Recommended rule:**

```text
hero total = hero value + one committed hand card + element modifier + reward/effect bonuses
success if hero total >= barrier value
```

Questions:

- Is a committed card required, or may the hero attempt a Barrier with value alone?
- Does a failed Barrier cause damage, discard, retreat, or a choice?
- Can the player retry the same Barrier?
- Is a successful Barrier card discarded, exhausted, or returned to hand?

Recommended defaults:

```text
One committed card is required.
Tie succeeds.
Failure costs 1 health and exhausts the room.
The committed card goes to discard.
No retry unless a reward explicitly permits it.
```

Decision:

## 11. Barrier rarity

Recommended mapping:

```text
Common: 1-3
Epic: 4-6
Legendary: 7-9
```

Questions:

- Is the Barrier's value the threshold directly?
- Should Legendary barriers have a special effect, or only a higher value?

Recommended v0.1 default: value is the threshold; special effects are flavor-only until balance testing.

Decision:

---

# F. Challenger Resolver

## 12. Minimal challenge sequence

**Recommended first implementation:**

```text
1. Reveal Challenger.
2. Player chooses CLAIM or RETREAT.
3. On CLAIM, player commits one card and rolls the die.
4. Challenger resolves its response value.
5. Compare totals.
6. Win: gain reward and exhaust room.
7. Lose: lose health and discard committed card.
```

This is the smallest complete version. A later update can add the proposed response/defense/final-claim loop.

Question:

- Should v0.1 use this one-roll challenge, or must it include the three-step Claim -> Response -> Final Claim sequence immediately?

Decision:

## 13. Recommended challenge equation

```text
player total = hero value + committed card value + die result + element modifier + reward bonuses
challenger total = challenger value + resistance modifier
success if player total >= challenger total
```

Suggested die: d6.

Questions:

- Accept d6 for the first challenge resolver?
- Should a Challenger's resistance modifier be 0, +1, or based on its rank?
- Does a Challenger deal fixed damage on failure, or roll damage?

Recommended defaults:

```text
Resistance modifier = floor(challenger value / 3)
Failure damage = 1 health
Tie = success
```

Decision:

## 14. Three required hand-play tests

Before coding, fill these examples manually:

### Easy challenge

Hero:

Challenger:

Committed card:

Element relation:

Die result:

Player total:

Challenger total:

Result:

### Equal challenge

Hero:

Challenger:

Committed card:

Element relation:

Die result:

Player total:

Challenger total:

Result:

### Disadvantaged challenge

Hero:

Challenger:

Committed card:

Element relation:

Die result:

Player total:

Challenger total:

Result:

---

# G. Card Economy

## 15. Starting hand

Recommended default:

```text
Starting hand: 3 cards
Hand maximum: 5 cards
```

Questions:

- Accept starting hand size 3?
- Accept hand maximum 5?

Decision:

## 16. Draw rule

Recommended default:

```text
Draw 1 card when entering a new room.
Treasure may grant an additional card or reward.
```

Questions:

- Draw before or after resolving the room?
- Is the deck finite during one run?
- What happens when the deck is empty?

Recommended default: draw before room resolution; finite deck; reshuffle discard when empty.

Decision:

## 17. Card destinations

Recommended states:

```text
deck -> hand -> committed/exhausted -> discard
```

Questions:

- Should a committed card always go to discard?
- Can Water rewards recover a discarded card in v0.1?
- Are Treasure rewards held in a separate inventory?

Recommended default: committed cards go to discard; Water recovery is allowed only as a named Treasure effect; rewards are stored in inventory.

Decision:

## 18. Health

Recommended default:

```text
Starting health: 5
Defeat: health reaches 0
```

Questions:

- Accept 5 health?
- Can health exceed its starting maximum?
- Does the run end immediately at 0 health?

Decision:

## 19. Treasure use

Recommended first-build rule:

```text
Treasure is generated as an element + tier + effect.
The player may hold up to 3 rewards.
Rewards are used from the admin/player action panel.
```

Questions:

- Accept reward inventory maximum 3?
- Are rewards single-use unless explicitly marked persistent?
- Can rewards be sold or converted to cards?

Decision:

---

# H. Admin / GODMODE Contract

## 20. Admin screen

Required regions:

```text
Header: title, seed, build, Generate, Reset, Export
Settings: board size, room weights, rules preset
Grid: complete board with hidden data visible
Stats: run count, wins, health, hand, deck, discard
Event log: ordered action history
```

Required actions:

- Generate
- Play
- GODMODE
- Reset
- Simulate
- Copy JSON
- Export Run

## 21. GODMODE permissions

Recommended permissions:

- Reveal all rooms
- Hide all rooms
- Select any room
- Resolve a room without cost
- Force success
- Force failure
- Reroll selected room
- Replace selected card
- Set health
- Set hand
- Set seed
- Append a test event

Questions:

- Accept all permissions above?
- Should GODMODE actions be logged?
- Should GODMODE runs be marked as modified and excluded from balance statistics?

Recommended default: every GODMODE mutation is logged; modified runs are excluded from balance statistics but remain exportable.

Decision:

## 22. Simulation

Recommended default:

```text
SIMULATE runs the same resolvers as PLAY.
It uses a selected seed and number of iterations.
It reports win rate, average health, average rooms reached, and common failure room types.
```

Questions:

- What is the maximum simulation count in the UI?
- Should simulation use default player decisions or a simple policy?
- Which statistics are required first?

Recommended default: maximum 1,000 runs; simple fixed policy; four statistics above.

Decision:

---

# I. Data and Determinism Contract

## 23. Content record

Minimum shared fields:

```ts
interface CardRecord {
  id: string;
  type: "hero" | "challenger" | "barrier" | "treasure" | "royal" | "champion";
  rank: string;
  value: number;
  element: "air" | "fire" | "water" | "earth";
  tier?: "common" | "epic" | "legendary";
  name: string;
  family: string;
  tags: string[];
  artStatus: string;
  mechanicalNote?: string;
}
```

Type-specific fields may be added, but the shared identity fields must remain stable.

Decision:

## 24. Seed behavior

Recommended default:

```text
same seed + same content version + same rules version = same run
```

The run stores:

- seed
- content version
- rules version
- generated board
- event log
- mutations

Decision:

## 25. Import/export

Recommended default:

- Export full run JSON.
- Export content package JSON.
- Import a run for debugging.
- Do not support cloud saves yet.

Decision:

---

# J. Final Approval Gate

The Admin Engine may begin only when these are resolved:

- [ ] Board dimensions and orientation
- [ ] Boss tile placement
- [ ] Room distribution
- [ ] Element advantage cycle and modifier
- [ ] Barrier resolver
- [ ] Challenger resolver
- [ ] Starting hand and draw rule
- [ ] Card destination rules
- [ ] Starting health and defeat
- [ ] GODMODE permissions
- [ ] Simulation policy
- [ ] Content record schema
- [ ] Seed and export contract

## Creator decision

Status: `DRAFT / APPROVED / REVISE`  
Name:  
Date:  

---

## Recommended next move

Resolve Sections B-H in order. Do not begin with art tooling or database design. The first code should implement the pure functions for:

```text
generateBoard()
resolveElement()
resolveBarrier()
resolveChallenge()
drawCard()
applyReward()
```

Once those functions pass the three hand-play examples, the Admin screen can be built around them without inventing rules.
