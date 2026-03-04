import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_EFFECT_INTENSITY, type EffectIntensityMap, type EffectType, type InstrumentType, type Tonality } from '@/audio/core/audioConfig'

interface AudioState {
  audioEnabled: boolean
  padPlaying: boolean
  bpm: number
  volume: number
  lowCut: number
  highCut: number
  instrument: InstrumentType
  effects: EffectType[]
  effectIntensity: EffectIntensityMap
  tonality: Tonality
  setAudioEnabled: (value: boolean) => void
  setPadPlaying: (value: boolean) => void
  setBpm: (value: number) => void
  setVolume: (value: number) => void
  setLowCut: (value: number) => void
  setHighCut: (value: number) => void
  setInstrument: (value: InstrumentType) => void
  setEffects: (value: EffectType[]) => void
  setEffectIntensity: (effect: EffectType, value: number) => void
  setTonality: (value: Tonality) => void
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      audioEnabled: false,
      padPlaying: false,
      bpm: 72,
      volume: 0.5,
      lowCut: 120,
      highCut: 8000,
      instrument: 'pad',
      effects: [],
      effectIntensity: { ...DEFAULT_EFFECT_INTENSITY },
      tonality: 'C',
      setAudioEnabled: (value) => set({ audioEnabled: value }),
      setPadPlaying: (value) => set({ padPlaying: value }),
      setBpm: (value) => set({ bpm: value }),
      setVolume: (value) => set({ volume: value }),
      setLowCut: (value) => set({ lowCut: value }),
      setHighCut: (value) => set({ highCut: value }),
      setInstrument: (value) => set({ instrument: value }),
      setEffects: (value) => set({ effects: value }),
      setEffectIntensity: (effect, value) =>
        set((state) => ({
          effectIntensity: {
            ...state.effectIntensity,
            [effect]: value,
          },
        })),
      setTonality: (value) => set({ tonality: value }),
    }),
    {
      name: 'ambient-performance-store',
      partialize: (state) => ({
        bpm: state.bpm,
        volume: state.volume,
        lowCut: state.lowCut,
        highCut: state.highCut,
        instrument: state.instrument,
        effects: state.effects,
        effectIntensity: state.effectIntensity,
        tonality: state.tonality,
      }),
    },
  ),
)
