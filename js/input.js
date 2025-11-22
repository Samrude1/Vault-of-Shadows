class InputHandler {
    constructor() {
        this.keys = {};
        this.lastKey = null;
        
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            this.lastKey = key;
            
            // Prevent default browser behavior for game keys
            if (['w', 'a', 's', 'd', 'q', 'e', 'z', 'c', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    isPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }

    getMovement() {
        if (this.isPressed('w') || this.isPressed('arrowup')) return { dx: 0, dy: -1 };
        if (this.isPressed('s') || this.isPressed('arrowdown')) return { dx: 0, dy: 1 };
        if (this.isPressed('a') || this.isPressed('arrowleft')) return { dx: -1, dy: 0 };
        if (this.isPressed('d') || this.isPressed('arrowright')) return { dx: 1, dy: 0 };
        
        // Diagonal movement
        if (this.isPressed('q')) return { dx: -1, dy: -1 };
        if (this.isPressed('e')) return { dx: 1, dy: -1 };
        if (this.isPressed('z')) return { dx: -1, dy: 1 };
        if (this.isPressed('c')) return { dx: 1, dy: 1 };
        
        return null;
    }

    isWait() {
        return this.isPressed(' ') || this.isPressed('space');
    }

    consumeLastKey() {
        const key = this.lastKey;
        this.lastKey = null;
        return key;
    }

    clear() {
        this.lastKey = null;
    }
}

