# Dungeon Master Engine Architecture and Data Schema

> **Overview**: A unified, modular RPG generation engine supporting multi-theme gameplay mechanics, core rulesets, algorithmic generation, and extended game worlds (Generic RPG, Culinary RPG / *Dungeo*, and Dwarven-Sugar RPG / *Sugarbound*).

---

## 1. System & Directory Architecture

The engine adopts a clean separation of concerns: pure core logic resides in `src/engine/`, canonical data specifications are governed by `prisma/schema.prisma`, and individual game implementations consume the engine API while adding thematic front-end elements.

```
dungeon-master/
├── prisma/
│   ├── schema.prisma       ← canonical data models
│   └── seed.ts             ← base data for all themes
├── src/
│   ├── app/
│   │   ├── page.tsx          ← DM Admin dashboard
│   │   └── api/
│   │       ├── dice/route.ts
│   │       ├── characters/route.ts
│   │       ├── monsters/route.ts
│   │       ├── dungeons/route.ts
│   │       └── quests/route.ts
│   ├── engine/               ← pure generation logic
│   │   ├── dice.ts
│   │   ├── characters.ts
│   │   ├── monsters.ts
│   │   ├── dungeons.ts
│   │   └── quests.ts
│   ├── lib/
│   │   └── prisma.ts          ← singleton DB client
│   └── data/
│       ├── generic/           ← base RPG tables
│       ├── dungeo/            ← culinary-themed tables
│       └── sugarbound/        ← dwarven/sugar tables
└── games/
    ├── dungeo/            ← imports engine, adds UI
    └── sugarbound/        ← imports engine, adds UI
```

---

## 2. Canonical Data Schema (`schema.prisma`)

The database models leverage **Prisma ORM** with built-in multi-theme branching via `gameTheme` tags (`generic` | `dungeo` | `sugarbound`).

### 2.1 Character Model
Represents player characters, attributes, and thematic inventory linkage.
```prisma
model Character {
  id            String   // cuid()
  name          String
  race          String
  class         String
  level         Int      // default 1
  strength      Int      // 4d6 drop lowest
  dexterity     Int
  constitution  Int
  intelligence  Int
  wisdom        Int
  charisma      Int
  gameTheme     String   // "generic" | "dungeo" | "sugarbound"
  inventory     Item[]
}
```

### 2.2 Monster Model
Defines combat stats, challenge ratings, ability payloads, and loot matrices.
```prisma
model Monster {
  id              String
  name            String
  type            String
  challengeRating Float
  hp              Int
  ac              Int
  attackBonus     Int
  damageDice      String   // "2d6+3"
  abilities       Json
  lootTable       Json
  gameTheme       String
}
```

### 2.3 Dungeon & Room Models
Defines procedurally generated layout structures, tile coordinates, and interactive room events.
```prisma
model Dungeon {
  id        String
  name      String
  theme     String
  size      String   // small | medium | large
  template  String   // monster-heavy | trap-heavy | balanced
  rooms     Room[]
  gameTheme String
}

model Room {
  id          String
  positionX   Int
  positionY   Int
  eventType   String   // empty | treasure | trap | monster | special
  eventData   Json
  description String
  dungeon     Dungeon  // relation
}
```

### 2.4 Quest Model
Governs objective-based progression, difficulty scaling, and rewards.
```prisma
model Quest {
  id          String
  title       String
  type        String   // ingredient-gathering | recipe-recovery | clearing
  objectives  Json
  difficulty  String   // easy | medium | hard
  rewards     Json
  gameTheme   String
}
```

### 2.5 Item Model
Covers weapons, armor, ingredients, potions, and thematic artifacts.
```prisma
model Item {
  id          String
  name        String
  itemType    String   // weapon | armor | ingredient | potion | artifact
  rarity      String   // common | uncommon | rare | legendary
  effects     Json
  gameTheme   String
  character   Character? // optional relation
}
```

---

## 3. Game Themes & Narrative Integrations

The engine supports multi-theme modularity allowing shared mechanics across distinct narrative worlds:

1. **Generic RPG (`generic`)**: Standard high-fantasy mechanics, traditional stats, and baseline RPG roll tables.
2. **Dungeo (`dungeo`)**: Culinary-themed RPG experience emphasizing ingredient gathering, culinary dungeon encounters, recipe recovery, and gourmet faction mechanics.
3. **Sugarbound (`sugarbound`)**: Dwarven-Sugar fantasy theme featuring dwarven clans, confectionery mines, and candy-coated dungeons.
