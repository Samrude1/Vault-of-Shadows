# Vault Of Shadows - Dungeon Crawler Game

**Version 2.4** - Phase 2 Complete: Bosses, Special Rooms, and Enhanced Combat!

## About

Vault of Shadows is a reimagining of the classic 1980 Rogue game, built with HTML5 Canvas and vanilla JavaScript. It combines the strategic gameplay of the original with a **modern mobile-game aesthetic**, featuring procedural graphics, atmospheric lighting, and a sleek user interface.

![Vault of Shadows - Gameplay Screenshot](screenshot.png?v3)
_Explore dark dungeons, fight monsters, and find the Amulet of Yendor._

## New Features (v2.4 - Phase 2 Update) - ✅ Complete

The game has been significantly expanded with deep RPG mechanics and unique content:

### 👹 Boss Encounters
Face off against powerful bosses every few levels, each with unique abilities and AI:
- **Kobold King (Lvl 3)**: Summons minions when injured.
- **Orc Warlord (Lvl 6)**: Enrages at low health for massive damage.
- **Lich (Lvl 9)**: Teleports and raises the dead.
- **Amulet Guardian (Lvl 10)**: Protects the Amulet with a magical shield.
- **Ancient Dragon (Lvl 12)**: Breathes fire in a large area.

### ⚔️ Enhanced Combat
- **Critical Hits**: 10% chance to deal double damage 💥.
- **Dodge System**: High defense allows you to completely avoid attacks ⚡.
- **Status Effects**:
  - **Poison** 💚: Damage over time.
  - **Burn** 🔥: Heavy damage over time.
  - **Stun** 💫: Skip turns.
  - **Haste** ⏩: Move at double speed.

### 🏰 Special Rooms
Discover unique locations in the dungeon:
- **Treasure Rooms**: Guarded by elites, filled with loot.
- **Monster Nests**: Dangerous swarms of enemies protecting gold.
- **Shrines**: Restore full health and grant permanent stat boosts.
- **Libraries**: Archives containing powerful magical scrolls.
- **Trap Rooms**: High risk, high reward.

### 📜 Expanded Magic
10 unique scroll types to master:
- **Fireball**: Deal area damage.
- **Freeze**: Stun groups of enemies.
- **Summoning**: Call a Spirit ally to fight for you.
- **Mapping**: Reveal the entire floor.
- **Teleport**, **Identify**, **Haste**, and more!

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
│   ├── game.js         # Core game loop and UI
│   ├── GameCombat.js   # Combat logic, Boss AI, XP system
│   ├── GameRooms.js    # Special room generation
│   ├── dungeon.js      # Procedural generation algorithms
│   ├── renderer.js     # Advanced canvas drawing
│   ├── player.js       # Player logic
│   ├── monster.js      # Monster AI and types
│   ├── item.js         # Item systems
│   ├── input.js        # Input handling
│   └── sound.js        # Procedural audio
└── README.md           # This file
```

---

**Enjoy the dungeon!** Watch out for the Kobold King on Level 3...
