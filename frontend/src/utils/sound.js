// PokéAuction Web Audio API Synthesizer & SFX Engine

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Timer Tick (Tik-Tak)
  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Auction Bid Placed (Coin / Chime)
  playBid() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Gavel Hammer (Tokmak / Satış Bitti)
  playGavel() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Pass (Pas)
  playPass() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.12);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Elemental Attack SFX Engine
  playElementalAttack(moveType = 'Normal', moveName = '') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const nameLower = (moveName || '').toLowerCase();

    // 1. BEAM ATTACKS (Hyper Beam, Solar Beam)
    if (nameLower.includes('beam') || nameLower.includes('cannon')) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      return;
    }

    // 2. ELECTRIC (Thunderbolt, Thunder, Spark)
    if (moveType === 'Electric' || nameLower.includes('thunder') || nameLower.includes('zap') || nameLower.includes('spark')) {
      // Rapid sawtooth static pulses
      [0, 0.04, 0.09, 0.14].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(800 - idx * 120, now + offset);
        osc.frequency.exponentialRampToValueAtTime(150, now + offset + 0.05);
        gain.gain.setValueAtTime(0.16, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
      return;
    }

    // 3. FIRE (Flamethrower, Fire Blast)
    if (moveType === 'Fire' || nameLower.includes('fire') || nameLower.includes('flame')) {
      const bufferSize = this.ctx.sampleRate * 0.28;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(950, now + 0.18);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      return;
    }

    // 4. WATER (Hydro Pump, Surf, Water Gun)
    if (moveType === 'Water' || nameLower.includes('water') || nameLower.includes('hydro') || nameLower.includes('surf')) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
      return;
    }

    // 5. ICE (Ice Beam, Blizzard)
    if (moveType === 'Ice' || nameLower.includes('ice') || nameLower.includes('blizzard') || nameLower.includes('frost')) {
      [1760, 2637].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.22);
      });
      return;
    }

    // 6. GROUND / ROCK (Earthquake, Rock Slide)
    if (moveType === 'Ground' || moveType === 'Rock' || nameLower.includes('earth') || nameLower.includes('rock') || nameLower.includes('dig')) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
      return;
    }

    // 7. PSYCHIC / GHOST (Psychic, Shadow Ball, Hypnosis)
    if (moveType === 'Psychic' || moveType === 'Ghost' || nameLower.includes('psychic') || nameLower.includes('shadow') || nameLower.includes('psy')) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.15);
      osc.frequency.linearRampToValueAtTime(750, now + 0.3);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
      return;
    }

    // 8. SLASH / CLAW / BITE
    if (nameLower.includes('slash') || nameLower.includes('claw') || nameLower.includes('bite') || nameLower.includes('cut')) {
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      return;
    }

    // 9. FLYING (Brave Bird, Aerial Ace, Wing Attack, Gust)
    if (moveType === 'Flying' || nameLower.includes('bird') || nameLower.includes('wing') || nameLower.includes('peck') || nameLower.includes('air') || nameLower.includes('gust') || nameLower.includes('fly')) {
      const bufferSize = this.ctx.sampleRate * 0.22;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.14);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      return;
    }

    // 10. FIGHTING (Close Combat, Mega Punch, Low Kick, Submission, Karate Chop)
    if (moveType === 'Fighting' || nameLower.includes('combat') || nameLower.includes('punch') || nameLower.includes('kick') || nameLower.includes('chop')) {
      [0, 0.07, 0.14].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200 - idx * 25, now + offset);
        osc.frequency.exponentialRampToValueAtTime(55, now + offset + 0.06);
        gain.gain.setValueAtTime(0.26, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.06);
      });
      return;
    }

    // 11. POISON (Sludge Bomb, Poison Jab, Toxic, Acid)
    if (moveType === 'Poison' || nameLower.includes('sludge') || nameLower.includes('poison') || nameLower.includes('toxic') || nameLower.includes('acid')) {
      [0, 0.05, 0.1].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420 + idx * 80, now + offset);
        osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.08);
        gain.gain.setValueAtTime(0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
      return;
    }

    // Default Physical Attack Whoosh
    this.playAttack();
  }

  // Ditto Transform Shimmer SFX
  playTransform() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + idx * 0.05 + 0.18);
      gain.gain.setValueAtTime(0.14, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.22);
    });
  }

  // Attack Woosh
  playAttack() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.1);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Hit Impact & Critical (With Juicy Sub-Bass and Crunch)
  playHit(isCrit = false, effectiveness = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Crunchy Impact Noise
    const bufferSize = this.ctx.sampleRate * (isCrit ? 0.22 : 0.14);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isCrit ? 'bandpass' : (effectiveness > 1 ? 'lowpass' : 'highpass');
    filter.frequency.setValueAtTime(isCrit ? 850 : (effectiveness > 1 ? 550 : 1400), now);

    const gain = this.ctx.createGain();
    const volume = isCrit ? 0.38 : (effectiveness > 1 ? 0.28 : 0.15);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.22 : 0.14));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    // 2. Extra Sub-Bass Thud for Critical or Super Effective Hits
    if (isCrit || effectiveness > 1) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(isCrit ? 110 : 85, now);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + (isCrit ? 0.22 : 0.14));

      subGain.gain.setValueAtTime(isCrit ? 0.35 : 0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.22 : 0.14));

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + (isCrit ? 0.22 : 0.14));
    }

    // 3. Metallic High Chime for Critical Hit
    if (isCrit) {
      const pingOsc = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      pingOsc.type = 'triangle';
      pingOsc.frequency.setValueAtTime(1480, now);
      pingOsc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
      pingGain.gain.setValueAtTime(0.18, now);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      pingOsc.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      pingOsc.start(now);
      pingOsc.stop(now + 0.18);
    }
  }

  // Pokemon Faint (Descend)
  playFaint() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Victory Fanfare
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i === 3 ? 0.5 : 0.15));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (i === 3 ? 0.5 : 0.15));
    });
  }

  // Official Pokemon Cry
  playCry(cryUrl) {
    if (this.muted || !cryUrl) return;
    try {
      const audio = new Audio(cryUrl);
      audio.volume = 0.25;
      audio.play().catch(() => {});
    } catch (e) {}
  }
}

export const sound = new SoundSystem();
