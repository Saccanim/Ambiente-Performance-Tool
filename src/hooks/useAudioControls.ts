import { useCallback, useState } from 'react'
import { audioEngine } from '@/audio/core/ToneAudioEngine'
import { useAudioStore } from '@/store/audioStore'

export function useAudioControls() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  const {
    audioEnabled,
    padPlaying,
    bpm,
    volume,
    lowCut,
    highCut,
    setAudioEnabled,
    setPadPlaying,
    setBpm,
    setVolume,
    setLowCut,
    setHighCut,
  } = useAudioStore()

  const initializeAudio = useCallback(async () => {
    setIsInitializing(true)
    setAudioError(null)
    try {
      await audioEngine.initialize()
      audioEngine.setBpm(bpm)
      audioEngine.setVolume(volume)
      audioEngine.setFilter(lowCut, highCut)
      setAudioEnabled(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao iniciar audio no navegador.'
      setAudioEnabled(false)
      setAudioError(message)
    } finally {
      setIsInitializing(false)
    }
  }, [bpm, highCut, lowCut, setAudioEnabled, volume])

  const togglePad = useCallback(() => {
    const nextState = !padPlaying
    audioEngine.togglePad(nextState)
    setPadPlaying(audioEngine.isPadPlaying())
  }, [padPlaying, setPadPlaying])

  const updateBpm = useCallback(
    (nextValue: number) => {
      setBpm(nextValue)
      audioEngine.setBpm(nextValue)
    },
    [setBpm],
  )

  const updateVolume = useCallback(
    (nextValue: number) => {
      setVolume(nextValue)
      audioEngine.setVolume(nextValue)
    },
    [setVolume],
  )

  const updateLowCut = useCallback(
    (nextValue: number) => {
      setLowCut(nextValue)
      audioEngine.setFilter(nextValue, highCut)
    },
    [highCut, setLowCut],
  )

  const updateHighCut = useCallback(
    (nextValue: number) => {
      setHighCut(nextValue)
      audioEngine.setFilter(lowCut, nextValue)
    },
    [lowCut, setHighCut],
  )

  return {
    audioEnabled,
    padPlaying,
    bpm,
    volume,
    lowCut,
    highCut,
    isInitializing,
    audioError,
    initializeAudio,
    togglePad,
    updateBpm,
    updateVolume,
    updateLowCut,
    updateHighCut,
  }
}
