import * as Tone from 'tone'
import {
  DEFAULT_EFFECT_INTENSITY,
  EFFECT_OPTIONS,
  type EffectIntensityMap,
  type EffectType,
  type InstrumentType,
  type Tonality,
} from '@/audio/core/audioConfig'
import type { IAudioEngine } from '@/audio/core/IAudioEngine'
import { INSTRUMENT_WAVE_PARTIALS } from '@/audio/core/waveTablePresets'

const MIN_FREQUENCY = 20
const MAX_FREQUENCY = 20_000
const MIN_BPM = 40
const MAX_BPM = 300
const CHORD_INTERVALS = [0, 5, 7, 12] as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export class ToneAudioEngine implements IAudioEngine {
  private initialized = false
  private playing = false
  private instrument: InstrumentType = 'pad'
  private tonality: Tonality = 'C'
  private currentBpm = 72
  private enabledEffects = new Set<EffectType>()
  private effectIntensity: EffectIntensityMap = { ...DEFAULT_EFFECT_INTENSITY }
  private synth: Tone.PolySynth | null = null
  private highpass: Tone.Filter | null = null
  private lowpass: Tone.Filter | null = null
  private reverb: Tone.JCReverb | null = null
  private delay: Tone.FeedbackDelay | null = null
  private distortion: Tone.Distortion | null = null
  private envelopeFilter: Tone.AutoWah | null = null
  private chorus: Tone.Chorus | null = null
  private gain: Tone.Gain | null = null
  private masterEq: Tone.EQ3 | null = null
  private compressor: Tone.Compressor | null = null
  private limiter: Tone.Limiter | null = null
  private activeNotes: string[] = []

  private createWaveTableSynth(options: {
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
  }): Tone.PolySynth {
    return new Tone.PolySynth(Tone.MonoSynth, {
      oscillator: { type: 'custom', partials: options.partials },
      envelope: options.envelope,
      filter: options.filter,
      filterEnvelope: options.filterEnvelope,
      volume: options.volume,
    })
  }

  private createSynth(instrument: InstrumentType): Tone.PolySynth {
    switch (instrument) {
      case 'orgao':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.orgao,
          envelope: {
            attack: 0.01,
            decay: 0.08,
            sustain: 0.95,
            release: 0.6,
          },
          filter: {
            type: 'lowpass',
            frequency: 4500,
            Q: 0.2,
            rolloff: -24,
          },
          filterEnvelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.1,
            release: 0.25,
            baseFrequency: 320,
            octaves: 1.8,
          },
          volume: -10,
        })
      case 'violino':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.violino,
          envelope: {
            attack: 0.12,
            decay: 0.25,
            sustain: 0.8,
            release: 1.9,
          },
          filter: {
            type: 'lowpass',
            frequency: 3600,
            Q: 1.4,
            rolloff: -24,
          },
          filterEnvelope: {
            attack: 0.22,
            decay: 0.7,
            sustain: 0.4,
            release: 1.3,
            baseFrequency: 420,
            octaves: 3.1,
          },
          volume: -9,
        })
      case 'vozes':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.vozes,
          envelope: {
            attack: 0.65,
            decay: 0.4,
            sustain: 0.88,
            release: 3.5,
          },
          filter: {
            type: 'bandpass',
            frequency: 1200,
            Q: 0.7,
            rolloff: -12,
          },
          filterEnvelope: {
            attack: 0.6,
            decay: 1.2,
            sustain: 0.5,
            release: 3,
            baseFrequency: 240,
            octaves: 2.4,
          },
          volume: -11,
        })
      case 'cosinus':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.cosinus,
          envelope: { attack: 0.12, decay: 0.2, sustain: 0.8, release: 1.4 },
          filter: { type: 'lowpass', frequency: 3200, Q: 0.5, rolloff: -24 },
          filterEnvelope: {
            attack: 0.2,
            decay: 0.6,
            sustain: 0.35,
            release: 1.2,
            baseFrequency: 220,
            octaves: 2,
          },
          volume: -10,
        })
      case 'harmonicRich':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.harmonicRich,
          envelope: { attack: 0.02, decay: 0.15, sustain: 0.9, release: 0.9 },
          filter: { type: 'lowpass', frequency: 4600, Q: 0.7, rolloff: -24 },
          filterEnvelope: {
            attack: 0.06,
            decay: 0.35,
            sustain: 0.2,
            release: 0.55,
            baseFrequency: 280,
            octaves: 3,
          },
          volume: -10,
        })
      case 'softBell':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.softBell,
          envelope: { attack: 0.005, decay: 0.75, sustain: 0.06, release: 1.8 },
          filter: { type: 'bandpass', frequency: 2100, Q: 1.4, rolloff: -12 },
          filterEnvelope: {
            attack: 0.01,
            decay: 0.9,
            sustain: 0,
            release: 1.6,
            baseFrequency: 420,
            octaves: 2.2,
          },
          volume: -11,
        })
      case 'deepBass':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.deepBass,
          envelope: { attack: 0.02, decay: 0.2, sustain: 0.95, release: 1.3 },
          filter: { type: 'lowpass', frequency: 950, Q: 1.1, rolloff: -24 },
          filterEnvelope: {
            attack: 0.03,
            decay: 0.5,
            sustain: 0.18,
            release: 0.9,
            baseFrequency: 65,
            octaves: 1.6,
          },
          volume: -8,
        })
      case 'hollow':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.hollow,
          envelope: { attack: 0.08, decay: 0.3, sustain: 0.7, release: 1.6 },
          filter: { type: 'bandpass', frequency: 1500, Q: 0.9, rolloff: -12 },
          filterEnvelope: {
            attack: 0.12,
            decay: 0.7,
            sustain: 0.26,
            release: 1.1,
            baseFrequency: 210,
            octaves: 2.4,
          },
          volume: -10,
        })
      case 'buzz':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.buzz,
          envelope: { attack: 0.01, decay: 0.18, sustain: 0.82, release: 0.8 },
          filter: { type: 'lowpass', frequency: 3000, Q: 1.6, rolloff: -24 },
          filterEnvelope: {
            attack: 0.03,
            decay: 0.3,
            sustain: 0.12,
            release: 0.3,
            baseFrequency: 260,
            octaves: 2.6,
          },
          volume: -11,
        })
      case 'softString':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.softString,
          envelope: { attack: 0.2, decay: 0.35, sustain: 0.76, release: 2.2 },
          filter: { type: 'lowpass', frequency: 2500, Q: 0.6, rolloff: -24 },
          filterEnvelope: {
            attack: 0.25,
            decay: 0.9,
            sustain: 0.3,
            release: 1.6,
            baseFrequency: 190,
            octaves: 2.8,
          },
          volume: -11,
        })
      case 'robotic':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.robotic,
          envelope: { attack: 0.01, decay: 0.12, sustain: 0.86, release: 0.65 },
          filter: { type: 'bandpass', frequency: 1700, Q: 2.1, rolloff: -12 },
          filterEnvelope: {
            attack: 0.02,
            decay: 0.3,
            sustain: 0.22,
            release: 0.4,
            baseFrequency: 280,
            octaves: 3,
          },
          volume: -12,
        })
      case 'waterDrop':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.waterDrop,
          envelope: { attack: 0.002, decay: 0.38, sustain: 0.04, release: 1.2 },
          filter: { type: 'bandpass', frequency: 2600, Q: 2.8, rolloff: -12 },
          filterEnvelope: {
            attack: 0.005,
            decay: 0.5,
            sustain: 0,
            release: 0.85,
            baseFrequency: 700,
            octaves: 2.1,
          },
          volume: -12,
        })
      case 'wind':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.wind,
          envelope: { attack: 1.3, decay: 1, sustain: 0.72, release: 2.8 },
          filter: { type: 'bandpass', frequency: 1100, Q: 0.4, rolloff: -12 },
          filterEnvelope: {
            attack: 1.1,
            decay: 1.3,
            sustain: 0.5,
            release: 2.2,
            baseFrequency: 160,
            octaves: 1.8,
          },
          volume: -12,
        })
      case 'weird':
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.weird,
          envelope: { attack: 0.02, decay: 0.2, sustain: 0.76, release: 1.1 },
          filter: { type: 'bandpass', frequency: 1400, Q: 1.9, rolloff: -12 },
          filterEnvelope: {
            attack: 0.03,
            decay: 0.45,
            sustain: 0.2,
            release: 0.7,
            baseFrequency: 230,
            octaves: 2.7,
          },
          volume: -12,
        })
      case 'pad':
      default:
        return this.createWaveTableSynth({
          partials: INSTRUMENT_WAVE_PARTIALS.pad,
          envelope: {
            attack: 2.2,
            decay: 0.3,
            sustain: 0.85,
            release: 4.6,
          },
          filter: {
            type: 'lowpass',
            frequency: 1800,
            Q: 0.8,
            rolloff: -24,
          },
          filterEnvelope: {
            attack: 2.4,
            decay: 1.8,
            sustain: 0.35,
            release: 3.5,
            baseFrequency: 140,
            octaves: 3.2,
          },
          volume: -11,
        })
    }
  }

  private applyMasterProfile(): void {
    if (!this.masterEq) {
      return
    }

    switch (this.instrument) {
      case 'orgao':
        this.masterEq.low.rampTo(0.2, 0.1)
        this.masterEq.mid.rampTo(1.2, 0.1)
        this.masterEq.high.rampTo(-2.4, 0.1)
        return
      case 'violino':
        this.masterEq.low.rampTo(-1.2, 0.1)
        this.masterEq.mid.rampTo(1.8, 0.1)
        this.masterEq.high.rampTo(-0.2, 0.1)
        return
      case 'vozes':
        this.masterEq.low.rampTo(-1.6, 0.1)
        this.masterEq.mid.rampTo(0.6, 0.1)
        this.masterEq.high.rampTo(-2.1, 0.1)
        return
      case 'deepBass':
        this.masterEq.low.rampTo(2.1, 0.1)
        this.masterEq.mid.rampTo(-1.6, 0.1)
        this.masterEq.high.rampTo(-3, 0.1)
        return
      case 'softBell':
      case 'waterDrop':
        this.masterEq.low.rampTo(-2, 0.1)
        this.masterEq.mid.rampTo(0.2, 0.1)
        this.masterEq.high.rampTo(0.7, 0.1)
        return
      case 'robotic':
      case 'buzz':
      case 'weird':
        this.masterEq.low.rampTo(-1.8, 0.1)
        this.masterEq.mid.rampTo(0.4, 0.1)
        this.masterEq.high.rampTo(-3.2, 0.1)
        return
      case 'pad':
      case 'softString':
      case 'wind':
      case 'hollow':
      case 'harmonicRich':
      case 'cosinus':
      default:
        this.masterEq.low.rampTo(1.4, 0.1)
        this.masterEq.mid.rampTo(-0.8, 0.1)
        this.masterEq.high.rampTo(-1.4, 0.1)
    }
  }

  private getChordNotes(): string[] {
    const root = Tone.Frequency(`${this.tonality}3`)
    return CHORD_INTERVALS.map((interval) => root.transpose(interval).toNote())
  }

  private syncDelayToBpm(): void {
    if (!this.delay) {
      return
    }

    const secondsPerBeat = 60 / this.currentBpm
    const eighthNote = secondsPerBeat / 2
    this.delay.delayTime.rampTo(eighthNote, 0.1)
  }

  private applyEffectIntensity(effect: EffectType): void {
    const intensity = clamp(this.effectIntensity[effect], 0, 1)

    switch (effect) {
      case 'reverb':
        if (!this.reverb) {
          return
        }

        this.reverb.roomSize.rampTo(0.2 + intensity * 0.75, 0.1)
        this.reverb.wet.rampTo(intensity, 0.1)
        return
      case 'delay':
        if (!this.delay) {
          return
        }

        this.delay.feedback.rampTo(0.08 + intensity * 0.75, 0.1)
        this.delay.wet.rampTo(intensity * 0.9, 0.1)
        this.syncDelayToBpm()
        return
      case 'distortion':
        if (!this.distortion) {
          return
        }

        this.distortion.distortion = intensity
        this.distortion.wet.rampTo(intensity, 0.1)
        return
      case 'envelopeFilter':
        if (!this.envelopeFilter) {
          return
        }

        this.envelopeFilter.baseFrequency = 90 + intensity * 420
        this.envelopeFilter.octaves = 1.8 + intensity * 4.5
        this.envelopeFilter.sensitivity = -60 + intensity * 48
        this.envelopeFilter.Q.rampTo(2 + intensity * 10, 0.1)
        this.envelopeFilter.gain.rampTo(2 + intensity * 10, 0.1)
        this.envelopeFilter.wet.rampTo(intensity, 0.1)
        return
      case 'chorus':
        if (!this.chorus) {
          return
        }

        this.chorus.frequency.rampTo(0.8 + intensity * 5, 0.1)
        this.chorus.depth = 0.2 + intensity * 0.75
        this.chorus.wet.rampTo(intensity, 0.1)
    }
  }

  private applyAllEffectIntensities(): void {
    for (const effect of EFFECT_OPTIONS) {
      this.applyEffectIntensity(effect)
    }
  }

  private getEnabledEffectNodes(): Tone.ToneAudioNode[] {
    const nodes: Tone.ToneAudioNode[] = []

    for (const effect of EFFECT_OPTIONS) {
      if (!this.enabledEffects.has(effect)) {
        continue
      }

      switch (effect) {
        case 'reverb':
          if (this.reverb) {
            nodes.push(this.reverb)
          }
          break
        case 'delay':
          if (this.delay) {
            nodes.push(this.delay)
          }
          break
        case 'distortion':
          if (this.distortion) {
            nodes.push(this.distortion)
          }
          break
        case 'envelopeFilter':
          if (this.envelopeFilter) {
            nodes.push(this.envelopeFilter)
          }
          break
        case 'chorus':
          if (this.chorus) {
            nodes.push(this.chorus)
          }
          break
      }
    }

    return nodes
  }

  private rebuildSignalChain(): void {
    if (
      !this.synth ||
      !this.highpass ||
      !this.lowpass ||
      !this.gain ||
      !this.masterEq ||
      !this.compressor ||
      !this.limiter
    ) {
      return
    }

    const allNodes = [
      this.synth,
      this.highpass,
      this.lowpass,
      this.reverb,
      this.delay,
      this.distortion,
      this.envelopeFilter,
      this.chorus,
      this.gain,
      this.masterEq,
      this.compressor,
      this.limiter,
    ]

    for (const node of allNodes) {
      node?.disconnect()
    }

    const chainNodes = [
      this.highpass,
      this.lowpass,
      ...this.getEnabledEffectNodes(),
      this.gain,
      this.masterEq,
      this.compressor,
      this.limiter,
    ]
    let current = this.synth as Tone.ToneAudioNode

    for (const node of chainNodes) {
      current.connect(node)
      current = node
    }

    current.connect(Tone.Destination)
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    await Tone.start()
    const context = Tone.getContext()
    if (context.state !== 'running') {
      await context.resume()
    }
    context.lookAhead = 0.03

    this.synth = this.createSynth(this.instrument)
    this.highpass = new Tone.Filter(120, 'highpass', -24)
    this.lowpass = new Tone.Filter(8_000, 'lowpass', -24)
    this.reverb = new Tone.JCReverb(0.35)
    this.delay = new Tone.FeedbackDelay(0.2, 0.3)
    this.distortion = new Tone.Distortion(0.2)
    this.envelopeFilter = new Tone.AutoWah(120, 4, -30)
    this.chorus = new Tone.Chorus(1.2, 4.5, 0.35).start()
    this.gain = new Tone.Gain(0.5)
    this.masterEq = new Tone.EQ3(-1, 0.6, -1.2)
    this.masterEq.lowFrequency.value = 220
    this.masterEq.highFrequency.value = 2600
    this.compressor = new Tone.Compressor(-20, 2.2)
    this.compressor.attack.value = 0.012
    this.compressor.release.value = 0.18
    this.limiter = new Tone.Limiter(-1)

    this.rebuildSignalChain()
    this.applyMasterProfile()
    this.applyAllEffectIntensities()
    this.syncDelayToBpm()

    Tone.Transport.bpm.value = this.currentBpm

    // Audible confirmation that audio path is unlocked after user gesture.
    this.synth.triggerAttackRelease(this.getChordNotes(), '8n')
    this.initialized = true
  }

  togglePad(playing: boolean): void {
    if (!this.initialized || !this.synth) {
      return
    }

    if (playing && !this.playing) {
      Tone.Transport.start()
      this.activeNotes = this.getChordNotes()
      this.synth.triggerAttack(this.activeNotes)
      this.playing = true
      return
    }

    if (!playing && this.playing) {
      if (this.activeNotes.length > 0) {
        this.synth.triggerRelease(this.activeNotes)
      }
      this.activeNotes = []
      Tone.Transport.stop()
      Tone.Transport.position = 0
      this.playing = false
    }
  }

  isPadPlaying(): boolean {
    return this.playing
  }

  setBpm(value: number): void {
    const bpm = clamp(value, MIN_BPM, MAX_BPM)
    this.currentBpm = bpm
    Tone.Transport.bpm.rampTo(bpm, 0.1)
    this.syncDelayToBpm()
  }

  setVolume(value: number): void {
    if (!this.gain) {
      return
    }

    this.gain.gain.rampTo(clamp(value, 0, 1), 0.1)
  }

  setFilter(lowCut: number, highCut: number): void {
    if (!this.highpass || !this.lowpass) {
      return
    }

    const low = clamp(lowCut, MIN_FREQUENCY, MAX_FREQUENCY - 1)
    const high = clamp(highCut, low + 1, MAX_FREQUENCY)

    this.highpass.frequency.rampTo(low, 0.1)
    this.lowpass.frequency.rampTo(high, 0.1)
  }

  setInstrument(value: InstrumentType): void {
    this.instrument = value

    if (!this.initialized) {
      return
    }

    const wasPlaying = this.playing
    const notesToRetain = [...this.activeNotes]
    const previousSynth = this.synth
    if (wasPlaying && notesToRetain.length > 0) {
      previousSynth?.triggerRelease(notesToRetain)
    }
    this.synth = this.createSynth(value)
    previousSynth?.disconnect()
    previousSynth?.dispose()
    this.rebuildSignalChain()
    this.applyMasterProfile()

    if (wasPlaying && this.synth) {
      this.activeNotes = this.getChordNotes()
      this.synth.triggerAttack(this.activeNotes)
    }
  }

  setEffects(value: EffectType[]): void {
    this.enabledEffects = new Set(value)

    if (!this.initialized) {
      return
    }

    this.rebuildSignalChain()
    this.applyAllEffectIntensities()
  }

  setEffectIntensity(effect: EffectType, value: number): void {
    this.effectIntensity = {
      ...this.effectIntensity,
      [effect]: clamp(value, 0, 1),
    }

    if (!this.initialized) {
      return
    }

    this.applyEffectIntensity(effect)
  }

  setTonality(value: Tonality): void {
    this.tonality = value

    if (!this.playing || !this.synth) {
      return
    }

    if (this.activeNotes.length > 0) {
      this.synth.triggerRelease(this.activeNotes)
    }

    this.activeNotes = this.getChordNotes()
    this.synth.triggerAttack(this.activeNotes)
  }

  dispose(): void {
    this.togglePad(false)
    this.synth?.dispose()
    this.highpass?.dispose()
    this.lowpass?.dispose()
    this.reverb?.dispose()
    this.delay?.dispose()
    this.distortion?.dispose()
    this.envelopeFilter?.dispose()
    this.chorus?.dispose()
    this.gain?.dispose()
    this.masterEq?.dispose()
    this.compressor?.dispose()
    this.limiter?.dispose()

    this.synth = null
    this.highpass = null
    this.lowpass = null
    this.reverb = null
    this.delay = null
    this.distortion = null
    this.envelopeFilter = null
    this.chorus = null
    this.gain = null
    this.masterEq = null
    this.compressor = null
    this.limiter = null
    this.activeNotes = []
    this.playing = false
    this.enabledEffects.clear()
    this.initialized = false
  }
}

export const audioEngine = new ToneAudioEngine()
