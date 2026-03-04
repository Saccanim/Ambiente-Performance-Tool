import * as Tone from 'tone'
import { EFFECT_OPTIONS, type EffectIntensityMap, type EffectType } from '@/audio/core/audioConfig'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export interface EffectRack {
  reverb: Tone.JCReverb
  delay: Tone.FeedbackDelay
  distortion: Tone.Distortion
  envelopeFilter: Tone.AutoWah
  chorus: Tone.Chorus
}

export function createEffectRack(): EffectRack {
  return {
    reverb: new Tone.JCReverb(0.35),
    delay: new Tone.FeedbackDelay(0.2, 0.3),
    distortion: new Tone.Distortion(0.2),
    envelopeFilter: new Tone.AutoWah(120, 4, -30),
    chorus: new Tone.Chorus(1.2, 4.5, 0.35).start(),
  }
}

export function getEnabledEffectNodes(rack: EffectRack, enabledEffects: Set<EffectType>): Tone.ToneAudioNode[] {
  const nodes: Tone.ToneAudioNode[] = []
  for (const effect of EFFECT_OPTIONS) {
    if (!enabledEffects.has(effect)) {
      continue
    }

    switch (effect) {
      case 'reverb':
        nodes.push(rack.reverb)
        break
      case 'delay':
        nodes.push(rack.delay)
        break
      case 'distortion':
        nodes.push(rack.distortion)
        break
      case 'envelopeFilter':
        nodes.push(rack.envelopeFilter)
        break
      case 'chorus':
        nodes.push(rack.chorus)
        break
    }
  }
  return nodes
}

export function syncDelayToBpm(rack: EffectRack, bpm: number): void {
  const secondsPerBeat = 60 / bpm
  const eighthNote = secondsPerBeat / 2
  rack.delay.delayTime.rampTo(eighthNote, 0.1)
}

export function applyEffectIntensity(
  rack: EffectRack,
  effect: EffectType,
  intensity: number,
  bpm: number,
): void {
  const safeIntensity = clamp(intensity, 0, 1)

  switch (effect) {
    case 'reverb':
      rack.reverb.roomSize.rampTo(0.2 + safeIntensity * 0.75, 0.1)
      rack.reverb.wet.rampTo(safeIntensity, 0.1)
      return
    case 'delay':
      rack.delay.feedback.rampTo(0.08 + safeIntensity * 0.75, 0.1)
      rack.delay.wet.rampTo(safeIntensity * 0.9, 0.1)
      syncDelayToBpm(rack, bpm)
      return
    case 'distortion':
      rack.distortion.distortion = safeIntensity
      rack.distortion.wet.rampTo(safeIntensity, 0.1)
      return
    case 'envelopeFilter':
      rack.envelopeFilter.baseFrequency = 90 + safeIntensity * 420
      rack.envelopeFilter.octaves = 1.8 + safeIntensity * 4.5
      rack.envelopeFilter.sensitivity = -60 + safeIntensity * 48
      rack.envelopeFilter.Q.rampTo(2 + safeIntensity * 10, 0.1)
      rack.envelopeFilter.gain.rampTo(2 + safeIntensity * 10, 0.1)
      rack.envelopeFilter.wet.rampTo(safeIntensity, 0.1)
      return
    case 'chorus':
      rack.chorus.frequency.rampTo(0.8 + safeIntensity * 5, 0.1)
      rack.chorus.depth = 0.2 + safeIntensity * 0.75
      rack.chorus.wet.rampTo(safeIntensity, 0.1)
  }
}

export function applyAllEffectIntensities(
  rack: EffectRack,
  intensityMap: EffectIntensityMap,
  bpm: number,
): void {
  for (const effect of EFFECT_OPTIONS) {
    applyEffectIntensity(rack, effect, intensityMap[effect], bpm)
  }
}

export function disposeEffectRack(rack: EffectRack): void {
  rack.reverb.dispose()
  rack.delay.dispose()
  rack.distortion.dispose()
  rack.envelopeFilter.dispose()
  rack.chorus.dispose()
}
