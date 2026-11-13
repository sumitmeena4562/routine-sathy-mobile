import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOUNDS_DIR = path.resolve(__dirname, '../assets/sounds');

const SAMPLE_RATE = 44100;

function createWavBuffer(samples, numChannels = 1) {
  const byteRate = SAMPLE_RATE * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt Subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels
  buffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
  buffer.writeUInt32LE(byteRate, 28);    // ByteRate
  buffer.writeUInt16LE(blockAlign, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34);          // BitsPerSample

  // data Subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // PCM Samples
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-32767, Math.min(32767, Math.round(samples[i])));
    buffer.writeInt16LE(s, 44 + i * 2);
  }

  return buffer;
}

// ----------------------------------------------------------------------------
// Audio Synthesis Helpers
// ----------------------------------------------------------------------------

// Harmonic bell/marimba note generator with multi-overtone spectrum & exponential decay
function addBellNote(buffer, startSec, durationSec, freq, amplitude = 26000, decayRate = 3.5) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const sampleIdx = startSample + i;
    if (sampleIdx >= buffer.length) break;

    const t = i / SAMPLE_RATE;
    // Fast attack (5ms), exponential decay
    const attack = Math.min(1.0, t / 0.005);
    const envelope = attack * Math.exp(-decayRate * t);

    // Physical chime harmonic ratios: f, 2f, 3.01f, 4.2f
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = 0.5 * Math.sin(2 * Math.PI * (freq * 2.0) * t);
    const s3 = 0.25 * Math.sin(2 * Math.PI * (freq * 3.01) * t);
    const s4 = 0.12 * Math.sin(2 * Math.PI * (freq * 4.16) * t);

    const val = amplitude * envelope * (s1 + s2 + s3 + s4) / 1.87;
    buffer[sampleIdx] += val;
  }
}

// Resonant Tibetan Singing Bowl / Temple Chime
function addSingingBowlStrike(buffer, startSec, durationSec, rootFreq = 216, amplitude = 28000) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const sampleIdx = startSample + i;
    if (sampleIdx >= buffer.length) break;

    const t = i / SAMPLE_RATE;
    const attack = Math.min(1.0, t / 0.015);
    const envelope = attack * Math.exp(-0.85 * t);

    // Warm vibrato modulation at 4 Hz (theta wave soothing pulse)
    const vibrato = 1.0 + 0.003 * Math.sin(2 * Math.PI * 4.0 * t);
    const f0 = rootFreq * vibrato;

    // Rich harmonic overtone series characteristic of bronze bowls
    const f1 = f0;
    const f2 = f0 * 2.005; // Octave with slight shimmer
    const f3 = f0 * 2.99;  // Perfect fifth harmonic
    const f4 = f0 * 4.18;  // Shimmering overtone
    const f5 = f0 * 5.43;  // High bell sparkle

    const s = 0.55 * Math.sin(2 * Math.PI * f1 * t)
            + 0.30 * Math.sin(2 * Math.PI * f2 * t)
            + 0.18 * Math.sin(2 * Math.PI * f3 * t)
            + 0.10 * Math.sin(2 * Math.PI * f4 * t)
            + 0.05 * Math.sin(2 * Math.PI * f5 * t);

    buffer[sampleIdx] += amplitude * envelope * s;
  }
}

// ----------------------------------------------------------------------------
// Generate 4 Complete Rings
// ----------------------------------------------------------------------------

console.log('Generating rich musical alarm sounds...');

// 1. Sunrise Forest: Melodic Morning Glockenspiel / Marimba Arpeggio (6 seconds)
// Musical phrase: C5 -> E5 -> G5 -> B5 -> C6 -> G5 -> E5 (repeated uplifting wake motif)
{
  const DURATION = 6.0;
  const samples = new Float32Array(Math.floor(DURATION * SAMPLE_RATE));

  const phrase1 = [
    { t: 0.0, f: 523.25 },  // C5
    { t: 0.28, f: 659.25 }, // E5
    { t: 0.56, f: 783.99 }, // G5
    { t: 0.84, f: 987.77 }, // B5
    { t: 1.12, f: 1046.50 },// C6
    { t: 1.50, f: 783.99 }, // G5
    { t: 1.90, f: 659.25 }, // E5
  ];

  // Repeat phrase with uplifting resolve at 3.0s
  const phrase2 = [
    { t: 3.0, f: 523.25 },  // C5
    { t: 3.28, f: 659.25 }, // E5
    { t: 3.56, f: 783.99 }, // G5
    { t: 3.84, f: 1046.50 },// C6
    { t: 4.12, f: 1318.51 },// E6 (high sparkle finish)
    { t: 4.60, f: 1046.50 },// C6
  ];

  for (const n of phrase1) {
    addBellNote(samples, n.t, 2.2, n.f, 24000, 3.2);
  }
  for (const n of phrase2) {
    addBellNote(samples, n.t, 2.2, n.f, 24000, 3.0);
  }

  const wavBuf = createWavBuffer(samples);
  fs.writeFileSync(path.join(SOUNDS_DIR, 'sunrise-forest.wav'), wavBuf);
  console.log('Generated sunrise-forest.wav (size:', wavBuf.length, 'bytes)');
}

