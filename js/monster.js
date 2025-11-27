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
        this.areaRadius = stats.areaRadius || 0;
        this.areaDamageAmount = stats.areaDamageAmount || 0;
        this.regeneration = stats.regeneration || 0;

        // Boss-specific properties
        this.isBoss = stats.isBoss || false;
        this.summonType = stats.summonType || null;
        this.summonThreshold = stats.summonThreshold || 0;
        this.summonCount = stats.summonCount || 0;
        this.hasSummoned = false; // Track if boss has summoned
        this.enrageThreshold = stats.enrageThreshold || 0;
        this.enrageBonus = stats.enrageBonus || 0;
        this.isEnraged = false;
        this.summonInterval = stats.summonInterval || 0;
        this.teleportChance = stats.teleportChance || 0;
        this.shieldTurns = stats.shieldTurns || false;
        this.shieldActive = false;

        // Turn counter for slow monsters (skeletons) and boss abilities
        this.turnCounter = 0;
        this.stunned = 0;
    }

    static getStats(type) {
        const types = {
            kobold: {
                name: 'Kobold',
                health: 5,
                attack: 2,
                defense: 1,
                symbol: 'k',
                color: '#fbbf24', // Bright gold/yellow
                speed: 1
            },
            orc: {
                name: 'Orc',
                health: 10,
                attack: 4,
                defense: 2,
                symbol: 'o',
                color: '#10b981', // Vibrant green
                speed: 1
            },
            troll: {
                name: 'Troll',
                health: 20,
                attack: 6,
                defense: 3,
                symbol: 'T',
                color: '#a855f7', // Purple
                speed: 1
            },
            bat: {
                name: 'Bat',
                health: 3,
                attack: 3,
                defense: 0,
                symbol: 'b',
                color: '#8b5cf6', // Light purple
                speed: 1,
                canFly: true
            },
            skeleton: {
                name: 'Skeleton',
                health: 8,
                attack: 3,
                defense: 2,
                symbol: 's',
                color: '#f0f9ff', // Bright white/cyan
                speed: 0.5 // Moves every other turn
            },
            goblin: {
                name: 'Goblin',
                health: 6,
                attack: 2,
                defense: 1,
                symbol: 'g',
                color: '#22c55e', // Lime green
                speed: 1,
                fleeThreshold: 0.3 // Flees when health below 30%
            },
            dragon: {
                name: 'Dragon',
                health: 40,
                attack: 10,
                defense: 5,
                symbol: 'D',
                color: '#ef4444', // Bright red
                speed: 1,
                areaDamage: true
            },
            zombie: {
                name: 'Zombie',
                health: 15,
                attack: 4,
                defense: 1,
                symbol: 'z',
                color: '#84cc16', // Lime/yellow-green
                speed: 1,
                regeneration: 1 // Regenerates 1 HP per turn
            },
            // BOSS MONSTERS
            kobold_king: {
                name: 'Kobold King',
                health: 30,
                attack: 5,
                defense: 2,
                symbol: 'K',
                color: '#f59e0b', // Orange
                speed: 1,
                isBoss: true,
                summonType: 'kobold',
                summonThreshold: 0.5, // Summons at 50% HP
                summonCount: 2
            },
            orc_warlord: {
                name: 'Orc Warlord',
                health: 50,
                attack: 8,
                defense: 4,
                symbol: 'O',
                color: '#dc2626', // Red
                speed: 1,
                isBoss: true,
                enrageThreshold: 0.3, // Enrages at 30% HP
                enrageBonus: 2
            },
            lich: {
                name: 'Lich',
                health: 60,
                attack: 10,
                defense: 3,
                symbol: 'L',
                color: '#8b5cf6', // Purple
                speed: 1,
                isBoss: true,
                summonType: 'skeleton',
                summonInterval: 3, // Summons every 3 turns
                summonCount: 2,
                teleportChance: 0.2 // 20% chance to teleport when hit
            },
            amulet_guardian: {
                name: 'Amulet Guardian',
                health: 80,
                attack: 12,
                defense: 5,
                symbol: 'G',
                color: '#fbbf24', // Gold
                speed: 1,
                isBoss: true,
                shieldTurns: true // Shield every other turn
            },
            ancient_dragon: {
                name: 'Ancient Dragon',
                health: 100,
                attack: 15,
                defense: 6,
                symbol: 'Ð',
                color: '#dc2626', // Dark red
                speed: 1,
                isBoss: true,
                canFly: true,
                areaDamage: true,
                areaRadius: 3,
                areaDamageAmount: 5
            }
        };
        return types[type] || types.kobold;
    }

    takeDamage(amount) {
        // Boss shield: Amulet Guardian reduces damage by 50% when shield is active
        if (this.type === 'amulet_guardian' && this.shieldActive) {
            amount = Math.floor(amount * 0.5);
        }

        // Lich teleport: 20% chance to teleport when hit
        if (this.type === 'lich' && this.teleportChance > 0) {
            if (Math.random() < this.teleportChance) {
                this.shouldTeleport = true; // Signal to game.js
            }
        }

        // Check for boss summon threshold (Kobold King)
        if (this.type === 'kobold_king' && !this.hasSummoned && this.summonThreshold > 0) {
            const healthPercent = this.health / this.maxHealth;
            if (healthPercent < this.summonThreshold) {
                this.hasSummoned = true;
                this.shouldSummon = true; // Signal to game.js
            }
        }

        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }

        return {
            killed: this.health <= 0,
            dodged: false,
            damage: amount
        };
    }

    attackTarget(target) {
        let attackPower = this.attack; // Käytetään bonusvahinkona

        // 1. Nopanheitto: Laske perusvahinko esim. 1d4 (1-4)
        // TÄMÄ RIVI KORVAA VANHAN:
        const damageRoll = Utils.rollDice(1, 4);

        // 2. Laske todellinen perusvahinko: Nopan tulos + Attack-bonus - Defense
        const baseDamage = Math.max(
            1,
            damageRoll + attackPower - target.defense
        );

        // Critical hit: 10% chance for 2x damage
        const isCrit = Math.random() < 0.10;
        const damage = isCrit ? baseDamage * 2 : baseDamage;

        // Vahingon kohdistaminen
        const result = target.takeDamage(damage);

        // Tulosten käsittely
        const actualKilled = result.killed;
        const actualDamage = result.dodged ? 0 : damage;

        // Status effects (ei muutoksia tässä osassa)
        let statusEffect = null;

        // ... (Zombie, Troll, Dragon jne. logiikka) ...

        // Status effects
        // Zombie: 30% chance to poison on hit
        if (this.type === 'zombie' && Math.random() < 0.30) {
            statusEffect = { type: 'poison', duration: 5 };
        }

        // Troll: 20% chance to stun on hit
        if (this.type === 'troll' && Math.random() < 0.20) {
            statusEffect = { type: 'stun', duration: 1 };
        }

        // Dragon: burn on hit (if area damage is active, handled separately)
        if (this.type === 'dragon' && Math.random() < 0.40) {
            statusEffect = { type: 'burn', duration: 3 };
        }

        // Ancient Dragon: burn on hit
        if (this.type === 'ancient_dragon' && Math.random() < 0.50) {
            statusEffect = { type: 'burn', duration: 3 };
        }

        console.log(`Monster attacks for ${damage} damage (crit: ${isCrit})`);

        return {
            killed: actualKilled,
            damage: actualDamage,
            isCrit: isCrit,
            dodged: result.dodged || false,
            statusEffect: statusEffect
        };
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
            },
            // BOSS DROP TABLES
            kobold_king: {
                goldMin: 100,
                goldMax: 150,
                itemChance: 1.0, // 100% guaranteed
                possibleItems: ['sword', 'chain_mail']
            },
            orc_warlord: {
                goldMin: 150,
                goldMax: 200,
                itemChance: 1.0, // 100% guaranteed
                possibleItems: ['axe', 'plate_armor']
            },
            lich: {
                goldMin: 200,
                goldMax: 300,
                itemChance: 1.0, // 100% guaranteed
                possibleItems: ['magic_staff', 'magic_robes', 'scroll_fireball', 'scroll_freeze']
            },
            amulet_guardian: {
                goldMin: 250,
                goldMax: 400,
                itemChance: 1.0, // 100% guaranteed - drops Amulet
                possibleItems: ['amulet'] // Special case
            },
            ancient_dragon: {
                goldMin: 300,
                goldMax: 500,
                itemChance: 1.0, // 100% guaranteed
                possibleItems: ['axe', 'magic_staff', 'plate_armor', 'magic_robes']
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
        if (this.stunned > 0) {
            this.stunned--;
            return; // Skip turn
        }

        // Increment turn counter for boss abilities
        this.turnCounter++;

        // Boss AI: Always aggressive, always pursues player
        if (this.isBoss) {
            // Orc Warlord: Enrage when health is low
            if (this.type === 'orc_warlord' && !this.isEnraged && this.enrageThreshold > 0) {
                const healthPercent = this.health / this.maxHealth;
                if (healthPercent < this.enrageThreshold) {
                    this.isEnraged = true;
                    this.attack += this.enrageBonus;
                    // Return a signal that the boss enraged (will be handled in game.js)
                    this.justEnraged = true;
                }
            }

            // Amulet Guardian: Toggle shield every other turn
            if (this.type === 'amulet_guardian' && this.shieldTurns) {
                this.shieldActive = (this.turnCounter % 2 === 0);
            }

            // Lich: Summon skeletons every N turns
            if (this.type === 'lich' && this.summonInterval > 0) {
                if (this.turnCounter % this.summonInterval === 0) {
                    this.shouldSummon = true; // Signal to game.js to spawn minions
                }
            }

            // Bosses always move towards player (no random movement)
            const dx = Math.sign(player.x - this.x);
            const dy = Math.sign(player.y - this.y);

            const distX = Math.abs(player.x - this.x);
            const distY = Math.abs(player.y - this.y);

            let moveX = 0;
            let moveY = 0;

            if (distX > distY) {
                moveX = dx;
            } else if (distY > distX) {
                moveY = dy;
            } else {
                moveX = dx;
            }

            const newX = this.x + moveX;
            const newY = this.y + moveY;

            // Ancient Dragon can fly through walls
            if (this.canFly && Math.random() < 0.3) {
                const occupied = monsters.some(m => m !== this && m.x === newX && m.y === newY && m.isAlive());
                if (!occupied && (newX !== player.x || newY !== player.y)) {
                    this.x = newX;
                    this.y = newY;
                    return;
                }
            }

            // Normal boss movement
            if (dungeon.isWalkable(newX, newY)) {
                const occupied = monsters.some(m => m !== this && m.x === newX && m.y === newY && m.isAlive());
                if (!occupied && (newX !== player.x || newY !== player.y)) {
                    this.x = newX;
                    this.y = newY;
                }
            }
            return;
        }

        // Regular monster AI below
        // Skeleton: only moves every other turn (slow movement)
        if (this.type === 'skeleton') {
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



