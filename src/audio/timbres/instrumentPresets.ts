import * as Tone from 'tone'
import type { InstrumentType } from '@/audio/core/audioConfig'
import { INSTRUMENT_WAVE_PARTIALS } from '@/audio/core/waveTablePresets'

interface WaveTablePreset {
  partials: number[]
  envelope: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass'
    frequency: number
    Q: number
    rolloff: -12 | -24 | -48 | -96
  }
  filterEnvelope: {
    attack: number
    decay: number
    sustain: number
    release: number
    baseFrequency: number
    octaves: number
  }
  volume: number
}

function createWaveTableSynth(preset: WaveTablePreset): Tone.PolySynth {
  return new Tone.PolySynth(Tone.MonoSynth, {
    oscillator: { type: 'custom', partials: preset.partials },
    envelope: preset.envelope,
    filter: preset.filter,
    filterEnvelope: preset.filterEnvelope,
    volume: preset.volume,
  })
}

const PRESETS: Record<InstrumentType, WaveTablePreset> = {
  orgao: {
    partials: INSTRUMENT_WAVE_PARTIALS.orgao,
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.95, release: 0.6 },
    filter: { type: 'lowpass', frequency: 4500, Q: 0.2, rolloff: -24 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.25, baseFrequency: 320, octaves: 1.8 },
    volume: -10,
  },
  violino: {
    partials: INSTRUMENT_WAVE_PARTIALS.violino,
    envelope: { attack: 0.12, decay: 0.25, sustain: 0.8, release: 1.9 },
    filter: { type: 'lowpass', frequency: 3600, Q: 1.4, rolloff: -24 },
    filterEnvelope: { attack: 0.22, decay: 0.7, sustain: 0.4, release: 1.3, baseFrequency: 420, octaves: 3.1 },
    volume: -9,
  },
  vozes: {
    partials: INSTRUMENT_WAVE_PARTIALS.vozes,
    envelope: { attack: 0.65, decay: 0.4, sustain: 0.88, release: 3.5 },
    filter: { type: 'bandpass', frequency: 1200, Q: 0.7, rolloff: -12 },
    filterEnvelope: { attack: 0.6, decay: 1.2, sustain: 0.5, release: 3, baseFrequency: 240, octaves: 2.4 },
    volume: -11,
  },
  cosinus: {
    partials: INSTRUMENT_WAVE_PARTIALS.cosinus,
    envelope: { attack: 0.12, decay: 0.2, sustain: 0.8, release: 1.4 },
    filter: { type: 'lowpass', frequency: 3200, Q: 0.5, rolloff: -24 },
    filterEnvelope: { attack: 0.2, decay: 0.6, sustain: 0.35, release: 1.2, baseFrequency: 220, octaves: 2 },
    volume: -10,
  },
  harmonicRich: {
    partials: INSTRUMENT_WAVE_PARTIALS.harmonicRich,
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.9, release: 0.9 },
    filter: { type: 'lowpass', frequency: 4600, Q: 0.7, rolloff: -24 },
    filterEnvelope: { attack: 0.06, decay: 0.35, sustain: 0.2, release: 0.55, baseFrequency: 280, octaves: 3 },
    volume: -10,
  },
  softBell: {
    partials: INSTRUMENT_WAVE_PARTIALS.softBell,
    envelope: { attack: 0.005, decay: 0.75, sustain: 0.06, release: 1.8 },
    filter: { type: 'bandpass', frequency: 2100, Q: 1.4, rolloff: -12 },
    filterEnvelope: { attack: 0.01, decay: 0.9, sustain: 0, release: 1.6, baseFrequency: 420, octaves: 2.2 },
    volume: -11,
  },
  deepBass: {
    partials: INSTRUMENT_WAVE_PARTIALS.deepBass,
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.95, release: 1.3 },
    filter: { type: 'lowpass', frequency: 950, Q: 1.1, rolloff: -24 },
    filterEnvelope: { attack: 0.03, decay: 0.5, sustain: 0.18, release: 0.9, baseFrequency: 65, octaves: 1.6 },
    volume: -8,
  },
  hollow: {
    partials: INSTRUMENT_WAVE_PARTIALS.hollow,
    envelope: { attack: 0.08, decay: 0.3, sustain: 0.7, release: 1.6 },
    filter: { type: 'bandpass', frequency: 1500, Q: 0.9, rolloff: -12 },
    filterEnvelope: { attack: 0.12, decay: 0.7, sustain: 0.26, release: 1.1, baseFrequency: 210, octaves: 2.4 },
    volume: -10,
  },
  buzz: {
    partials: INSTRUMENT_WAVE_PARTIALS.buzz,
    envelope: { attack: 0.01, decay: 0.18, sustain: 0.82, release: 0.8 },
    filter: { type: 'lowpass', frequency: 3000, Q: 1.6, rolloff: -24 },
    filterEnvelope: { attack: 0.03, decay: 0.3, sustain: 0.12, release: 0.3, baseFrequency: 260, octaves: 2.6 },
    volume: -11,
  },
  softString: {
    partials: INSTRUMENT_WAVE_PARTIALS.softString,
    envelope: { attack: 0.2, decay: 0.35, sustain: 0.76, release: 2.2 },
    filter: { type: 'lowpass', frequency: 2500, Q: 0.6, rolloff: -24 },
    filterEnvelope: { attack: 0.25, decay: 0.9, sustain: 0.3, release: 1.6, baseFrequency: 190, octaves: 2.8 },
    volume: -11,
  },
  robotic: {
    partials: INSTRUMENT_WAVE_PARTIALS.robotic,
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.86, release: 0.65 },
    filter: { type: 'bandpass', frequency: 1700, Q: 2.1, rolloff: -12 },
    filterEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.22, release: 0.4, baseFrequency: 280, octaves: 3 },
    volume: -12,
  },
  waterDrop: {
    partials: INSTRUMENT_WAVE_PARTIALS.waterDrop,
    envelope: { attack: 0.002, decay: 0.38, sustain: 0.04, release: 1.2 },
    filter: { type: 'bandpass', frequency: 2600, Q: 2.8, rolloff: -12 },
    filterEnvelope: { attack: 0.005, decay: 0.5, sustain: 0, release: 0.85, baseFrequency: 700, octaves: 2.1 },
    volume: -12,
  },
  wind: {
    partials: INSTRUMENT_WAVE_PARTIALS.wind,
    envelope: { attack: 1.3, decay: 1, sustain: 0.72, release: 2.8 },
    filter: { type: 'bandpass', frequency: 1100, Q: 0.4, rolloff: -12 },
    filterEnvelope: { attack: 1.1, decay: 1.3, sustain: 0.5, release: 2.2, baseFrequency: 160, octaves: 1.8 },
    volume: -12,
  },
  weird: {
    partials: INSTRUMENT_WAVE_PARTIALS.weird,
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.76, release: 1.1 },
    filter: { type: 'bandpass', frequency: 1400, Q: 1.9, rolloff: -12 },
    filterEnvelope: { attack: 0.03, decay: 0.45, sustain: 0.2, release: 0.7, baseFrequency: 230, octaves: 2.7 },
    volume: -12,
  },
  pad: {
    partials: INSTRUMENT_WAVE_PARTIALS.pad,
    envelope: { attack: 2.2, decay: 0.3, sustain: 0.85, release: 4.6 },
    filter: { type: 'lowpass', frequency: 1800, Q: 0.8, rolloff: -24 },
    filterEnvelope: { attack: 2.4, decay: 1.8, sustain: 0.35, release: 3.5, baseFrequency: 140, octaves: 3.2 },
    volume: -11,
  },
}

