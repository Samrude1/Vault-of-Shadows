class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.muted = false;

        // Load settings from localStorage
        const savedVolume = localStorage.getItem('rogueVolume');
        const savedMuted = localStorage.getItem('rogueMuted');

        this.volume = savedVolume ? parseFloat(savedVolume) : 0.3;
        this.muted = savedMuted === 'true';

        this.init();
    }

    init() {
        try {
            // Create audio context (needs user interaction to start)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported, sounds disabled');
            this.enabled = false;
        }
    }

    // Enable audio context (must be called after user interaction)
    enable() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level)); // Clamp between 0 and 1
        localStorage.setItem('rogueVolume', this.volume.toString());
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('rogueMuted', this.muted.toString());
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    playTone(frequency, duration, type = 'sine', volume = this.volume) {
        if (!this.enabled || !this.audioContext || this.muted) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Silently fail if audio context is not ready
        }
    }

    playSequence(frequencies, duration, type = 'sine', volume = this.volume) {
        if (!this.enabled || !this.audioContext) return;

        frequencies.forEach((freq, index) => {
            const delay = index * duration;
            setTimeout(() => {
                this.playTone(freq, duration * 0.8, type, volume);
            }, delay * 1000);
        });
    }

    // Sound effects
    playMove() {
        this.playTone(200, 0.05, 'sine', 0.1);
    }

    playHit() {
        this.playTone(150, 0.1, 'sawtooth', 0.4);
    }

    playEnemyHit() {
        this.playTone(100, 0.1, 'sawtooth', 0.5);
    }

    playKill() {
        this.playSequence([300, 400, 500], 0.1, 'sine', 0.3);
    }

    playItemPickup() {
        this.playSequence([400, 500, 600], 0.08, 'sine', 0.3);
    }

    playLevelDown() {
        this.playSequence([200, 150, 100, 50], 0.15, 'sine', 0.4);
    }

    playGameOver() {
        this.playSequence([300, 250, 200, 150, 100], 0.2, 'sawtooth', 0.5);
    }

    playVictory() {
        this.playSequence([523, 659, 784, 1047], 0.15, 'sine', 0.4);
    }

    playHeal() {
        this.playSequence([400, 450, 500], 0.1, 'sine', 0.3);
    }

    playEquip() {
        this.playSequence([500, 600], 0.1, 'sine', 0.3);
    }

    playWait() {
        this.playTone(150, 0.08, 'sine', 0.15);
    }

    playShop() {
        this.playSequence([400, 500], 0.1, 'sine', 0.3);
    }

    playPurchase() {
        this.playSequence([500, 600, 700], 0.08, 'sine', 0.3);
    }

    playSpell() {
        this.playSequence([600, 800, 1000], 0.08, 'triangle', 0.25);
    }

    playCriticalHit() {
        // A sharper, more impactful sound for crits
        this.playSequence([150, 100], 0.05, 'square', 0.6);
        // Add a high pitched ping for emphasis
        setTimeout(() => {
            this.playTone(800, 0.1, 'sine', 0.3);
        }, 50);
    }
}



