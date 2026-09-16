import { createGrainBuffer, createSoundChannel, getAudioContext, playStoneDrop, type SoundChannel } from "@/lib/audio";
import type { SpriteSound } from "./sprites";

const PENTATONIC = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];

function envGain(ctx: AudioContext, destination: AudioNode, when: number, peak: number, attack: number, decay: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay);
  gain.connect(destination);
  return gain;
}

function grainBurst(ctx: AudioContext, destination: AudioNode, when: number, freq: number, peak: number, duration: number) {
  const source = ctx.createBufferSource();
  source.buffer = createGrainBuffer(ctx, 900, 3, duration + 0.05);
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = 0.7;
  source.connect(band).connect(envGain(ctx, destination, when, peak, 0.02, duration));
  source.start(when);
  source.stop(when + duration + 0.05);
}

function chirp(ctx: AudioContext, destination: AudioNode, when: number, base: number, peak: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(base, when);
  osc.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * 0.5), when + 0.045);
  osc.frequency.exponentialRampToValueAtTime(base * 0.9, when + 0.08);
  osc.connect(envGain(ctx, destination, when, peak, 0.008, 0.08));
  osc.start(when);
  osc.stop(when + 0.1);
}

function birdSong(ctx: AudioContext, destination: AudioNode, when: number, peak: number) {
  const base = 2400 + Math.random() * 1600;
  const notes = 2 + Math.floor(Math.random() * 4);
  for (let i = 0; i < notes; i++) chirp(ctx, destination, when + i * (0.08 + Math.random() * 0.05), base * (0.9 + Math.random() * 0.25), peak);
}

function croak(ctx: AudioContext, destination: AudioNode, when: number, peak: number) {
  for (let n = 0; n < 2; n++) {
    const start = when + n * 0.22;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, start);
    osc.frequency.exponentialRampToValueAtTime(85, start + 0.16);
    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 650;
    const tremolo = ctx.createGain();
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 32;
    const depth = ctx.createGain();
    depth.gain.value = 0.5;
    lfo.connect(depth).connect(tremolo.gain);
    osc.connect(low).connect(tremolo).connect(envGain(ctx, destination, start, peak, 0.015, 0.17));
    osc.start(start);
    lfo.start(start);
    osc.stop(start + 0.2);
    lfo.stop(start + 0.2);
  }
}

function bellTone(ctx: AudioContext, destination: AudioNode, when: number, freq: number, peak: number) {
  [1, 2.76, 5.4].forEach((ratio, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    osc.connect(envGain(ctx, destination, when, peak * [1, 0.35, 0.12][i], 0.004, 2.4 / (i + 1)));
    osc.start(when);
    osc.stop(when + 2.6);
  });
}

function waterPlop(ctx: AudioContext, destination: AudioNode, when: number, peak: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1100, when);
  osc.frequency.exponentialRampToValueAtTime(260, when + 0.1);
  osc.connect(envGain(ctx, destination, when, peak, 0.005, 0.12));
  osc.start(when);
  osc.stop(when + 0.15);
  grainBurst(ctx, destination, when + 0.02, 1800, peak * 0.5, 0.18);
}

/** A short cue when something is placed in the garden. */
export function playPlaceSound(sound: SpriteSound) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const out = ctx.destination;
  switch (sound) {
    case "rustle":
      grainBurst(ctx, out, now, 3200, 0.35, 0.28);
      grainBurst(ctx, out, now + 0.05, 1500, 0.2, 0.22);
      break;
    case "water":
      waterPlop(ctx, out, now, 0.3);
      break;
    case "bird":
      birdSong(ctx, out, now, 0.12);
      break;
    case "frog":
      croak(ctx, out, now, 0.3);
      break;
    case "chime":
      [0, 2, 4].forEach((n, i) => bellTone(ctx, out, now + i * 0.18, 880 * PENTATONIC[n], 0.07));
      break;
    case "tap":
      playStoneDrop();
      break;
    case "soft":
      grainBurst(ctx, out, now, 900, 0.25, 0.12);
      break;
  }
}

