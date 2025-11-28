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
                            this.game.renderer.triggerShake(10);
                            this.game.renderer.triggerFlash('#ef4444', 5);
                            this.game.sound.playCriticalHit();
                        } else {
                            this.game.sound.playEnemyHit();
                        }
                        attackMsg += '!';
                        this.game.addMessage(attackMsg);

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

        const boss = new Monster(bossPos.x, bossPos.y, bossType, this.game.currentLevel);
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
        // Limit total minions to prevent flooding
        const nearbyMinions = this.game.monsters.filter(m =>
            m.type === type &&
            Math.abs(m.x - boss.x) < 8 &&
            Math.abs(m.y - boss.y) < 8
        ).length;

        if (nearbyMinions >= 4) {
            this.game.addMessage(`The ${boss.name} tries to summon minions, but there is no room!`);
            return;
        }

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
                        this.game.monsters.push(new Monster(x, y, type, this.game.currentLevel));
                        spawned++;
                    }
                }
            }
        }
    }

    selectMonsterType(level) {
        // Progressive monster upgrades every 3 levels
        // Levels 1-3: Weak monsters only (kobold, bat, goblin)
        // Levels 4-6: Medium monsters introduced (orc, skeleton)
        // Levels 7-9: Strong monsters (troll, zombie)
        // Levels 10+: Deadly monsters (dragon)

        let distribution;

        if (level <= 3) {
            // TIER 1 (Levels 1-3): Only weak monsters
            distribution = [
                { type: 'kobold', weight: 50 },
                { type: 'bat', weight: 30 },
                { type: 'goblin', weight: 20 }
            ];
        } else if (level <= 6) {
            // TIER 2 (Levels 4-6): Weak monsters phased out, medium monsters introduced
            distribution = [
                { type: 'kobold', weight: 20 },
                { type: 'bat', weight: 10 },
                { type: 'goblin', weight: 15 },
                { type: 'skeleton', weight: 30 },
                { type: 'orc', weight: 25 }
            ];
        } else if (level <= 9) {
            // TIER 3 (Levels 7-9): Medium monsters remain, strong monsters introduced
            distribution = [
                { type: 'skeleton', weight: 20 },
                { type: 'orc', weight: 20 },
                { type: 'troll', weight: 30 },
                { type: 'zombie', weight: 30 }
            ];
        } else {
            // TIER 4 (Levels 10+): Strong and deadly monsters
            distribution = [
                { type: 'troll', weight: 25 },
                { type: 'zombie', weight: 25 },
                { type: 'orc', weight: 10 },
                { type: 'skeleton', weight: 10 },
                { type: 'dragon', weight: 30 }
            ];
        }

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

    getXPForMonster(monster) {
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
        const baseXP = xpTable[monster.type] || 10;
        return Math.floor(baseXP * (monster.xpMultiplier || 1));
    }
}
