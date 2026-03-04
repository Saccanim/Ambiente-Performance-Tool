import * as Tone from 'tone'
import { DEFAULT_EFFECT_INTENSITY, type EffectIntensityMap, type EffectType, type InstrumentType, type Tonality } from '@/audio/core/audioConfig'
import type { IAudioEngine } from '@/audio/core/IAudioEngine'
import {
  applyAllEffectIntensities,
  applyEffectIntensity,
  createEffectRack,
  disposeEffectRack,
  getEnabledEffectNodes,
  type EffectRack,
  syncDelayToBpm,
} from '@/audio/effects/effectRack'
import { applyMasterProfile, createInstrumentSynth } from '@/audio/timbres/instrumentPresets'

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
  private gain: Tone.Gain | null = null
  private masterEq: Tone.EQ3 | null = null
  private compressor: Tone.Compressor | null = null
  private limiter: Tone.Limiter | null = null
  private effectRack: EffectRack | null = null
  private activeNotes: string[] = []

  private getChordNotes(): string[] {
    const root = Tone.Frequency(`${this.tonality}3`)
    return CHORD_INTERVALS.map((interval) => root.transpose(interval).toNote())
  }

  private rebuildSignalChain(): void {
    if (
      !this.synth ||
      !this.highpass ||
      !this.lowpass ||
      !this.gain ||
      !this.masterEq ||
      !this.compressor ||
      !this.limiter ||
      !this.effectRack
    ) {
      return
    }

    const allNodes = [
      this.synth,
      this.highpass,
      this.lowpass,
      this.effectRack.reverb,
      this.effectRack.delay,
      this.effectRack.distortion,
      this.effectRack.envelopeFilter,
      this.effectRack.chorus,
      this.gain,
      this.masterEq,
      this.compressor,
      this.limiter,
    ]

    for (const node of allNodes) {
      node.disconnect()
    }

    const chainNodes = [
      this.highpass,
      this.lowpass,
      ...getEnabledEffectNodes(this.effectRack, this.enabledEffects),
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

    this.synth = createInstrumentSynth(this.instrument)
    this.highpass = new Tone.Filter(120, 'highpass', -24)
    this.lowpass = new Tone.Filter(8_000, 'lowpass', -24)
    this.gain = new Tone.Gain(0.5)
    this.masterEq = new Tone.EQ3(-1, 0.6, -1.2)
    this.masterEq.lowFrequency.value = 220
    this.masterEq.highFrequency.value = 2600
    this.compressor = new Tone.Compressor(-20, 2.2)
    this.compressor.attack.value = 0.012
    this.compressor.release.value = 0.18
    this.limiter = new Tone.Limiter(-1)
    this.effectRack = createEffectRack()

    this.rebuildSignalChain()
    applyMasterProfile(this.masterEq, this.instrument)
    applyAllEffectIntensities(this.effectRack, this.effectIntensity, this.currentBpm)
    syncDelayToBpm(this.effectRack, this.currentBpm)

    Tone.Transport.bpm.value = this.currentBpm

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
    if (this.effectRack) {
      syncDelayToBpm(this.effectRack, bpm)
    }
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

    this.synth = createInstrumentSynth(value)
    previousSynth?.disconnect()
    previousSynth?.dispose()
    this.rebuildSignalChain()
    if (this.masterEq) {
      applyMasterProfile(this.masterEq, this.instrument)
    }

    if (wasPlaying && this.synth) {
      this.activeNotes = this.getChordNotes()
      this.synth.triggerAttack(this.activeNotes)
    }
  }

  setEffects(value: EffectType[]): void {
    this.enabledEffects = new Set(value)
    if (!this.initialized || !this.effectRack) {
      return
    }
    this.rebuildSignalChain()
    applyAllEffectIntensities(this.effectRack, this.effectIntensity, this.currentBpm)
  }

  setEffectIntensity(effect: EffectType, value: number): void {
    this.effectIntensity = {
      ...this.effectIntensity,
      [effect]: clamp(value, 0, 1),
    }

    if (!this.initialized || !this.effectRack) {
      return
    }
    applyEffectIntensity(this.effectRack, effect, this.effectIntensity[effect], this.currentBpm)
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
    this.gain?.dispose()
    this.masterEq?.dispose()
    this.compressor?.dispose()
    this.limiter?.dispose()
    if (this.effectRack) {
      disposeEffectRack(this.effectRack)
    }

    this.synth = null
    this.highpass = null
    this.lowpass = null
    this.gain = null
    this.masterEq = null
    this.compressor = null
    this.limiter = null
    this.effectRack = null
    this.activeNotes = []
    this.playing = false
    this.enabledEffects.clear()
    this.initialized = false
  }
}

export const audioEngine = new ToneAudioEngine()
