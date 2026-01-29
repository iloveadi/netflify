class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Master Volume
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type, duration) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration) {
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    // Specific Game Sounds
    playPaddleHit() {
        this.init();
        // Rising pitch for paddle hit
        this.playTone(440, 'square', 0.1);
        setTimeout(() => this.playTone(880, 'square', 0.1), 50);
    }

    playBrickHit() {
        this.init();
        // High pitch beep
        this.playTone(1200 + Math.random() * 500, 'square', 0.08);
    }

    playWallHit() {
        this.init();
        // Lower thud
        this.playTone(220, 'triangle', 0.05);
    }

    playGameOver() {
        this.init();
        // Descending tones + noise
        this.playTone(800, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(600, 'sawtooth', 0.2), 200);
        setTimeout(() => this.playTone(400, 'sawtooth', 0.4), 400);
        setTimeout(() => this.playNoise(0.5), 600);
    }

    playWin() {
        this.init();
        // Victory fanfare (Arpeggio)
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 'square', 0.2), i * 150);
        });
    }

    // Galaga Sounds
    playShoot() {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playExplosion() {
        this.init();
        this.playNoise(0.3);
    }
}

const soundManager = new SoundManager();
export default soundManager;
