class Monster {
    constructor(x, y, type = 'kobold') {
        this.x = x;
        this.y = y;
        this.type = type;

        // Monster stats based on type
        const stats = Monster.getStats(type);
        this.maxHealth = stats.health;
        this.health = stats.health;
        this.attack = stats.attack;
        this.defense = stats.defense;
        this.symbol = stats.symbol;
        this.color = stats.color;
        this.name = stats.name;
        this.speed = stats.speed || 1;

        // Special abilities
        this.canFly = stats.canFly || false;
        this.fleeThreshold = stats.fleeThreshold || 0;
        this.areaDamage = stats.areaDamage || false;
        this.regeneration = stats.regeneration || 0;

        // Turn counter for slow monsters (skeletons)
        this.turnCounter = 0;
    }

    static getStats(type) {
        const types = {
            kobold: {
                name: 'Kobold',
                health: 5,
                attack: 2,
                defense: 1,
                symbol: 'k',
                color: '#ffa500',
                speed: 1
            },
            orc: {
                name: 'Orc',
                health: 10,
                attack: 4,
                defense: 2,
                symbol: 'o',
                color: '#00ff00',
                speed: 1
            },
            troll: {
                name: 'Troll',
                health: 20,
                attack: 6,
                defense: 3,
                symbol: 'T',
                color: '#800080',
                speed: 1
            },
            bat: {
                name: 'Bat',
                health: 3,
                attack: 3,
                defense: 0,
                symbol: 'b',
                color: '#696969',
                speed: 1,
                canFly: true
            },
            skeleton: {
                name: 'Skeleton',
                health: 8,
                attack: 3,
                defense: 2,
                symbol: 's',
                color: '#ffffff',
                speed: 0.5 // Moves every other turn
            },
            goblin: {
                name: 'Goblin',
                health: 6,
                attack: 2,
                defense: 1,
                symbol: 'g',
                color: '#32cd32',
                speed: 1,
                fleeThreshold: 0.3 // Flees when health below 30%
            },
            dragon: {
                name: 'Dragon',
                health: 40,
                attack: 10,
                defense: 5,
                symbol: 'D',
                color: '#ff4500',
                speed: 1,
                areaDamage: true
            },
            zombie: {
                name: 'Zombie',
                health: 15,
                attack: 4,
                defense: 1,
                symbol: 'z',
                color: '#98fb98',
                speed: 1,
                regeneration: 1 // Regenerates 1 HP per turn
            }
        };
        return types[type] || types.kobold;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
        return this.health <= 0;
    }

    attackTarget(target) {
        const damage = Math.max(1, this.attack - target.defense + Math.floor(Math.random() * 3));
        return target.takeDamage(damage);
    }

    isAlive() {
        return this.health > 0;
    }

    static getDropTable(type) {
        const dropTables = {
            kobold: {
                goldMin: 5,
                goldMax: 10,
                itemChance: 0.10, // 10% chance
                possibleItems: ['health_potion', 'dagger']
            },
            orc: {
                goldMin: 10,
                goldMax: 20,
                itemChance: 0.15, // 15% chance
                possibleItems: ['health_potion', 'sword', 'mace', 'leather_armor']
            },
            troll: {
                goldMin: 20,
                goldMax: 40,
                itemChance: 0.25, // 25% chance
                possibleItems: ['axe', 'magic_staff', 'chain_mail', 'plate_armor', 'health_potion']
            },
            bat: {
                goldMin: 3,
                goldMax: 8,
                itemChance: 0.05, // 5% chance
                possibleItems: ['health_potion']
            },
            skeleton: {
                goldMin: 8,
                goldMax: 15,
                itemChance: 0.12, // 12% chance
                possibleItems: ['health_potion', 'sword', 'leather_armor', 'chain_mail']
            },
            goblin: {
                goldMin: 5,
                goldMax: 12,
                itemChance: 0.15, // 15% chance (hoarders)
                possibleItems: ['health_potion', 'dagger', 'sword', 'leather_armor']
            },
            dragon: {
                goldMin: 50,
                goldMax: 100,
                itemChance: 0.50, // 50% chance (guaranteed good loot)
                possibleItems: ['axe', 'magic_staff', 'plate_armor', 'magic_robes', 'health_potion']
            },
            zombie: {
                goldMin: 10,
                goldMax: 20,
                itemChance: 0.10, // 10% chance
                possibleItems: ['health_potion', 'mace', 'chain_mail']
            }
        };
        return dropTables[type] || dropTables.kobold;
    }

