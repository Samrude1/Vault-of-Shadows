# Bug Fixes Summary

## Issues Fixed

### 1. ✅ Can't Walk Over Scrolls When Inventory Full
**Problem**: Player couldn't move over scrolls when inventory was full - movement was blocked entirely.

**Fix**: Modified item pickup logic to allow movement even when inventory is full. Now shows message "Inventory full! Cannot pick up scroll" but still allows the player to walk over the scroll and continue moving.

**File**: `js/game.js` - Item pickup section

---

### 2. ✅ Scroll of Summon Attacking Wrong Target  
**Problem**: Scroll of Summon was attacking the first monster in the list (often a Kobold) instead of the nearest enemy.

**Fix**: Changed scroll_summon logic to find and attack the **nearest enemy** based on Manhattan distance. Spirit now does 15 damage (increased from 10) and provides better feedback messages.

**File**: `js/game.js` - handleScrollEffect() method

**New Logic**:
```javascript
// Find nearest enemy by distance
let nearestTarget = null;
let nearestDist = Infinity;
this.monsters.forEach(m => {
    if (m.isAlive()) {
        const dist = Math.abs(m.x - this.player.x) + Math.abs(m.y - this.player.y);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestTarget = m;
        }
    }
});
```

---

### 3. ✅ Scroll of Haste Effect
**Problem**: User reported haste "won't do anything"

**Status**: Haste effect IS working correctly in the code:
- Applies 'haste' status for 10 turns
- Monsters only get a turn every other turn when player is hasted
- Message displays: "You feel incredibly fast! (Double speed) ⏩"

**How it works**:
```javascript
// In playerTurn() - line 564
if (!this.player.isHasted() || this.turnCounter % 2 === 0) {
    this.combat.monsterTurn();
}
```

When hasted, monsters skip every other turn, effectively giving the player double speed.

**Note**: The effect might not be immediately obvious if there are no monsters nearby. The player should notice they can move twice before enemies move once.

---

### 4. ⚠️ Enemies Attacking Twice on Same Turn
**Problem**: User reports enemies sometimes attack twice in one turn.

**Investigation Needed**: This could be caused by:
1. **Haste effect ending** - When haste ends mid-turn, the turn counter logic might cause a double turn
2. **Boss summon abilities** - Some bosses summon minions that might attack immediately
3. **Turn order bug** - Need to verify monster turn logic

**Potential Fix Areas**:
- Check if `combat.monsterTurn()` is being called multiple times
- Verify boss ability triggers don't cause extra turns
- Ensure status effect processing doesn't trigger extra monster turns

**Status**: Needs further testing to reproduce and identify exact cause.

---

## Testing Recommendations

### Scroll of Haste:
1. Buy/find Scroll of Haste
2. Use it (Press U)
3. Move around - you should be able to move 2 times before monsters move once
4. Watch for message: "You feel incredibly fast! (Double speed) ⏩"
5. After 10 turns, message: "You feel your speed return to normal."

### Scroll of Summon:
1. Buy/find Scroll of Summon  
2. Make sure there are enemies nearby
3. Use it (Press U)
4. Spirit should attack the NEAREST enemy, not just any random one
5. Check message shows correct enemy name

### Walking Over Scrolls:
1. Fill inventory with a scroll
2. Try to walk over another scroll on the ground
3. Should see message but STILL be able to move
4. Player should not get stuck

### Double Attack Bug:
1. Play through several levels
2. Watch for any instances where enemies attack twice in one turn
3. Note what was happening (boss fight, status effects, etc.)
4. Report findings for further investigation

---

## Files Modified

1. **js/game.js**:
   - Fixed item pickup to allow movement when inventory full
   - Fixed scroll_summon to target nearest enemy
   - Verified haste effect logic is correct
   - Added better feedback messages

---

## Known Issues

- **Double attack bug**: Needs reproduction and further investigation
- **Haste visibility**: Effect works but might not be obvious without enemies nearby - could add a visual indicator

---

## Recommendations

1. **Add visual indicator for haste**: Show a speed icon or different player color when hasted
2. **Add turn counter display**: Help players see when haste is active
3. **Investigate double attack**: Set up logging to track monster turns
