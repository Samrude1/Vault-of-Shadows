# Inventory System Implementation

## Overview
Added a simple 1-item inventory system to make scrolls and consumables more strategic. Players can now hold one item at a time and use it when needed with the **U** key.

## Features

### 1. Inventory Slot
- **Capacity**: 1 item (scroll or consumable)
- **Display**: Shows in stats UI as "Item: [Item Name]" or "Item: Empty"
- **Color coding**: 
  - Gold (#fbbf24) when holding an item
  - Gray (#94a3b8) when empty

### 2. Controls
- **U Key**: Use the item currently in inventory
- Triggers scroll effects and consumes the item
- Monsters get a turn after using an item

### 3. Picking Up Scrolls
- **From ground**: Scrolls are added to inventory instead of being used immediately
- **From shop**: Purchased scrolls go directly to inventory
- **Full inventory**: Cannot pick up or buy scrolls when inventory is full
  - Message: "Inventory full! Use your current item first (Press U)."

### 4. Shop Integration
- Scrolls purchased from shop go to inventory
- Shop prevents buying scrolls when inventory is full
- Purchase message includes reminder: "Press U to use"

## UI Changes

### Stats Bar (index.html)
Added new stat display:
```html
<div class="stat">
    <label>Item:</label>
    <span id="inventory">Empty</span>
</div>
```

### Controls Info
Added to controls:
```
Use Item: U
```

## Code Changes

### Files Modified:
1. **js/player.js**: Added `inventory` property to Player class
2. **js/input.js**: Added `isUseItem()` method for U key detection
3. **js/GameUI.js**: Added inventory display update
4. **js/GameShop.js**: Modified to add scrolls to inventory
5. **js/game.js**: 
   - Added `useInventoryItem()` method
   - Modified item pickup to add scrolls to inventory
   - Added U key handler in `handleInput()`
6. **index.html**: Added inventory UI element and control info

## Gameplay Impact

### Strategic Depth
- Players must decide **when** to use scrolls, not just **if**
- Can save powerful scrolls (Fireball, Freeze) for boss fights
- Utility scrolls (Teleport, Haste) can be kept for emergencies

### Shop Value
- Scrolls are now actually useful purchases
- Players can buy scrolls before entering dangerous areas
- Creates meaningful gold spending decisions

### Inventory Management
- Simple 1-slot system keeps it accessible
- Forces players to prioritize which scroll to keep
- No complex inventory UI needed

## Example Flow

1. **Buy scroll**: "Purchased Scroll of Fireball for 70 gold! Press U to use."
2. **Inventory shows**: "Item: Scroll of Fireball" (in gold color)
3. **Player explores**, keeping the scroll for a tough fight
4. **Encounters boss**, presses **U**
5. **Scroll activates**: Fireball effect triggers, inventory clears
6. **Can pick up new scroll** from ground or shop

## Benefits Over Previous System

### Before:
- ❌ Scrolls used immediately on pickup (useless in cleared shop rooms)
- ❌ No strategic timing
- ❌ Shop scrolls were pointless purchases

### After:
- ✅ Scrolls saved for strategic moments
- ✅ Shop scrolls are valuable purchases
- ✅ Adds tactical depth without complexity
- ✅ Simple, intuitive 1-slot system
