/**
 * Procedural Retro Web Audio Sound & Chiptune Music Synthesizer
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentMusicTimer: number | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.6;
  private musicVolume: number = 0.35;
  private currentTrack: 'none' | 'menu' | 'dungeon' | 'boss' | 'victory' = 'none';

  private init() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();

          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);

          this.sfxGain = this.ctx.createGain();
          this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
          this.sfxGain.connect(this.masterGain);

          this.musicGain = this.ctx.createGain();
          this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
          this.musicGain.connect(this.masterGain);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          // Autoplay policy: audio will resume on next user gesture
        });
      }
    } catch (e) {
      console.warn('AudioContext deferred until user interaction:', e);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(sfx: number, music: number) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.musicVolume = Math.max(0, Math.min(1, music));
    if (this.ctx) {
      if (this.sfxGain) this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      if (this.musicGain) this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public getVolumes() {
    return { sfx: this.sfxVolume, music: this.musicVolume };
  }

  // --- SOUND EFFECTS ---

  public playSlash(isHeavy: boolean = false) {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isHeavy ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isHeavy ? 420 : 650, t);
    osc.frequency.exponentialRampToValueAtTime(isHeavy ? 80 : 120, t + (isHeavy ? 0.18 : 0.12));

    gain.gain.setValueAtTime(isHeavy ? 0.4 : 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isHeavy ? 0.2 : 0.13));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + (isHeavy ? 0.22 : 0.15));
  }

  public playHit(isCrit: boolean = false) {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    
    // Quick noise punch
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isCrit ? 1200 : 800, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isCrit ? 0.5 : 0.3, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);
  }

  public playEnemyHurt() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.1);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playEnemyDeath() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  public playCoin() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(987.77, t);
    osc2.frequency.setValueAtTime(1318.51, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  public playChestOpen() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  public playPotion() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playBlock() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playDash() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playJump() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.1);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playUpgrade() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const freqs = [330, 415, 494, 660, 830];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  public playDragonRoar() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.3);
    osc.frequency.linearRampToValueAtTime(70, t + 0.7);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.82);
  }

  public playFireball() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.3);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playBowShoot() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.14);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  public playMagicSpell() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  public playMagicShield() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(660, t + 0.15);
    osc.frequency.linearRampToValueAtTime(520, t + 0.3);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playElementSkill(element: 'fire' | 'ice' | 'lightning') {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (element === 'fire') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.35);
    } else if (element === 'ice') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.linearRampToValueAtTime(1174, t + 0.12);
      osc.frequency.linearRampToValueAtTime(587, t + 0.3);
    } else {
      // lightning
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.setValueAtTime(900, t + 0.05);
      osc.frequency.setValueAtTime(200, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
    }

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  public playPlayerHurt() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.16);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playPlayerDeath() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const freqs = [220, 207, 196, 185, 174, 164, 130];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  public playVictoryFanfare() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const notes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.35 }, // C5
      { f: 415.30, d: 0.35 }, // G#4
      { f: 466.16, d: 0.35 }, // A#4
      { f: 523.25, d: 0.2 },  // C5
      { f: 466.16, d: 0.15 }, // A#4
      { f: 523.25, d: 0.6 },  // C5
    ];
    let offset = 0;
    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + n.d + 0.05);
      offset += n.d * 0.95;
    });
  }

  public playButtonClick() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // --- CHIPTUNE BGM GENERATOR ---

  public startMusic(track: 'menu' | 'dungeon' | 'boss' | 'victory') {
    this.init();
    if (this.currentTrack === track) return;
    this.stopMusic();
    this.currentTrack = track;

    if (track === 'menu') {
      this.loopMelody(
        [
          220, 261.63, 329.63, 440, 392, 329.63, 261.63, 293.66,
          220, 246.94, 293.66, 392, 349.23, 293.66, 246.94, 261.63
        ],
        0.28,
        'triangle'
      );
    } else if (track === 'dungeon') {
      this.loopMelody(
        [
          146.83, 174.61, 220, 196, 174.61, 146.83, 130.81, 146.83,
          110, 130.81, 164.81, 146.83, 130.81, 110, 98, 110
        ],
        0.26,
        'square',
        0.14
      );
    } else if (track === 'boss') {
      this.loopMelody(
        [
          110, 110, 220, 110, 130.81, 110, 164.81, 146.83,
          110, 110, 246.94, 110, 196, 174.61, 164.81, 146.83
        ],
        0.16,
        'sawtooth',
        0.18
      );
    } else if (track === 'victory') {
      this.loopMelody(
        [
          261.63, 329.63, 392, 523.25, 493.88, 392, 329.63, 392,
          349.23, 440, 523.25, 659.25, 587.33, 440, 392, 523.25
        ],
        0.3,
        'triangle',
        0.2
      );
    }
  }

  private loopMelody(
    notes: number[],
    stepDuration: number,
    waveType: OscillatorType = 'square',
    gainLevel: number = 0.15
  ) {
    let step = 0;
    const playNext = () => {
      try {
        if (!this.ctx || !this.musicGain || this.currentTrack === 'none') return;
        const freq = notes[step % notes.length];
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(gainLevel, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.9);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + stepDuration);

        step++;
        this.currentMusicTimer = window.setTimeout(playNext, stepDuration * 1000);
      } catch (err) {
        // Silently continue timer without throwing
        step++;
        this.currentMusicTimer = window.setTimeout(playNext, stepDuration * 1000);
      }
    };

    playNext();
  }

  public stopMusic() {
    if (this.currentMusicTimer) {
      clearTimeout(this.currentMusicTimer);
      this.currentMusicTimer = null;
    }
    this.currentTrack = 'none';
  }
}

export const audio = new RetroAudioEngine();