export function createInstrumentSynth(instrument: InstrumentType): Tone.PolySynth {
  return createWaveTableSynth(PRESETS[instrument])
}

export function applyMasterProfile(masterEq: Tone.EQ3, instrument: InstrumentType): void {
  switch (instrument) {
    case 'orgao':
      masterEq.low.rampTo(0.2, 0.1)
      masterEq.mid.rampTo(1.2, 0.1)
      masterEq.high.rampTo(-2.4, 0.1)
      return
    case 'violino':
      masterEq.low.rampTo(-1.2, 0.1)
      masterEq.mid.rampTo(1.8, 0.1)
      masterEq.high.rampTo(-0.2, 0.1)
      return
    case 'vozes':
      masterEq.low.rampTo(-1.6, 0.1)
      masterEq.mid.rampTo(0.6, 0.1)
      masterEq.high.rampTo(-2.1, 0.1)
      return
    case 'deepBass':
      masterEq.low.rampTo(2.1, 0.1)
      masterEq.mid.rampTo(-1.6, 0.1)
      masterEq.high.rampTo(-3, 0.1)
      return
    case 'softBell':
    case 'waterDrop':
      masterEq.low.rampTo(-2, 0.1)
      masterEq.mid.rampTo(0.2, 0.1)
      masterEq.high.rampTo(0.7, 0.1)
      return
    case 'robotic':
    case 'buzz':
    case 'weird':
      masterEq.low.rampTo(-1.8, 0.1)
      masterEq.mid.rampTo(0.4, 0.1)
      masterEq.high.rampTo(-3.2, 0.1)
      return
    default:
      masterEq.low.rampTo(1.4, 0.1)
      masterEq.mid.rampTo(-0.8, 0.1)
      masterEq.high.rampTo(-1.4, 0.1)
  }
}