    generateDrops() {
        const dropTable = Monster.getDropTable(this.type);
        const drops = [];

        // Always drop gold
        const goldAmount = Math.floor(Math.random() * (dropTable.goldMax - dropTable.goldMin + 1)) + dropTable.goldMin;
        drops.push({
            type: 'gold',
            value: goldAmount
        });

        // Chance to drop an item
        if (Math.random() < dropTable.itemChance) {
            const itemType = dropTable.possibleItems[Math.floor(Math.random() * dropTable.possibleItems.length)];
            drops.push({
                type: itemType,
                value: null
            });
        }

        return drops;
    }

    // AI: move towards player with unique behaviors per monster type
    act(player, dungeon, monsters) {
        // Skeleton: only moves every other turn (slow movement)
        if (this.type === 'skeleton') {
            this.turnCounter++;
            if (this.turnCounter % 2 === 1) {
                return; // Skip this turn
            }
        }

        // Goblin: flee if health is below threshold
        if (this.type === 'goblin' && this.fleeThreshold > 0) {
            const healthPercent = this.health / this.maxHealth;
            if (healthPercent < this.fleeThreshold) {
                this.flee(player, dungeon, monsters);
                return;
            }
        }

        const dx = Math.sign(player.x - this.x);
        const dy = Math.sign(player.y - this.y);

        // Check distance to player
        const distX = Math.abs(player.x - this.x);
        const distY = Math.abs(player.y - this.y);

        // If close to player, move towards them
        if (distX <= 5 && distY <= 5) {
            let moveX = 0;
            let moveY = 0;

            if (distX > distY) {
                moveX = dx;
            } else if (distY > distX) {
                moveY = dy;
            } else {
                // Equal distance, prefer horizontal
                moveX = dx;
            }

            // Try to move
            const newX = this.x + moveX;
            const newY = this.y + moveY;

            // Bat: can occasionally fly through walls
            if (this.canFly && Math.random() < 0.2) {
                // 20% chance to fly through walls
                const occupied = monsters.some(m => m !== this && m.x === newX && m.y === newY && m.isAlive());
                if (!occupied && (newX !== player.x || newY !== player.y)) {
                    this.x = newX;
                    this.y = newY;
                    return;
                }
            }

            // Normal movement (check walkability)
            if (dungeon.isWalkable(newX, newY)) {
                const occupied = monsters.some(m => m !== this && m.x === newX && m.y === newY && m.isAlive());
                if (!occupied && (newX !== player.x || newY !== player.y)) {
                    this.x = newX;
                    this.y = newY;
                    return;
                }
            }
        } else {
            // Random movement when far from player
            const directions = [
                [-1, -1], [0, -1], [1, -1],
                [-1, 0], [1, 0],
                [-1, 1], [0, 1], [1, 1]
            ];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const newX = this.x + dir[0];
            const newY = this.y + dir[1];

            if (dungeon.isWalkable(newX, newY)) {
                const occupied = monsters.some(m => m !== this && m.x === newX && m.y === newY && m.isAlive());
                if (!occupied && (newX !== player.x || newY !== player.y)) {
                    this.x = newX;
                    this.y = newY;
                }
            }
        }
    }

    // Goblin flee behavior
    flee(player, dungeon, monsters) {
        // Move away from player
        const dx = Math.sign(this.x - player.x); // Reversed direction
        const dy = Math.sign(this.y - player.y);

        let moveX = 0;
        let moveY = 0;

        const distX = Math.abs(player.x - this.x);
        const distY = Math.abs(player.y - this.y);

        if (distX > distY) {
            moveX = dx;
        } else if (distY > distX) {
            moveY = dy;
        } else {
            moveX = dx;
        }

        const newX = this.x + moveX;
        const newY = this.y + moveY;

        if (dungeon.isWalkable(newX, newY)) {
            const occupied = monsters.some(m => m !== this && m.x === newX && m.y === newY && m.isAlive());
            if (!occupied && (newX !== player.x || newY !== player.y)) {
                this.x = newX;
                this.y = newY;
            }
        }
    }

    // Zombie regeneration (called each turn)
    regenerate() {
        if (this.regeneration > 0 && this.health < this.maxHealth) {
            this.health = Math.min(this.health + this.regeneration, this.maxHealth);
        }
    }
}