// 2. Energetic Dawn: Bright, crisp dual-tone wake chime sequence (6 seconds)
// Syncopated modern alarm wake motif: ding... ding-dong! ... ding... ding-dong!
{
  const DURATION = 6.0;
  const samples = new Float32Array(Math.floor(DURATION * SAMPLE_RATE));

  // High-clarity chime sequence
  const chimes = [
    // Loop 1
    { t: 0.0, f: 880.0 },   // A5
    { t: 0.35, f: 1318.51 },// E6
    { t: 0.65, f: 1760.0 }, // A6
    { t: 1.20, f: 1174.66 },// D6
    { t: 1.50, f: 1567.98 },// G6

    // Loop 2
    { t: 3.0, f: 880.0 },   // A5
    { t: 3.35, f: 1318.51 },// E6
    { t: 3.65, f: 1760.0 }, // A6
    { t: 4.20, f: 1174.66 },// D6
    { t: 4.50, f: 1567.98 },// G6
  ];

  for (const c of chimes) {
    addBellNote(samples, c.t, 1.8, c.f, 27000, 4.0);
  }

  const wavBuf = createWavBuffer(samples);
  fs.writeFileSync(path.join(SOUNDS_DIR, 'energetic-dawn.wav'), wavBuf);
  console.log('Generated energetic-dawn.wav (size:', wavBuf.length, 'bytes)');
}

// 3. Zen Bowl: Deep resonant singing bowl with harmonic overtones (6 seconds)
{
  const DURATION = 6.0;
  const samples = new Float32Array(Math.floor(DURATION * SAMPLE_RATE));

  // First resonant strike at 0.0s (216 Hz root)
  addSingingBowlStrike(samples, 0.0, 3.2, 216, 28000);
  // High accent singing bell at 0.8s
  addBellNote(samples, 0.8, 2.5, 648, 16000, 2.0);

  // Second harmonious strike at 3.0s (270 Hz - gentle major third lift)
  addSingingBowlStrike(samples, 3.0, 3.0, 270, 28000);
  // High accent singing bell at 3.8s
  addBellNote(samples, 3.8, 2.5, 810, 16000, 2.0);

  const wavBuf = createWavBuffer(samples);
  fs.writeFileSync(path.join(SOUNDS_DIR, 'zen-bowl.wav'), wavBuf);
  console.log('Generated zen-bowl.wav (size:', wavBuf.length, 'bytes)');
}

// 4. Ocean Waves: Soothing surf wash layered with crystalline water harp chimes (6 seconds)
{
  const DURATION = 6.0;
  const samples = new Float32Array(Math.floor(DURATION * SAMPLE_RATE));

  // Organic ocean wave swell (pink/brown noise with smooth volume envelope)
  let lastNoise = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    // Ocean surf swell envelope: 2 waves in 6 seconds
    const wave1 = Math.pow(Math.sin((Math.PI * t) / 3.0), 2);
    const white = (Math.random() * 2 - 1);
    lastNoise = (lastNoise * 0.96) + (white * 0.04); // Low-pass warm noise filter
    const ocean = lastNoise * 9000 * wave1;
    samples[i] = ocean;
  }

  // Crystalline pentatonic water droplets / harp notes floating over the surf
  const waterNotes = [
    { t: 0.3, f: 587.33 },  // D5
    { t: 0.7, f: 739.99 },  // F#5
    { t: 1.1, f: 880.0 },   // A5
    { t: 1.8, f: 1174.66 }, // D6
    { t: 3.3, f: 587.33 },  // D5
    { t: 3.8, f: 880.0 },   // A5
    { t: 4.3, f: 1174.66 }, // D6
    { t: 4.8, f: 1479.98 }, // F#6
  ];

  for (const n of waterNotes) {
    addBellNote(samples, n.t, 2.0, n.f, 22000, 3.5);
  }

  const wavBuf = createWavBuffer(samples);
  fs.writeFileSync(path.join(SOUNDS_DIR, 'ocean-waves.wav'), wavBuf);
  console.log('Generated ocean-waves.wav (size:', wavBuf.length, 'bytes)');
}

console.log('All 4 rich alarm ringtones generated successfully!');

