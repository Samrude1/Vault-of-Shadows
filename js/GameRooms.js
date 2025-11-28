// GameRooms.js - Special room handling
class GameRooms {
    constructor(game) {
        this.game = game;
    }

    populateSpecialRooms() {
        const specialRoomsFound = [];

        this.game.dungeon.rooms.forEach(room => {
            if (room.type === 'normal') return;

            const centerX = room.x + Math.floor(room.width / 2);
            const centerY = room.y + Math.floor(room.height / 2);

            // Track special room types found
            if (!specialRoomsFound.includes(room.type)) {
                specialRoomsFound.push(room.type);
            }

            switch (room.type) {
                case 'treasure':
                    const numTreasureItems = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < numTreasureItems; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        const itemTypes = ['health_potion', 'sword', 'axe', 'plate_armor', 'magic_staff'];
                        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                        this.game.items.push(new Item(pos.x, pos.y, type));
                    }
                    for (let i = 0; i < 2; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        const eliteTypes = ['orc', 'troll'];
                        const type = eliteTypes[Math.floor(Math.random() * eliteTypes.length)];
                        this.game.monsters.push(new Monster(pos.x, pos.y, type, this.game.currentLevel));
                    }
                    break;

                case 'trap':
                    const trapScrolls = ['scroll_fireball', 'scroll_freeze', 'scroll_haste', 'scroll_mapping'];
                    const scrollType = trapScrolls[Math.floor(Math.random() * trapScrolls.length)];
                    this.game.items.push(new Item(centerX, centerY, scrollType));

                    const numTrapMonsters = 2 + Math.floor(Math.random() * 2);
                    for (let i = 0; i < numTrapMonsters; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        const type = this.game.combat.selectMonsterType(this.game.currentLevel);
                        this.game.monsters.push(new Monster(pos.x, pos.y, type, this.game.currentLevel));
                    }
                    break;

                case 'nest':
                    const numNestMonsters = 3 + Math.floor(this.game.currentLevel * 0.5);
                    for (let i = 0; i < numNestMonsters; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        const type = this.game.combat.selectMonsterType(this.game.currentLevel);
                        this.game.monsters.push(new Monster(pos.x, pos.y, type, this.game.currentLevel));
                    }
                    for (let i = 0; i < 2; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        const goldAmount = 10 + Math.floor(Math.random() * 20);
                        this.game.items.push(new Item(pos.x, pos.y, 'gold', goldAmount));
                    }
                    break;

                case 'shrine':
                    this.game.items.push(new Item(centerX, centerY, 'shrine'));
                    break;

                case 'library':
                    const numLibraryScrolls = 2 + Math.floor(Math.random() * 2);
                    for (let i = 0; i < numLibraryScrolls; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        const scrollTypes = ['scroll_teleport', 'scroll_magic_missile', 'scroll_healing', 'scroll_enchantment', 'scroll_fireball', 'scroll_freeze', 'scroll_haste', 'scroll_identify', 'scroll_mapping', 'scroll_summon'];
                        const type = scrollTypes[Math.floor(Math.random() * scrollTypes.length)];
                        this.game.items.push(new Item(pos.x, pos.y, type));
                    }
                    const numSkeletons = 2 + Math.floor(Math.random() * 2);
                    for (let i = 0; i < numSkeletons; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        this.game.monsters.push(new Monster(pos.x, pos.y, 'skeleton', this.game.currentLevel));
                    }
                    break;

                case 'armory':
                    const armoryItems = ['sword', 'axe', 'mace', 'plate_armor', 'chain_mail'];
                    for (let i = 0; i < 2; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        const type = armoryItems[Math.floor(Math.random() * armoryItems.length)];
                        this.game.items.push(new Item(pos.x, pos.y, type));
                    }
                    const numOrcs = 2 + Math.floor(Math.random() * 2);
                    for (let i = 0; i < numOrcs; i++) {
                        const pos = this.getRandomPosInRoom(room);
                        this.game.monsters.push(new Monster(pos.x, pos.y, 'orc', this.game.currentLevel));
                    }
                    break;
            }
        });

        // Display a single summary message for special rooms found
        if (specialRoomsFound.length > 0) {
            const roomMessages = {
                'treasure': '💎 Treasure',
                'trap': '⚠️ Trap',
                'nest': '👹 Monster Nest',
                'shrine': '✨ Shrine',
                'library': '📚 Library',
                'armory': '⚔️ Armory'
            };
            const foundRooms = specialRoomsFound.map(type => roomMessages[type]).join(', ');
            this.game.addMessage(`Special rooms detected: ${foundRooms}`);
        }
    }

    getRandomPosInRoom(room) {
        const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
        const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
        return { x, y };
    }
}
