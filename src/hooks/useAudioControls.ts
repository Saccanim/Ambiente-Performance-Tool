import { useCallback, useState } from 'react'
import { EFFECT_OPTIONS, type EffectType, type InstrumentType, type Tonality } from '@/audio/core/audioConfig'
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
    instrument,
    effects,
    effectIntensity,
    tonality,
    setAudioEnabled,
    setPadPlaying,
    setBpm,
    setVolume,
    setLowCut,
    setHighCut,
    setInstrument,
    setEffects,
    setEffectIntensity,
    setTonality,
  } = useAudioStore()

  const initializeAudio = useCallback(async () => {
    setIsInitializing(true)
    setAudioError(null)
    try {
      await audioEngine.initialize()
      audioEngine.setBpm(bpm)
      audioEngine.setVolume(volume)
      audioEngine.setFilter(lowCut, highCut)
      audioEngine.setInstrument(instrument)
      audioEngine.setEffects(effects)
      for (const effect of EFFECT_OPTIONS) {
        audioEngine.setEffectIntensity(effect, effectIntensity[effect])
      }
      audioEngine.setTonality(tonality)
      setAudioEnabled(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao iniciar audio no navegador.'
      setAudioEnabled(false)
      setAudioError(message)
    } finally {
      setIsInitializing(false)
    }
  }, [bpm, effectIntensity, effects, highCut, instrument, lowCut, setAudioEnabled, tonality, volume])

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

  const updateInstrument = useCallback(
    (nextValue: InstrumentType) => {
      setInstrument(nextValue)
      audioEngine.setInstrument(nextValue)
    },
    [setInstrument],
  )

  const toggleEffect = useCallback(
    (effect: EffectType, enabled: boolean) => {
      const active = new Set(effects)
      if (enabled) {
        active.add(effect)
      } else {
        active.delete(effect)
      }

      const nextEffects = EFFECT_OPTIONS.filter((item) => active.has(item))
      setEffects(nextEffects)
      audioEngine.setEffects(nextEffects)
    },
    [effects, setEffects],
  )

  const updateEffectIntensity = useCallback(
    (effect: EffectType, nextValue: number) => {
      setEffectIntensity(effect, nextValue)
      audioEngine.setEffectIntensity(effect, nextValue)
    },
    [setEffectIntensity],
  )

  const updateTonality = useCallback(
    (nextValue: Tonality) => {
      setTonality(nextValue)
      audioEngine.setTonality(nextValue)
    },
    [setTonality],
  )

  return {
    audioEnabled,
    padPlaying,
    bpm,
    volume,
    lowCut,
    highCut,
    instrument,
    effects,
    effectIntensity,
    tonality,
    isInitializing,
    audioError,
    initializeAudio,
    togglePad,
    updateBpm,
    updateVolume,
    updateLowCut,
    updateHighCut,
    updateInstrument,
    toggleEffect,
    updateEffectIntensity,
    updateTonality,
  }
}
