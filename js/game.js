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

        this.messages = [];
        this.maxMessages = 5;
        this.winLevel = 5; // Level where Amulet of Yendor appears

        // Hunger system
        this.turnCounter = 0;
        this.hungerDecreaseInterval = 10; // Decrease hunger every 10 turns

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

        // Create monsters
        this.monsters = [];
        const numMonsters = 5 + Math.floor(this.currentLevel * 2);
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
                    const type = this.selectMonsterType(this.currentLevel);
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

    setupSoundSettings() {
        const settingsToggle = document.getElementById('settings-toggle');
        const settingsPanel = document.getElementById('settings-panel');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        const muteToggle = document.getElementById('mute-toggle');

        // Load saved settings
        volumeSlider.value = this.sound.volume * 100;
        volumeValue.textContent = Math.round(this.sound.volume * 100) + '%';
        muteToggle.textContent = this.sound.isMuted() ? 'ðŸ”‡ Muted' : 'ðŸ”Š Unmuted';

        // Toggle settings panel
        settingsToggle.addEventListener('click', () => {
            settingsPanel.classList.toggle('hidden');
        });

        // Volume slider
        volumeSlider.addEventListener('input', () => {
            const volume = volumeSlider.value / 100;
            this.sound.setVolume(volume);
            volumeValue.textContent = volumeSlider.value + '%';
        });

        // Mute toggle
        muteToggle.addEventListener('click', () => {
            const muted = this.sound.toggleMute();
            muteToggle.textContent = muted ? 'ðŸ”‡ Muted' : 'ðŸ”Š Unmuted';
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
        this.monsterTurn();

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
            const killed = this.player.attackTarget(monsterAtPos);
            const damage = Math.max(1, this.player.attack - monsterAtPos.defense + Math.floor(Math.random() * 3));
            this.addMessage(`You attack the ${monsterAtPos.name} for ${damage} damage!`);
            this.sound.playHit();

            if (killed) {
                // Generate drops from killed monster
                const drops = monsterAtPos.generateDrops();
                drops.forEach(drop => {
                    this.items.push(new Item(monsterAtPos.x, monsterAtPos.y, drop.type, drop.value));
                });

                this.addMessage(`You killed the ${monsterAtPos.name}!`);
                this.sound.playKill();
            } else {
                // Monster counterattacks
                const playerKilled = monsterAtPos.attackTarget(this.player);
                const monsterDamage = Math.max(1, monsterAtPos.attack - this.player.defense + Math.floor(Math.random() * 3));
                this.addMessage(`The ${monsterAtPos.name} attacks you for ${monsterDamage} damage!`);
                this.sound.playEnemyHit();

                if (playerKilled) {
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
        this.monsterTurn();

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

    monsterTurn() {
        // Remove dead monsters
        this.monsters = this.monsters.filter(m => m.isAlive());

        // Each monster acts
        this.monsters.forEach(monster => {
            if (monster.isAlive()) {
                // Zombie regeneration
                if (monster.type === 'zombie') {
                    monster.regenerate();
                }

                // Check if monster is adjacent to player
                const distX = Math.abs(monster.x - this.player.x);
                const distY = Math.abs(monster.y - this.player.y);

                if (distX <= 1 && distY <= 1 && !(distX === 0 && distY === 0)) {
                    // Monster attacks player
                    const killed = monster.attackTarget(this.player);
                    const damage = Math.max(1, monster.attack - this.player.defense + Math.floor(Math.random() * 3));
                    this.addMessage(`The ${monster.name} attacks you for ${damage} damage!`);
                    this.sound.playEnemyHit();

                    // Dragon area damage (hits even if not directly adjacent)
                    if (monster.areaDamage && distX <= 2 && distY <= 2) {
                        const areaDamage = Math.floor(damage * 0.5);
                        if (areaDamage > 0) {
                            this.player.takeDamage(areaDamage);
                            this.addMessage(`The ${monster.name}'s flames scorch you for ${areaDamage} additional damage!`);
                        }
                    }

                    if (killed) {
                        this.endGame(false);
                        return;
                    }
                } else {
                    // Monster moves
                    monster.act(this.player, this.dungeon, this.monsters);
                }
            }
        });
    }

    goToNextLevel() {
        this.currentLevel++;
        this.addMessage(`You descend to level ${this.currentLevel}...`);
        this.sound.playLevelDown();

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

        // Create new monsters (more on deeper levels)
        this.monsters = [];
        const numMonsters = 5 + Math.floor(this.currentLevel * 2);
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
                    const type = this.selectMonsterType(this.currentLevel);
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
                const scrollTypes = ['scroll_teleport', 'scroll_magic_missile', 'scroll_healing', 'scroll_enchantment'];
                const scrollType = scrollTypes[Math.floor(Math.random() * scrollTypes.length)];
                this.items.push(new Item(pos.x, pos.y, scrollType));
            }
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

    // Create new monsters
    this.monsters = [];
    const numMonsters = 5 + Math.floor(this.currentLevel * 2);
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
                const type = this.selectMonsterType(this.currentLevel);
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
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('depth').textContent = this.currentLevel;
        document.getElementById('gold').textContent = this.player.gold;
        document.getElementById('hunger').textContent = `${this.player.hunger}/${this.player.maxHunger}`;

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
    }

    render() {
        this.renderer.render(this.dungeon, this.player, this.monsters, this.items);
    }

    handleScrollEffect(scrollType, scrollName) {
        switch (scrollType) {
            case 'scroll_teleport':
                // Teleport player to random location
                const newPos = this.dungeon.getRandomFloorPosition();
                this.player.x = newPos.x;
                this.player.y = newPos.y;
                this.addMessage(`You read the ${scrollName}. You are teleported!`);
                this.sound.playItemPickup();
                break;

            case 'scroll_magic_missile':
                // Damage all monsters within 3 tiles
                let hitCount = 0;
                this.monsters.forEach(monster => {
                    if (monster.isAlive()) {
                        const distX = Math.abs(monster.x - this.player.x);
                        const distY = Math.abs(monster.y - this.player.y);
                        const distance = Math.max(distX, distY);

                        if (distance <= 3) {
                            const killed = monster.takeDamage(10);
                            hitCount++;
                            if (killed) {
                                this.addMessage(`The magic missile kills the ${monster.name}!`);
                                // Generate drops
                                const drops = monster.generateDrops();
                                drops.forEach(drop => {
                                    this.items.push(new Item(monster.x, monster.y, drop.type, drop.value));
                                });
                            }
                        }
                    }
                });
                this.addMessage(`You read the ${scrollName}. Magic missiles strike ${hitCount} ${hitCount === 1 ? 'enemy' : 'enemies'}!`);
                this.sound.playHit();
                break;

            case 'scroll_healing':
                // Restore 15 health
                this.player.heal(15);
                this.addMessage(`You read the ${scrollName}. You feel much better!`);
                this.sound.playHeal();
                break;

            case 'scroll_enchantment':
                // Increase attack and defense by 1
                this.player.attack += 1;
                this.player.defense += 1;
                this.addMessage(`You read the ${scrollName}. You feel empowered! Attack +1, Defense +1!`);
                this.sound.playEquip();
                break;
        }
    }

    // Helper function to select monster type based on dungeon depth
    selectMonsterType(level) {
        const distributions = {
            1: [
                { type: 'kobold', weight: 70 },
                { type: 'bat', weight: 20 },
                { type: 'goblin', weight: 10 }
            ],
            2: [
                { type: 'kobold', weight: 70 },
                { type: 'bat', weight: 20 },
                { type: 'goblin', weight: 10 }
            ],
            3: [
                { type: 'kobold', weight: 40 },
                { type: 'bat', weight: 20 },
                { type: 'goblin', weight: 20 },
                { type: 'skeleton', weight: 15 },
                { type: 'orc', weight: 5 }
            ],
            4: [
                { type: 'kobold', weight: 40 },
                { type: 'bat', weight: 20 },
                { type: 'goblin', weight: 20 },
                { type: 'skeleton', weight: 15 },
                { type: 'orc', weight: 5 }
            ],
            5: [
                { type: 'orc', weight: 30 },
                { type: 'skeleton', weight: 25 },
                { type: 'goblin', weight: 20 },
                { type: 'troll', weight: 15 },
                { type: 'zombie', weight: 10 }
            ],
            6: [
                { type: 'orc', weight: 30 },
                { type: 'skeleton', weight: 25 },
                { type: 'goblin', weight: 20 },
                { type: 'troll', weight: 15 },
                { type: 'zombie', weight: 10 }
            ]
        };

        // For levels 7+, use a different distribution
        const deepDistribution = [
            { type: 'troll', weight: 30 },
            { type: 'zombie', weight: 25 },
            { type: 'skeleton', weight: 20 },
            { type: 'orc', weight: 15 },
            { type: 'dragon', weight: 10 }
        ];

        const distribution = level >= 7 ? deepDistribution : (distributions[level] || distributions[1]);

        // Calculate total weight
        const totalWeight = distribution.reduce((sum, item) => sum + item.weight, 0);

        // Random selection based on weights
        let random = Math.random() * totalWeight;
        for (const item of distribution) {
            random -= item.weight;
            if (random <= 0) {
                return item.type;
            }
        }

        return 'kobold'; // Fallback
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

