# DUNGEO: Culinary Dungeon Master — MVP Game Logic & Specification

> **System Blueprint & Game Design Document (GDD)**  
> *A solo fantasy RPG dungeon-crawler generator where food, monsters, dice, hunger, recipes, and absurd cultural cuisine collide.*

---

## 1. Executive Summary & Core Fantasy

### Overview
**DUNGEO: Culinary Dungeon Master** is a whimsical, solo dungeon-crawling RPG generator designed as a hybrid between a fantasy cookbook and a dungeon crawler admin panel. The player explores magical culinary dungeons in search of rare ingredients, recipes, gold, and artifacts while balancing survival mechanics against ridiculous culinary threats.

### Core Fantasy
In the world of **DUNGEO**, every dungeon is hungry. Ancient kitchens, fermented caves, cursed bakeries, goulash swamps, hummus plains, raw fish arenas, and pudding dojos have mutated into unstable magical dungeons.
- **The Objective:** Recover rare ingredients, assemble forbidden recipes, gain gold, and defeat food-culture bosses.
- **The World Rule:** Everyone in this world is perpetually hungry, craves sweets, and deeply distrusts teapots.

---

## 2. MVP Core Game Loop

The playable demo executes a structured 7-stage loop:

```
[1. Create Hero] ➔ [2. Generate Dungeon] ➔ [3. Explore Room by Room]
                                                      │
[6. Combat / Check] ◄── [5. Dice Checks] ◄── [4. Resolve Room Events]
         │
         ├──► [7. Hunger/Sweet Tooth Pressure]
         └──► [Victory / Defeat Check] ➔ Loop to next room or End Run
```

### Stage 1: Hero Creation
Players assemble or procedurally roll a Hero Character Sheet.
- **Hero Attributes:** Name, Race, Class, Background, Life Points (HP), Mana, Gold, Armor, Weapon, Tool/Scroll/Shield, Hunger Meter, Sweet Tooth Meter, Inventory, Ingredients Collected, Recipes Found, Primary Stats.
- **Primary Stats:** Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma.
- **Special Meters:**
  - **Hunger:** *“If this gets too high, you may attempt to eat the evidence.”*
  - **Sweet Tooth:** *“Improves dessert detection. Worsens judgment.”*
- **Customization Controls:** Full random generation, field-by-field rerolls (Name, Class, Stats, Equipment), or manual field editing.

### Stage 2: Dungeon Generation
Generates a compact dungeon consisting of **6 to 9 procedural rooms**.
- **Dungeon Data:** Unique Name, Food-Culture Theme, Difficulty Rating, Hidden Room Map, Final Boss Room, Dungeon Goal, Dungeon Curse.
- **Example Dungeons:**
  - *The Pastry Catacombs*
  - *Sticky Beef Goulash Swamp*
  - *The Hummus Plains of Flame*
  - *Blueberry Teapot Court*
  - *Matryoshka Potato Salad Vault*
  - *Pudding Samurai Land*
  - *Fermentation Caves*
- **Primary Objectives:**
  - Recover 3 specific ingredients.
  - Find the Golden Recipe Page.
  - Defeat the thematic Final Boss.
  - Escape with at least 10 Gold.
  - Collect a forbidden dessert without consuming it.

### Stage 3: Room-by-Room Exploration
The player navigates rooms sequentially starting from Room 1.
- **Unexplored Rooms (Fog of War):** Displayed as mystery cards with placeholder hints such as `???`, *“locked smell”*, *“suspicious crumbs”*, or *“muffled chewing noises”*.
- **Player Actions:** Inspect Room, Search for Ingredient, Roll Check, Attack, Defend, Use Item, Eat Snack, Collect Treasure, Sneak Past, Enter Next Room, Flee Dungeon.

### Stage 4: Room Event Resolution
Each room houses one primary event:
- **Event Types:** Empty but Suspicious, Monster Encounter, Trap, Treasure Cache, Ingredient Cache, Story Event, Puzzle Recipe, Merchant, Cursed Object, Sweet Craving Test, Mini Boss, Final Boss.

