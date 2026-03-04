import type { EffectType, InstrumentType, Tonality } from '@/audio/core/audioConfig'

export interface IAudioEngine {
  initialize(): Promise<void>
  togglePad(playing: boolean): void
  isPadPlaying(): boolean
  setBpm(value: number): void
  setVolume(value: number): void
  setFilter(lowCut: number, highCut: number): void
  setInstrument(value: InstrumentType): void
  setEffects(value: EffectType[]): void
  setEffectIntensity(effect: EffectType, value: number): void
  setTonality(value: Tonality): void
  dispose(): void
}
