// PokéAuction Web Audio API Synthesizer & SFX Engine

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.currentAttackAudio = null;
    this.attackAudioTimeout = null;
    this.fadeInterval = null;
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
    if (this.muted) {
      this.stopAttackSound(0);
    }
    return this.muted;
  }

  // Smoothly cutoff active attack audio when turn ends or duration expires
  stopAttackSound(fadeMs = 80) {
    if (this.attackAudioTimeout) {
      clearTimeout(this.attackAudioTimeout);
      this.attackAudioTimeout = null;
    }
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.currentAttackAudio) {
      const audio = this.currentAttackAudio;
      this.currentAttackAudio = null;

      if (fadeMs > 0 && !audio.paused && audio.volume > 0.05) {
        const initialVol = audio.volume;
        const steps = 4;
        const interval = Math.max(15, Math.floor(fadeMs / steps));
        let step = 0;
        this.fadeInterval = setInterval(() => {
          step++;
          try {
            audio.volume = Math.max(0, initialVol * (1 - step / steps));
            if (step >= steps) {
              clearInterval(this.fadeInterval);
              this.fadeInterval = null;
              audio.pause();
              audio.currentTime = 0;
            }
          } catch (e) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
            try { audio.pause(); } catch (_) {}
          }
        }, interval);
      } else {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      }
    }
  }

  // Play real audio WAV file from /sounds/ with optional maxDuration cutoff
  playAudioFile(filename, volume = 0.6, maxDurationMs = null) {
    if (this.muted) return;
    this.stopAttackSound(0); // Immediately cutoff previous attack sound
    try {
      const audio = new Audio(`/sounds/${filename}`);
      audio.volume = Math.min(1, Math.max(0, volume));
      this.currentAttackAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }

      audio.onended = () => {
        if (this.currentAttackAudio === audio) {
          this.currentAttackAudio = null;
        }
      };

      if (maxDurationMs && maxDurationMs > 0) {
        this.attackAudioTimeout = setTimeout(() => {
          if (this.currentAttackAudio === audio) {
            this.stopAttackSound(90);
          }
        }, maxDurationMs);
      }
    } catch (e) {
      // Audio playback fallback
    }
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

  // Authentic Pokémon Move Audio Engine (Official WAV SFX with Auto-Cutoff)
  playElementalAttack(moveType = 'Normal', moveName = '', speed = 1) {
    if (this.muted) return;
    const nameLower = (moveName || '').toLowerCase().trim();
    // Clamped attack duration so sounds conclude smoothly before the turn switches
    const maxDuration = Math.round(1250 / Math.max(speed, 0.5));

    // 1. BEAM ATTACKS
    if (nameLower.includes('hyper beam') || (nameLower.includes('beam') && moveType === 'Normal')) {
      return this.playAudioFile('hyper_beam.wav', 0.85, maxDuration);
    }
    if (nameLower.includes('solar beam') || nameLower.includes('solar')) {
      return this.playAudioFile('solar_beam.wav', 0.8, maxDuration);
    }
    if (nameLower.includes('ice beam')) {
      return this.playAudioFile('ice_beam.wav', 0.75, maxDuration);
    }
    if (nameLower.includes('psybeam')) {
      return this.playAudioFile('psychic.wav', 0.75, maxDuration);
    }

    // 2. ELECTRIC ATTACKS
    if (moveType === 'Electric' || nameLower.includes('thunder') || nameLower.includes('zap') || nameLower.includes('spark') || nameLower.includes('bolt')) {
      if (nameLower === 'thunder') {
        return this.playAudioFile('thunder.wav', 0.85, maxDuration);
      }
      return this.playAudioFile('thunderbolt.wav', 0.8, maxDuration);
    }

    // 3. FIRE ATTACKS
    if (moveType === 'Fire' || nameLower.includes('flame') || nameLower.includes('fire') || nameLower.includes('blast') || nameLower.includes('ember') || nameLower.includes('heat')) {
      return this.playAudioFile('flamethrower.wav', 0.8, maxDuration);
    }

    // 4. WATER ATTACKS
    if (moveType === 'Water' || nameLower.includes('hydro') || nameLower.includes('surf') || nameLower.includes('water') || nameLower.includes('bubble') || nameLower.includes('aqua')) {
      if (nameLower.includes('hydro') || nameLower.includes('surf')) {
        return this.playAudioFile('hydro_pump.wav', 0.85, maxDuration);
      }
      return this.playAudioFile('water_gun.wav', 0.75, maxDuration);
    }

    // 5. ICE ATTACKS
    if (moveType === 'Ice' || nameLower.includes('blizzard') || nameLower.includes('freeze') || nameLower.includes('frost') || nameLower.includes('aurora')) {
      if (nameLower.includes('blizzard')) {
        return this.playAudioFile('blizzard.wav', 0.85, maxDuration);
      }
      return this.playAudioFile('ice_beam.wav', 0.8, maxDuration);
    }

    // 6. GROUND & ROCK ATTACKS
    if (moveType === 'Ground' || moveType === 'Rock' || nameLower.includes('earth') || nameLower.includes('quake') || nameLower.includes('fissure') || nameLower.includes('dig') || nameLower.includes('rock') || nameLower.includes('stone') || nameLower.includes('slide')) {
      return this.playAudioFile('earthquake.wav', 0.85, maxDuration);
    }

    // 7. PSYCHIC & GHOST ATTACKS
    if (moveType === 'Psychic' || moveType === 'Ghost' || nameLower.includes('psychic') || nameLower.includes('shadow') || nameLower.includes('dream') || nameLower.includes('hypno') || nameLower.includes('nightmare') || nameLower.includes('confusion')) {
      return this.playAudioFile('psychic.wav', 0.8, maxDuration);
    }

    // 8. FLYING ATTACKS
    if (moveType === 'Flying' || nameLower.includes('wing') || nameLower.includes('fly') || nameLower.includes('peck') || nameLower.includes('aerial') || nameLower.includes('gust') || nameLower.includes('air') || nameLower.includes('bird')) {
      return this.playAudioFile('wing_attack.wav', 0.75, maxDuration);
    }

    // 9. FIGHTING ATTACKS
    if (moveType === 'Fighting' || nameLower.includes('chop') || nameLower.includes('punch') || nameLower.includes('kick') || nameLower.includes('combat') || nameLower.includes('cross') || nameLower.includes('mach')) {
      return this.playAudioFile('karate_chop.wav', 0.75, maxDuration);
    }

    // 10. DARK / BITE ATTACKS
    if (nameLower.includes('bite') || nameLower.includes('crunch') || nameLower.includes('fang') || moveType === 'Dark') {
      return this.playAudioFile('bite.wav', 0.75, maxDuration);
    }

    // 11. HEAVY PHYSICAL / NORMAL ATTACKS
    if (nameLower.includes('slam') || nameLower.includes('tackle') || nameLower.includes('strike') || nameLower.includes('headbutt') || nameLower.includes('edge') || nameLower.includes('crash')) {
      if (nameLower.includes('body slam') || nameLower.includes('slam') || nameLower.includes('double-edge')) {
        return this.playAudioFile('body_slam.wav', 0.8, maxDuration);
      }
      return this.playAudioFile('tackle.wav', 0.75, maxDuration);
    }

    // 12. DEFAULT FALLBACK
    return this.playAudioFile('tackle.wav', 0.7, maxDuration);
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

  // Authentic Pokémon Retro Hit Impact & Critical
  playHit(isCrit = false, effectiveness = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // A. NOT VERY EFFECTIVE (Muffled soft tap click)
    if (effectiveness < 1 && effectiveness > 0 && !isCrit) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
      return;
    }

    // B. IMMUNITY / NO EFFECT (Dull ping)
    if (effectiveness === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
      return;
    }

    // C. CRITICAL HIT METALLIC SHARP PING (Iconic double ping)
    if (isCrit) {
      [0, 0.045].forEach((offset, idx) => {
        const pingOsc = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        pingOsc.type = 'square';
        pingOsc.frequency.setValueAtTime(idx === 0 ? 1320 : 1760, now + offset);
        pingGain.gain.setValueAtTime(0.15, now + offset);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
        pingOsc.connect(pingGain);
        pingGain.connect(this.ctx.destination);
        pingOsc.start(now + offset);
        pingOsc.stop(now + offset + 0.12);
      });
    }

    // D. SUPER EFFECTIVE CRUNCH (Iconic GBA 2-stage "KER-CHUNG!" crunch)
    if (effectiveness > 1 || isCrit) {
      // Stage 1: Initial sharp snap noise
      const snapBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.06), this.ctx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapBuf.length; i++) snapData[i] = Math.random() * 2 - 1;
      const snapNoise = this.ctx.createBufferSource();
      snapNoise.buffer = snapBuf;
      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(1200, now);
      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.25, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      snapNoise.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapNoise.start(now);

      // Stage 2: Heavy resonant low-pitch crunch (+0.035s)
      const crunchTime = now + 0.035;
      const crunchBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.22), this.ctx.sampleRate);
      const crunchData = crunchBuf.getChannelData(0);
      for (let i = 0; i < crunchBuf.length; i++) crunchData[i] = Math.random() * 2 - 1;
      const crunchNoise = this.ctx.createBufferSource();
      crunchNoise.buffer = crunchBuf;
      const crunchFilter = this.ctx.createBiquadFilter();
      crunchFilter.type = 'lowpass';
      crunchFilter.frequency.setValueAtTime(750, crunchTime);
      crunchFilter.frequency.exponentialRampToValueAtTime(220, crunchTime + 0.2);
      const crunchGain = this.ctx.createGain();
      crunchGain.gain.setValueAtTime(0.38, crunchTime);
      crunchGain.gain.exponentialRampToValueAtTime(0.001, crunchTime + 0.22);
      crunchNoise.connect(crunchFilter);
      crunchFilter.connect(crunchGain);
      crunchGain.connect(this.ctx.destination);
      crunchNoise.start(crunchTime);

      // Sub-bass heavy thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'square';
      subOsc.frequency.setValueAtTime(110, crunchTime);
      subOsc.frequency.exponentialRampToValueAtTime(30, crunchTime + 0.2);
      subGain.gain.setValueAtTime(0.32, crunchTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, crunchTime + 0.2);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(crunchTime);
      subOsc.stop(crunchTime + 0.2);
      return;
    }

    // E. REGULAR NORMAL HIT (Snappy 8-bit square punch)
    const hitOsc = this.ctx.createOscillator();
    const hitGain = this.ctx.createGain();
    hitOsc.type = 'square';
    hitOsc.frequency.setValueAtTime(260, now);
    hitOsc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
    hitGain.gain.setValueAtTime(0.26, now);
    hitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    hitOsc.connect(hitGain);
    hitGain.connect(this.ctx.destination);
    hitOsc.start(now);
    hitOsc.stop(now + 0.12);

    const hitBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.1), this.ctx.sampleRate);
    const hitData = hitBuf.getChannelData(0);
    for (let i = 0; i < hitBuf.length; i++) hitData[i] = Math.random() * 2 - 1;
    const hNoise = this.ctx.createBufferSource();
    hNoise.buffer = hitBuf;
    const hFilter = this.ctx.createBiquadFilter();
    hFilter.type = 'bandpass';
    hFilter.frequency.setValueAtTime(900, now);
    const hGain = this.ctx.createGain();
    hGain.gain.setValueAtTime(0.2, now);
    hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    hNoise.connect(hFilter);
    hFilter.connect(hGain);
    hGain.connect(this.ctx.destination);
    hNoise.start(now);
  }

  // Pokémon Fainted (Authentic Game Boy / GBA Chromatic Descending Steps)
  playFaint() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 5 classic rapid descending square-wave chromatic steps
    const faintSteps = [380, 310, 240, 175, 95];
    const stepDuration = 0.08;

    faintSteps.forEach((freq, idx) => {
      const stepTime = now + idx * stepDuration;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, stepTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, stepTime + stepDuration);

      const vol = 0.24 * (1 - idx * 0.15);
      gain.gain.setValueAtTime(vol, stepTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + stepDuration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(stepTime);
      osc.stop(stepTime + stepDuration);
    });
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
