# Playtest sheet

**Status:** this is the active task.  
**Game:** frozen NCE Classic prototype, rules v0.1.  
**Do not tune numbers while filling this in.**

Play 5 to 10 runs. Change the Ace, the seed, or both. One row is one complete run, including a loss.

The app opens on PLAY. Choose the Ace, set the seed, generate, then start at E1.

## Runs

Copy this block once per run.

```text
Seed:
Hero:
Result:                VICTORY / DEFEAT
Reason:                ROYAL_DEFEATED / HEALTH_DEPLETED / DECK_EXHAUSTED
Rooms visited:
Royal reached?         yes / no
HP remaining:
Cards used:
Why I lost / why I won:
Moment I had an interesting decision:
Moment that felt automatic / boring:
```

## After the runs

Answer from the runs, not from the design documents.

1. Does choosing a card actually feel like a decision?
2. Does choosing a route matter?
3. Does Treasure change what I want to do next?

Write `yes`, `no`, or `sometimes`, and one sentence of evidence for each.

```text
1. Card choice:
2. Route choice:
3. Treasure:
```

## How to read the answers

Mostly no: the next design job is the structure of the choice. Leave +2 and HP 3 alone until that structure is named.

Mostly yes: the prototype is worth balancing and presentation. That is still a separate order.

A single brutal seed is not a balance verdict. A run that feels automatic on every route is a structure verdict.

## Notes that are not balance

- The whole board is visible, so route choice is about cost, not discovery.
- A pending room cannot be abandoned.
- Treasure does not grant a power. It only changes the hand.
- Royal targets are 7, 8, or 9. The catalog still says 10, 11, or 12. If that display is confusing, say so here. Do not change the code during the freeze.
