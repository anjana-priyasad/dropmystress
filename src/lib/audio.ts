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
