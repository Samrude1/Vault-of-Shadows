// GameCombat.js - Combat and monster-related methods
class GameCombat {
    constructor(game) {
        this.game = game;
    }

    monsterTurn() {
        // Remove dead monsters
        this.game.monsters = this.game.monsters.filter(m => m.isAlive());

        // Each monster acts
        this.game.monsters.forEach(monster => {
            if (monster.isAlive()) {
                // Handle boss abilities (summoning, enrage, etc.)
                if (monster.isBoss) {
                    this.handleBossAbilities(monster);
                }

                // Zombie regeneration
                if (monster.type === 'zombie') {
                    monster.regenerate();
                }

                // Check if monster is adjacent to player
                const distX = Math.abs(monster.x - this.game.player.x);
                const distY = Math.abs(monster.y - this.game.player.y);

                if (distX <= 1 && distY <= 1 && !(distX === 0 && distY === 0)) {
                    // Monster attacks player
                    const result = monster.attackTarget(this.game.player);

                    // Display attack message with crit/dodge indicators
                    if (result.dodged) {
                        this.game.addMessage(`The ${monster.name} attacks but you DODGE! ⚡`);
                    } else {
                        let attackMsg = `The ${monster.name} attacks you for ${result.damage} damage`;
                        if (result.isCrit) {
                            attackMsg += ' 💥 CRITICAL!';
                        }
                        attackMsg += '!';
                        this.game.addMessage(attackMsg);
                        this.game.sound.playEnemyHit();

                        // Apply status effect if any
                        if (result.statusEffect) {
                            this.game.player.applyStatusEffect(
                                result.statusEffect.type,
                                result.statusEffect.duration
                            );
                            const effectName = result.statusEffect.type.charAt(0).toUpperCase() +
                                result.statusEffect.type.slice(1);
                            this.game.addMessage(`You are ${effectName}ed! 🌀`);
                        }
                    }

                    // Ancient Dragon area damage
                    if (monster.type === 'ancient_dragon' && monster.areaDamage && !result.dodged) {
                        const areaDamage = monster.areaDamageAmount;
                        if (areaDamage > 0) {
                            const areaResult = this.game.player.takeDamage(areaDamage);
                            if (!areaResult.dodged) {
                                this.game.addMessage(`The ${monster.name}'s flames scorch you for ${areaDamage} additional damage! 🔥`);
                            }
                        }
                    }

                    if (result.killed) {
                        this.game.endGame(false);
                        return;
                    }
                } else {
                    // Monster moves
                    monster.act(this.game.player, this.game.dungeon, this.game.monsters);
                }
            }
        });
    }

    isBossLevel(level) {
        return [3, 6, 9, 10, 12].includes(level);
    }

    spawnBoss(level) {
        const bossTypes = {
            3: 'kobold_king',
            6: 'orc_warlord',
            9: 'lich',
            10: 'amulet_guardian',
            12: 'ancient_dragon'
        };

        const bossType = bossTypes[level];
        if (!bossType) return;

        // Try to place boss far from player
        let bossPos = this.game.dungeon.getRandomFloorPosition();
        let attempts = 0;
        while (attempts < 50) {
            const dist = Math.abs(bossPos.x - this.game.player.x) + Math.abs(bossPos.y - this.game.player.y);
            if (dist > 10) break;
            bossPos = this.game.dungeon.getRandomFloorPosition();
            attempts++;
        }

        const boss = new Monster(bossPos.x, bossPos.y, bossType);
        this.game.monsters.push(boss);
        this.game.addMessage(`⚠️ You feel a powerful presence... A ${boss.name} awaits!`);
    }

    handleBossAbilities(monster) {
        // Orc Warlord Enrage
        if (monster.justEnraged) {
            this.game.addMessage(`The ${monster.name} ROARS in anger! Attack increased! 💢`);
            monster.justEnraged = false;
            this.game.sound.playEnemyHit();
        }

        // Lich Summoning
        if (monster.shouldSummon) {
            this.spawnMinions(monster, monster.summonType || 'skeleton', monster.summonCount || 2);
            monster.shouldSummon = false;
            this.game.addMessage(`The ${monster.name} summons minions! 💀`);
        }

        // Kobold King Summoning
        if (monster.shouldSummon && monster.type === 'kobold_king') {
            this.spawnMinions(monster, 'kobold', 2);
            monster.shouldSummon = false;
            this.game.addMessage(`The ${monster.name} calls for help! 📢`);
        }

        // Amulet Guardian Shield
        if (monster.type === 'amulet_guardian' && monster.shieldActive) {
            this.game.addMessage(`The ${monster.name} is protected by a shimmering shield! 🛡️`);
        }
    }

