# Vault Of Shadows - Dungeon Crawler Game

**Version 3.1** - Phase 3 Complete: Mechanics Overhaul & Balance Fixes

## About

Vault of Shadows is a reimagining of the classic 1980 Rogue game, built with HTML5 Canvas and vanilla JavaScript. It combines the strategic gameplay of the original with a **modern mobile-game aesthetic**, featuring procedural graphics, atmospheric lighting, and a sleek user interface.

![Vault of Shadows - Gameplay Screenshot](screenshot.png?v3)
_Explore dark dungeons, fight monsters, and descend into the infinite depths._

## New Features (v3.1 - Balance & Scaling) - ✅ Complete
- **Removed Level Cap**: Players can now level up to 100 (was capped at 15).
- **Increased Stat Gains**: +3 HP, +1 Attack, +1 Defense per level (was +2 HP, +0.5 Atk/Def).
- **Percentage Bonuses**: Every 10 levels, gain +10% Max HP and +5% Attack/Defense.
- **Equipment Scaling**: Weapons and armor found on deeper levels have bonus stats.
- **Adjusted XP Curve**: Smoother progression for endless mode (1.12 exponent, was 1.15).
- **Bug Fixes**: Resolved critical "NaN" stat errors caused by item scaling logic in deep dungeon levels.

## Features (v3.0 - Mechanics Overhaul) - ✅ Complete
- **Exponential XP Curve**: Leveling becomes progressively harder, preventing "god mode" in late game.
- **Dynamic Monster Scaling**: Monsters gain %-based stats per level to remain dangerous deep in the dungeon.
- **Monster Tiers**: Face off against **Veteran**, **Elite**, and **Champion** variants of enemies with unique stats and rewards.

## Features (v2.4 - Phase 2 Update) - ✅ Complete

The game has been significantly expanded with deep RPG mechanics and unique content:

### 👹 Boss Encounters
Face off against powerful bosses every few levels, each with unique abilities and AI:
- **Kobold King (Lvl 3)**: Summons minions when injured.
- **Orc Warlord (Lvl 6)**: Enrages at low health for massive damage.
- **Lich (Lvl 9)**: Teleports and raises the dead.
- **Amulet Guardian (Lvl 10)**: Protects the Amulet with a magical shield.
- **Ancient Dragon (Lvl 12)**: Breathes fire in a large area.

### ⚔️ Enhanced Combat
- **Critical Hits**: 10% chance to deal double damage with screen shake and flash effects 💥.
- **Dodge System**: High defense allows you to completely avoid attacks ⚡.
- **Status Effects**:
  - **Poison** 💚: Damage over time.
  - **Burn** 🔥: Heavy damage over time.
  - **Stun** 💫: Skip turns.
  - **Haste** ⏩: Move at double speed (15 turns).
  - **Strength** 💪: +50% Attack damage (10 turns).
  - **Shield** 🛡️: +50% Defense (10 turns).

### 📜 Expanded Magic & Potions
**10 unique scroll types** with improved effectiveness:
- **Fireball**: Deal area damage in a 3-tile radius.
- **Freeze**: Stun groups of enemies for 5 turns.
- **Summoning**: Call a Spirit ally that attacks all nearby enemies for 20 damage each.
- **Mapping**: Reveal the entire floor.
- **Identify**: Reveal all items on the floor, even through fog of war.
- **Haste**: Double speed for 15 turns.
- **Teleport**, **Healing**, **Enchantment**, and more!

**New Carryable Potions**:
- **Shield Potion**: +50% Defense for 10 turns.
- **Strength Potion**: +50% Attack for 10 turns.

### 🏰 Special Rooms
Discover unique locations in the dungeon:
- **Treasure Rooms**: Guarded by elites, filled with loot.
- **Monster Nests**: Dangerous swarms of enemies protecting gold.
- **Shrines**: Restore full health and grant permanent stat boosts.
- **Libraries**: Archives containing powerful magical scrolls.
- **Trap Rooms**: High risk, high reward.

### 🛒 Shop System
- **Dynamic Pricing**: Items scale with dungeon level.
- **Level-Appropriate Gear**: Shop offers Sword/Chain Mail at early levels, upgrading to Magic Staff/Robes in deeper dungeons.
- **Removed Weak Items**: Dagger and Leather Armor no longer sold (too weak for shop prices).

### 🎨 Visual & Audio Polish
- **Procedural Wall Colors**: Every 3 levels features a unique color scheme (levels 1-3 are classic gray).
- **Critical Hit Effects**: Screen shake and color flash on critical hits.
- **Enhanced Sound**: Unique sound effect for critical hits.

---

## Visual Features (v2.3)

- **Modern Mobile Aesthetic**: Vibrant colors, glassmorphism UI, and smooth animations.
- **Advanced Procedural Graphics**: 3D walls, tiled floors, and token-based entities.
- **Atmospheric Lighting**: High-contrast Fog of War and deep shadows.

## How to Play

1. **Move**: Use **WASD** or **Arrow Keys**.
2. **Diagonal**: Use **Q, E, Z, C**.
3. **Wait**: Press **Space** to skip a turn (let enemies come to you).
4. **Interact**:
   - Walk into monsters to **Attack**.
   - Walk over items to **Pick Up**.
   - Press **B** on a Shop tile (`⌂`) to **Buy**.
   - Use Stairs Down (`▼`) to go deeper.
   - Use Stairs Up (`▲`) to go back.
5. **Win**: Find the **Amulet of Yendor** (`"`) on **Level 10** and return to the surface!

### Legend

- **@** : Player
- **k, o, T, D** : Enemies
- **👑, 💀, 🐉** : Bosses
- **!** : Potion
- **/** : Weapon
- **]** : Armor
- **?** : Scroll
- **%** : Food
- **$** : Gold
- **⌂** : Shop
- **▼** : Stairs Down
- **▲** : Stairs Up
- **"** : Amulet of Yendor

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Rendering**: Custom HTML5 Canvas rendering engine (no external image assets).
- **Audio**: Web Audio API for procedurally generated sound effects.
- **No Dependencies**: 100% Vanilla JavaScript.

### Project Structure (Refactored)

The codebase has been modularized for better maintainability:

```
rogue/
├── index.html          # Main entry point
├── css/
│   └── style.css       # Modern styling and glassmorphism effects
├── js/
│   ├── game.js         # Core game loop
│   ├── GameCombat.js   # Combat logic, Boss AI, XP system
│   ├── GameRooms.js    # Special room generation
│   ├── GameShop.js     # Shop logic and pricing
│   ├── GameUI.js       # UI updates and message log
│   ├── dungeon.js      # Procedural generation algorithms
│   ├── renderer.js     # Advanced canvas drawing
│   ├── player.js       # Player logic
│   ├── monster.js      # Monster AI and types
│   ├── item.js         # Item systems
│   ├── input.js        # Input handling
│   ├── sound.js        # Procedural audio
│   └── utils.js        # Utility functions
└── README.md           # This file
```

---

**Enjoy the dungeon!** Watch out for the Kobold King on Level 3...
