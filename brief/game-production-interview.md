# NCE / DUNGEO

## Decisive Game Production Interview

**Purpose:** Define the smallest real game that can be built, tested, and played.  
**Status:** Awaiting creator decisions  
**Current candidate:** Dungeo / NCE LV00  
**Rule:** When a question is unknown, answer `defer`. Do not answer with a feature wish-list.

---

## How to Answer

Answer directly beneath each question. Short answers are preferred. If two choices are equally attractive, choose the one that makes the first playable build easier.

Use these labels where useful:

- **DECIDE:** fixed for the first build
- **DEFER:** important, but not part of the first build
- **REMOVE:** not part of the project unless deliberately restored later
- **OPEN:** requires another interview

The final result of this document will become the production contract for the first game slice.

---

# Part I - The First Game

## 1. One-sentence game definition

Complete this sentence:

> The first playable Dungeo game is a game where the player ________________________________.

## 2. Player role

Who is the player in the first build?

- [ ] A dungeon master who generates content
- [ ] A hero exploring a dungeon
- [ ] A monster infiltrating a kitchen
- [ ] Adam operating the NCE
- [ ] Other: 

Decision:

## 3. First playable experience

What should the player do during the first five minutes?

1. 
2. 
3. 

## 4. Success feeling

What should the player feel after completing one run?

Examples: clever, amused, surprised, victorious, hungry, unsettled, curious.

Decision:

## 5. Run length

How long should one complete first-build run take?

Decision: ____ minutes

## 6. Failure and replay

What happens when the player fails?

Decision:

How quickly can they start again?

Decision:

---

# Part II - Platform and Delivery Boundary

## 7. First platform

Choose one primary target:

- [ ] Desktop browser, local development only
- [ ] Desktop browser, deployable website
- [ ] Mobile browser
- [ ] Desktop application
- [ ] Command-line prototype first
- [ ] Other: 

Decision:

## 8. Input method

- [ ] Mouse and keyboard
- [ ] Keyboard only
- [ ] Touch
- [ ] Gamepad
- [ ] Other: 

Decision:

## 9. Offline requirement

Must the first build work without an internet connection?

Decision:

## 10. Audience

Who must be able to run the first build?

- [ ] Only the creator
- [ ] Friends / testers
- [ ] General public
- [ ] Development team

Decision:

## 11. Existing codebase

Is there already a repository or application that this game must use?

Path or URL:

Decision:

---

# Part III - Player Mode versus Admin Mode

## 12. First build priority

Rank these from 1 to 4:

- ___ Admin generator
- ___ Playable hero dungeon run
- ___ Narrative presentation
- ___ Content authoring tools

## 13. Admin visibility

Should the creator see all hidden data during the first playable run?

Decision:

## 14. Admin/player separation

For the first build, should Admin Mode and Player Mode be:

- [ ] One screen with a debug toggle
- [ ] Two views in the same app
- [ ] Admin only; Player Mode deferred

Decision:

## 15. Content editing

What may be edited manually in the first build?

- [ ] Names
- [ ] Descriptions
- [ ] Stats
- [ ] Rooms
- [ ] Monsters
- [ ] Items
- [ ] Nothing; generation only

Decision:

---

# Part IV - Core Game Loop

## 16. Required loop

Select only the stages that must exist in the first playable version:

- [ ] Create hero
- [ ] Generate dungeon
- [ ] Enter room
- [ ] Inspect room
- [ ] Search
- [ ] Roll a check
- [ ] Fight a monster
- [ ] Avoid a trap
- [ ] Collect an ingredient
- [ ] Collect treasure
- [ ] Eat / manage hunger
- [ ] Craft a recipe
- [ ] Defeat a boss
- [ ] Escape
- [ ] Review run summary

Decision:

## 17. Movement model

- [ ] Linear sequence of rooms
- [ ] Branching room sequence
- [ ] Grid map
- [ ] Graph / node map
- [ ] Other: 

Decision:

## 18. Action model

How does the player choose an action?

- [ ] Buttons from a small fixed menu
- [ ] Cards
- [ ] Text commands
- [ ] Free-form interaction
- [ ] Other: 

Decision:

## 19. Randomness

Should the player see the seed and be able to reproduce a run?

Decision:

Should the player be able to reroll outcomes?

Decision:

---

# Part V - Rules Boundary

## 20. Rules complexity

Choose the intended first-build complexity:

- [ ] Very light: a few stats and simple success/failure
- [ ] Light RPG: stats, modifiers, HP, basic combat
- [ ] Traditional RPG: classes, equipment, abilities, conditions
- [ ] Other: 

Decision:

## 21. Dice

Which dice are required in the first build?

- [ ] d4
- [ ] d6
- [ ] d8
- [ ] d10
- [ ] d12
- [ ] d20
- [ ] d100

Decision:

## 22. Combat

Is combat required for the first playable version?

Decision:

If yes, what is the smallest acceptable combat loop?

```text
player action -> roll -> damage/effect -> enemy response -> repeat
```

Decision:

## 23. Hunger and Sweet Tooth

For the first game, are these:

