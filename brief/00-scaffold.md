# NCE brief scaffold

**Status:** planning only. The playable prototype is frozen.  
**Built game:** NCE Classic, prototype rules v0.1, reviewed as commit `44` (`897c766`). Verdict: keep.  
**Do not code from this folder until a later order says the freeze is over.**

This folder is the planning scaffold. It is not a second game engine.

## Authority

| Rank | What it governs | Where |
|---|---|---|
| 1 | The game that exists and must not be extended yet | `nce-classic-v01-checkpoint-1.md` |
| 2 | The order in force: play it and break it | `nce-classic-v01-developer-task.md` |
| 3 | The engine map, so later work does not invent a second architecture | `dungeon_master_engine_architecture.md` |
| 4 | The open creature and dataset questions | `nce-classic-v01-decision-interview.md` |
| 5 | The playtest sheet | `game-production-interview.md` |

If a parked Dungeo note conflicts with the frozen prototype, the prototype wins.

## Folder map

| File | Role |
|---|---|
| `1.md` | Raw origin notes. Voice and myth. Not rules. |
| `2.md` | Decision log of how the 3×5 board and 76-record catalog were locked. |
| `D1.md` | Narrative concept. The myth stays. The first playable slice is Classic, not Dungeo. |
| `dungeo-game-overview.md` | Parked pitch. Mind's Labyrinth is not the current game. |
| `dungeo-master-lore-bible.md` | Parked creature and sugar candidates. Not catalog canon. |
| `dungeo-mvp-specification.md` | Parked culinary loop. Dice, hunger, and classes are not prototype rules. |
| `dungeon_master_engine_architecture.md` | The engine that actually shipped. |
| `game-production-interview.md` | Five to ten manual runs, and the three playtest questions. |
| `nce-classic-v01-checkpoint-1.md` | Frozen contract of the playable prototype. |
| `nce-classic-v01-decision-interview.md` | Creature grammar and dataset questions still open. |
| `nce-classic-v01-developer-task.md` | Freeze order. No Champions, abilities, equipment, or admin expansion. |

## What is already true

PLAY is the game. GODMODE, the Compendium, diagnostics, replay, and JSON export stay as tools.

A run is: choose an Ace, generate a world, start at E1, move, resolve Treasure, Barrier, and Challenger rooms, spend a hand, lose health, reach the Royal, win or lose, restart.

Barrier is one check. Challenger is two. Royal is three. The check is `1 + card value + element modifier`. Tie succeeds.

Royal catalog values `10 / 11 / 12` become gameplay targets `7 / 8 / 9` only inside `encounterTarget()`. Do not copy `10 / 11 / 12` into other systems as if they were the difficulty.

## What is still open

The 76 named records in the Classic catalog are the content package in use. They are not a finished theory of creatures.

Family, Transformation, Culinary Treatment, and Quirk are a candidate grammar. They are not approved, and they are not in the engine. The same is true of insects, rodents, lizards, dwarfs, and the culinary mashup lists. Those lists are material for the dataset interview. They do not replace the catalog, and they do not change prototype rules.

## What this freeze forbids

Champions, hero abilities, equipment, treasure magic, new monster mechanics, XP, animation, fog, walls, and more admin tooling.

`heroRoomId` and `currentRoomId` stay redundant. The board stays an open 3×5 grid. Do not invent a maze.
