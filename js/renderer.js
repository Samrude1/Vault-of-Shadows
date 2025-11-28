class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 24;
        this.fontSize = 16;
        this.setupCanvas();

        this.tileCache = {};
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.cols = Math.floor(this.canvas.width / this.tileSize);
        this.rows = Math.floor(this.canvas.height / this.tileSize);
    }

    clear() {
        // Much darker background for better contrast
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render(game, dungeon, player, monsters, items) {
        this.clear();

        const cameraX = Math.max(0, Math.min(
            dungeon.width - this.cols,
            player.x - Math.floor(this.cols / 2)
        ));
        const cameraY = Math.max(0, Math.min(
            dungeon.height - this.rows,
            player.y - Math.floor(this.rows / 2)
        ));

        // Render dungeon tiles
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const dungeonX = x + cameraX;
                const dungeonY = y + cameraY;

                if (dungeonX >= 0 && dungeonX < dungeon.width && dungeonY >= 0 && dungeonY < dungeon.height) {
                    const tile = dungeon.getTile(dungeonX, dungeonY);
                    const isVisible = game.isVisible(dungeonX, dungeonY);
                    const isExplored = game.isExplored(dungeonX, dungeonY);

                    this.drawTile(x * this.tileSize, y * this.tileSize, tile, isVisible, isExplored, game.currentLevel);
                }
            }
        }

        // Render traps (only if triggered/revealed)
        if (game.traps) {
            game.traps.forEach(trap => {
                if (trap.triggered && game.isVisible(trap.x, trap.y)) {
                    const screenX = (trap.x - cameraX) * this.tileSize;
                    const screenY = (trap.y - cameraY) * this.tileSize;
                    if (this.isOnScreen(screenX, screenY)) {
                        this.drawToken(screenX, screenY, '^', '#ef4444', 'trap');
                    }
                }
            });
        }

        // Render items
        items.forEach(item => {
            if (!item.pickedUp && game.isVisible(item.x, item.y)) {
                const screenX = (item.x - cameraX) * this.tileSize;
                const screenY = (item.y - cameraY) * this.tileSize;
                if (this.isOnScreen(screenX, screenY)) {
                    this.drawToken(screenX, screenY, item.symbol, item.color, 'item');
                }
            }
        });

        // Render monsters
        monsters.forEach(monster => {
            if (monster.isAlive() && game.isVisible(monster.x, monster.y)) {
                const screenX = (monster.x - cameraX) * this.tileSize;
                const screenY = (monster.y - cameraY) * this.tileSize;
                if (this.isOnScreen(screenX, screenY)) {
                    this.drawToken(screenX, screenY, monster.symbol, monster.color, 'monster');
                }
            }
        });

        // Render player
        const playerScreenX = (player.x - cameraX) * this.tileSize;
        const playerScreenY = (player.y - cameraY) * this.tileSize;
        if (this.isOnScreen(playerScreenX, playerScreenY)) {
            this.drawToken(playerScreenX, playerScreenY, player.symbol, player.color, 'player');
        }
    }

    isOnScreen(x, y) {
        return x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height;
    }

    drawTile(x, y, tile, isVisible, isExplored, level = 1) {
        if (!isVisible && !isExplored) return;

        const ctx = this.ctx;

        // High contrast fog of war
        // Visible: Full brightness
        // Explored: Very dim (20% opacity) to create "dark corridor" feel
        const opacity = isVisible ? 1.0 : 0.2;
        ctx.globalAlpha = opacity;

        switch (tile) {
            case '#': // Wall
                this.drawWall(x, y, isVisible, level);
                break;
            case '.': // Floor
                this.drawFloor(x, y, isVisible);
                break;
            case '+': // Door
                this.drawFloor(x, y, isVisible);
                this.drawDoor(x, y, isVisible);
                break;
            case '>': // Stairs Down
                this.drawFloor(x, y, isVisible);
                this.drawStairs(x, y, true, isVisible);
                break;
            case '<': // Stairs Up
                this.drawFloor(x, y, isVisible);
                this.drawStairs(x, y, false, isVisible);
                break;
            case '&': // Shop
                this.drawFloor(x, y, isVisible);
                this.drawShop(x, y, isVisible);
                break;
        }

        ctx.globalAlpha = 1.0;
    }

    drawWall(x, y, isVisible, level = 1) {
        const ctx = this.ctx;
        const s = this.tileSize;

        // Progressive wall colors every 3 levels
        // Colors are chosen to be always visible (never too dark)
        let baseColor, darkColor, lightColor;

        const tier = Math.floor((level - 1) / 3); // 0 for levels 1-3, 1 for 4-6, etc.

        switch (tier % 6) { // Cycle through 6 color schemes
            case 0: // Levels 1-3: Gray stone (default)
                baseColor = '#404040';
                darkColor = '#262626';
                lightColor = '#525252';
                break;
            case 1: // Levels 4-6: Brown/Earth stone
                baseColor = '#4a3f35';
                darkColor = '#2d2419';
                lightColor = '#5c4d3f';
                break;
            case 2: // Levels 7-9: Blue-gray stone
                baseColor = '#3d4a52';
                darkColor = '#252e33';
                lightColor = '#4f5f6b';
                break;
            case 3: // Levels 10-12: Purple-gray stone
                baseColor = '#4a3f52';
                darkColor = '#2d2433';
                lightColor = '#5c4f6b';
                break;
            case 4: // Levels 13-15: Green-gray stone
                baseColor = '#3f4a3f';
                darkColor = '#242d24';
                lightColor = '#4f5f4f';
                break;
            case 5: // Levels 16-18: Red-gray stone
                baseColor = '#4a3f3f';
                darkColor = '#2d2424';
                lightColor = '#5c4f4f';
                break;
        }

        // Main block
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, s, s);

        // Top highlight (3D effect)
        ctx.fillStyle = lightColor;
        ctx.fillRect(x, y, s, s / 4);

        // Side shadow
        ctx.fillStyle = darkColor;
        ctx.fillRect(x + s - s / 4, y, s / 4, s);

        // Brick pattern - subtle
        ctx.strokeStyle = '#171717';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + s / 2);
        ctx.lineTo(x + s, y + s / 2);
        ctx.moveTo(x + s / 2, y);
        ctx.lineTo(x + s / 2, y + s / 2);
        ctx.moveTo(x + s / 4, y + s / 2);
        ctx.lineTo(x + s / 4, y + s);
        ctx.moveTo(x + s * 0.75, y + s / 2);
        ctx.lineTo(x + s * 0.75, y + s);
        ctx.stroke();
    }

    drawFloor(x, y, isVisible) {
        const ctx = this.ctx;
        const s = this.tileSize;

        // Dark floor for high contrast with tokens
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x, y, s, s);

        // Very subtle tile border
        ctx.strokeStyle = '#262626';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, s, s);

        // Center dot for classic feel (optional, but adds texture)
        ctx.fillStyle = '#262626';
        ctx.fillRect(x + s / 2 - 1, y + s / 2 - 1, 2, 2);
    }

    drawDoor(x, y, isVisible) {
        const ctx = this.ctx;
        const s = this.tileSize;

        ctx.fillStyle = '#854d0e'; // Darker wood
        ctx.fillRect(x + 4, y + 4, s - 8, s - 8);

        ctx.fillStyle = '#ca8a04'; // Gold knob
        ctx.beginPath();
        ctx.arc(x + s - 8, y + s / 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStairs(x, y, isDown, isVisible) {
        const ctx = this.ctx;
        const s = this.tileSize;

        ctx.fillStyle = '#ca8a04'; // Gold/Yellow stairs

        const steps = 3;
        const stepH = (s - 8) / steps;

        for (let i = 0; i < steps; i++) {
            if (isDown) {
                // Stairs going down: steps get narrower as they descend
                const width = s - 8 - (i * 4);
                const offsetX = 4 + (i * 2);
                const offsetY = 4 + (i * stepH);
                ctx.fillRect(x + offsetX, y + offsetY, width, stepH);
            } else {
                // Stairs going up: steps get wider as they ascend (reverse order)
                const width = s - 8 - ((steps - 1 - i) * 4);
                const offsetX = 4 + ((steps - 1 - i) * 2);
                const offsetY = 4 + (i * stepH);
                ctx.fillRect(x + offsetX, y + offsetY, width, stepH);
            }
        }
    }

    drawShop(x, y, isVisible) {
        const ctx = this.ctx;
        const s = this.tileSize;

        ctx.fillStyle = '#064e3b'; // Dark green carpet
        ctx.fillRect(x + 2, y + 2, s - 4, s - 4);

        ctx.fillStyle = '#10b981';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⌂', x + s / 2, y + s / 2);
    }

    drawToken(x, y, symbol, color, type) {
        const ctx = this.ctx;
        const s = this.tileSize;
        const cx = x + s / 2;
        const cy = y + s / 2;
        const r = s / 2 - 2;

        // Stronger shadow for pop
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 3, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Token background - Darker to match new theme
        ctx.fillStyle = type === 'player' ? '#0891b2' :
            type === 'monster' ? '#27272a' : '#312e81';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Bright border for contrast
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Gloss
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.3, r * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Symbol
        ctx.fillStyle = color;
        ctx.font = `bold ${this.fontSize}px "Segoe UI Emoji", "Noto Color Emoji", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, cx, cy + 1);
    }
}
