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
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
        return this.health <= 0;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    isAlive() {
        return this.health > 0;
    }

    attackTarget(target) {
        const damage = Math.max(1, this.attack - target.defense + Math.floor(Math.random() * 3));
        return target.takeDamage(damage);
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
        // Scaling formula: 50 + (level * 30)
        // Level 1→2: 80 XP
        // Level 2→3: 110 XP
        // Level 3→4: 140 XP
        return 50 + (level * 30);
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
}



