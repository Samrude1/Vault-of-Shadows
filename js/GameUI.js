class GameUI {
    constructor(game) {
        this.game = game;
    }

    update() {
        document.getElementById('health').textContent = `${this.game.player.health}/${this.game.player.maxHealth}`;
        document.getElementById('player-level').textContent = this.game.player.level;
        document.getElementById('depth').textContent = this.game.currentLevel;
        document.getElementById('gold').textContent = this.game.player.gold;
        document.getElementById('attack').textContent = this.game.player.attack;
        document.getElementById('defense').textContent = this.game.player.defense;
        document.getElementById('hunger').textContent = `${this.game.player.hunger}/${this.game.player.maxHunger}`;

        // Update inventory display
        const inventoryEl = document.getElementById('inventory');
        if (this.game.player.inventory) {
            const itemData = Item.getItemData(this.game.player.inventory);
            inventoryEl.textContent = itemData.name;
            inventoryEl.style.color = '#fbbf24'; // Gold color for items
        } else {
            inventoryEl.textContent = 'Empty';
            inventoryEl.style.color = '#94a3b8'; // Gray for empty
        }

        // Update XP bar
        const xpPercent = (this.game.player.xp / this.game.player.xpToNextLevel) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent = `${this.game.player.xp}/${this.game.player.xpToNextLevel}`;

        // Update health color
        const healthEl = document.getElementById('health');
        const healthPercent = this.game.player.health / this.game.player.maxHealth;
        if (healthPercent > 0.6) {
            healthEl.style.color = '#00ff00';
        } else if (healthPercent > 0.3) {
            healthEl.style.color = '#ffff00';
        } else {
            healthEl.style.color = '#ff0000';
        }

        // Update hunger color
        const hungerEl = document.getElementById('hunger');
        const hungerPercent = this.game.player.hunger / this.game.player.maxHunger;
        if (hungerPercent > 0.6) {
            hungerEl.style.color = '#00ff00';
        } else if (hungerPercent > 0.3) {
            hungerEl.style.color = '#ffff00';
        } else {
            hungerEl.style.color = '#ff0000';
        }

        // Update status effects display
        let statusText = '';
        if (this.game.player.statusEffects.poison.active) {
            statusText += `☠️ Poison (${this.game.player.statusEffects.poison.duration}) `;
        }
        if (this.game.player.statusEffects.burn.active) {
            statusText += `🔥 Burn (${this.game.player.statusEffects.burn.duration}) `;
        }
        if (this.game.player.statusEffects.stun.active) {
            statusText += `💫 Stunned (${this.game.player.statusEffects.stun.duration}) `;
        }

        // Update status effects in messages area or create a status line
        const healthEl2 = document.getElementById('health');
        if (statusText) {
            healthEl2.title = statusText.trim(); // Show as tooltip
        } else {
            healthEl2.title = '';
        }
    }

    addMessage(text) {
        this.game.messages.push(text);
        if (this.game.messages.length > this.game.maxMessages) {
            this.game.messages.shift();
        }
        this.updateMessages();
    }

    updateMessages() {
        const messagesEl = document.getElementById('messages');
        messagesEl.innerHTML = '';
        this.game.messages.forEach((msg, i) => {
            const div = document.createElement('div');
            div.className = 'message';
            if (i === this.game.messages.length - 1) {
                div.className += ' new';
            }
            div.textContent = msg;
            messagesEl.appendChild(div);
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
}
