class DungeonGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.rooms = [];
        this.tiles = {
            WALL: '#',
            FLOOR: '.',
            DOOR: '+',
            STAIRS_DOWN: '>',
            STAIRS_UP: '<',
            SHOP: '&'
        };
    }

    generate() {
        // Initialize grid with walls
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = this.tiles.WALL;
            }
        }

        // Generate rooms
        this.rooms = [];
        const maxRooms = 10;
        const minRoomSize = 5;
        const maxRoomSize = 12;

        for (let i = 0; i < maxRooms; i++) {
            const roomWidth = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
            const roomHeight = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
            const x = Math.floor(Math.random() * (this.width - roomWidth - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - roomHeight - 2)) + 1;

            const newRoom = { x, y, width: roomWidth, height: roomHeight, type: 'normal' };

            // Check if room overlaps with existing rooms
            let overlaps = false;
            for (const room of this.rooms) {
                if (this.roomsOverlap(newRoom, room)) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                this.createRoom(newRoom);

                // Assign special room type (skip first and last rooms)
                if (this.rooms.length > 0 && i < maxRooms - 1) {
                    newRoom.type = this.selectRoomType();
                }

                this.rooms.push(newRoom);

                // Connect to previous room
                if (this.rooms.length > 1) {
                    const prevRoom = this.rooms[this.rooms.length - 2];
                    this.createCorridor(
                        { x: newRoom.x + Math.floor(newRoom.width / 2), y: newRoom.y + Math.floor(newRoom.height / 2) },
                        { x: prevRoom.x + Math.floor(prevRoom.width / 2), y: prevRoom.y + Math.floor(prevRoom.height / 2) }
                    );
                }
            }
        }

        // Place stairs down in the last room
        if (this.rooms.length > 0) {
            const lastRoom = this.rooms[this.rooms.length - 1];
            const stairsX = lastRoom.x + Math.floor(lastRoom.width / 2);
            const stairsY = lastRoom.y + Math.floor(lastRoom.height / 2);
            this.grid[stairsY][stairsX] = this.tiles.STAIRS_DOWN;
        }

        return this.grid;
    }

    // Place stairs up in the first room (called from game.js for levels > 1)
    placeStairsUp() {
        if (this.rooms.length > 0) {
            const firstRoom = this.rooms[0];
            const stairsX = firstRoom.x + Math.floor(firstRoom.width / 2);
            const stairsY = firstRoom.y + Math.floor(firstRoom.height / 2);
            this.grid[stairsY][stairsX] = this.tiles.STAIRS_UP;
        }
    }

    selectRoomType() {
        const roll = Math.random() * 100;

        // Room type probabilities
        if (roll < 3) return 'shrine';        // 3%
        else if (roll < 8) return 'treasure';  // 5%
        else if (roll < 13) return 'library';  // 5%
        else if (roll < 18) return 'armory';   // 5%
        else if (roll < 26) return 'nest';     // 8%
        else if (roll < 36) return 'trap';     // 10%
        else return 'normal';                   // 64%
    }

    // Place shop in a random room (called from game.js)
    placeShop() {
        if (this.rooms.length > 1) {
            // Pick a random room (not first or last)
            const roomIndex = Math.floor(Math.random() * (this.rooms.length - 2)) + 1;
            const room = this.rooms[roomIndex];
            const shopX = room.x + Math.floor(room.width / 2);
            const shopY = room.y + Math.floor(room.height / 2);
            this.grid[shopY][shopX] = this.tiles.SHOP;
            return { x: shopX, y: shopY };
        }
        return null;
    }

    roomsOverlap(room1, room2) {
        return room1.x < room2.x + room2.width + 1 &&
            room1.x + room1.width + 1 > room2.x &&
            room1.y < room2.y + room2.height + 1 &&
            room1.y + room1.height + 1 > room2.y;
    }

    createRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                this.grid[y][x] = this.tiles.FLOOR;
            }
        }
    }

    createCorridor(from, to) {
        let x = from.x;
        let y = from.y;

        // L-shaped corridor: horizontal first, then vertical
        while (x !== to.x) {
            this.grid[y][x] = this.tiles.FLOOR;
            x += x < to.x ? 1 : -1;
        }

        while (y !== to.y) {
            this.grid[y][x] = this.tiles.FLOOR;
            y += y < to.y ? 1 : -1;
        }

        // Ensure destination is floor
        this.grid[to.y][to.x] = this.tiles.FLOOR;
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return this.tiles.WALL;
        }
        return this.grid[y][x];
    }

    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        return tile === this.tiles.FLOOR || tile === this.tiles.DOOR ||
            tile === this.tiles.STAIRS_DOWN || tile === this.tiles.STAIRS_UP || tile === this.tiles.SHOP;
    }

    getRandomFloorPosition() {
        // Collect all floor positions
        const floorPositions = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isWalkable(x, y)) {
                    floorPositions.push({ x, y });
                }
            }
        }

        if (floorPositions.length === 0) {
            // Fallback: return a default position if no floors found
            return { x: 1, y: 1 };
        }

        // Return a random floor position
        return floorPositions[Math.floor(Math.random() * floorPositions.length)];
    }

    getRoomAt(x, y) {
        for (const room of this.rooms) {
            if (x >= room.x && x < room.x + room.width &&
                y >= room.y && y < room.y + room.height) {
                return room;
            }
        }
        return null;
    }
}

