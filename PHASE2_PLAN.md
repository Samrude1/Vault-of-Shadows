# Phase 2 Implementation Plan

This document outlines the implementation plan for additional features to enhance the Rogue game beyond the MVP.

## Overview

Phase 2 will add advanced features to create a more complete and engaging Rogue-like experience, including enhanced monster variety, field of view, advanced items, hunger system, traps, monster drops, and quality-of-life improvements.

## Features to Implement

### 1. Enhanced Monster Variety

**Goal**: Add more monster types with unique behaviors and stats.

**Implementation Details**:
- Add new monster types to `js/monster.js`:
  - **Bat** (b): Fast, weak, flies (can move through walls occasionally)
  - **Skeleton** (s): Medium health, immune to some damage, slower movement
  - **Goblin** (g): Fast, weak, runs away when low health
  - **Dragon** (D): Very strong, breathes fire (area damage), rare spawn
  - **Zombie** (z): Slow, high health, regenerates
- Create unique AI behaviors for each monster type
- Monster spawn rates should vary by dungeon depth
- Visual distinction: different colors/symbols

**Files to Modify**:
- `js/monster.js`: Add new monster types with custom stats and behaviors
- `js/game.js`: Update monster spawning logic for new types

**Estimated Complexity**: Medium

---

### 2. Field of View / Fog of War

**Goal**: Implement line-of-sight system where players can only see explored and visible areas.

**Implementation Details**:
- Add `explored` array to track visited tiles
- Add `visible` array to track currently visible tiles (within sight radius)
- Use raycasting or radius-based visibility check
- Render fog of war for unexplored areas (dark/black)
- Render dimmed version for explored but not currently visible areas
- Update visibility each turn based on player position
- Monsters/items only visible when in player's line of sight

**Files to Modify**:
- `js/dungeon.js`: Add explored/visible tracking methods
- `js/renderer.js`: Update rendering to show fog of war
- `js/game.js`: Update visibility calculations each turn

**Estimated Complexity**: High

---

### 3. Advanced Items

#### 3.1 Scrolls with Magical Effects

**Goal**: Add scroll items that provide magical effects when read.

**Implementation Details**:
- Create scroll item type in `js/item.js`
- Scroll types:
  - **Identify Scroll**: Reveals properties of unknown items
  - **Teleport Scroll**: Teleports player to random location on level
  - **Magic Missile Scroll**: Deals damage to nearby enemies
  - **Healing Scroll**: Restores health (alternative to potions)
  - **Enchantment Scroll**: Permanently improves weapon/armor
- Scrolls need to be "read" (use key like 'r' when standing on them)
- Some scrolls can have unknown effects until identified

**Files to Modify**:
- `js/item.js`: Add scroll item types and effects
- `js/game.js`: Add scroll reading logic
- `js/input.js`: Add 'r' key for reading scrolls

**Estimated Complexity**: Medium

#### 3.2 More Varied Weapons and Armor

**Goal**: Add variety to weapons and armor with different stats.

**Implementation Details**:
- Weapon types:
  - **Dagger** (+1 attack, faster)
  - **Sword** (+2 attack, balanced)
  - **Mace** (+2 attack, slower)
  - **Axe** (+3 attack, heavy)
  - **Magic Staff** (+2 attack, +1 defense)
- Armor types:
  - **Leather Armor** (+1 defense)
  - **Chain Mail** (+2 defense)
  - **Plate Armor** (+3 defense, slower movement)
  - **Magic Robes** (+2 defense, +1 attack)
- Items spawn with random variants
- Better items appear on deeper levels

**Files to Modify**:
- `js/item.js`: Add weapon and armor variants with different stats
- `js/game.js`: Update item generation to use variants

**Estimated Complexity**: Low

#### 3.3 Item Identification System

**Goal**: Some potions and scrolls are unidentified until used or identified.

**Implementation Details**:
- Potions/scrolls spawn with random "cursed" or "unknown" status
- Unknown items show as "Potion (unknown)" or "Scroll (unknown)"
- Using an unknown item reveals its type
- Identify scroll can reveal item properties
- Add inventory system to show collected unidentified items
- Once identified, items are remembered across playthroughs (optional: save to localStorage)

**Files to Modify**:
- `js/item.js`: Add identification system, unknown item handling
- `js/game.js`: Update item pickup/use to handle identification
- `js/renderer.js`: Display unknown item names differently

**Estimated Complexity**: Medium

---

### 4. Hunger System

**Goal**: Add hunger mechanic where player must eat food or lose health.

**Implementation Details**:
- Add `hunger` stat to player (0-100, decreases over time)
- Add food items (rations, bread, etc.) that restore hunger
- Player loses health when hunger reaches 0 (starvation damage each turn)
- Hunger decreases every N turns (configurable)
- Food spawns in dungeon
- Show hunger level in UI
- Visual indicator when hunger is low (yellow/red)

