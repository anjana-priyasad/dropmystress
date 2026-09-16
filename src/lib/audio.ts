/**
 * All sound in the app is synthesized with the Web Audio API — no audio files.
 */

let sharedContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  sharedContext ??= new AudioContext();
  if (sharedContext.state === "suspended") void sharedContext.resume();
  return sharedContext;
}

type NoiseColor = "white" | "pink" | "brown";

export function createNoiseBuffer(ctx: AudioContext, color: NoiseColor, seconds = 6): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (color === "white") {
      data[i] = white;
    } else if (color === "pink") {
      // Paul Kellet's refined pink noise filter.
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }

  if (color === "brown") {
    // Remove drift so the end meets the start and the loop doesn't click.
    const drift = data[length - 1] - data[0];
    for (let i = 0; i < length; i++) data[i] -= (drift * i) / length;
  }
  return buffer;
}

function loopNoise(ctx: AudioContext, color: NoiseColor): AudioBufferSourceNode {
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, color);
  source.loop = true;
  return source;
}

/** A soft singing-bowl style bell. */
export function playBell({ frequency = 432, duration = 4, volume = 0.22 } = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.value = volume;
  out.connect(ctx.destination);

  [1, 2.01, 2.76, 5.4].forEach((ratio, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequency * ratio;
    const env = ctx.createGain();
    const peak = [1, 0.5, 0.3, 0.12][i];
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration / (i + 1));
    osc.connect(env).connect(out);
    osc.start(now);
    osc.stop(now + duration);
  });
}

/** A short, bright pop for bubble wrap. */
export function playPop() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  const pitch = 380 + Math.random() * 260;
  osc.frequency.setValueAtTime(pitch, now);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.35, now + 0.08);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.35, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(env).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

/** A low, soft thud for the stress ball. */
export function playThud(intensity = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.18);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.4 * Math.min(1, intensity), now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(env).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * A buffer of sparse, tiny "grain" impulses with short decays. Filtered, it sounds
 * like individual grains of sand or gravel scraping past each other.
 */
export function createGrainBuffer(ctx: AudioContext, grainsPerSecond: number, grainMs: number, seconds = 3): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const grainLength = Math.max(4, Math.floor((ctx.sampleRate * grainMs) / 1000));
  const count = Math.floor(grainsPerSecond * seconds);
  for (let g = 0; g < count; g++) {
    const start = Math.floor(Math.random() * (length - grainLength));
    const amplitude = 0.2 + Math.random() * 0.8;
    for (let j = 0; j < grainLength; j++) {
      data[start + j] += amplitude * Math.exp((-5 * j) / grainLength) * (Math.random() * 2 - 1);
    }
  }
  return buffer;
}

export type RakeSound = {
  /** How fast the rake is moving, in CSS pixels per second. 0 fades the sound out. */
  setSpeed: (pixelsPerSecond: number) => void;
  stop: () => void;
};

/** The scrape of a wooden rake drawn through fine sand. Loudness and texture follow the speed. */
export function createRakeSound(): RakeSound | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const output = ctx.createGain();
  output.gain.value = 0;
  output.connect(ctx.destination);

  const loop = (buffer: AudioBuffer) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = Math.random() * 0.5;
    source.start(0, Math.random() * buffer.duration);
    return source;
  };

  // Fine sand: dense, bright grains.
  const fine = loop(createGrainBuffer(ctx, 1400, 2.5));
  const fineBand = ctx.createBiquadFilter();
  fineBand.type = "bandpass";
  fineBand.frequency.value = 3200;
  fineBand.Q.value = 0.6;
  const fineGain = ctx.createGain();
  fineGain.gain.value = 0.9;
  fine.connect(fineBand).connect(fineGain).connect(output);

  // Coarser grains: sparser, lower "crunch".
  const coarse = loop(createGrainBuffer(ctx, 140, 9));
  const coarseBand = ctx.createBiquadFilter();
  coarseBand.type = "bandpass";
  coarseBand.frequency.value = 900;
  coarseBand.Q.value = 0.9;
  const coarseGain = ctx.createGain();
  coarseGain.gain.value = 0;
  coarse.connect(coarseBand).connect(coarseGain).connect(output);

  // A soft bed of hiss so the scrape never sounds like isolated clicks.
  const hiss = loop(createNoiseBuffer(ctx, "pink", 3));
  const hissBand = ctx.createBiquadFilter();
  hissBand.type = "bandpass";
  hissBand.frequency.value = 1800;
  hissBand.Q.value = 0.5;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.18;
  hiss.connect(hissBand).connect(hissGain).connect(output);

  const sources = [fine, coarse, hiss];

  return {
    setSpeed(pixelsPerSecond) {
      const now = ctx.currentTime;
      const intensity = Math.min(1, Math.sqrt(Math.max(0, pixelsPerSecond) / 1400));
      const smoothing = intensity > 0 ? 0.03 : 0.08;
      output.gain.setTargetAtTime(intensity * 0.55, now, smoothing);
      coarseGain.gain.setTargetAtTime(Math.pow(intensity, 1.6) * 0.9, now, smoothing);
      fineBand.frequency.setTargetAtTime(2400 + intensity * 2600, now, 0.05);
      hissBand.frequency.setTargetAtTime(1200 + intensity * 1400, now, 0.05);
      const rate = 0.8 + intensity * 0.45;
      sources.forEach((s) => s.playbackRate.setTargetAtTime(rate, now, 0.05));
    },
    stop() {
      const now = ctx.currentTime;
      output.gain.setTargetAtTime(0, now, 0.05);
      setTimeout(() => {
        sources.forEach((s) => {
          try {
            s.stop();
          } catch {}
        });
        output.disconnect();
      }, 400);
    },
  };
}

