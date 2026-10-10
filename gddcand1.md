# NCE / DUNGEO LV00

## Technical MVP Game Design Document

**Document status:** Revised MVP candidate  
**Product:** Nexus Central Engine / Dungeo  
**Build:** LV00 - Initial functioning Admin Engine  
**Primary user:** The creator / Dungeon Master / system operator  
**Implementation target:** Small, local, deterministic web application

---

## 1. Executive Decision

The first functioning NCE build is not a complete dungeon crawler. It is an **admin generator and debug console** that can create, inspect, reroll, and export the ingredients of a Dungeo run.

The MVP must prove that the engine can reliably generate:

- A hero
- An elemental lineage
- A compact dungeon
- Rooms and room events
- Culinary monsters
- Items and ingredients
- Dice results
- A readable event log
- A reproducible result from a seed

The player-facing adventure, fog of war, combat campaign, accounts, multiplayer, PostgreSQL, Prisma, Sugarbound, tarot expansions, and complex narrative state are explicitly deferred.

The initial product is a **working authoring tool**. It creates the data that a later player mode will consume.

---

## 2. Product Vision

The NCE is a reality-generation system framed as a game. Dungeo is its first test world: a culinary dungeon generator where hunger, sugar, ingredients, monsters, and absurdity are converted into structured game data.

The admin user should be able to open the application, press **Generate Run**, inspect what was created, reroll individual parts, and save or export the result.

The interface may use the green CRT / Nexus Central aesthetic, but the aesthetic must never make the generator harder to operate.

---

## 3. MVP Goals

### Must have

1. Run the application locally with one command.
2. Generate a complete Dungeo run from an optional numeric seed.
3. Display the generated hero, dungeon, rooms, monsters, loot, and log.
4. Reroll a hero, room, monster, or dungeon while keeping the rest of the run intact.
5. Roll supported dice and show the result.
6. Allow basic manual editing of names and descriptions.
7. Export the current run as JSON.
8. Recreate the same run when the same seed and generation inputs are used.
9. Reset the current run without corrupting the application.

### Should have

- Copy seed button
- Copy generated JSON button
- Event log filtering
- Simple validation errors
- Local browser persistence
- A small starter dataset of culinary content

### Must not have in LV00

- User accounts or authentication
- Cloud deployment requirements
- Multiplayer
- Full player mode
- Fog-of-war enforcement
- Turn-based combat campaign
- Save slots or campaign progression
- PostgreSQL or Prisma
- Procedural image generation
- Tarot expansion decks
- Sugarbound implementation
- L.A.B. / LA3 mechanics
- AI-generated content at runtime

---

## 4. MVP User Flow

```text
Open app
  -> Admin dashboard
  -> Choose theme and seed
  -> Generate hero
  -> Generate dungeon
  -> Inspect generated run
  -> Reroll selected entity if needed
  -> Edit labels or descriptions if needed
  -> Roll test dice
  -> Export run JSON
```

There is one primary screen. Secondary panels may be drawers or tabs, but they do not need separate routes.

---

## 5. Admin Dashboard

### 5.1 Header

Displays:

- NCE / Dungeo title
- Current build: LV00
- Current seed
- Theme selector: `dungeo` only in MVP
- New Run button
- Reset button
- Export JSON button

### 5.2 Generator Controls

Controls:

- Seed input
- Generate Hero
- Generate Dungeon
- Generate Full Run
- Reroll Selected
- Dice type selector
- Modifier input
- Roll Dice

### 5.3 Run Summary

Displays:

- Run ID
- Seed
- Theme
- Dungeon name
- Number of rooms
- Hero name and class
- Current generation timestamp

### 5.4 Hero Panel

Displays:

- Name
- Race
- Class
- Background
- Elemental lineage
- Card source
- Six primary stats
- HP, mana, gold
- Hunger and Sweet Tooth values
- Equipment
- Reroll buttons for name, class, stats, and full hero

### 5.5 Dungeon Panel

Displays:

- Dungeon name
- Food-culture theme
- Difficulty
- Goal
- Curse
- Room count
- Room list or compact grid
- Reroll dungeon button

