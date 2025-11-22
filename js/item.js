class Item {
    constructor(x, y, type = 'health_potion', value = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.pickedUp = false;

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
                color: '#ff0000',
                description: 'Restores health'
            },
            // Weapons
            dagger: {
                name: 'Dagger',
                symbol: '/',
                color: '#c0c0c0',
                description: 'A small blade',
                attackBonus: 1,
                defenseBonus: 0
            },
            sword: {
                name: 'Sword',
                symbol: '/',
                color: '#ffff00',
                description: 'A balanced weapon',
                attackBonus: 2,
                defenseBonus: 0
            },
            mace: {
                name: 'Mace',
                symbol: '/',
                color: '#8b7355',
                description: 'A heavy blunt weapon',
                attackBonus: 2,
                defenseBonus: 0
            },
            axe: {
                name: 'Axe',
                symbol: '/',
                color: '#ff6347',
                description: 'A powerful chopping weapon',
                attackBonus: 3,
                defenseBonus: 0
            },
            magic_staff: {
                name: 'Magic Staff',
                symbol: '/',
                color: '#9370db',
                description: 'A mystical weapon',
                attackBonus: 2,
                defenseBonus: 1
            },
            // Armor
            leather_armor: {
                name: 'Leather Armor',
                symbol: ']',
                color: '#8b4513',
                description: 'Light protective gear',
                attackBonus: 0,
                defenseBonus: 1
            },
            chain_mail: {
                name: 'Chain Mail',
                symbol: ']',
                color: '#00ffff',
                description: 'Medium protective gear',
                attackBonus: 0,
                defenseBonus: 2
            },
            plate_armor: {
                name: 'Plate Armor',
                symbol: ']',
                color: '#b0c4de',
                description: 'Heavy protective gear',
                attackBonus: 0,
                defenseBonus: 3
            },
            magic_robes: {
                name: 'Magic Robes',
                symbol: ']',
                color: '#9400d3',
                description: 'Enchanted protective robes',
                attackBonus: 1,
                defenseBonus: 2
            },
            amulet: {
                name: 'Amulet of Yendor',
                symbol: '"',
                color: '#ff00ff',
                description: 'The legendary Amulet of Yendor!'
            },
            gold: {
                name: 'Gold',
                symbol: '$',
                color: '#ffd700',
                description: 'Shiny gold coins'
            },
            rations: {
                name: 'Rations',
                symbol: '%',
                color: '#8b4513',
                description: 'Dried food rations',
                hungerRestore: 30
            },
            bread: {
                name: 'Bread',
                symbol: '%',
                color: '#f5deb3',
                description: 'Fresh bread',
                hungerRestore: 20
            },
            scroll_teleport: {
                name: 'Scroll of Teleportation',
                symbol: '?',
                color: '#00ffff',
                description: 'Teleports you to a random location'
            },
            scroll_magic_missile: {
                name: 'Scroll of Magic Missile',
                symbol: '?',
                color: '#9370db',
                description: 'Damages nearby enemies'
            },
            scroll_healing: {
                name: 'Scroll of Healing',
                symbol: '?',
                color: '#90ee90',
                description: 'Restores health'
            },
            scroll_enchantment: {
                name: 'Scroll of Enchantment',
                symbol: '?',
                color: '#ffd700',
                description: 'Permanently improves your abilities'
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
                player.attack += weaponData.attackBonus;
                player.defense += weaponData.defenseBonus;
                return `You equip the ${this.name}. Attack +${weaponData.attackBonus}${weaponData.defenseBonus > 0 ? ', Defense +' + weaponData.defenseBonus : ''}!`;
            case 'leather_armor':
            case 'chain_mail':
            case 'plate_armor':
            case 'magic_robes':
                const armorData = Item.getItemData(this.type);
                player.defense += armorData.defenseBonus;
                player.attack += armorData.attackBonus;
                return `You equip the ${this.name}. Defense +${armorData.defenseBonus}${armorData.attackBonus > 0 ? ', Attack +' + armorData.attackBonus : ''}!`;
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
            case 'scroll_teleport':
            case 'scroll_magic_missile':
            case 'scroll_healing':
            case 'scroll_enchantment':
                // Scrolls need game context, return scroll type for game to handle
                return { scrollType: this.type, scrollName: this.name };
            default:
                return `You use the ${this.name}.`;
        }
    }
}

