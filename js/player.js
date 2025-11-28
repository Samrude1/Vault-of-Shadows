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
            haste: { active: false, duration: 0 }
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
        // Dodge chance: 5% per defense point, max 30%
        const dodgeChance = Math.min(this.defense * 0.05, 0.30);
        const dodged = Math.random() < dodgeChance;

        if (dodged) {
            return { killed: false, dodged: true, damage: 0 };
        }

        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
        return { killed: this.health <= 0, dodged: false, damage: amount };
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
        const baseDamage = Math.max(
            1,
            damageRoll + this.attack - target.defense
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
        // Exponential Curve: 50 * (1.15 ^ Level)
        // Level 1: 57 XP
        // Level 5: 100 XP
        // Level 10: 202 XP
        // Level 20: 818 XP
        return Math.floor(50 * Math.pow(1.15, level));
    }

    gainXP(amount) {
        this.xp += amount;

        // Check for level up
        while (this.xp >= this.xpToNextLevel && this.level < 15) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = this.getXPForNextLevel(this.level);

        // Level-up bonuses
        // +2 max HP and heal 2 HP
        this.maxHealth += 2;
        this.health = Math.min(this.health + 2, this.maxHealth);

        // Alternate between +1 ATK and +1 DEF
        if (this.level % 2 === 0) {
            this.attack += 1;
        } else {
            this.defense += 1;
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