Each room displays:

- Room number
- Name
- Event type
- Description
- Sensory hint
- Monster, treasure, trap, or ingredient data if present
- Reroll room button

### 5.6 Inspector Panel

Displays the selected entity as readable JSON and a formatted summary. This panel is for debugging generation output, not for ordinary play.

### 5.7 Event Log

Records:

- Generation actions
- Rerolls
- Dice rolls
- Validation errors
- Export actions

---

## 6. Minimal Generation Rules

### 6.1 Seeded randomness

Every generator receives a seeded random-number generator. Do not call `Math.random()` inside engine code.

Required behavior:

- Same seed + same generator version = same output.
- Different seed = usually different output.
- Rerolling one entity does not silently regenerate unrelated entities.

The seed is an integer. If the user leaves it blank, the app creates a random seed and displays it.

### 6.2 Elemental card system

LV00 uses the base four-suit deck only.

| Suit | Element | LV00 role |
|---|---|---|
| Spades | Air | speed, magic, stealth |
| Clubs | Fire | attack, heat, ranged damage |
| Diamonds | Earth | defense, mining, structure |
| Hearts | Water | healing, fluid, syrup, purity |

The base card ranks are:

```text
A, 2, 3, 4, 5, 6, 7, 8, 9, J, Q, K
```

Tens are excluded. Jokers are represented as optional metadata only and do not need special gameplay logic in the first build.

Court-card modifiers:

- Jack: +2
- Queen: +3
- King: +4

The generator must store the card that produced an elemental assignment so the result is inspectable.

### 6.3 Hero generation

The hero generator selects one value from each table:

- Name
- Race
- Class
- Background
- Personality trait
- Elemental card
- Equipment set

Minimum starter classes:

- Snobbish Paladin
- Cookie-Stealing Elf
- Pantry Ranger
- Soup Monk
- Sauce Sorcerer

Minimum races:

- Human
- Elf
- Dwarf
- Ratfolk

Minimum stats:

```text
strength, dexterity, constitution,
intelligence, wisdom, charisma
```

For MVP, use a simple bounded generator rather than a full tabletop ruleset:

```text
stat = 8 + random integer from 0 through 10
modifier = floor((stat - 10) / 2)
```

Initial derived values:

```text
HP = 10 + constitution modifier * 2
Mana = 5 + intelligence modifier
Gold = 10
Hunger = 0
Sweet Tooth = 0
```

Clamp HP, Mana, Hunger, and Sweet Tooth to sensible minimums and maximums.

### 6.4 Dungeon generation

The dungeon generator creates exactly 6, 7, 8, or 9 rooms.

Each dungeon receives:

- Name
- Culinary theme
- Difficulty: easy, medium, or hard
- Goal
- Curse
- Final-room flag
- Seed
- Ordered room list

Starter dungeon themes:

- Pastry Catacombs
- Fermentation Caves
- Hummus Plains of Flame
- Blueberry Teapot Court
- Pudding Samurai Land

The MVP uses a linear room sequence. A graph or navigable grid is deferred. Each room points to the next room by array order.

Minimum room event types:

- Empty but Suspicious
- Monster
- Trap
- Treasure
- Ingredient
- Story
- Mini Boss
- Final Boss

Generation constraints:

- Room 1 is always an entry room.
- The final room is always a Final Boss or Goal room.
- At least one room contains a monster.
- At least one room contains an ingredient or treasure.
- No room may contain an invalid event payload.

### 6.5 Monster generation

Monster names follow this formula:

```text
Monster = Modifier + Food Theme + Creature + Weird Trait
```

Starter values:

- Modifiers: Sticky, Haunted, Flaming, Giant, Pickled
- Food themes: Sugar, Blueberry, Potato, Falafel, Molasses
- Creatures: Ant, Slime, Goblin, Troll, Gremlin
- Traits: Knight, Wyrm, Swarm, Ninja, Oracle

Each monster receives:

- Name
- Type
- HP
- Defense
- Attack bonus
- Damage dice
- Culinary weaknesses
- Loot table
- Flavor description

The MVP does not need full enemy AI. Monsters are generated data objects for inspection and later combat use.

