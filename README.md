# Vault Of Shadows - Dungeon Crawler Game

**Version 2.3** - A modern, visually polished web implementation of the classic Rogue dungeon crawler.

## About

Vault of Shadows is a reimagining of the classic 1980 Rogue game, built with HTML5 Canvas and vanilla JavaScript. It combines the strategic gameplay of the original with a **modern mobile-game aesthetic**, featuring procedural graphics, atmospheric lighting, and a sleek user interface.

![Vault of Shadows - Gameplay Screenshot](screenshot.png?v2)
_Explore dark dungeons, fight monsters, and find the Amulet of Yendor._

## Current Development Phase: Visual Overhaul (v2.3) - ✅ Complete

The game has undergone a complete visual transformation. While the core mechanics remain faithful to the rogue-like genre, the presentation has been modernized to provide a more immersive and accessible experience.

### New Visual Features (v2.3)

- **Modern Mobile Aesthetic**:

  - Vibrant, cartoon-style color palette inspired by modern mobile games.
  - **Glassmorphism UI**: Sleek, semi-transparent panels with blur effects for stats, messages, and controls.
  - Smooth CSS animations for UI interactions.

- **Advanced Procedural Graphics**:

  - **3D Walls**: Procedurally drawn walls with depth, highlights, and brick patterns.
  - **Tiled Floors**: Subtle grid patterns for clean navigation.
  - **Token-Based Entities**: Player, monsters, and items are rendered as polished "tokens" with shadows, borders, and gloss effects.

- **Atmospheric Lighting**:

  - **High-Contrast Fog of War**: Explored areas are dimmed to 20% brightness, creating a dramatic "dark corridor" feel.
  - **Deep Backgrounds**: Pitch-black unexplored areas emphasize isolation.
  - **Pop-out Visibility**: Entities use high-contrast borders to remain clearly visible against the dark dungeon.

- **Enhanced User Interface**:
  - **Icon Legend**: A helpful legend at the bottom of the screen explains key map symbols (Shop, Stairs, Amulet).
  - **Clear Typography**: Uses modern fonts ("Lilita One" for headers, "Nunito" for text) for better readability.
  - **Simplified Controls**: Intuitive control panel and mute toggle.

### Core Gameplay Features

- **Procedural Dungeon Generation**: Every run is unique with random rooms, corridors, and monster placement.
- **Turn-Based Combat**: Tactical grid-based combat. Move into enemies to attack.
- **Deep Progression**:
  - **Level Up**: Descend deeper into the dungeon (infinite levels).
  - **Difficulty Scaling**: Monsters get tougher and new types appear as you go deeper (Dragons at Level 7+!).
  - **Economy**: Collect gold to spend at shops (one per level).
- **Survival Mechanics**:
  - **Hunger**: Manage your food supply to avoid starvation.
  - **Permadeath**: Death is final. No saves.
- **Items & Equipment**:
  - Potions, Scrolls (Teleport, Magic Missile, etc.), Weapons, and Armor.
  - **Amulet of Yendor**: The ultimate goal, located on Level 5.

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
5. **Win**: Find the **Amulet of Yendor** (`"`) on Level 5 and return to Level 1!

### Legend

- **@** : Player
- **k, o, T, D** : Enemies (Kobold, Orc, Troll, Dragon, etc.)
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

### Project Structure

```
rogue/
├── index.html          # Main entry point
├── css/
│   └── style.css       # Modern styling and glassmorphism effects
├── js/
│   ├── game.js         # Game loop and state management
│   ├── dungeon.js      # Procedural generation algorithms
│   ├── renderer.js     # Advanced canvas drawing (walls, tokens, lighting)
│   ├── player.js       # Player logic
│   ├── monster.js      # Monster AI and types
│   ├── item.js         # Item systems
│   ├── input.js        # Input handling
│   └── sound.js        # Procedural audio
└── README.md           # This file
```

---

**Enjoy the dungeon!** Watch out for the Dragons on Level 7...