### Stage 5: Dice Check System
Uses standard RPG polyhedral dice (**d4, d6, d8, d10, d12, d20, d100**) to resolve actions.
- **Check Categories:** Attack, Defense, Trap, Sneak, Cooking, Ingredient Search, Hunger Check, Sweet Tooth Check, Boss Check, Random Chaos Roll.
- **Flavor Outcomes:**
  - *Low Roll (Failure):* “You fail with confidence.” / “The dungeon notices. The dungeon is disappointed.” / “You trip over a suspiciously judgmental dumpling.”
  - *High Roll (Success):* “A heroic success. The cookbook briefly applauds.” / “You succeed so well the trap apologizes.” / “The ingredient leaps into your bag out of respect.”

### Stage 6: Combat System
Simple, fast-paced turn-based combat.
- **Combat Phase:**
  1. Player rolls `d20 + Stat Modifier`.
  2. If result exceeds Monster Defense, deal weapon/spell damage.
  3. If monster survives, it retaliates against Player Defense.
  4. Strategic options: Defend (damage reduction), Sneak Away (Dexterity check), or Throw Snack (distraction).
  5. Exploiting culinary weaknesses (e.g., salt, fresh herbs, bad reviews) yields bonus combat effects.

### Stage 7: Hunger & Sweet Tooth Pressure Meters
Dual lightweight pressure mechanics that escalate as exploration continues:
- **Hunger System:** Increases when entering new rooms, failing checks, or encountering food aromas. High hunger causes stat debuffs, harder trap checks, or accidental consumption of key ingredients.
- **Sweet Tooth System:** Passively aids in detecting sugar crystals, hidden treats, and recipe fragments. High sweet tooth increases greed, triggers attraction to cursed sweets, and forces risky decisions.

---

## 3. UI Architecture & View Specifications

### 1. Admin Mode (Dungeon Master View)
The control center and full generator panel for managing or debugging the dungeon run.
- **Visible Elements:** Complete revealed dungeon map, hidden room inspectors, monster/trap stats, player location, real-time event log, dice history, and win/loss toggles.
- **Admin Actions:** Generate New Dungeon/Hero, Reroll Specific Room/Monster/Treasure, Force Random Chaos Event, Reveal/Hide Rooms, Simulate Dice Rolls, Reset Run.
- **UI Label:** *“Warning: Admin view contains forbidden spoilers, cursed recipes, and tax records from the Goulash Mafia.”*

### 2. Player Mode (Discovery View)
The clean, immersive solo play view with full fog-of-war.
- **Visible Elements:** Current Room Card, Discovered Map Cards, Hero Status (HP, Mana, Hunger, Sweet Tooth), Inventory, Action Buttons, Interactive Dice Panel, Story Event Log.

### 3. Screen Requirements Matrix

| Screen | Key Features & Functional Components |
| :--- | :--- |
| **Home Screen** | Game Title, Tagline (*"A solo RPG generator where every dungeon is hungry"*), Start Player Mode, Open Admin Mode, Quick Hero/Dungeon Generators. |
| **Admin Dashboard** | Full Dungeon Grid, Selected Room Inspector, Hero Summary, Monster/Event Preview, Generator Controls, Raw Event Log. |
| **Player View** | Current Room Display, Discovered Map Grid, Hero Meter Bars, Action Triggers, Dice Roller, Narrative Feed. |
| **Hero Generator** | Interactive Character Sheet, Individual Attribute Reroll Buttons, Stat Roller, Custom Name/Class Inputs. |
| **Monster Encounter** | Monster Visual Card, HP Bar, Stats (ATK/DEF), Special Abilities, Culinary Weaknesses, Action Buttons (Attack/Defend/Item/Flee). |
| **Run Summary** | Victory/Defeat Banner, Rooms Explored, Monsters Defeated, Ingredients/Gold Collected, Funniest Event Log Entry, Final Earned Title. |

---

## 4. Procedural Generators & Entity Framework