### 6.6 Room event generation

Every room receives a single primary event. Event payloads must be type-safe and easy to inspect.

Examples:

- Monster event: monster name and monster stats
- Trap event: trap name, difficulty, damage dice
- Treasure event: item name and gold value
- Ingredient event: ingredient name and taste profile
- Story event: title and short text

### 6.7 Dice engine

Supported dice:

```text
d4, d6, d8, d10, d12, d20, d100
```

Input:

```json
{
  "sides": 20,
  "count": 1,
  "modifier": 3,
  "seed": 12345
}
```

Output:

```json
{
  "notation": "1d20+3",
  "rolls": [14],
  "modifier": 3,
  "total": 17,
  "critical": false
}
```

The dice engine is a utility and test surface. It does not yet resolve combat or skill checks.

---

## 7. Minimal Data Model

The first build uses TypeScript interfaces and a single in-memory `RunState`. No database is required.

```ts
type Theme = "dungeo";
type Element = "air" | "fire" | "earth" | "water";
type EventType =
  | "empty"
  | "monster"
  | "trap"
  | "treasure"
  | "ingredient"
  | "story"
  | "miniBoss"
  | "finalBoss";

interface CardRef {
  suit: "spades" | "clubs" | "diamonds" | "hearts";
  rank: "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "J" | "Q" | "K";
  element: Element;
  modifier: number;
}

interface Hero {
  id: string;
  name: string;
  race: string;
  className: string;
  background: string;
  personality: string;
  card: CardRef;
  stats: Record<string, number>;
  hp: number;
  mana: number;
  gold: number;
  hunger: number;
  sweetTooth: number;
  equipment: string[];
}

interface Monster {
  id: string;
  name: string;
  type: string;
  hp: number;
  defense: number;
  attackBonus: number;
  damageDice: string;
  weaknesses: string[];
  description: string;
}

interface Room {
  id: string;
  index: number;
  name: string;
  eventType: EventType;
  sensoryHint: string;
  description: string;
  monster?: Monster;
  payload?: Record<string, unknown>;
}

interface Dungeon {
  id: string;
  name: string;
  theme: string;
  difficulty: "easy" | "medium" | "hard";
  goal: string;
  curse: string;
  rooms: Room[];
}

interface RunState {
  id: string;
  seed: number;
  theme: Theme;
  hero?: Hero;
  dungeon?: Dungeon;
  log: LogEntry[];
  createdAt: string;
}
```

The model is intentionally smaller than the future Prisma model. It can later be persisted without changing the conceptual shape.

---

## 8. Runtime and Persistence Strategy

### Required stack

- Next.js with App Router
- TypeScript
- React
- Plain CSS or a minimal component stylesheet
- Node.js runtime

### No database in LV00

The first build should use:

- In-memory server state for the active run
- `localStorage` for browser recovery
- JSON export for durable sharing
- Static TypeScript data tables in `src/data/`

This removes database setup, migrations, authentication, deployment configuration, and ORM debugging from the first milestone.

### Optional persistence upgrade

Add SQLite only after the generator and dashboard pass the acceptance tests. Prisma/PostgreSQL belongs to the multi-user or multi-theme phase, not the first functioning admin.

---

## 9. Proposed Project Structure

```text
nce-admin/
  package.json
  next.config.ts
  tsconfig.json
  src/
    app/
      page.tsx
      globals.css
      api/
        run/route.ts
        reroll/route.ts
        dice/route.ts
        export/route.ts
    components/
      AdminDashboard.tsx
      HeroPanel.tsx
      DungeonPanel.tsx
      RoomList.tsx
      InspectorPanel.tsx
      EventLog.tsx
    engine/
      rng.ts
      cards.ts
      dice.ts
      hero.ts
      monsters.ts
      dungeons.ts
      run.ts
      validate.ts
    data/
      dungeo.ts
      cards.ts
    types/
      game.ts
```

The engine modules must not import React, browser APIs, or Next.js components. They should be testable as ordinary TypeScript functions.

---

## 10. API Surface

The dashboard may call these route handlers. The engine itself remains usable without HTTP.

