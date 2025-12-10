class Item {
    constructor(x, y, type = 'health_potion', value = null, dungeonLevel = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.pickedUp = false;
        this.revealed = false;
        this.dungeonLevel = dungeonLevel;

        const itemData = Item.getItemData(type);
        this.name = itemData.name;
        this.symbol = itemData.symbol;
        this.color = itemData.color;
        this.description = itemData.description;

        // For gold, store the value
        if (type === 'gold') {
            this.value = value || 1;
        }
    }

    static getItemData(type) {
        const items = {
            health_potion: {
                name: 'Health Potion',
                symbol: '!',
                color: '#ef4444', // Bright red
                description: 'Restores health'
            },
            potion_shield: {
                name: 'Shield Potion',
                symbol: '!',
                color: '#3b82f6', // Blue
                description: 'Increases Defense by 50% for 10 turns'
            },
            potion_strength: {
                name: 'Strength Potion',
                symbol: '!',
                color: '#f97316', // Orange
                description: 'Increases Attack by 50% for 10 turns'
            },
            // Weapons
            dagger: {
                name: 'Dagger',
                symbol: '/',
                color: '#94a3b8', // Silver/gray
                description: 'A small blade',
                attackBonus: 1,
                defenseBonus: 0
            },
            sword: {
                name: 'Sword',
                symbol: '/',
                color: '#fbbf24', // Bright gold
                description: 'A balanced weapon',
                attackBonus: 2,
                defenseBonus: 0
            },
            mace: {
                name: 'Mace',
                symbol: '/',
                color: '#78716c', // Brown
                description: 'A heavy blunt weapon',
                attackBonus: 2,
                defenseBonus: 0
            },
            axe: {
                name: 'Axe',
                symbol: '/',
                color: '#f97316', // Bright orange
                description: 'A powerful chopping weapon',
                attackBonus: 3,
                defenseBonus: 0
            },
            magic_staff: {
                name: 'Magic Staff',
                symbol: '/',
                color: '#a855f7', // Purple
                description: 'A mystical weapon',
                attackBonus: 2,
                defenseBonus: 1
            },
            // Armor
            leather_armor: {
                name: 'Leather Armor',
                symbol: ']',
                color: '#92400e', // Brown
                description: 'Light protective gear',
                attackBonus: 0,
                defenseBonus: 1
            },
            chain_mail: {
                name: 'Chain Mail',
                symbol: ']',
                color: '#06b6d4', // Cyan
                description: 'Medium protective gear',
                attackBonus: 0,
                defenseBonus: 2
            },
            plate_armor: {
                name: 'Plate Armor',
                symbol: ']',
                color: '#60a5fa', // Blue
                description: 'Heavy protective gear',
                attackBonus: 0,
                defenseBonus: 3
            },
            magic_robes: {
                name: 'Magic Robes',
                symbol: ']',
                color: '#c026d3', // Magenta
                description: 'Enchanted protective robes',
                attackBonus: 1,
                defenseBonus: 2
            },
            amulet: {
                name: 'Amulet of Yendor',
                symbol: '\"',
                color: '#f0abfc', // Pink/magenta
                description: 'The legendary Amulet of Yendor!'
            },
            gold: {
                name: 'Gold',
                symbol: '$',
                color: '#fbbf24', // Bright gold
                description: 'Shiny gold coins'
            },
            rations: {
                name: 'Rations',
                symbol: '%',
                color: '#92400e', // Brown
                description: 'Dried food rations',
                hungerRestore: 30
            },
            bread: {
                name: 'Bread',
                symbol: '%',
                color: '#fde047', // Light yellow
                description: 'Fresh bread',
                hungerRestore: 20
            },
            scroll_teleport: {
                name: 'Scroll of Teleportation',
                symbol: '?',
                color: '#06b6d4', // Cyan
                description: 'Teleports you to a random location'
            },
            scroll_magic_missile: {
                name: 'Scroll of Magic Missile',
                symbol: '?',
                color: '#a855f7', // Purple
                description: 'Damages nearby enemies'
            },
            scroll_healing: {
                name: 'Scroll of Healing',
                symbol: '?',
                color: '#22c55e', // Green
                description: 'Restores health'
            },
            scroll_enchantment: {
                name: 'Scroll of Enchantment',
                symbol: '?',
                color: '#fbbf24', // Gold
                description: 'Permanently improves your abilities'
            },
            // NEW PHASE 2 SCROLLS
            scroll_fireball: {
                name: 'Scroll of Fireball',
                symbol: '?',
                color: '#f97316', // Orange
                description: 'Launches a fireball that explodes on impact'
            },
            scroll_freeze: {
                name: 'Scroll of Freeze',
                symbol: '?',
                color: '#38bdf8', // Light blue
                description: 'Freezes all nearby enemies'
            },
            scroll_haste: {
                name: 'Scroll of Haste',
                symbol: '?',
                color: '#fde047', // Yellow
                description: 'Grants temporary speed boost'
            },
            scroll_identify: {
                name: 'Scroll of Identify',
                symbol: '?',
                color: '#c084fc', // Light purple
                description: 'Reveals all items on the current level'
            },
            scroll_mapping: {
                name: 'Scroll of Mapping',
                symbol: '?',
                color: '#94a3b8', // Silver
                description: 'Reveals the entire dungeon map'
            },
            scroll_summon: {
                name: 'Scroll of Summon',
                symbol: '?',
                color: '#22d3ee', // Cyan
                description: 'Summons a friendly ally to fight for you'
            },
            shrine: {
                name: 'Shrine',
                symbol: '†',
                color: '#fbbf24', // Gold
                description: 'A holy shrine radiating divine energy'
            }
        };
        return items[type] || items.health_potion;
    }

    use(player) {
        switch (this.type) {
            case 'health_potion':
                player.heal(10);
                return `You drink the ${this.name}. You feel better!`;
            case 'dagger':
            case 'sword':
            case 'mace':
            case 'axe':
            case 'magic_staff':
                const weaponData = Item.getItemData(this.type);
                // Apply level scaling: +0.15 attack per dungeon level
                const weaponLevelBonus = Math.floor(this.dungeonLevel * 0.15);
                const totalAttackBonus = weaponData.attackBonus + weaponLevelBonus;
                const scaledWeaponData = {
                    ...weaponData,
                    attackBonus: totalAttackBonus
                };
                player.equipWeapon(scaledWeaponData);
                const weaponMsg = `You equip the ${this.name}. Attack +${totalAttackBonus}${weaponData.defenseBonus > 0 ? ', Defense +' + weaponData.defenseBonus : ''}!`;
                return weaponLevelBonus > 0 ? weaponMsg + ` (Level ${this.dungeonLevel} bonus: +${weaponLevelBonus})` : weaponMsg;
            case 'leather_armor':
            case 'chain_mail':
            case 'plate_armor':
            case 'magic_robes':
                const armorData = Item.getItemData(this.type);
                // Apply level scaling: +0.1 defense per dungeon level
                const armorLevelBonus = Math.floor(this.dungeonLevel * 0.1);
                const totalDefenseBonus = armorData.defenseBonus + armorLevelBonus;
                const scaledArmorData = {
                    ...armorData,
                    defenseBonus: totalDefenseBonus
                };
                player.equipArmor(scaledArmorData);
                const armorMsg = `You equip the ${this.name}. Defense +${totalDefenseBonus}${armorData.attackBonus > 0 ? ', Attack +' + armorData.attackBonus : ''}!`;
                return armorLevelBonus > 0 ? armorMsg + ` (Level ${this.dungeonLevel} bonus: +${armorLevelBonus})` : armorMsg;
            case 'amulet':
                return `You have retrieved the ${this.name}! You are victorious!`;
            case 'gold':
                player.addGold(this.value);
                return `You collect ${this.value} gold.`;
            case 'rations':
            case 'bread':
                const foodData = Item.getItemData(this.type);
                player.eat(foodData.hungerRestore);
                return `You eat the ${this.name}. You feel less hungry.`;
            case 'shrine':
                // Full heal + stat boost
                player.health = player.maxHealth;
                player.maxHealth += 5;
                player.attack += 1;
                player.defense += 1;
                return `You pray at the ${this.name}. Divine light washes over you! (+5 Max HP, +1 ATK, +1 DEF)`;
            case 'scroll_teleport':
            case 'scroll_magic_missile':
            case 'scroll_healing':
            case 'scroll_enchantment':
            case 'scroll_fireball':
            case 'scroll_freeze':
            case 'scroll_haste':
            case 'scroll_identify':
            case 'scroll_mapping':
            case 'scroll_summon':
            case 'potion_shield':
            case 'potion_strength':
                // Scrolls and special potions need game context, return type for game to handle
                return { scrollType: this.type, scrollName: this.name };
            default:
                return `You use the ${this.name}.`;
        }
    }
}

