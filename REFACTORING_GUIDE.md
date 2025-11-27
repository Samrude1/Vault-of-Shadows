# Game.js Refactoring Guide

## Overview
The game.js file has been split into modular components for better maintainability.

## New Module Files Created:
1. **GameCombat.js** - Combat and monster-related methods
2. **GameRooms.js** - Special room handling

## Methods Moved to GameCombat.js:
- `monsterTurn()`
- `isBossLevel(level)`
- `spawnBoss(level)`
- `handleBossAbilities(monster)`
- `spawnMinions(boss, type, count)`
- `selectMonsterType(level)`
- `getXPForMonster(monsterType)`

## Methods Moved to GameRooms.js:
- `populateSpecialRooms()`
- `getRandomPosInRoom(room)`

## Changes Needed in game.js:

### 1. Add module initialization in constructor:
```javascript
constructor() {
    // ... existing code ...
    
    // Initialize modules
    this.combat = new GameCombat(this);
    this.rooms = new GameRooms(this);
    
    this.init();
}
```

### 2. Update method calls:
- `this.monsterTurn()` → `this.combat.monsterTurn()`
- `this.isBossLevel()` → `this.combat.isBossLevel()`
- `this.spawnBoss()` → `this.combat.spawnBoss()`
- `this.selectMonsterType()` → `this.combat.selectMonsterType()`
- `this.getXPForMonster()` → `this.combat.getXPForMonster()`
- `this.populateSpecialRooms()` → `this.rooms.populateSpecialRooms()`

### 3. Remove these methods from game.js:
All methods listed above under "Methods Moved"

## Benefits:
- Reduced game.js from ~1400 lines to ~900 lines
- Better code organization
- Easier to maintain and test
- Clear separation of concerns
