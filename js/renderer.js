class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 16;
        this.fontSize = 16;
        this.setupCanvas();
    }

    setupCanvas() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.cols = Math.floor(this.canvas.width / this.tileSize);
        this.rows = Math.floor(this.canvas.height / this.tileSize);
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render(game, dungeon, player, monsters, items) {
        this.clear();

        // Calculate camera offset to center on player
        const cameraX = Math.max(0, Math.min(
            dungeon.width - this.cols,
            player.x - Math.floor(this.cols / 2)
        ));
        const cameraY = Math.max(0, Math.min(
            dungeon.height - this.rows,
            player.y - Math.floor(this.rows / 2)
        ));

        // Render dungeon
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const dungeonX = x + cameraX;
                const dungeonY = y + cameraY;

                if (dungeonX >= 0 && dungeonX < dungeon.width && dungeonY >= 0 && dungeonY < dungeon.height) {
                    const tile = dungeon.getTile(dungeonX, dungeonY);
                    this.drawTileWithFog(x * this.tileSize, y * this.tileSize, tile, game.isVisible(dungeonX, dungeonY), game.isExplored(dungeonX, dungeonY));
                }
            }
        }

        // Render items
        items.forEach(item => {
            if (!item.pickedUp && game.isVisible(item.x, item.y)) {
                const screenX = (item.x - cameraX) * this.tileSize;
                const screenY = (item.y - cameraY) * this.tileSize;
                if (this.isOnScreen(screenX, screenY)) {
                    this.drawEntity(screenX, screenY, item.symbol, item.color);
                }
            }
        });

        // Render monsters
        monsters.forEach(monster => {
            if (monster.isAlive() && game.isVisible(monster.x, monster.y)) {
                const screenX = (monster.x - cameraX) * this.tileSize;
                const screenY = (monster.y - cameraY) * this.tileSize;
                if (this.isOnScreen(screenX, screenY)) {
                    this.drawEntity(screenX, screenY, monster.symbol, monster.color);
                }
            }
        });

        // Render player
        const playerScreenX = (player.x - cameraX) * this.tileSize;
        const playerScreenY = (player.y - cameraY) * this.tileSize;
        if (this.isOnScreen(playerScreenX, playerScreenY)) {
            this.drawEntity(playerScreenX, playerScreenY, player.symbol, player.color);
        }
    }

    isOnScreen(x, y) {
        return x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height;
    }

    drawTile(x, y, tile) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

        let char = '';
        let color = '#666';

        switch (tile) {
            case '#':
                char = '#';
                color = '#666';
                break;
            case '.':
                char = '.';
                color = '#333';
                break;
            case '+':
                char = '+';
                color = '#8b4513';
                break;
            case '>':
                char = '>';
                color = '#ffaa00';
                break;
            case '<':
                char = '<';
                color = '#ffaa00';
                break;
            case '<':
                char = '<';
                color = '#ffaa00';
                break;
        }

        this.drawEntity(x, y, char, color);
    }

    drawTileWithFog(x, y, tile, isVisible, isExplored) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

        let char = '';
        let color = '#666';

        // Only show tiles that are visible or explored
        if (isVisible) {
            // Fully visible - normal colors
            switch (tile) {
                case '#':
                    char = '#';
                    color = '#666';
                    break;
                case '.':
                    char = '.';
                    color = '#333';
                    break;
                case '+':
                    char = '+';
                    color = '#8b4513';
                    break;
                case '>':
                    char = '>';
                    color = '#ffaa00';
                    break;
                case '<':
                    char = '<';
                    color = '#ffaa00';
                    break;
                case '&':
                    char = '&';
                    color = '#00ff00';
                    break;
            }
        } else if (isExplored) {
            // Explored but not visible - dimmed
            switch (tile) {
                case '#':
                    char = '#';
                    color = '#333';
                    break;
                case '.':
                    char = '.';
                    color = '#111';
                    break;
                case '+':
                    char = '+';
                    color = '#4a2c1a';
                    break;
                case '>':
                    char = '>';
                    color = '#805500';
                    break;
                case '<':
                    char = '<';
                    color = '#805500';
                    break;
                case '&':
                    char = '&';
                    color = '#008000';
                    break;
            }
        }
        // If not visible and not explored, don't draw anything (stays black)

        if (char) {
            this.drawEntity(x, y, char, color);
        }
    }

    drawEntity(x, y, symbol, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${this.fontSize}px monospace`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(symbol, x + 2, y + 2);
    }
}



