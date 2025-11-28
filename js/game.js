class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.input = new InputHandler();
        this.sound = new SoundManager();
        this.dungeonWidth = 80;
        this.dungeonHeight = 24;

        this.dungeon = null;
        this.player = null;
        this.monsters = [];
        this.items = [];
        this.traps = [];

        this.currentLevel = 1;
        this.gameOver = false;
        this.waitingForInput = false;
        this.hasAmulet = false;
        this.audioEnabled = false;
        this.shopPosition = null;

        this.messages = [];
        this.maxMessages = 5;
        this.winLevel = 10; // Level where Amulet of Yendor appears (changed from 5 to 10)

        // Hunger system
        this.turnCounter = 0;
        this.hungerDecreaseInterval = 10; // Decrease hunger every 10 turns

        // Fog of war / visibility
        this.explored = [];
        this.visible = [];
        this.visibilityRadius = 3; // How far the player can see

        // Player level tracking for level-up notifications
        this.currentPlayerLevel = 1;

        // Initialize modules
        this.combat = new GameCombat(this);
        this.rooms = new GameRooms(this);
        this.shop = new GameShop(this);
        this.ui = new GameUI(this);

        // Enable audio on first user interaction
        const enableAudio = () => {
            if (!this.audioEnabled) {
                this.sound.enable();
                this.audioEnabled = true;
            }
            window.removeEventListener('keydown', enableAudio);
            window.removeEventListener('click', enableAudio);
        };
        window.addEventListener('keydown', enableAudio);
        window.addEventListener('click', enableAudio);

        this.init();
    }

    init() {
        // Generate dungeon
        const generator = new DungeonGenerator(this.dungeonWidth, this.dungeonHeight);
        this.dungeon = generator;
        this.dungeon.generate();

        // Place stairs up on levels > 1
        if (this.currentLevel > 1) {
            this.dungeon.placeStairsUp();
        }

        // Create player at first room
        const startPos = this.dungeon.getRandomFloorPosition();
        this.player = new Player(startPos.x, startPos.y);

        // Initialize fog of war
        this.initFogOfWar();
        this.updateVisibility();

        // Create monsters
        this.monsters = [];
        this.traps = [];
        const numMonsters = 4 + Math.floor(this.currentLevel * 1.5); // Reduced from 5 + (level * 2)
        const usedPositions = new Set();
        let attempts = 0;
        const maxAttempts = numMonsters * 20; // Prevent infinite loops

        for (let i = 0; i < numMonsters && attempts < maxAttempts; i++) {
            attempts++;
            const pos = this.dungeon.getRandomFloorPosition();
            const posKey = `${pos.x},${pos.y}`;

            // Make sure monster is not at player position and not on top of another monster
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                if (!usedPositions.has(posKey)) {
                    usedPositions.add(posKey);
                    const type = this.combat.selectMonsterType(this.currentLevel);
                    this.monsters.push(new Monster(pos.x, pos.y, type, this.currentLevel));
                } else {
                    i--; // Retry this iteration
                }
            } else {
                i--; // Retry this iteration
            }
        }

        // Create items
        this.items = [];
        const numItems = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numItems; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                // Select items based on dungeon level
                let itemTypes;
                if (this.currentLevel <= 2) {
                    itemTypes = ['health_potion', 'dagger', 'leather_armor'];
                } else if (this.currentLevel <= 4) {
                    itemTypes = ['health_potion', 'sword', 'mace', 'chain_mail'];
                } else {
                    itemTypes = ['health_potion', 'axe', 'magic_staff', 'plate_armor', 'magic_robes'];
                }
                const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                this.items.push(new Item(pos.x, pos.y, type));
            }
        }

        // Place Amulet of Yendor on the win level
        if (this.currentLevel === this.winLevel) {
            const amuletPos = this.dungeon.getRandomFloorPosition();
            if (amuletPos.x !== this.player.x || amuletPos.y !== this.player.y) {
                this.items.push(new Item(amuletPos.x, amuletPos.y, 'amulet'));
                this.addMessage('You sense something powerful nearby... The Amulet of Yendor!');
            }
        }

        // Spawn food items
        const numFood = 1 + Math.floor(Math.random() * 2); // 1-2 food items per level
        for (let i = 0; i < numFood; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                const foodType = Math.random() < 0.5 ? 'rations' : 'bread';
                this.items.push(new Item(pos.x, pos.y, foodType));
            }
        }

        // Spawn scrolls
        const numScrolls = 1 + Math.floor(Math.random() * 2); // 1-2 scrolls per level
        for (let i = 0; i < numScrolls; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                const scrollTypes = ['scroll_teleport', 'scroll_magic_missile', 'scroll_healing', 'scroll_enchantment'];
                const scrollType = scrollTypes[Math.floor(Math.random() * scrollTypes.length)];
                this.items.push(new Item(pos.x, pos.y, scrollType));
            }
        }

        // Place shop
        this.shopPosition = this.dungeon.placeShop();
        if (this.shopPosition) {
            this.addMessage('You hear the sound of a merchant nearby...');
        }

        // Populate special rooms with content
        this.rooms.populateSpecialRooms();

        // Spawn boss if applicable (e.g. testing level 3 start)
        if (this.combat.isBossLevel(this.currentLevel)) {
            this.combat.spawnBoss(this.currentLevel);
        }

        this.gameOver = false;
        this.addMessage('Welcome to the dungeon! Move with WASD or arrow keys.');
        this.updateUI();

        // Setup sound settings UI
        this.setupSoundSettings();

        // Setup restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });

        this.gameLoop();
    }

    initFogOfWar() {
        // Initialize explored and visible arrays
        this.explored = [];
        this.visible = [];
        for (let y = 0; y < this.dungeonHeight; y++) {
            this.explored[y] = [];
            this.visible[y] = [];
            for (let x = 0; x < this.dungeonWidth; x++) {
                this.explored[y][x] = false;
                this.visible[y][x] = false;
            }
        }
    }

    updateVisibility() {
        // Reset visible array
        for (let y = 0; y < this.dungeonHeight; y++) {
            for (let x = 0; x < this.dungeonWidth; x++) {
                this.visible[y][x] = false;
            }
        }

        // Mark visible tiles within radius
        for (let dy = -this.visibilityRadius; dy <= this.visibilityRadius; dy++) {
            for (let dx = -this.visibilityRadius; dx <= this.visibilityRadius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.visibilityRadius) {
                    const x = this.player.x + dx;
                    const y = this.player.y + dy;

                    if (x >= 0 && x < this.dungeonWidth && y >= 0 && y < this.dungeonHeight) {
                        this.visible[y][x] = true;
                        this.explored[y][x] = true; // Mark as explored
                    }
                }
            }
        }
    }

    isVisible(x, y) {
        return this.visible[y] && this.visible[y][x];
    }

    isExplored(x, y) {
        return this.explored[y] && this.explored[y][x];
    }

    setupSoundSettings() {
        const muteToggle = document.getElementById('mute-toggle');

        // Set initial icon based on mute state
        muteToggle.textContent = this.sound.isMuted() ? '🔇' : '🔊';

        // Remove any existing event listeners by cloning and replacing
        const muteClone = muteToggle.cloneNode(true);
        muteToggle.parentNode.replaceChild(muteClone, muteToggle);

        // Mute toggle
        muteClone.addEventListener('click', () => {
            const muted = this.sound.toggleMute();
            muteClone.textContent = muted ? '🔇' : '🔊';
        });
    }

    restart() {
        document.getElementById('game-over').classList.add('hidden');
        this.currentLevel = 1;
        this.hasAmulet = false;
        this.messages = [];
        this.init();
    }

    gameLoop() {
        if (!this.gameOver) {
            this.handleInput();
            this.render();
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    handleInput() {
        if (!this.waitingForInput) {
            // Check for shop interaction
            if (this.input.isShop() && !this.shop.shopOpen) {
                const playerTile = this.dungeon.getTile(this.player.x, this.player.y);
                if (playerTile === '&') {
                    this.openShop();
                    return;
                }
            }

            // Check for use item
            if (this.input.isUseItem()) {
                this.waitingForInput = true;
                this.useInventoryItem();
                return;
            }

            const movement = this.input.getMovement();
            if (movement) {
                this.waitingForInput = true;
                this.playerTurn(movement);
            } else if (this.input.isWait()) {
                this.waitingForInput = true;
                this.playerWait();
            }
        }
    }

    playerWait() {
        // Player waits (skips turn)
        this.addMessage('You wait...');
        this.sound.playWait();

        // Monster turn
        this.combat.monsterTurn();

        // Check if player is still alive after monster turn
        if (!this.player.isAlive()) {
            this.endGame(false);
        } else {
            this.updateUI();
        }

        // Small delay before accepting next input
        setTimeout(() => {
            this.waitingForInput = false;
        }, 100);
    }

    useInventoryItem() {
        // Check if player has an item
        if (!this.player.inventory) {
            this.addMessage('No item in inventory!');
            this.waitingForInput = false;
            return;
        }

        const itemType = this.player.inventory;
        const itemData = Item.getItemData(itemType);

        // Use the item (trigger scroll/potion effect)
        this.handleScrollEffect(itemType, itemData.name);

        // Clear inventory
        this.player.inventory = null;
        if (itemType.startsWith('potion_')) {
            this.addMessage(`You drank the ${itemData.name}!`);
        } else {
            this.addMessage(`You used ${itemData.name}!`);
        }

        // Monster turn happens after using item
        this.combat.monsterTurn();

        // Check if player is still alive
        if (!this.player.isAlive()) {
            this.endGame(false);
        } else {
            this.updateUI();
        }

        // Small delay before accepting next input
        setTimeout(() => {
            this.waitingForInput = false;
        }, 100);
    }

    playerTurn(movement) {
        // Check if player is stunned
        if (this.player.isStunned()) {
            this.addMessage('You are stunned and cannot act! ??');

            // Monster turn still happens
            this.combat.monsterTurn();

            // Process status effects (including decrementing stun)
            const statusMessages = this.player.processStatusEffects();
            statusMessages.forEach(msg => {
                if (msg.type === 'poison') {
                    this.addMessage(`?? Poison deals ${msg.damage} damage!`);
                } else if (msg.type === 'burn') {
                    this.addMessage(`?? Burn deals ${msg.damage} damage!`);
                } else if (msg.type === 'stun_end') {
                    this.addMessage('You recover from being stunned.');
                }
            });

            // Check if player is still alive
            if (!this.player.isAlive()) {
                this.endGame(false);
            } else {
                this.updateUI();
            }

            setTimeout(() => {
                this.waitingForInput = false;
            }, 100);
            return;
        }

        // Try to move player
        const newX = this.player.x + movement.dx;
        const newY = this.player.y + movement.dy;

        // Check for monster at destination
        const monsterAtPos = this.monsters.find(m =>
            m.x === newX && m.y === newY && m.isAlive()
        );

        // Check for item at destination
        const itemAtPos = this.items.find(i =>
            i.x === newX && i.y === newY && !i.pickedUp
        );

        if (monsterAtPos) {
            // Attack monster
            const result = this.player.attackTarget(monsterAtPos);

            // Display attack message with crit indicator
            let attackMsg = `You attack the ${monsterAtPos.name} for ${result.damage} damage`;
            if (result.isCrit) {
                attackMsg += ' 💥 CRITICAL HIT!';
                this.renderer.triggerShake(5);
                this.renderer.triggerFlash('#ffffff', 3);
                this.sound.playCriticalHit();
            } else {
                this.sound.playHit();
            }
            attackMsg += '!';
            this.addMessage(attackMsg);

            // Handle boss abilities triggered by damage
            if (monsterAtPos.isBoss) {
                // Lich Teleport
                if (monsterAtPos.shouldTeleport) {
                    const newPos = this.dungeon.getRandomFloorPosition();
                    monsterAtPos.x = newPos.x;
                    monsterAtPos.y = newPos.y;
                    monsterAtPos.shouldTeleport = false;
                    this.addMessage(`The ${monsterAtPos.name} teleports away! 🌀`);
                }

                // Kobold King Summon (triggered by damage threshold)
                if (monsterAtPos.shouldSummon) {
                    this.combat.handleBossAbilities(monsterAtPos);
                }
            }

            if (result.killed) {
                // Award XP for kill
                const xpReward = this.combat.getXPForMonster(monsterAtPos);
                this.player.gainXP(xpReward);

                // Generate drops from killed monster
                const drops = monsterAtPos.generateDrops();
                drops.forEach(drop => {
                    this.items.push(new Item(monsterAtPos.x, monsterAtPos.y, drop.type, drop.value));
                });

                this.addMessage(`You killed the ${monsterAtPos.name}! (+${xpReward} XP)`);
                this.sound.playKill();

                // Check if player leveled up
                if (this.player.level > this.currentPlayerLevel) {
                    this.currentPlayerLevel = this.player.level;
                    this.addMessage(`🌟 LEVEL UP! You are now level ${this.player.level}!`);
                    this.sound.playItemPickup(); // Use pickup sound for level up
                }
            }
            // Note: Monster will attack during its turn (monsterTurn() called later)
        } else if (itemAtPos) {
            // Check if it's a scroll and inventory is full
            if (itemAtPos.type.startsWith('scroll_') && this.player.inventory !== null) {
                this.addMessage('Inventory full! Cannot pick up scroll. Use your current item first (Press U).');
                // Still allow movement - don't return early
                this.player.move(movement.dx, movement.dy, this.dungeon);

                // Monster turn
                this.combat.monsterTurn();

                // Check if player is still alive
                if (!this.player.isAlive()) {
                    this.endGame(false);
                } else {
                    this.updateUI();
                }

                setTimeout(() => {
                    this.waitingForInput = false;
                }, 100);
                return;
            }

            // Pick up item
            const message = itemAtPos.use(this.player);
            itemAtPos.pickedUp = true;

            // Check if it's a scroll (returns object with scrollType)
            if (typeof message === 'object' && message.scrollType) {
                // Add to inventory instead of using immediately
                this.player.inventory = message.scrollType;
                this.addMessage(`You picked up ${message.scrollName}. Press U to use.`);
            } else {
                this.addMessage(message);
            }

            this.player.move(movement.dx, movement.dy, this.dungeon);

            // Check for traps
            const trap = this.traps.find(t => t.x === this.player.x && t.y === this.player.y && !t.triggered);
            if (trap) {
                this.triggerTrap(trap);
            }

            // Play appropriate sound based on item type
            if (itemAtPos.type === 'amulet') {
                this.hasAmulet = true;
                this.addMessage('You have retrieved the Amulet of Yendor! You feel a pull back to the surface...');
                this.sound.playItemPickup();

                // Check if already on level 1 (immediate win)
                if (this.currentLevel === 1) {
                    this.endGame(true);
                    this.waitingForInput = false;
                    return;
                }
            } else if (itemAtPos.type === 'health_potion') {
                this.sound.playHeal();
            } else if (itemAtPos.type === 'weapon' || itemAtPos.type === 'armor') {
                this.sound.playEquip();
            } else {
                this.sound.playItemPickup();
            }
        } else {
            // Normal movement
            const moved = this.player.move(movement.dx, movement.dy, this.dungeon);
            if (moved) {
                this.sound.playMove();
                this.updateVisibility(); // Update fog of war after movement
            }

            // Check for stairs
            if (this.dungeon.getTile(this.player.x, this.player.y) === '>') {
                this.goToNextLevel();
                this.waitingForInput = false;
                return;
            } else if (this.dungeon.getTile(this.player.x, this.player.y) === '<') {
                this.goToPreviousLevel();
                this.waitingForInput = false;
                return;
            }
        }

        // Monster turn
        if (!this.player.isHasted() || this.turnCounter % 2 === 0) {
            this.combat.monsterTurn();
        }

        // Process status effects
        const statusMessages = this.player.processStatusEffects();
        statusMessages.forEach(msg => {
            if (msg.type === 'poison') {
                this.addMessage(`☠️ Poison deals ${msg.damage} damage!`);
            } else if (msg.type === 'burn') {
                this.addMessage(`🔥 Burn deals ${msg.damage} damage!`);
            } else if (msg.type === 'poison_end') {
                this.addMessage('The poison wears off.');
            } else if (msg.type === 'burn_end') {
                this.addMessage('The burning subsides.');
            } else if (msg.type === 'stun_end') {
                this.addMessage('You recover from being stunned.');
            } else if (msg.type === 'haste_end') {
                this.addMessage('You feel your speed return to normal.');
            } else if (msg.type === 'strength_end') {
                this.addMessage('The strength potion wears off.');
            } else if (msg.type === 'shield_end') {
                this.addMessage('The shield potion wears off.');
            }
        });


        // Hunger system
        this.turnCounter++;
        if (this.turnCounter % this.hungerDecreaseInterval === 0) {
            this.player.decreaseHunger(1);

            // Hunger warnings
            const hungerStatus = this.player.getHungerStatus();
            if (hungerStatus === 'starving' && this.player.hunger % 20 === 0) {
                this.addMessage('You are starving!');
            } else if (hungerStatus === 'hungry' && this.player.hunger === 50) {
                this.addMessage('You are getting hungry.');
            }
        }

        // Starvation damage
        if (this.player.isStarving()) {
            this.player.takeDamage(1);
            this.addMessage('You are starving! You lose 1 health.');
        }


        // Check if player is still alive after monster turn
        if (!this.player.isAlive()) {
            this.endGame(false);
        } else {
            this.updateUI();
        }

        // Small delay before accepting next input
        setTimeout(() => {
            this.waitingForInput = false;
        }, 100);
    }



    goToNextLevel() {
        this.currentLevel++;
        this.addMessage(`You descend to level ${this.currentLevel}...`);
        this.sound.playLevelDown();

        // Milestone messages
        if (this.currentLevel === 5) {
            this.addMessage("You've reached the halfway point. The air grows colder...");
        } else if (this.currentLevel === 10) {
            this.addMessage("You sense immense power ahead. The Amulet is near!");
        } else if (this.currentLevel === 15) {
            this.addMessage("You've ventured deeper than most dare. Legendary treasures await...");
        }

        // Generate new dungeon
        const generator = new DungeonGenerator(this.dungeonWidth, this.dungeonHeight);
        this.dungeon = generator;
        this.dungeon.generate();

        // Place stairs up on all levels > 1
        if (this.currentLevel > 1) {
            this.dungeon.placeStairsUp();
        }

        // Place player at start room
        const startPos = this.dungeon.getRandomFloorPosition();
        this.player.x = startPos.x;
        this.player.y = startPos.y;

        // Initialize fog of war for new level
        this.initFogOfWar();
        this.updateVisibility();

        // Create new monsters (more on deeper levels)
        this.monsters = [];
        const numMonsters = 4 + Math.floor(this.currentLevel * 1.5); // Reduced from 5 + (level * 2)
        const usedPositions = new Set();
        let attempts = 0;
        const maxAttempts = numMonsters * 20;

        for (let i = 0; i < numMonsters && attempts < maxAttempts; i++) {
            attempts++;
            const pos = this.dungeon.getRandomFloorPosition();
            const posKey = `${pos.x},${pos.y}`;

            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                if (!usedPositions.has(posKey)) {
                    usedPositions.add(posKey);
                    const type = this.combat.selectMonsterType(this.currentLevel);
                    this.monsters.push(new Monster(pos.x, pos.y, type, this.currentLevel));
                } else {
                    i--; // Retry this iteration
                }
            } else {
                i--; // Retry this iteration
            }
        }

        // Create new items
        this.items = [];
        const numItems = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numItems; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                // Select items based on dungeon level
                let itemTypes;
                if (this.currentLevel <= 2) {
                    itemTypes = ['health_potion', 'dagger', 'leather_armor'];
                } else if (this.currentLevel <= 4) {
                    itemTypes = ['health_potion', 'sword', 'mace', 'chain_mail'];
                } else {
                    itemTypes = ['health_potion', 'axe', 'magic_staff', 'plate_armor', 'magic_robes'];
                }
                const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                this.items.push(new Item(pos.x, pos.y, type));
            }
        }

        // Place Amulet of Yendor on the win level
        if (this.currentLevel === this.winLevel) {
            const amuletPos = this.dungeon.getRandomFloorPosition();
            if (amuletPos.x !== this.player.x || amuletPos.y !== this.player.y) {
                this.items.push(new Item(amuletPos.x, amuletPos.y, 'amulet'));
                this.addMessage('You sense something powerful nearby... The Amulet of Yendor!');
            }
        }

        // Spawn food items
        const numFood = 1 + Math.floor(Math.random() * 2); // 1-2 food items per level
        for (let i = 0; i < numFood; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                const foodType = Math.random() < 0.5 ? 'rations' : 'bread';
                this.items.push(new Item(pos.x, pos.y, foodType));
            }
        }

        // Spawn scrolls
        const numScrolls = 1 + Math.floor(Math.random() * 2); // 1-2 scrolls per level
        for (let i = 0; i < numScrolls; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                const scrollTypes = ['scroll_teleport', 'scroll_magic_missile', 'scroll_healing', 'scroll_enchantment', 'scroll_fireball', 'scroll_freeze', 'scroll_haste', 'scroll_identify', 'scroll_mapping', 'scroll_summon'];
                const scrollType = scrollTypes[Math.floor(Math.random() * scrollTypes.length)];
                this.items.push(new Item(pos.x, pos.y, scrollType));
            }
        }

        // Place shop
        this.shopPosition = this.dungeon.placeShop();

        // Populate special rooms with content
        this.rooms.populateSpecialRooms();

        // Spawn boss if applicable
        if (this.combat.isBossLevel(this.currentLevel)) {
            this.combat.spawnBoss(this.currentLevel);
        }

        this.updateUI();
    }



    goToPreviousLevel() {
        if (this.currentLevel <= 1) {
            this.addMessage('You are already at the surface!');
            return;
        }

        this.currentLevel--;
        this.addMessage(`You ascend to level ${this.currentLevel}...`);
        this.sound.playItemPickup(); // Use pickup sound for ascending

        // Check win condition: level 1 with Amulet
        if (this.currentLevel === 1 && this.hasAmulet) {
            this.addMessage('You have escaped the dungeon with the Amulet of Yendor!');
            this.endGame(true);
            return;
        }

        // Generate new dungeon
        const generator = new DungeonGenerator(this.dungeonWidth, this.dungeonHeight);
        this.dungeon = generator;
        this.dungeon.generate();

        // Place stairs up on levels > 1
        if (this.currentLevel > 1) {
            this.dungeon.placeStairsUp();
        }

        // Place player at start room
        const startPos = this.dungeon.getRandomFloorPosition();
        this.player.x = startPos.x;
        this.player.y = startPos.y;

        // Initialize fog of war for new level
        this.initFogOfWar();
        this.updateVisibility();

        // Create new monsters
        this.monsters = [];
        const numMonsters = 4 + Math.floor(this.currentLevel * 1.5); // Reduced from 5 + (level * 2)
        const usedPositions = new Set();
        let attempts = 0;
        const maxAttempts = numMonsters * 20;

        for (let i = 0; i < numMonsters && attempts < maxAttempts; i++) {
            attempts++;
            const pos = this.dungeon.getRandomFloorPosition();
            const posKey = `${pos.x},${pos.y}`;

            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                if (!usedPositions.has(posKey)) {
                    usedPositions.add(posKey);
                    const type = this.combat.selectMonsterType(this.currentLevel);
                    this.monsters.push(new Monster(pos.x, pos.y, type, this.currentLevel));
                } else {
                    i--;
                }
            } else {
                i--;
            }
        }

        // Create new items
        this.items = [];
        const numItems = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numItems; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                let itemTypes;
                if (this.currentLevel <= 2) {
                    itemTypes = ['health_potion', 'dagger', 'leather_armor'];
                } else if (this.currentLevel <= 4) {
                    itemTypes = ['health_potion', 'sword', 'mace', 'chain_mail'];
                } else {
                    itemTypes = ['health_potion', 'axe', 'magic_staff', 'plate_armor', 'magic_robes'];
                }
                const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                this.items.push(new Item(pos.x, pos.y, type));
            }
        }

        // Spawn food items
        const numFood = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numFood; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                const foodType = Math.random() < 0.5 ? 'rations' : 'bread';
                this.items.push(new Item(pos.x, pos.y, foodType));
            }
        }

        // Spawn scrolls
        const numScrolls = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numScrolls; i++) {
            const pos = this.dungeon.getRandomFloorPosition();
            if (pos.x !== this.player.x || pos.y !== this.player.y) {
                const scrollTypes = ['scroll_teleport', 'scroll_magic_missile', 'scroll_healing', 'scroll_enchantment'];
                const scrollType = scrollTypes[Math.floor(Math.random() * scrollTypes.length)];
                this.items.push(new Item(pos.x, pos.y, scrollType));
            }
        }

        // Place shop
        this.shopPosition = this.dungeon.placeShop();

        // Populate special rooms with content
        this.rooms.populateSpecialRooms();

        this.updateUI();
    }

    endGame(victory) {
        this.gameOver = true;
        if (victory) {
            this.addMessage('You have retrieved the Amulet of Yendor! Victory!');
            this.sound.playVictory();
            const gameOverEl = document.getElementById('game-over');
            gameOverEl.querySelector('h2').textContent = 'Victory!';
            gameOverEl.querySelector('p').textContent = 'You have retrieved the Amulet of Yendor!';
            gameOverEl.classList.remove('hidden');
        } else {
            this.addMessage('You have died!');
            this.sound.playGameOver();
            const gameOverEl = document.getElementById('game-over');
            gameOverEl.querySelector('h2').textContent = 'Game Over';
            gameOverEl.querySelector('p').textContent = 'You have died!';
            gameOverEl.classList.remove('hidden');
        }
        this.updateUI();
    }

    addMessage(text) {
        this.ui.addMessage(text);
    }

    updateMessages() {
        this.ui.updateMessages();
    }

    updateUI() {
        this.ui.update();
    }

    render() {
        this.renderer.render(this, this.dungeon, this.player, this.monsters, this.items);
    }

    handleScrollEffect(scrollType, scrollName) {
        this.addMessage(`You read the ${scrollName}...`);
        this.sound.playSpell();

        switch (scrollType) {
            case 'scroll_teleport':
                const newPos = this.dungeon.getRandomFloorPosition();
                this.player.x = newPos.x;
                this.player.y = newPos.y;
                this.addMessage('You are teleported to a new location! 🌀');
                this.updateVisibility();
                break;
            case 'scroll_magic_missile':
                // Deal damage to nearest monster
                let nearest = null;
                let minDist = Infinity;
                this.monsters.forEach(m => {
                    if (m.isAlive()) {
                        const d = Math.abs(m.x - this.player.x) + Math.abs(m.y - this.player.y);
                        if (d < minDist) {
                            minDist = d;
                            nearest = m;
                        }
                    }
                });

                if (nearest && minDist < 8) {
                    const damage = 20;
                    nearest.takeDamage(damage);
                    this.addMessage(`A magic missile strikes the ${nearest.name} for ${damage} damage! ✨`);
                    if (!nearest.isAlive()) {
                        this.addMessage(`The ${nearest.name} is killed!`);
                        this.player.gainXP(this.combat.getXPForMonster(nearest));
                    }
                } else {
                    this.addMessage('But nothing happens.');
                }
                break;
            case 'scroll_healing':
                this.player.heal(20);
                this.addMessage('You feel much better! 💖');
                break;
            case 'scroll_enchantment':
                if (Math.random() < 0.5) {
                    this.player.attack += 1;
                    this.addMessage('Your weapon glows with magical energy! (+1 Attack) ⚔️');
                } else {
                    this.player.defense += 1;
                    this.addMessage('Your armor hardens! (+1 Defense) 🛡️');
                }
                break;
            case 'scroll_fireball':
                this.addMessage('A massive fireball explodes around you! 🔥');
                let hitCount = 0;
                this.monsters.forEach(m => {
                    if (m.isAlive()) {
                        const dist = Math.max(Math.abs(m.x - this.player.x), Math.abs(m.y - this.player.y));
                        if (dist <= 3) { // 3 tile radius
                            const damage = 15;
                            m.takeDamage(damage);
                            this.addMessage(`The ${m.name} is burned for ${damage} damage!`);
                            if (!m.isAlive()) {
                                this.player.gainXP(this.combat.getXPForMonster(m));
                            }
                            hitCount++;
                        }
                    }
                });
                if (hitCount === 0) this.addMessage('The fireball hits nothing.');
                break;
            case 'scroll_freeze':
                this.addMessage('A freezing blast expands from you! ❄️');
                let frozenCount = 0;
                this.monsters.forEach(m => {
                    if (m.isAlive()) {
                        const dist = Math.max(Math.abs(m.x - this.player.x), Math.abs(m.y - this.player.y));
                        if (dist <= 4) {
                            m.stunned = 5; // Frozen for 5 turns
                            frozenCount++;
                        }
                    }
                });
                if (frozenCount > 0) {
                    this.addMessage(`${frozenCount} ${frozenCount === 1 ? 'enemy' : 'enemies'} frozen for 5 turns!`);
                } else {
                    this.addMessage('No enemies nearby to freeze.');
                }
                break;
            case 'scroll_haste':
                this.player.applyStatusEffect('haste', 15);
                this.addMessage('You feel incredibly fast! (Double speed for 15 turns) ⏩');
                break;
            case 'scroll_identify':
                this.addMessage('You sense the location of all items on this floor! 📜');
                this.items.forEach(item => {
                    item.revealed = true;
                });
                break;
            case 'scroll_mapping':
                this.addMessage('The layout of this level is revealed! 🗺️');
                for (let y = 0; y < this.dungeonHeight; y++) {
                    for (let x = 0; x < this.dungeonWidth; x++) {
                        this.explored[y][x] = true;
                    }
                }
                this.updateVisibility();
                break;
            case 'scroll_summon':
                this.addMessage('You summon a friendly Spirit! 👻');
                // Spirit attacks ALL nearby enemies (within 5 tiles)
                let spiritHits = 0;
                this.monsters.forEach(m => {
                    if (m.isAlive()) {
                        const dist = Math.abs(m.x - this.player.x) + Math.abs(m.y - this.player.y);
                        if (dist <= 5) {
                            const damage = 20; // Spirit does 20 damage to each
                            m.takeDamage(damage);
                            this.addMessage(`The Spirit attacks the ${m.name} for ${damage} damage!`);
                            if (!m.isAlive()) {
                                this.addMessage(`The ${m.name} is destroyed!`);
                                this.player.gainXP(this.combat.getXPForMonster(m));
                            }
                            spiritHits++;
                        }
                    }
                });
                if (spiritHits === 0) {
                    this.addMessage('The Spirit finds no enemies to attack.');
                }
                break;
            case 'potion_shield':
                this.player.applyStatusEffect('shield', 10);
                this.addMessage('You feel your skin harden! (+50% Defense for 10 turns) 🛡️');
                break;
            case 'potion_strength':
                this.player.applyStatusEffect('strength', 10);
                this.addMessage('You feel a surge of power! (+50% Attack for 10 turns) 💪');
                break;
        }
    }

    openShop() {
        this.shop.open();
    }

    closeShop() {
        this.shop.close();
    }

    purchaseItem(itemType, price) {
        this.shop.purchaseItem(itemType, price);
    }

    // Helper function to select monster type based on dungeon depth

    triggerTrap(trap) {
        trap.triggered = true;
        this.sound.playEnemyHit(); // Use hit sound for trap trigger

        switch (trap.type) {
            case 'spikes':
                const damage = 5 + Math.floor(this.currentLevel * 2);
                this.player.takeDamage(damage);
                this.addMessage(`⚠️ You step on a Spike Trap! It deals ${damage} damage!`);
                break;
            case 'poison':
                // Force apply poison even if already poisoned (reset duration)
                this.player.statusEffects.poison.active = true;
                this.player.statusEffects.poison.duration = 10;
                this.addMessage(`⚠️ You trigger a Poison Gas Trap! You are poisoned! ☠️`);
                break;
            case 'summon':
                this.addMessage(`⚠️ You trigger an Alarm Trap! Monsters appear! 🚨`);
                this.combat.spawnMinions({ x: this.player.x, y: this.player.y, name: 'Trap' }, 'kobold', 3);
                break;
            case 'teleport':
                this.addMessage(`⚠️ You step on a Teleport Trap! 🌀`);
                const newPos = this.dungeon.getRandomFloorPosition();
                this.player.x = newPos.x;
                this.player.y = newPos.y;
                this.updateVisibility();
                break;
        }
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
