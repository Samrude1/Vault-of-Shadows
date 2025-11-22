# Vault Of Shadows - Dungeon Crawler Game

A web-based implementation of the classic Rogue dungeon crawling game, built with HTML5 Canvas and vanilla JavaScript.

## About

This is a modern web implementation of Rogue, the classic dungeon crawling video game originally developed by Michael Toy and Glenn Wichman around 1980. Players explore procedurally generated dungeons, battle monsters, collect treasures, and seek the legendary Amulet of Yendor.

## Current Development Phase: Phase 1 (MVP) + Phase 2 Features - ✅ Complete

The game has completed its MVP (Minimum Viable Product) phase and includes many Phase 2 features. The game is fully playable with all core features implemented and functional.

### Implemented Features

- **Procedural Dungeon Generation**: Random room-and-corridor algorithm generates unique dungeons for each playthrough
- **Turn-Based Gameplay**: Grid-based movement with turn-based combat system
- **Player System**: 
  - Movement with WASD or arrow keys (including diagonal movement)
  - Health system with visual health bar
  - Combat stats (attack and defense)
- **Monster AI**: 
  - Eight monster types with unique behaviors:
    - Kobolds, Orcs, Trolls (original monsters)
    - Bats (can fly through walls)
    - Skeletons (slow but tough)
    - Goblins (flee when injured)
    - Dragons (powerful boss with area damage)
    - Zombies (regenerate health)
  - Intelligent AI that moves toward and attacks the player
  - Depth-based spawning: harder monsters appear on deeper levels
  - Random spawning throughout all dungeon rooms
- **Combat System**: 
  - Turn-based melee combat
  - Damage calculation based on attack and defense stats
  - Counterattacks during combat
- **Item System**: 
  - Health potions (restore health)
  - Varied weapons: Dagger (+1), Sword (+2), Mace (+2), Axe (+3), Magic Staff (+2 attack, +1 defense)
  - Varied armor: Leather (+1), Chain Mail (+2), Plate (+3), Magic Robes (+1 attack, +2 defense)
  - Gold currency (dropped by monsters)
  - Amulet of Yendor (win condition)
- **Multiple Levels**: Descend deeper into the dungeon via stairs (> symbol)
- **Win Condition**: Retrieve the Amulet of Yendor found on level 5
- **Permadeath**: No saves or reloads - death means starting over
- **User Interface**: 
  - Health display with color-coded status (green > 60%, yellow > 30%, red otherwise)
  - Level/depth counter showing current dungeon level
  - Gold counter tracking collected treasure
  - Game message log showing combat, item pickup, and event messages
  - Game over screen (death) and victory screen (retrieved Amulet)
  - Restart button to begin a new game
  - Sound settings panel with volume control and mute toggle
- **Sound System**: 
  - Procedurally generated sound effects using Web Audio API
  - Audio feedback for movement, combat, items, and events
  - Volume control and mute toggle in settings panel
  - Settings saved to localStorage
  - No external audio files required
- **Monster Drops**:
  - Monsters drop gold when killed (amount varies by monster type)
  - Chance to drop items (weapons, armor, potions)
  - Stronger monsters drop more gold and better items
- **Hunger System**:
  - Hunger stat (0-100) decreases over time
  - Starvation damage when hunger reaches 0
  - Food items (Rations, Bread) restore hunger
  - Color-coded hunger display in UI
- **Scrolls with Magical Effects**:
  - 4 scroll types with unique magical effects
  - Teleportation, Magic Missile, Healing, Enchantment
  - Scrolls spawn randomly in dungeons
  - One-time use with powerful effects

## How to Play

1. Open `index.html` in a web browser
2. Use **WASD** or **arrow keys** to move your character (@)
3. Use **Q, E, Z, C** for diagonal movement
4. Press **Space** to wait/skip a turn
5. Walk into monsters to attack them
6. Walk over items to automatically pick them up
7. Manage your hunger by eating food (% symbol)
8. Use stairs down (>) to descend deeper into the dungeon
9. Use stairs up (<) to ascend to previous levels
10. Find the **Amulet of Yendor** on level 5
11. Return to level 1 with the Amulet to win!

### Controls

- **Movement**: WASD or Arrow Keys (↑↓←→)
  - W / ↑ : Move up
  - S / ↓ : Move down
  - A / ← : Move left
  - D / → : Move right
- **Diagonal Movement**: Q, E, Z, C
  - Q: Up-left
  - E: Up-right
  - Z: Down-left
  - C: Down-right
- **Actions**: 
  - Space: Wait/skip a turn (useful for letting monsters move first)

### Game Mechanics