**Files to Modify**:
- `js/player.js`: Add hunger stat and starvation logic
- `js/item.js`: Add food item types
- `js/game.js`: Update hunger each turn, spawn food items
- `js/renderer.js` or `index.html`: Add hunger display to UI

**Estimated Complexity**: Medium

---

### 5. Traps and Special Rooms

**Goal**: Add traps and special room types to increase dungeon variety.

**Implementation Details**:
- Trap types:
  - **Pit Trap**: Deals damage when stepped on
  - **Arrow Trap**: Fires arrows (damage) in a direction
  - **Poison Trap**: Applies poison effect (damage over time)
  - **Teleport Trap**: Teleports player to random location
- Traps are hidden until triggered
- Some traps can be detected (higher skill/level = better detection)
- Special room types:
  - **Treasure Room**: Contains multiple valuable items, guarded
  - **Trap Room**: Multiple traps, but may have good loot
  - **Monster Nest**: High monster density
  - **Library**: Contains scrolls
  - **Armory**: Contains weapons/armor

**Files to Modify**:
- `js/dungeon.js`: Add trap placement and special room generation
- `js/game.js`: Add trap triggering logic, special room detection
- `js/renderer.js`: Show trap indicators when detected

**Estimated Complexity**: High

---

### 6. Enhanced Win Condition

**Goal**: Player must return to the surface (level 1) after retrieving the Amulet.

**Implementation Details**:
- Add stairs UP (<) on each level (except level 1)
- Track if player has the Amulet
- Allow ascending levels
- Win condition: player on level 1 with Amulet
- Add message when Amulet is retrieved: "You feel a pull back to the surface..."
- Monsters become more aggressive when player has Amulet
- Amulet shows on player visually (or status indicator)

**Files to Modify**:
- `js/dungeon.js`: Add stairs up generation
- `js/game.js`: Add ascending logic, enhanced win condition, Amulet tracking
- `js/renderer.js`: Show Amulet indicator if player has it

**Estimated Complexity**: Medium

---

### 7. Monster Drops

**Goal**: Monsters drop gold and items when killed.

**Implementation Details**:
- Add gold item type (represented as $ or G)
- Monsters drop gold on death (amount varies by monster type)
- Rare chance for monsters to drop items (weapons, potions, etc.)
- Stronger monsters drop more gold and better items
- Gold can be used for future shop system (Phase 3)
- Track gold in player stats
- Show gold count in UI

**Files to Modify**:
- `js/item.js`: Add gold item type
- `js/player.js`: Add gold stat
- `js/game.js`: Add drop logic when monsters die
- `js/monster.js`: Define drop tables for each monster type
- `js/renderer.js` or `index.html`: Add gold display

**Estimated Complexity**: Low

---

### 8. Sound Options

**Goal**: Add volume controls and sound toggle options.

**Implementation Details**:
- Add settings UI (button or menu)
- Volume slider (0-100%)
- Mute/unmute toggle
- Save preferences to localStorage
- Settings accessible from pause menu or in-game
- Visual feedback for settings changes

**Files to Modify**:
- `js/sound.js`: Add volume control, mute functionality
- `index.html`: Add settings UI elements
- `css/style.css`: Style settings menu
- `js/game.js`: Add settings menu handling, localStorage persistence

**Estimated Complexity**: Low

---

## Implementation Order

Recommended order for implementing features:

1. **Monster Drops** (Low complexity, adds immediate value)
2. **More Varied Weapons and Armor** (Low complexity, enhances existing system)
3. **Sound Options** (Low complexity, QoL improvement)
4. **Enhanced Monster Variety** (Medium complexity, significant gameplay impact)
5. **Scrolls with Magical Effects** (Medium complexity, adds variety)
6. **Hunger System** (Medium complexity, adds challenge)
7. **Enhanced Win Condition** (Medium complexity, improves game flow)
8. **Item Identification System** (Medium complexity, adds depth)
9. **Field of View / Fog of War** (High complexity, major visual change)
10. **Traps and Special Rooms** (High complexity, adds variety)

## Technical Considerations

- **Performance**: Fog of war and field of view may impact rendering performance. Consider optimization techniques.
- **Balancing**: New features need playtesting to ensure game balance isn't broken.
- **Save System**: Consider adding save/load functionality for identified items (localStorage).
- **Backwards Compatibility**: Ensure existing saves work with new features (if save system is added).

## Testing Requirements

- Test each new monster type's AI behavior
- Verify fog of war rendering performance
- Test item identification and memory
- Balance hunger system timing
- Test trap detection and triggering
- Verify win condition works correctly
- Test monster drop rates and amounts
- Verify sound settings persistence

## Future Considerations (Phase 3)

- Shop system (use gold to buy items)
- Character classes (Warrior, Mage, Rogue with different stats)
- Experience and leveling system
- Multiple save slots
- Seed-based dungeon generation (reproducible dungeons)
- Achievements system

---

**Note**: This plan is flexible and can be adjusted based on development priorities and player feedback.

