class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.maxHealth = 20;
        this.health = 20;
        this.attack = 4;
        this.defense = 2;
        this.symbol = '@';
        this.color = '#06b6d4'; // Bright cyan - hero color
        this.gold = 0;

        // Hunger system
        this.maxHunger = 100;
        this.hunger = 100;

        // XP and Leveling system
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = this.getXPForNextLevel(1);

        // Status effects system
        this.statusEffects = {
            poison: { active: false, duration: 0 },
            burn: { active: false, duration: 0 },
            stun: { active: false, duration: 0 },
            haste: { active: false, duration: 0 },
            strength: { active: false, duration: 0 },
            shield: { active: false, duration: 0 }
        };

        // Equipment slots
        this.equipment = {
            weapon: null,
            armor: null
        };

        // Inventory: Can hold 1 item (scroll or consumable)
        this.inventory = null; // Stores item type (e.g., 'scroll_fireball')
    }

    addGold(amount) {
        this.gold += amount;
    }

    move(dx, dy, dungeon) {
        const newX = this.x + dx;
        const newY = this.y + dy;

        if (dungeon.isWalkable(newX, newY)) {
            this.x = newX;
            this.y = newY;
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        // Apply shield buff (increase defense effectively)
        let effectiveDefense = this.defense;
        if (this.statusEffects.shield.active) {
            effectiveDefense += Math.max(1, Math.floor(this.defense * 0.5)); // +50%
        }

        // Dodge chance: 5% per defense point, max 30%
        const dodgeChance = Math.min(effectiveDefense * 0.05, 0.30);
        const dodged = Math.random() < dodgeChance;

        if (dodged) {
            return { killed: false, dodged: true, damage: 0 };
        }

        // Armor Penetration: 10% of raw damage always penetrates
        // This prevents becoming invincible with high defense
        const rawDamage = amount;
        const minDamage = Math.ceil(rawDamage * 0.10);

        let damage = Math.max(minDamage, rawDamage - effectiveDefense);

        // Ensure damage controls don't go below 0 (though minDamage handles this mostly)
        damage = Math.max(0, damage);

        this.health -= damage;
        if (this.health < 0) {
            this.health = 0;
        }
        return { killed: this.health <= 0, dodged: false, damage: damage };
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    isAlive() {
        return this.health > 0;
    }

    // Player.js: attackTarget() - NOPPAVERSIO

    attackTarget(target) {
        // 1. Nopanheitto: Ase/Perusvahinko on nyt 1d6 (tulos 1-6)
        // HUOM: Kutsuu suoraan staattista Utils.rollDice()
        const damageRoll = Utils.rollDice(1, 6);

        // 2. Laske perusvahinko: Nopan tulos + Attack-bonus - Kohteen Defense
        let attackPower = this.attack;
        if (this.statusEffects.strength.active) {
            attackPower += Math.max(1, Math.floor(this.attack * 0.5)); // +50%
        }

        const baseDamage = Math.max(
            1,
            damageRoll + attackPower - target.defense
        );

        // Critical hit: 10% chance for 2x damage
        const isCrit = Math.random() < 0.10;
        const damage = isCrit ? baseDamage * 2 : baseDamage;

        // Vahingon kohdistaminen. target on tässä hirviö.
        const result = target.takeDamage(damage);

        // Tämän logiikan pitäisi nyt olla turvallinen (korjattu insta-death ongelma)
        const actualDamage = result.dodged ? 0 : damage;

        console.log(`Player attacks for ${damage} damage (crit: ${isCrit})`);

        return {
            killed: result.killed, // Nyt turvallisesti boolean-arvo
            damage: actualDamage,  // 0, jos väisti
            isCrit: isCrit,
            dodged: result.dodged || false // Oletetaan, että hirviö ei väistä, mutta turvallisuuden vuoksi tarkistetaan
        };
    }

    decreaseHunger(amount) {
        this.hunger -= amount;
        if (this.hunger < 0) {
            this.hunger = 0;
        }
    }

    eat(amount) {
        this.hunger = Math.min(this.hunger + amount, this.maxHunger);
    }

    isStarving() {
        return this.hunger === 0;
    }

    getHungerStatus() {
        const hungerPercent = this.hunger / this.maxHunger;
        if (hungerPercent > 0.6) {
            return 'well-fed';
        } else if (hungerPercent > 0.3) {
            return 'hungry';
        } else if (hungerPercent > 0) {
            return 'starving';
        } else {
            return 'critical';
        }
    }

    // XP and Leveling methods
    getXPForNextLevel(level) {
        // Exponential Curve: 50 * (1.12 ^ Level)
        // Adjusted from 1.15 to 1.12 for more reasonable progression in endless mode
        // Level 1: 56 XP
        // Level 5: 88 XP
        // Level 10: 155 XP
        // Level 20: 481 XP
        // Level 30: 1,497 XP
        // Level 50: 14,542 XP
        return Math.floor(50 * Math.pow(1.12, level));
    }

    gainXP(amount) {
        this.xp += amount;

        // Check for level up (cap at 100 for endless mode)
        while (this.xp >= this.xpToNextLevel && this.level < 100) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = this.getXPForNextLevel(this.level);

        // Level-up bonuses (increased for endless mode balance)
        // +3 max HP and heal 3 HP
        this.maxHealth += 3;
        this.health = Math.min(this.health + 3, this.maxHealth);

        // +1 ATK and +1 DEF every level (no more alternating)
        this.attack += 1;
        this.defense += 1;

        // Percentage bonus every 10 levels for scaling
        if (this.level % 10 === 0) {
            const hpBonus = Math.floor(this.maxHealth * 0.1); // +10% HP
            const statBonus = Math.floor(this.attack * 0.05); // +5% stats

            this.maxHealth += hpBonus;
            this.health = Math.min(this.health + hpBonus, this.maxHealth);
            this.attack += Math.max(1, statBonus);
            this.defense += Math.max(1, statBonus);
        }

        return true; // Signal that level up occurred
    }

    // Status effect methods
    applyStatusEffect(type, duration) {
        if (this.statusEffects[type]) {
            this.statusEffects[type] = { active: true, duration: duration };
        }
    }

    processStatusEffects() {
        const messages = [];

        // Process poison: -1 HP per turn for 5 turns
        if (this.statusEffects.poison.active) {
            this.health = Math.max(0, this.health - 1);
            this.statusEffects.poison.duration--;
            messages.push({ type: 'poison', damage: 1 });
            if (this.statusEffects.poison.duration <= 0) {
                this.statusEffects.poison.active = false;
                messages.push({ type: 'poison_end' });
            }
        }

        // Process burn: -2 HP per turn for 3 turns
        if (this.statusEffects.burn.active) {
            this.health = Math.max(0, this.health - 2);
            this.statusEffects.burn.duration--;
            messages.push({ type: 'burn', damage: 2 });
            if (this.statusEffects.burn.duration <= 0) {
                this.statusEffects.burn.active = false;
                messages.push({ type: 'burn_end' });
            }
        }

        // Stun is handled in game loop (prevents player action)
        if (this.statusEffects.stun.active) {
            this.statusEffects.stun.duration--;
            if (this.statusEffects.stun.duration <= 0) {
                this.statusEffects.stun.active = false;
                messages.push({ type: 'stun_end' });
            }
        }

        // Haste is handled in game loop (double speed)
        if (this.statusEffects.haste.active) {
            this.statusEffects.haste.duration--;
            if (this.statusEffects.haste.duration <= 0) {
                this.statusEffects.haste.active = false;
                messages.push({ type: 'haste_end' });
            }
        }

        // Strength buff
        if (this.statusEffects.strength.active) {
            this.statusEffects.strength.duration--;
            if (this.statusEffects.strength.duration <= 0) {
                this.statusEffects.strength.active = false;
                messages.push({ type: 'strength_end' });
            }
        }

        // Shield buff
        if (this.statusEffects.shield.active) {
            this.statusEffects.shield.duration--;
            if (this.statusEffects.shield.duration <= 0) {
                this.statusEffects.shield.active = false;
                messages.push({ type: 'shield_end' });
            }
        }

        return messages;
    }

    isStunned() {
        return this.statusEffects.stun.active;
    }

    isHasted() {
        return this.statusEffects.haste.active;
    }

    hasActiveStatusEffects() {
        return this.statusEffects.poison.active ||
            this.statusEffects.burn.active ||
            this.statusEffects.stun.active ||
            this.statusEffects.haste.active;
    }

    equipWeapon(itemData) {
        // Remove old weapon stats
        if (this.equipment.weapon) {
            this.attack -= this.equipment.weapon.attackBonus;
            this.defense -= this.equipment.weapon.defenseBonus;
        }

        // Equip new weapon
        this.equipment.weapon = itemData;
        this.attack += itemData.attackBonus;
        this.defense += itemData.defenseBonus;
    }

    equipArmor(itemData) {
        // Remove old armor stats
        if (this.equipment.armor) {
            this.defense -= this.equipment.armor.defenseBonus;
            this.attack -= this.equipment.armor.attackBonus;
        }

        // Equip new armor
        this.equipment.armor = itemData;
        this.defense += itemData.defenseBonus;
        this.attack += itemData.attackBonus;
    }
}



