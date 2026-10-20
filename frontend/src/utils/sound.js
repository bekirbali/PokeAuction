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
  // Authentic Pokémon Impact & Damage Audio (Official WAV SFX)
  playHit(isCrit = false, effectiveness = 1) {
    if (this.muted) return;

    if (effectiveness === 0) {
      // Immunity: no damage sound
      return;
    }

    if (isCrit) {
      // Critical hit: heavy smashing impact
      return this.playAudioFile('heavy_impact.wav', 0.85, 450);
    }

    if (effectiveness > 1) {
      // Super effective: iconic crunch impact
      return this.playAudioFile('crunch.wav', 0.85, 400);
    }

    // Normal or not very effective hit: blunt physical smack
    return this.playAudioFile('smack_down.wav', 0.75, 350);
  }

  // Pokémon Fainted (Authentic Cry Pitch Drop + Official Defeat Effect)
  playFaint(cryUrl = null) {
    if (this.muted) return;

    // 1. Play the fainted Pokemon's cry briskly with slight pitch drop (Gen 3-9 authentic faint effect)
    if (cryUrl) {
      try {
        const cryAudio = new Audio(cryUrl);
        cryAudio.volume = 0.5;
        cryAudio.playbackRate = 0.9;
        cryAudio.play().catch(() => {});
        setTimeout(() => {
          try {
            cryAudio.pause();
          } catch (_) {}
        }, 450);
      } catch (e) {}
    }

    // 2. Play official faint collapse sound (snappy cutoff)
    this.playAudioFile('pokemon_run.wav', 0.75, 450);
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
