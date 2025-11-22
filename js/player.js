class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.maxHealth = 20;
        this.health = 20;
        this.attack = 4;
        this.defense = 2;
        this.symbol = '@';
        this.color = '#fff';
        this.gold = 0;

        // Hunger system
        this.maxHunger = 100;
        this.hunger = 100;
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
}