### Hero Generator Tables
- **Classes:** Cookie-Stealing Elf, Snobbish Paladin, Neckromancer Mage, Bearded Neutral Dough Dwarf, Pantry Ranger, Kitchen Rogue, Soup Monk, Sauce Sorcerer, Bread Shield Warrior, Spice Alchemist, Tea Oracle, Pudding Duelist, Falafel Firestarter, Crumb Assassin, Butter Knight.
- **Personality Traits:**
  - *Cannot resist free samples.*
  - *Believes every soup is a prophecy.*
  - *Apologizes to defeated vegetables.*
  - *Thinks gold is less useful than snacks.*
  - *Refuses to trust forks.*
  - *Has a personal feud with one specific oven.*
- **Backgrounds:** Former royal kitchen assistant, Escaped bakery prisoner, Failed culinary student, Wandering snack thief, Magical dishwasher veteran, Recipe smuggler, Former Goulash Mafia accountant.

### Monster Generator Formula
$$\text{Monster} = (\text{Size/Modifier}) + (\text{Food Culture Theme}) + (\text{Creature Type}) + (\text{Weird Trait})$$
- **Example Outputs:** *Sticky Sugar Ant Knight*, *Haunted Pickle Troll*, *Russian Blinchki Goblin*, *Blueberry Teapot Gremlin*, *Potato Salad Matryoshka Beast*, *Dragon Breath Mint Wyrm*, *Flaming Falafel Slime*.
- **Monster Traits & Abilities:** Explodes into crumbs, gives unsolicited cooking advice, steals inventory, Molasses Grip, Teapot Steam Blast, Matryoshka Split, Falafel Fireball.
- **Weaknesses:** Salt, cold soup, polite applause, stale bread, lemon juice, bad reviews, clean spoons, unpaid restaurant bills.

### Room & Environment Generator
- **Room Smells:** Burnt sugar, wet bread, suspicious mint, nervous soup, overconfident paprika, haunted blueberries, raw fish and regret, tax evasion goulash.
- **Room Descriptions (Flavor First):**
  - *Trap Bakery:* “The ovens are cold, but the muffins are sweating. That is not usually a good sign.”
  - *Tea Ceremony Chamber:* “A dozen teapots turn to face you. One coughs politely. Another loads a crossbow.”
  - *Hummus Shrine:* “A golden bowl glows in the center. The air smells holy, garlicky, and legally complicated.”

### Items, Traps & Ingredients
- **Treasures:** Golden Recipe Page, Dragon Breath Mint, Ancient Blinchki Pan, Fortune Cookie Scroll, Enchanted Hummus Bowl, Raw Fish Blade, Pickle of Second Chances, Spoon of Minor Authority.
- **Traps:** Exploding Muffin Mine, Sticky Molasses Floor, Flying Knife Drawer, Sour Milk Fog, Mimic Lunchbox, Goulash Tax Audit.
- **Ingredient Taste Profiles:** Sweet, Spicy, Sour, Salty, Bitter, Umami, Fermented, Haunted, Royal, Forbidden, Crystalized, Mythical.
  - *Examples:* Phoenix Pepper, Blueberry Court Leaf, Matryoshka Potato Core, Goulash Swamp Beef, Hummus Sun Garlic, Pudding Honor Gel.

---

## 5. Game States & Design Guidelines

### Victory & Defeat Rules
- **Victory State:** Occurs when the Final Boss is defeated, the dungeon goal is achieved, and required ingredients are secured.
  - *Victory Log:* “You survived the dungeon, recovered the ingredients, and only ate two suspicious things. A respectable performance.”
- **Defeat State:** Occurs if HP reaches 0, Hunger reaches max, or Sweet Tooth curse triggers complete failure.
  - *Defeat Logs:* “You were defeated, lightly seasoned, and served with regret.” / “The Goulash Mafia sends condolences and an invoice.”

### Narrative Tone & Copywriting Directives
1. **Rule of Flavor:** Never use generic text (e.g., replace *"A monster appears"* with *"A Sticky Sugar Ant Knight blocks the pantry door and demands proof of dessert citizenship"*).
2. **Absurdist Logic:** Humorous and whimsical without sacrificing tabletop gameplay clarity.
3. **Pacing:** Punchy, card-based decisions with immediate feedback loops.

---
*End of Specification — DUNGEO MVP Architecture*