    spawnMinions(boss, type, count) {
        let spawned = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (spawned >= count) return;
                if (dx === 0 && dy === 0) continue;

                const x = boss.x + dx;
                const y = boss.y + dy;

                if (this.game.dungeon.isWalkable(x, y)) {
                    const occupied = this.game.monsters.some(m => m.x === x && m.y === y && m.isAlive()) ||
                        (this.game.player.x === x && this.game.player.y === y);

                    if (!occupied) {
                        this.game.monsters.push(new Monster(x, y, type));
                        spawned++;
                    }
                }
            }
        }
    }

    selectMonsterType(level) {
        // Rebalanced distributions for smoother difficulty curve
        const distributions = {
            1: [
                { type: 'kobold', weight: 60 },
                { type: 'bat', weight: 25 },
                { type: 'goblin', weight: 15 }
            ],
            2: [
                { type: 'kobold', weight: 60 },
                { type: 'bat', weight: 25 },
                { type: 'goblin', weight: 15 }
            ],
            3: [
                { type: 'kobold', weight: 60 },
                { type: 'bat', weight: 25 },
                { type: 'goblin', weight: 15 }
            ],
            4: [
                { type: 'kobold', weight: 30 },
                { type: 'bat', weight: 15 },
                { type: 'goblin', weight: 20 },
                { type: 'skeleton', weight: 20 },
                { type: 'orc', weight: 15 }
            ],
            5: [
                { type: 'kobold', weight: 30 },
                { type: 'bat', weight: 15 },
                { type: 'goblin', weight: 20 },
                { type: 'skeleton', weight: 20 },
                { type: 'orc', weight: 15 }
            ],
            6: [
                { type: 'kobold', weight: 30 },
                { type: 'bat', weight: 15 },
                { type: 'goblin', weight: 20 },
                { type: 'skeleton', weight: 20 },
                { type: 'orc', weight: 15 }
            ],
            7: [
                { type: 'orc', weight: 25 },
                { type: 'skeleton', weight: 20 },
                { type: 'goblin', weight: 15 },
                { type: 'troll', weight: 20 },
                { type: 'zombie', weight: 20 }
            ],
            8: [
                { type: 'orc', weight: 25 },
                { type: 'skeleton', weight: 20 },
                { type: 'goblin', weight: 15 },
                { type: 'troll', weight: 20 },
                { type: 'zombie', weight: 20 }
            ],
            9: [
                { type: 'orc', weight: 25 },
                { type: 'skeleton', weight: 20 },
                { type: 'goblin', weight: 15 },
                { type: 'troll', weight: 20 },
                { type: 'zombie', weight: 20 }
            ]
        };

        const deepDistribution = [
            { type: 'troll', weight: 25 },
            { type: 'zombie', weight: 25 },
            { type: 'skeleton', weight: 15 },
            { type: 'orc', weight: 15 },
            { type: 'dragon', weight: 20 }
        ];

        const distribution = level >= 10 ? deepDistribution : (distributions[level] || distributions[1]);
        const totalWeight = distribution.reduce((sum, item) => sum + item.weight, 0);

        let random = Math.random() * totalWeight;
        for (const item of distribution) {
            random -= item.weight;
            if (random <= 0) {
                return item.type;
            }
        }

        return 'kobold';
    }

    getXPForMonster(monsterType) {
        const xpTable = {
            kobold: 10,
            bat: 8,
            goblin: 12,
            skeleton: 15,
            orc: 20,
            troll: 35,
            zombie: 30,
            dragon: 100,
            kobold_king: 150,
            orc_warlord: 250,
            lich: 350,
            ancient_dragon: 500,
            amulet_guardian: 400
        };
        return xpTable[monsterType] || 10;
    }
}