/** A smooth stone settling into sand: a soft low thud with a small puff of grains. */
export function playStoneDrop() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const body = ctx.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(130, now);
  body.frequency.exponentialRampToValueAtTime(58, now + 0.2);
  const bodyEnv = ctx.createGain();
  bodyEnv.gain.setValueAtTime(0.0001, now);
  bodyEnv.gain.exponentialRampToValueAtTime(0.45, now + 0.008);
  bodyEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  body.connect(bodyEnv).connect(ctx.destination);
  body.start(now);
  body.stop(now + 0.32);

  const puff = ctx.createBufferSource();
  puff.buffer = createGrainBuffer(ctx, 900, 3, 0.25);
  const puffBand = ctx.createBiquadFilter();
  puffBand.type = "bandpass";
  puffBand.frequency.value = 2200;
  puffBand.Q.value = 0.7;
  const puffEnv = ctx.createGain();
  puffEnv.gain.setValueAtTime(0.35, now + 0.01);
  puffEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  puff.connect(puffBand).connect(puffEnv).connect(ctx.destination);
  puff.start(now + 0.01);
}

/** A long, gentle sweep of sand being smoothed flat. */
export function playSandSweep() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const duration = 1.1;

  const grains = ctx.createBufferSource();
  grains.buffer = createGrainBuffer(ctx, 1100, 3, duration + 0.1);
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.6;
  band.frequency.setValueAtTime(900, now);
  band.frequency.exponentialRampToValueAtTime(3800, now + duration * 0.6);
  band.frequency.exponentialRampToValueAtTime(1600, now + duration);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.exponentialRampToValueAtTime(0.4, now + duration * 0.35);
  env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  grains.connect(band).connect(env).connect(ctx.destination);
  grains.start(now);
  grains.stop(now + duration + 0.05);
}

export type SoundChannelId = "rain" | "ocean" | "wind" | "fire" | "brown";

export type SoundChannel = { output: GainNode; stop: () => void };

/** Builds a continuously playing ambient channel. Connect `output` wherever you like. */
export function createSoundChannel(ctx: AudioContext, id: SoundChannelId): SoundChannel {
  const output = ctx.createGain();
  output.gain.value = 0;
  const sources: AudioScheduledSourceNode[] = [];
  let crackleTimer: ReturnType<typeof setTimeout> | undefined;

  const start = (node: AudioScheduledSourceNode) => {
    node.start();
    sources.push(node);
    return node;
  };

  switch (id) {
    case "rain": {
      const noise = start(loopNoise(ctx, "pink"));
      const high = ctx.createBiquadFilter();
      high.type = "highpass";
      high.frequency.value = 500;
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = 7000;
      const level = ctx.createGain();
      level.gain.value = 0.9;
      noise.connect(high).connect(low).connect(level).connect(output);
      break;
    }
    case "ocean": {
      const noise = start(loopNoise(ctx, "white"));
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = 480;
      low.Q.value = 0.5;
      const soft = ctx.createBiquadFilter();
      soft.type = "lowpass";
      soft.frequency.value = 900;
      const swell = ctx.createGain();
      swell.gain.value = 0.55;
      const wave = start(ctx.createOscillator()) as OscillatorNode;
      wave.frequency.value = 0.09;
      const depth = ctx.createGain();
      depth.gain.value = 0.4;
      wave.connect(depth).connect(swell.gain);
      noise.connect(low).connect(soft).connect(swell).connect(output);
      break;
    }
    case "wind": {
      const noise = start(loopNoise(ctx, "pink"));
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 420;
      band.Q.value = 0.9;
      const gust = start(ctx.createOscillator()) as OscillatorNode;
      gust.frequency.value = 0.06;
      const gustDepth = ctx.createGain();
      gustDepth.gain.value = 260;
      gust.connect(gustDepth).connect(band.frequency);
      const level = ctx.createGain();
      level.gain.value = 1.6;
      noise.connect(band).connect(level).connect(output);
      break;
    }
    case "fire": {
      const rumble = start(loopNoise(ctx, "brown"));
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = 350;
      const rumbleLevel = ctx.createGain();
      rumbleLevel.gain.value = 0.7;
      rumble.connect(low).connect(rumbleLevel).connect(output);

      const crackleBuffer = createNoiseBuffer(ctx, "white", 0.02);
      const crackle = () => {
        const burst = ctx.createBufferSource();
        burst.buffer = crackleBuffer;
        const high = ctx.createBiquadFilter();
        high.type = "highpass";
        high.frequency.value = 1500 + Math.random() * 2500;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        env.gain.setValueAtTime(0.2 + Math.random() * 0.5, t);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.015 + Math.random() * 0.03);
        burst.connect(high).connect(env).connect(output);
        burst.start(t);
        crackleTimer = setTimeout(crackle, 40 + Math.random() * Math.random() * 600);
      };
      crackle();
      break;
    }
    case "brown": {
      const noise = start(loopNoise(ctx, "brown"));
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = 1000;
      noise.connect(low).connect(output);
      break;
    }
  }

  return {
    output,
    stop: () => {
      clearTimeout(crackleTimer);
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {}
      });
      output.disconnect();
    },
  };
}
