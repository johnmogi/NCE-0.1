# NCE CLASSIC

## Frozen playable prototype

**Status:** KEEP. Implementation is frozen pending playtest.  
**Rules label:** `prototype-rules-0.1`  
**Reviewed build:** commit `44` (`897c766`)  
**This file is the contract of what exists.** It is not permission to add the next system.

Prototype numbers are a playtest. They are not catalog canon. The 76-record catalog was not rewritten to fit them.

---

## 1. Product

PLAY is the primary surface. The order is:

```text
PLAY
GODMODE
CONTENT
RUN DATA
```

GODMODE inspects a generated board and does not resolve rooms. Diagnostics, the Compendium, replay, and JSON export remain. They are not the game.

---

## 2. Board

- 3 columns by 5 rows. Fifteen tiles.
- Start is the bottom-center tile, E1, `room-4-1`.
- Royal is the top-center tile, A1, `room-0-1`.
- Movement is orthogonal. There are no diagonals and no walls.
- The generator guarantees one orthogonal route from Start to Royal.
- Room mix: 1 Start, 1 Royal, 4 Treasure, 4 Barrier, 5 Challenger.
- The same seed and hero regenerate the same board.
- Gameplay draws use a separate seed stream and do not change the board.
- The board is fully visible. There is no fog.

Rooms outside the guaranteed route are optional. A cleared room stays cleared and may be crossed. A pending room cannot be left.

---

## 3. Hero and support deck

The Ace is the hero. Elements are Air, Fire, Water, and Earth.

```text
basePower = 1
health = 3
maxHealth = 3
```

There are no classes, abilities, or experience.

The support deck is not the encounter catalog. It is 32 cards: each element, values 2 through 9. A card is `id`, `element`, and `value`, for example `support-air-6`.

The deck is shuffled from the run seed and the hero. Opening hand is 4. Maximum hand is 6. The runtime tracks `drawPile`, `hand`, `discardPile`, and `health`.

---

## 4. The check

```text
Water beats Fire
Fire beats Earth
Earth beats Air
Air beats Water
```

Advantage is +2. Neutral is 0. Disadvantage is −2. Neutral means neither element beats the other. The committed card is compared with the encounter. The hero's element does not add a second modifier.

```text
TOTAL = 1 + card value + element modifier
```

Success is `TOTAL >= target`. A tie succeeds. The arithmetic is shown before the card is played.

| Room | Successes required | Target |
|---|---:|---|
| Barrier | 1 | catalog value |
| Challenger | 2 | catalog value |
| Royal | 3 | catalog value − 3 |

Jack 10, Queen 11, and King 12 therefore play as targets 7, 8, and 9. That conversion lives only in `encounterTarget()`. The catalog values stay 10, 11, and 12.

A failed check discards the card, draws one replacement, costs 1 HP, and does not advance the round. At 0 HP the run ends as `HEALTH_DEPLETED` before that replacement draw. If a required draw cannot be completed, the run ends as `DECK_EXHAUSTED` and the room does not clear. There is no reshuffle and no retreat.

Treasure draws two support cards. The player keeps one and discards the other. The treasure name is flavor. If the hand is already 6, the player discards one hand card before the kept card is added.

A turn is a move. Playing a card does not advance the turn.

---

## 5. Endings

The Royal's third success ends the run as a victory and shows turns, rooms visited, barriers, treasures, challengers, cards used, and HP remaining.

Restart deals the same deck on the same board. Generate replaces the board.

---

## 6. Engine

Gameplay rules are pure TypeScript under `src/engine/runtime/`:

```text
types.ts
actions.ts
deck.ts
elements.ts
resolver.ts
```

Commands are `START_PLAY`, `MOVE`, `COMMIT_CARD`, `CHOOSE_TREASURE`, and `RESET_PLAY`. Events are separate from commands. React renders the state. It does not own the rules.

`heroRoomId` and `currentRoomId` are redundant. Leave them.

---

## 7. Content

Static catalog, 76 records: 4 heroes, 32 challengers, 12 royals, 4 champions, 12 barriers, 12 treasures. Champions are catalog records only. They have no gameplay.

The engine reads the catalog and does not modify it.

---

## 8. Still out

Champions as playable characters, hero abilities, treasure magic, equipment, inventory, XP, resurrection, multiplayer, enemy HP, enemy AI, procedural story, animation, sound, fog, walls, Dungeo mechanics, Mesahara, simulation bots, and balance tuning.
