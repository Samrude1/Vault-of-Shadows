# Changelog

All notable changes to the **Vault of Shadows** project will be documented in this file.

## [v3.2.2] - Deployment Fixes & Combat Rebalancing
- **Combat Rebalanced**: Adjusted scaling to make mid-game tougher. Player Defense/Attack scaling slowed, Monster HP/Attack scaling increased.
- **ESM Migration**: Fully refactored to use ES Modules for better code organization and modern tooling support.
- **Vite Build System**: Now uses Vite for lightning-fast development, bundling, and minification.
- **Itch.io Ready**: Fixed deployment issues (absolute paths) to ensure smooth hosting on itch.io.
- **Bug Fixes**: Resolved issues with invisible monsters, double attacks, and missing imports.

## [v3.2] - Combat Rebalance
- **Recursive Monster Scaling**: Monsters now gain compounding stats (+20% HP, +1.2 Atk, +0.8 Def per level) to match player power.
- **Armor Penetration (Chip Damage)**: 10% of all damage now penetrates armor, preventing players from becoming invincible.
- **Improved Balance**: Level 10+ is now significantly more challenging.

## [v3.1] - Infinite Scaling
- **Removed Level Cap**: Players can now level up to 100 (was capped at 15).
- **Increased Stat Gains**: +3 HP, +1 Attack, +1 Defense per level.
- **Percentage Bonuses**: Every 10 levels, gain +10% Max HP and +5% Attack/Defense.
- **Equipment Scaling**: Weapons and armor found on deeper levels have bonus stats.
- **Adjusted XP Curve**: Smoother progression for endless mode.

## [v3.0] - Mechanics Overhaul
- **Exponential XP Curve**: Leveling becomes progressively harder, preventing "god mode" in late game.
- **Dynamic Monster Scaling**: Monsters gain %-based stats per level to remain dangerous deep in the dungeon.
- **Monster Tiers**: Face off against **Veteran**, **Elite**, and **Champion** variants of enemies with unique stats and rewards.

## [v2.4] - Phase 2 Update
The game has been significantly expanded with deep RPG mechanics and unique content:

### Boss Encounters
Face off against powerful bosses every few levels, each with unique abilities and AI:
- **Kobold King (Lvl 3)**: Summons minions when injured.
- **Orc Warlord (Lvl 6)**: Enrages at low health for massive damage.
- **Lich (Lvl 9)**: Teleports and raises the dead.
- **Amulet Guardian (Lvl 10)**: Protects the Amulet with a magical shield.
- **Ancient Dragon (Lvl 12)**: Breathes fire in a large area.

### Enhanced Combat
- **Critical Hits**: 10% chance to deal double damage with screen shake and flash effects 💥.
- **Dodge System**: High defense allows you to completely avoid attacks ⚡.
- **Status Effects**:
  - **Poison** 💚: Damage over time.
  - **Burn** 🔥: Heavy damage over time.
  - **Stun** 💫: Skip turns.
  - **Haste** ⏩: Move at double speed (15 turns).
  - **Strength** 💪: +50% Attack damage (10 turns).
  - **Shield** 🛡️: +50% Defense (10 turns).

### Expanded Magic & Potions
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

### Special Rooms
Discover unique locations in the dungeon:
- **Treasure Rooms**: Guarded by elites, filled with loot.
- **Monster Nests**: Dangerous swarms of enemies protecting gold.
- **Shrines**: Restore full health and grant permanent stat boosts.
- **Libraries**: Archives containing powerful magical scrolls.
- **Trap Rooms**: High risk, high reward.

### Shop System
- **Dynamic Pricing**: Items scale with dungeon level.
- **Level-Appropriate Gear**: Shop offers Sword/Chain Mail at early levels, upgrading to Magic Staff/Robes in deeper dungeons.
- **Removed Weak Items**: Dagger and Leather Armor no longer sold (too weak for shop prices).

### Visual & Audio Polish
- **Procedural Wall Colors**: Every 3 levels features a unique color scheme (levels 1-3 are classic gray).
- **Critical Hit Effects**: Screen shake and color flash on critical hits.
- **Enhanced Sound**: Unique sound effect for critical hits.

## [v2.3] - Visual Features
- **Modern Mobile Aesthetic**: Vibrant colors, glassmorphism UI, and smooth animations.
- **Advanced Procedural Graphics**: 3D walls, tiled floors, and token-based entities.
- **Atmospheric Lighting**: High-contrast Fog of War and deep shadows.
