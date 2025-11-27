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

        this.currentLevel = 1;
        this.gameOver = false;
        this.waitingForInput = false;
        this.hasAmulet = false;
        this.audioEnabled = false;
        this.shopOpen = false;
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
                    this.monsters.push(new Monster(pos.x, pos.y, type));
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
        muteToggle.textContent = this.sound.isMuted() ? '??' : '??';

        // Remove any existing event listeners by cloning and replacing
        const muteClone = muteToggle.cloneNode(true);
        muteToggle.parentNode.replaceChild(muteClone, muteToggle);

        // Mute toggle
        muteClone.addEventListener('click', () => {
            const muted = this.sound.toggleMute();
            muteClone.textContent = muted ? '??' : '??';
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
            if (this.input.isShop() && !this.shopOpen) {
                const playerTile = this.dungeon.getTile(this.player.x, this.player.y);
                if (playerTile === '&') {
                    this.openShop();
                    return;
                }
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
                attackMsg += ' ?? CRITICAL HIT!';
            }
            attackMsg += '!';
            this.addMessage(attackMsg);
            this.sound.playHit();

            // Handle boss abilities triggered by damage
            if (monsterAtPos.isBoss) {
                // Lich Teleport
                if (monsterAtPos.shouldTeleport) {
                    const newPos = this.dungeon.getRandomFloorPosition();
                    monsterAtPos.x = newPos.x;
                    monsterAtPos.y = newPos.y;
                    monsterAtPos.shouldTeleport = false;
                    this.addMessage(`The ${monsterAtPos.name} teleports away! ??`);
                }

                // Kobold King Summon (triggered by damage threshold)
                if (monsterAtPos.shouldSummon) {
                    this.handleBossAbilities(monsterAtPos);
                }
            }

            if (result.killed) {
                // Award XP for kill
                const xpReward = this.combat.getXPForMonster(monsterAtPos.type);
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
                    this.addMessage(`? LEVEL UP! You are now level ${this.player.level}!`);
                    this.sound.playItemPickup(); // Use pickup sound for level up
                }
            } else {
                // Monster counterattacks
                const counterResult = monsterAtPos.attackTarget(this.player);

                // Display counterattack message with crit/dodge indicators
                if (counterResult.dodged) {
                    this.addMessage(`The ${monsterAtPos.name} attacks but you DODGE! ?`);
                } else {
                    let counterMsg = `The ${monsterAtPos.name} attacks you for ${counterResult.damage} damage`;
                    if (counterResult.isCrit) {
                        counterMsg += ' ?? CRITICAL!';
                    }
                    counterMsg += '!';
                    this.addMessage(counterMsg);
                    this.sound.playEnemyHit();

                    // Apply status effect if any
                    if (counterResult.statusEffect) {
                        this.player.applyStatusEffect(
                            counterResult.statusEffect.type,
                            counterResult.statusEffect.duration
                        );
                        const effectName = counterResult.statusEffect.type.charAt(0).toUpperCase() +
                            counterResult.statusEffect.type.slice(1);
                        this.addMessage(`You are ${effectName}ed! ??`);
                    }
                }

                if (counterResult.killed) {
                    this.endGame(false);
                    this.waitingForInput = false;
                    return;
                }
            }
        } else if (itemAtPos) {
            // Pick up item
            const message = itemAtPos.use(this.player);
            itemAtPos.pickedUp = true;

            // Check if it's a scroll (returns object with scrollType)
            if (typeof message === 'object' && message.scrollType) {
                this.handleScrollEffect(message.scrollType, message.scrollName);
            } else {
                this.addMessage(message);
            }

            this.player.move(movement.dx, movement.dy, this.dungeon);

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
                this.addMessage(`?? Poison deals ${msg.damage} damage!`);
            } else if (msg.type === 'burn') {
                this.addMessage(`?? Burn deals ${msg.damage} damage!`);
            } else if (msg.type === 'poison_end') {
                this.addMessage('The poison wears off.');
            } else if (msg.type === 'burn_end') {
                this.addMessage('The burning subsides.');
            } else if (msg.type === 'stun_end') {
                this.addMessage('You recover from being stunned.');
            } else if (msg.type === 'haste_end') {
                this.addMessage('You feel your speed return to normal.');
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
                    this.monsters.push(new Monster(pos.x, pos.y, type));
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
                    this.monsters.push(new Monster(pos.x, pos.y, type));
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
        this.populateSpecialRooms();

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
        this.messages.push(text);
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        this.updateMessages();
    }

    updateMessages() {
        const messagesEl = document.getElementById('messages');
        messagesEl.innerHTML = '';
        this.messages.forEach((msg, i) => {
            const div = document.createElement('div');
            div.className = 'message';
            if (i === this.messages.length - 1) {
                div.className += ' new';
            }
            div.textContent = msg;
            messagesEl.appendChild(div);
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    updateUI() {
        document.getElementById('health').textContent = `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('player-level').textContent = this.player.level;
        document.getElementById('depth').textContent = this.currentLevel;
        document.getElementById('gold').textContent = this.player.gold;
        document.getElementById('attack').textContent = this.player.attack;
        document.getElementById('defense').textContent = this.player.defense;
        document.getElementById('hunger').textContent = `${this.player.hunger}/${this.player.maxHunger}`;

        // Update XP bar
        const xpPercent = (this.player.xp / this.player.xpToNextLevel) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent = `${this.player.xp}/${this.player.xpToNextLevel}`;

        // Update health color
        const healthEl = document.getElementById('health');
        const healthPercent = this.player.health / this.player.maxHealth;
        if (healthPercent > 0.6) {
            healthEl.style.color = '#00ff00';
        } else if (healthPercent > 0.3) {
            healthEl.style.color = '#ffff00';
        } else {
            healthEl.style.color = '#ff0000';
        }

        // Update hunger color
        const hungerEl = document.getElementById('hunger');
        const hungerPercent = this.player.hunger / this.player.maxHunger;
        if (hungerPercent > 0.6) {
            hungerEl.style.color = '#00ff00';
        } else if (hungerPercent > 0.3) {
            hungerEl.style.color = '#ffff00';
        } else {
            hungerEl.style.color = '#ff0000';
        }

        // Update status effects display
        let statusText = '';
        if (this.player.statusEffects.poison.active) {
            statusText += `?? Poison (${this.player.statusEffects.poison.duration}) `;
        }
        if (this.player.statusEffects.burn.active) {
            statusText += `?? Burn (${this.player.statusEffects.burn.duration}) `;
        }
        if (this.player.statusEffects.stun.active) {
            statusText += `?? Stunned (${this.player.statusEffects.stun.duration}) `;
        }

        // Update status effects in messages area or create a status line
        const healthEl2 = document.getElementById('health');
        if (statusText) {
            healthEl2.title = statusText.trim(); // Show as tooltip
        } else {
            healthEl2.title = '';
        }
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
                this.addMessage('You are teleported to a new location! ??');
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
                    this.addMessage(`A magic missile strikes the ${nearest.name} for ${damage} damage! ?`);
                    if (!nearest.isAlive()) {
                        this.addMessage(`The ${nearest.name} is killed!`);
                        this.player.gainXP(this.combat.getXPForMonster(nearest.type));
                    }
                } else {
                    this.addMessage('But nothing happens.');
                }
                break;
            case 'scroll_healing':
                this.player.heal(20);
                this.addMessage('You feel much better! ??');
                break;
            case 'scroll_enchantment':
                if (Math.random() < 0.5) {
                    this.player.attack += 1;
                    this.addMessage('Your weapon glows with magical energy! (+1 Attack) ??');
                } else {
                    this.player.defense += 1;
                    this.addMessage('Your armor hardens! (+1 Defense) ???');
                }
                break;
            case 'scroll_fireball':
                this.addMessage('A massive fireball explodes around you! ??');
                let hitCount = 0;
                this.monsters.forEach(m => {
                    if (m.isAlive()) {
                        const dist = Math.max(Math.abs(m.x - this.player.x), Math.abs(m.y - this.player.y));
                        if (dist <= 3) { // 3 tile radius
                            const damage = 15;
                            m.takeDamage(damage);
                            this.addMessage(`The ${m.name} is burned for ${damage} damage!`);
                            if (!m.isAlive()) {
                                this.player.gainXP(this.combat.getXPForMonster(m.type));
                            }
                            hitCount++;
                        }
                    }
                });
                if (hitCount === 0) this.addMessage('The fireball hits nothing.');
                break;
            case 'scroll_freeze':
                this.addMessage('A freezing blast expands from you! ??');
                this.monsters.forEach(m => {
                    if (m.isAlive()) {
                        const dist = Math.max(Math.abs(m.x - this.player.x), Math.abs(m.y - this.player.y));
                        if (dist <= 4) {
                            m.stunned = 2; // We'll need to check this in monster.act()
                            this.addMessage(`The ${m.name} is frozen solid!`);
                        }
                    }
                });
                break;
            case 'scroll_haste':
                this.player.applyStatusEffect('haste', 10);
                this.addMessage('You feel incredibly fast! (Double speed) ?');
                break;
            case 'scroll_identify':
                this.addMessage('You gain knowledge of the items on this floor! ??');
                // For now, just a message as we don't have unidentified items system fully working
                break;
            case 'scroll_mapping':
                this.addMessage('The layout of this level is revealed! ???');
                for (let y = 0; y < this.dungeonHeight; y++) {
                    for (let x = 0; x < this.dungeonWidth; x++) {
                        this.explored[y][x] = true;
                    }
                }
                this.updateVisibility();
                break;
            case 'scroll_summon':
                this.addMessage('You summon a friendly Spirit! ??');
                // Deal damage to a random enemy as a "summoned ally attack"
                let target = null;
                this.monsters.forEach(m => {
                    if (m.isAlive() && !target) target = m;
                });
                if (target) {
                    target.takeDamage(10);
                    this.addMessage(`The Spirit attacks the ${target.name} for 10 damage!`);
                    if (!target.isAlive()) {
                        this.player.gainXP(this.combat.getXPForMonster(target.type));
                    }
                }
                break;
        }
    }

    openShop() {
        this.shopOpen = true;
        this.sound.playShop();

        const shopOverlay = document.getElementById('shop-overlay');
        const shopGoldAmount = document.getElementById('shop-gold-amount');
        const shopClose = document.getElementById('shop-close');

        // Update gold display
        shopGoldAmount.textContent = this.player.gold;

        // Show shop
        shopOverlay.classList.remove('hidden');

        // Setup shop item click handlers
        const shopItems = document.querySelectorAll('.shop-item');
        shopItems.forEach(item => {
            // Remove existing listeners by cloning
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            newItem.addEventListener('click', () => {
                const itemType = newItem.getAttribute('data-item');
                const price = parseInt(newItem.getAttribute('data-price'));
                this.purchaseItem(itemType, price);
            });
        });

        // Setup close button
        const newCloseBtn = shopClose.cloneNode(true);
        shopClose.parentNode.replaceChild(newCloseBtn, shopClose);
        newCloseBtn.addEventListener('click', () => {
            this.closeShop();
        });

        // Setup ESC key to close shop
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeShop();
                window.removeEventListener('keydown', escHandler);
            }
        };
        window.addEventListener('keydown', escHandler);

        this.addMessage('Welcome to the shop! Press B or ESC to close.');
    }

    closeShop() {
        this.shopOpen = false;
        const shopOverlay = document.getElementById('shop-overlay');
        shopOverlay.classList.add('hidden');
    }

    purchaseItem(itemType, price) {
        if (this.player.gold < price) {
            this.addMessage('Not enough gold!');
            return;
        }

        this.player.gold -= price;
        this.sound.playPurchase();

        switch (itemType) {
            case 'health_potion':
                this.player.heal(10);
                this.addMessage(`Purchased Health Potion for ${price} gold. +10 HP!`);
                break;
            case 'rations':
                this.player.eat(30);
                this.addMessage(`Purchased Rations for ${price} gold. Hunger restored!`);
                break;
            case 'bread':
                this.player.eat(20);
                this.addMessage(`Purchased Bread for ${price} gold. Hunger restored!`);
                break;
            case 'attack_upgrade':
                this.player.attack += 1;
                this.addMessage(`Purchased Attack Upgrade for ${price} gold. Attack +1!`);
                break;
            case 'defense_upgrade':
                this.player.defense += 1;
                this.addMessage(`Purchased Defense Upgrade for ${price} gold. Defense +1!`);
                break;
        }

        // Update shop gold display
        document.getElementById('shop-gold-amount').textContent = this.player.gold;
        this.updateUI();
    }

    // Helper function to select monster type based on dungeon depth

}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