- [ ] Active mechanics
- [ ] Display-only meters
- [ ] Flavor text only
- [ ] Deferred

Decision:

## 24. Recipes and ingredients

What is the first-build purpose of ingredients?

- [ ] Collectible objectives
- [ ] Healing / resource items
- [ ] Crafting inputs
- [ ] Score and run summary
- [ ] Lore only
- [ ] Deferred

Decision:

---

# Part VI - Content Boundary

## 25. First dungeon

Name the one dungeon that must exist first:

Decision:

## 26. Required content counts

Set the minimum acceptable content for the first playable build:

- Heroes/classes: 
- Races: 
- Dungeon themes: 
- Rooms per run: 
- Monster types: 
- Items: 
- Ingredients: 
- Bosses: 
- Recipes: 

## 27. Canonical hero

Which hero or archetype should represent the first game?

Decision:

## 28. Canonical monster

Which monster should represent the first game?

Decision:

## 29. Tone boundary

Choose the dominant tone:

- [ ] Mostly funny
- [ ] Funny with real danger
- [ ] Dark with comic relief
- [ ] Surreal and unsettling
- [ ] Other: 

Decision:

## 30. Content generation

For the first build, content is:

- [ ] Hand-authored tables only
- [ ] Hand-authored tables with procedural combinations
- [ ] AI-generated during development only
- [ ] AI-generated at runtime

Decision:

---

# Part VII - Narrative and NCE Boundary

## 31. Narrative role

How visible should the NCE meta-story be in the first game?

- [ ] Invisible system foundation
- [ ] Flavor text and interface framing
- [ ] Short opening and ending scenes
- [ ] Central story during the run

Decision:

## 32. Adam

In the first playable build, Adam is:

- [ ] The unseen creator
- [ ] The admin avatar
- [ ] A playable character
- [ ] A narrator
- [ ] Deferred

Decision:

## 33. Lore that must appear

Select only what is necessary for the first build:

- [ ] Adam
- [ ] The NCE
- [ ] The Hive
- [ ] Lilith
- [ ] John Mogi
- [ ] Shechinah
- [ ] The Fool
- [ ] The Magician
- [ ] Sugarbound mythology
- [ ] None beyond Dungeo

Decision:

## 34. Canon versus experiment

Which parts of the first build are binding canon, and which are experiments?

Canon:

Experiments:

---

# Part VIII - Technical Boundary

## 35. Technology

Confirm or replace the proposed stack:

- Front end: Next.js / React / TypeScript
- Styling: plain CSS or minimal component library
- Engine: pure TypeScript modules
- Persistence: none or browser local storage
- Database: deferred
- Deployment: deferred unless required

Decision:

## 36. Persistence

What must survive closing the browser?

- [ ] Nothing
- [ ] Last generated run
- [ ] Exported runs only
- [ ] Named saved runs
- [ ] Campaign progress

Decision:

## 37. Data format

What must be exportable?

- [ ] JSON
- [ ] Markdown
- [ ] CSV
- [ ] Screenshots
- [ ] Nothing

Decision:

## 38. Determinism

Required reproducibility level:

- [ ] Same seed gives broadly similar content
- [ ] Same seed gives identical run
- [ ] Same seed and version give identical run

Decision:

## 39. Testing threshold

What must pass before the first build is considered real?

- [ ] App boots
- [ ] One run generates
- [ ] Same seed reproduces
- [ ] Invalid data is rejected
- [ ] Export/import works
- [ ] A human can complete a run
- [ ] Other: 

Decision:

## 40. Performance boundary

Acceptable generation time for one run:

Decision: ____ seconds

Maximum acceptable complexity for the first implementation:

Decision:

---

# Part IX - Hard No List

These items cannot enter the first build unless explicitly restored:

- [ ] Multiplayer
- [ ] Accounts
- [ ] Online services
- [ ] AI runtime generation
- [ ] Full tarot system
- [ ] Infinite Dusk Nexus deck
- [ ] Multiple dimensions as gameplay systems
- [ ] Three-Adam branching
- [ ] Sugarbound as a second playable game
- [ ] Culinary Dungeon Master as a second playable game
- [ ] Procedural map graph
- [ ] Complex crafting
- [ ] Full narrative dialogue system
- [ ] Real-time combat
- [ ] 3D graphics
- [ ] Mobile support
- [ ] Other: 

Additional hard boundary:

---

# Part X - Final Production Contract

Complete this after the interview.

## First playable build

The first build will be called:

## The player will

## The player will not

## The game starts when

## The game ends when

## The one core mechanic is

## The one required content set is

## The first technical milestone is

## The build is successful when

## Deferred until after the first playable build

## Open risks

## Creator approval

Name:  
Date:  
Decision status: `DRAFT / APPROVED / REVISE`

---

# Agent Use Notes

After the creator answers this document, the next artifacts should be:

1. `game-production-contract.md` - the resolved decisions only.
2. `game-implementation-plan.md` - ordered engineering tasks.
3. `game-slice-01.md` - the first playable vertical slice.
4. A working codebase that implements only the approved boundary.

No feature should be added to the implementation plan merely because it exists in the lore bible or a previous GDD. It must be approved by the final production contract.