- **Turn-Based Gameplay**: Each action (move, wait, attack) takes one turn. After you act, all monsters move and can attack.
- **Combat**: Moving into a monster triggers combat. Both you and the monster attack each other in the same turn. Damage is calculated based on your attack vs their defense (and vice versa).
- **Items**: Stepping on an item automatically picks it up and uses it:
  - Health Potions (!): Restore 10 health (up to max health)
  - Weapons (/): Various types with different attack bonuses
  - Armor (]): Various types with different defense bonuses
  - Food (%): Rations and Bread restore hunger
  - Scrolls (?): Magical one-time use items
  - Amulet of Yendor ("): Win condition item!
- **Monsters**: 
  - **Kobolds (k)**: Weak enemies (5 HP, 2 attack, 1 defense) - Common on early levels
  - **Bats (b)**: Fast, weak flyers (3 HP, 3 attack, 0 defense) - Can occasionally fly through walls
  - **Goblins (g)**: Cowardly hoarders (6 HP, 2 attack, 1 defense) - Flee when health drops below 30%
  - **Skeletons (s)**: Slow but tough (8 HP, 3 attack, 2 defense) - Move every other turn
  - **Orcs (o)**: Medium enemies (10 HP, 4 attack, 2 defense) - Common on mid levels
  - **Zombies (z)**: Regenerating undead (15 HP, 4 attack, 1 defense) - Regenerate 1 HP per turn
  - **Trolls (T)**: Strong enemies (20 HP, 6 attack, 3 defense) - Common on deep levels
  - **Dragons (D)**: Powerful bosses (40 HP, 10 attack, 5 defense) - Area damage, rare on deep levels
  - Monster difficulty and variety increase with dungeon depth
  - All monsters drop gold and may drop items when killed
- **Dungeon Levels**: 
  - Each level is procedurally generated with rooms and corridors
  - Stairs down (>) descend to the next level
  - Stairs up (<) ascend to the previous level (not on level 1)
  - More monsters spawn on deeper levels
  - Amulet of Yendor appears on level 5
- **Hunger**: 
  - Hunger decreases by 1 every 10 turns
  - At 0 hunger, you take 1 damage per turn (starvation)
  - Eat food (%) to restore hunger
- **Scrolls**: 
  - Teleportation: Random teleport to safe location
  - Magic Missile: 10 damage to all enemies within 3 tiles
  - Healing: Restore 15 HP
  - Enchantment: +1 attack and +1 defense permanently
- **Win Condition**: Find the Amulet of Yendor on level 5, then return to level 1 to escape the dungeon and win!
- **Death**: When your health reaches 0, the game ends with permadeath. Click "Restart Game" to start fresh - no saves or checkpoints!

## Technical Details

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Rendering**: HTML5 Canvas API
- **Audio**: Web Audio API (procedurally generated sounds)
- **Architecture**: Modular JavaScript classes
- **No dependencies**: Pure vanilla JavaScript, no frameworks or libraries
- **No external assets**: All graphics and sounds are procedurally generated

### Project Structure
```
rogue/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Game styling
├── js/
│   ├── game.js         # Main game loop, state management, and combat system
│   ├── dungeon.js      # Procedural dungeon generation (room-and-corridor)
│   ├── player.js       # Player character class with stats and combat
│   ├── monster.js      # Monster class with AI and multiple monster types
│   ├── item.js         # Item system (potions, weapons, armor, amulet)
│   ├── renderer.js     # Canvas rendering with ASCII-style graphics
│   ├── input.js        # Keyboard input handling (movement and wait)
│   └── sound.js        # Sound system with Web Audio API for game audio feedback
├── README.md           # This file
└── README_info.md      # Information about the original Rogue game
```

### Key Classes

- **Game**: Main game controller managing game state, turns, and game loop
- **DungeonGenerator**: Creates procedurally generated dungeons using room-and-corridor algorithm
- **Player**: Player character with stats, movement, and combat methods
- **Monster**: Monster entities with AI behavior and combat stats
- **Item**: Collectible items with various effects
- **Renderer**: Handles all canvas drawing and rendering
- **InputHandler**: Manages keyboard input, movement commands, and wait action
- **SoundManager**: Generates procedural sound effects for game events (movement, combat, items, etc.)

## Recent Updates

### Phase 2 Features - Recently Implemented

- **Enhanced Monster Variety**: Added 5 new monster types with unique behaviors:
  - Bats that can fly through walls
  - Skeletons with slow movement
  - Goblins that flee when injured
  - Dragons with area damage attacks
  - Zombies that regenerate health
  - Depth-based spawning system ensures appropriate difficulty scaling

- **Monster Drops**: Monsters now drop gold and items when killed:
  - All monsters drop gold (amount varies by type)
  - Chance to drop weapons, armor, or potions
  - Dragons drop 50-100 gold with 50% item drop rate

- **Varied Weapons and Armor**: Multiple equipment types with different stats:
  - Weapons: Dagger, Sword, Mace, Axe, Magic Staff
  - Armor: Leather Armor, Chain Mail, Plate Armor, Magic Robes
  - Better items spawn on deeper levels

- **Sound Options**: Added settings panel with:
  - Volume slider (0-100%)
  - Mute/unmute toggle
  - Settings saved to localStorage

- **Hunger System**: Added survival mechanic:
  - Hunger stat decreases every 10 turns
  - Starvation damage when hunger reaches 0
  - Food items (Rations, Bread) restore hunger
  - Color-coded hunger display

- **Scrolls with Magical Effects**: Added 4 magical scroll types:
  - Teleportation scroll (random teleport)
  - Magic Missile scroll (area damage)
  - Healing scroll (restore 15 HP)
  - Enchantment scroll (+1 attack & defense)
  - Scrolls spawn 1-2 per level

- **Enhanced Win Condition**: Improved endgame:
  - Added stairs up (<) on all levels except level 1
  - Players can now ascend to previous levels
  - Must return to level 1 with Amulet to win
  - Extended gameplay with return journey

### Previous Updates

- **Fixed Enemy Spawning**: Monsters spawn randomly throughout all rooms and corridors
- **Added Sound System**: Complete audio feedback using Web Audio API (procedurally generated)

## Future Development (Phase 2 - Remaining)

Planned enhancements for future versions:

- **Field of View / Fog of War**: Visible vs explored areas
- **Advanced Items**: 
  - Item identification system for unknown potions/scrolls
- **Traps and Special Rooms**: More dungeon variety

## Original Rogue

For information about the original Rogue game, see README_ABOUT.md.

---

**Enjoy your dungeon crawl!** May you survive long enough to retrieve the Amulet of Yendor.