export type AmbienceLayers = { birds: boolean; crickets: boolean; water: boolean; chimes: boolean; rain: boolean };

export type GardenAmbience = { setLayers: (layers: AmbienceLayers) => void; stop: () => void };

/** Living background sound that follows what's in the garden. */
export function createGardenAmbience(): GardenAmbience | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6);

  const layerGain = (initial = 0) => {
    const g = ctx.createGain();
    g.gain.value = initial;
    g.connect(master);
    return g;
  };

  const channels: SoundChannel[] = [];
  const wind = createSoundChannel(ctx, "wind");
  wind.output.gain.value = 0.12;
  wind.output.connect(master);
  channels.push(wind);

  const rainGain = layerGain();
  const rain = createSoundChannel(ctx, "rain");
  rain.output.gain.value = 0.5;
  rain.output.connect(rainGain);
  channels.push(rain);

  // A trickling stream: sparse, longer "bubble" grains through resonant filters.
  const waterGain = layerGain();
  const bubbles = ctx.createBufferSource();
  bubbles.buffer = createGrainBuffer(ctx, 45, 28, 4);
  bubbles.loop = true;
  const bubbleBand = ctx.createBiquadFilter();
  bubbleBand.type = "bandpass";
  bubbleBand.frequency.value = 1100;
  bubbleBand.Q.value = 2.2;
  bubbles.connect(bubbleBand).connect(waterGain);
  const trickle = ctx.createBufferSource();
  trickle.buffer = createGrainBuffer(ctx, 400, 4, 3);
  trickle.loop = true;
  const trickleBand = ctx.createBiquadFilter();
  trickleBand.type = "bandpass";
  trickleBand.frequency.value = 2600;
  trickleBand.Q.value = 0.8;
  const trickleLevel = ctx.createGain();
  trickleLevel.gain.value = 0.35;
  trickle.connect(trickleBand).connect(trickleLevel).connect(waterGain);
  bubbles.start();
  trickle.start();

  let layers: AmbienceLayers = { birds: false, crickets: false, water: false, chimes: false, rain: false };
  const timers: ReturnType<typeof setTimeout>[] = [];

  const panned = (pan: number) => {
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(master);
    return panner;
  };

  const schedule = (minMs: number, maxMs: number, play: () => void) => {
    const tick = () => {
      play();
      timers.push(setTimeout(tick, minMs + Math.random() * (maxMs - minMs)));
    };
    timers.push(setTimeout(tick, minMs * Math.random()));
  };

  schedule(2200, 7000, () => {
    if (layers.birds) birdSong(ctx, panned(Math.random() * 1.6 - 0.8), ctx.currentTime, 0.035 + Math.random() * 0.03);
  });
  schedule(1400, 3800, () => {
    if (!layers.crickets) return;
    const out = panned(Math.random() * 1.4 - 0.7);
    const start = ctx.currentTime;
    for (let burst = 0; burst < 3; burst++) {
      for (let pulse = 0; pulse < 5; pulse++) {
        const when = start + burst * 0.32 + pulse * 0.035;
        const osc = ctx.createOscillator();
        osc.frequency.value = 4400 + Math.random() * 300;
        osc.connect(envGain(ctx, out, when, 0.02, 0.004, 0.02));
        osc.start(when);
        osc.stop(when + 0.03);
      }
    }
  });
  schedule(3000, 8500, () => {
    if (!layers.chimes) return;
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      bellTone(ctx, panned(Math.random() - 0.5), ctx.currentTime + i * (0.25 + Math.random() * 0.4), 880 * PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)], 0.03);
    }
  });

  return {
    setLayers(next) {
      layers = next;
      const now = ctx.currentTime;
      waterGain.gain.setTargetAtTime(next.water ? 0.5 : 0, now, 0.5);
      rainGain.gain.setTargetAtTime(next.rain ? 0.8 : 0, now, 0.5);
    },
    stop() {
      timers.forEach(clearTimeout);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      setTimeout(() => {
        channels.forEach((c) => c.stop());
        [bubbles, trickle].forEach((s) => {
          try {
            s.stop();
          } catch {}
        });
        master.disconnect();
      }, 900);
    },
  };
}
