import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AudioState {
  audioEnabled: boolean
  padPlaying: boolean
  bpm: number
  volume: number
  lowCut: number
  highCut: number
  setAudioEnabled: (value: boolean) => void
  setPadPlaying: (value: boolean) => void
  setBpm: (value: number) => void
  setVolume: (value: number) => void
  setLowCut: (value: number) => void
  setHighCut: (value: number) => void
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
      setAudioEnabled: (value) => set({ audioEnabled: value }),
      setPadPlaying: (value) => set({ padPlaying: value }),
      setBpm: (value) => set({ bpm: value }),
      setVolume: (value) => set({ volume: value }),
      setLowCut: (value) => set({ lowCut: value }),
      setHighCut: (value) => set({ highCut: value }),
    }),
    {
      name: 'ambient-performance-store',
      partialize: (state) => ({
        bpm: state.bpm,
        volume: state.volume,
        lowCut: state.lowCut,
        highCut: state.highCut,
      }),
    },
  ),
)
