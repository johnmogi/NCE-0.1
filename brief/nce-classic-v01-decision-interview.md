# Creature and dataset interview

**Status:** OPEN. Nothing in this file is approved.  
**Frozen underneath it:** the 76-record Classic catalog and prototype rules v0.1.  
**Rule:** an answer here does not edit `classic.json` and does not change `encounterTarget()`.

The playable game already has named challengers, barriers, treasures, and royals. Those names are the content package in use. They are not a settled theory of how a creature is built.

This interview exists because that theory is still unresolved.

## How to answer

Under each question write one of:

- `KEEP` — the current catalog practice stays
- `REPLACE` — a new grammar should replace it later
- `DEFER` — interesting, not this dataset
- `OPEN` — still unresolved

Do not answer with a feature.

---

## 1. What is a creature record today?

A Classic challenger, barrier, treasure, or royal is one static record:

```text
id, type, rank, value, element, tier, name, family, tags
```

The support deck used in play is not these records. It is element plus value only.

Question: is the named catalog the creature dataset, or is it a temporary cast list while the grammar is decided?

```text
Answer:
```

## 2. Candidate grammar

One proposal, not yet in the engine, builds a creature from four slots:

```text
Family
Transformation
Culinary Treatment
Quirk
```

Question: do those four slots describe the creatures you want, and do their combinations read as recognizable, funny monsters rather than long names?

```text
Answer:
```

If the answer is not yes, name the slot that fails. Do not fill the slots with a new canon in this file until that answer exists.

## 3. Other candidate grammars

These also exist in the notes. They are candidates, not layers to stack on by default.

| Source | Formula | Example sitting in the notes |
|---|---|---|
| Origin notes | race × element × a second creature or condition | pickled mantis with an ooze leak |
| Origin notes | insects, rodents, lizards, dwarfs | dwarf miners drifting into undead insect hybrids |
| Culinary notes | size + food culture + creature + weird trait | haunted pickle troll, flaming falafel slime |
| Shipped catalog | one authored name per record | Cursed Golden Coffee-Dung Beetle |

Question: which one formula is the dataset, if any?

```text
Answer:
```

## 4. What must remain true even if the grammar changes

- Four elements: Air, Fire, Water, Earth.
- Challenger values used by the frozen game are the catalog values. Royal gameplay targets are derived only in `encounterTarget()`.
- A content record appears once per generated board.
- Champions stay in the catalog without gameplay until a later order.
- Treasure names may stay flavor. Magical treasure effects are outside this interview.

Question: should a future grammar be allowed to change a record's `value`, or only its name, family, and tags?

```text
Answer:
```

## 5. Funny versus legible

The test for a generated name is whether a player can say what they are facing in one breath, and whether the element is still obvious.

Question: write three combinations you would accept, and three you would reject. Use whatever grammar you currently favor. If you cannot yet, leave this `OPEN`.

```text
Accept:
Reject:
```

## 6. Suits

The origin notes map spades, clubs, diamonds, and hearts onto the four elements, and remove the tens. The shipped game does not use suits. It uses element names, and it keeps royal values 10, 11, and 12 in the catalog.

Question: are suits a presentation layer, a future deck, or a discarded metaphor?

```text
Answer:
```

## 7. Jokers and champions

The notes contain the Fool, the Magician, and four elemental champions. The catalog contains four champion records. The prototype does not play them.

Question: are champions creatures, a fifth room type, or a later hero?

```text
Answer:
```

## 8. What this interview will not decide

HP, the +2 modifier, hand size, check count, fog, walls, and treasure magic. Those wait on the playtest sheet.

When this interview is filled, it becomes a dataset proposal. It becomes an implementation order only when a new checkpoint says so.
