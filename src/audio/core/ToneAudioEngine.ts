import * as Tone from 'tone'
import type { IAudioEngine } from '@/audio/core/IAudioEngine'

const MIN_FREQUENCY = 20
const MAX_FREQUENCY = 20_000

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export class ToneAudioEngine implements IAudioEngine {
  private initialized = false
  private playing = false
  private synth: Tone.PolySynth | null = null
  private highpass: Tone.Filter | null = null
  private lowpass: Tone.Filter | null = null
  private gain: Tone.Gain | null = null
  private loop: Tone.Loop | null = null

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

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: {
        attack: 1.2,
        decay: 0.8,
        sustain: 0.45,
        release: 2.6,
      },
    })

    this.highpass = new Tone.Filter(120, 'highpass', -24)
    this.lowpass = new Tone.Filter(8_000, 'lowpass', -24)
    this.gain = new Tone.Gain(0.5)

    this.synth.chain(this.highpass, this.lowpass, this.gain, Tone.Destination)

    Tone.Transport.bpm.value = 72
    this.loop = new Tone.Loop((time) => {
      this.synth?.triggerAttackRelease(['C4', 'G4', 'D5'], '2n', time)
    }, '1m')

    // Audible confirmation that audio path is unlocked after user gesture.
    this.synth.triggerAttackRelease('C5', '8n')
    this.initialized = true
  }

  togglePad(playing: boolean): void {
    if (!this.initialized || !this.loop) {
      return
    }

    if (playing && !this.playing) {
      this.loop.start(0)
      Tone.Transport.start()
      this.playing = true
      return
    }

    if (!playing && this.playing) {
      this.loop.stop(0)
      Tone.Transport.stop()
      Tone.Transport.position = 0
      this.playing = false
    }
  }

  isPadPlaying(): boolean {
    return this.playing
  }

  setBpm(value: number): void {
    const bpm = clamp(value, 40, 180)
    Tone.Transport.bpm.rampTo(bpm, 0.1)
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

  dispose(): void {
    this.togglePad(false)
    this.loop?.dispose()
    this.synth?.dispose()
    this.highpass?.dispose()
    this.lowpass?.dispose()
    this.gain?.dispose()

    this.loop = null
    this.synth = null
    this.highpass = null
    this.lowpass = null
    this.gain = null
    this.initialized = false
  }
}

export const audioEngine = new ToneAudioEngine()