### `POST /api/run`

Creates a complete run.

Request:

```json
{ "seed": 12345, "theme": "dungeo" }
```

Response:

```json
{ "run": { "id": "run-...", "seed": 12345, "hero": {}, "dungeon": {}, "log": [] } }
```

### `POST /api/reroll`

Rerolls one target using a derived seed.

Request:

```json
{ "runId": "run-...", "target": "room", "targetId": "room-03" }
```

Allowed targets:

```text
hero, heroName, heroClass, heroStats, dungeon, room, monster
```

### `POST /api/dice`

Returns a deterministic dice result.

### `GET /api/run/export`

Returns the current run as downloadable JSON.

### Error format

```json
{ "error": { "code": "INVALID_INPUT", "message": "Seed must be an integer" } }
```

---

## 11. Validation Rules

The validator runs after every full generation and reroll.

Required checks:

- Run has a numeric seed.
- Hero has all required fields.
- Hero card uses a valid non-ten rank.
- Dungeon contains 6 to 9 rooms.
- Room indexes are unique and sequential.
- Final room is a final event.
- At least one monster event exists.
- At least one treasure or ingredient event exists.
- Every monster has positive HP and defense.
- Hunger and Sweet Tooth are between 0 and 100.
- Exported JSON can be parsed back into the same shape.

If validation fails, the UI displays the error and keeps the last valid run.

---

## 12. Testing Requirements

### Unit tests

- Seeded RNG returns repeatable values.
- Dice results stay within bounds.
- Tens never appear in the base card deck.
- Suit-to-element mappings are correct.
- Hero generation returns valid derived stats.
- Dungeon generation returns 6 to 9 rooms.
- Final-room and required-event constraints hold.
- Monster formula produces valid component combinations.
- Rerolling a room does not remove the hero.

### Integration tests

- `POST /api/run` returns a valid run.
- `POST /api/reroll` returns a changed target.
- Exported JSON validates against the run schema.
- Invalid input returns a structured 400 error.

### Browser smoke test

1. Open the app.
2. Generate a run.
3. Confirm hero and dungeon panels are populated.
4. Reroll one room.
5. Roll a d20.
6. Export JSON.
7. Reset and generate again with the same seed.
8. Confirm the generated content matches.

---

## 13. Definition of Done

LV00 is complete when a local user can:

- Start the app without external services.
- Generate a complete Dungeo run in under two seconds.
- See all generated entities in the admin dashboard.
- Reproduce a run with a copied seed.
- Reroll individual elements without losing the rest of the run.
- Inspect readable data and raw JSON.
- Export a valid run file.
- Reset safely.
- Run the automated tests successfully.

The build is not complete merely because the page renders. The generation functions, validation, repeatability, rerolls, and export must work together.

---

## 14. Post-MVP Roadmap

### LV01 - Playable Dungeo slice

- Player mode
- Linear room advancement
- Action buttons
- Basic dice checks
- Basic combat
- Hunger and Sweet Tooth updates
- Victory and defeat states

### LV02 - Persistent authoring tool

- SQLite persistence
- Saved runs
- Content editing tables
- Quest and recipe data
- Run history

### LV03 - Dual-view engine

- Admin view with complete state
- Player view with sanitized state
- Fog of war
- Backend data filtering

### LV04 - NCE expansion layer

- Generic theme support
- Sugarbound
- Culinary Dungeon Master sandbox
- Tarot and Joker behaviors
- Narrative events and dimensional metadata

---

## 15. Canon and Implementation Notes

The NCE narrative remains important, but it should enter LV00 as metadata and flavor text rather than as a dependency of the engine.

Recommended LV00 framing:

- Adam is the implied system operator.
- The green CRT aesthetic frames the dashboard.
- The NCE logo and John Mogi hummingbird may appear in the shell.
- The Fool and Magician may appear in log flavor text.
- The Abyss, Shechinah, Lilith, and the three Adams remain lore references only.

This keeps the story present without forcing the first technical build to solve the entire cosmology.

The smallest successful NCE is a reliable generator with a strong voice. Once that exists, the larger world can safely grow around it.
