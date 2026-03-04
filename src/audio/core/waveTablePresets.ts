import type { InstrumentType } from '@/audio/core/audioConfig'

export type WaveName =
  | 'cosinus'
  | 'harmonicRich'
  | 'softBell'
  | 'deepBass'
  | 'hollow'
  | 'buzz'
  | 'softString'
  | 'robotic'
  | 'waterDrop'
  | 'wind'
  | 'weird'

const CUSTOM_WAVE_REAL_VALUES: Record<WaveName, readonly number[]> = {
  cosinus: [0, 1, 0.5, 0.25],
  harmonicRich: [0, 1, 0.8, 0.6, 0.4, 0.2],
  softBell: [0, 1, 0.3, 0.1],
  deepBass: [0, 1, 0.3, 0.1, 0.05, 0.02],
  hollow: [0, 0, 1, 0, 0.5, 0],
  buzz: [0, 1, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
  softString: [0, 1, 0.2, 0.1, 0.05, 0.01],
  robotic: [0, 1, 0, 1, 0, 1, 0, 1],
  waterDrop: [0, 1, 0.4, 0.1, 0.05, 0.02, 0.01],
  wind: [0, 0.3, 0.5, 0.7, 0.9, 1],
  weird: [0, 0.2, 0.8, 0.4, 0.1, 0.05],
}

function buildPartialsFromWaves(names: readonly WaveName[]): number[] {
  const maxLength = names.reduce((max, waveName) => {
    return Math.max(max, CUSTOM_WAVE_REAL_VALUES[waveName].length)
  }, 2)

  const partials = Array.from({ length: maxLength - 1 }, () => 0)
  for (const waveName of names) {
    const values = CUSTOM_WAVE_REAL_VALUES[waveName]
    for (let harmonic = 1; harmonic < maxLength; harmonic += 1) {
      partials[harmonic - 1] += (values[harmonic] ?? 0) / names.length
    }
  }

  const peak = partials.reduce((max, value) => Math.max(max, Math.abs(value)), 0.0001)
  const normalized = partials.map((value) => value / peak)
  normalized[0] = Math.max(normalized[0], 0.12)
  return normalized
}

export const WAVE_TABLE_PARTIALS: Record<WaveName, number[]> = {
  cosinus: buildPartialsFromWaves(['cosinus']),
  harmonicRich: buildPartialsFromWaves(['harmonicRich']),
  softBell: buildPartialsFromWaves(['softBell']),
  deepBass: buildPartialsFromWaves(['deepBass']),
  hollow: buildPartialsFromWaves(['hollow']),
  buzz: buildPartialsFromWaves(['buzz']),
  softString: buildPartialsFromWaves(['softString']),
  robotic: buildPartialsFromWaves(['robotic']),
  waterDrop: buildPartialsFromWaves(['waterDrop']),
  wind: buildPartialsFromWaves(['wind']),
  weird: buildPartialsFromWaves(['weird']),
}

export const INSTRUMENT_WAVE_PARTIALS: Record<InstrumentType, number[]> = {
  pad: buildPartialsFromWaves(['softString', 'wind']),
  orgao: buildPartialsFromWaves(['harmonicRich', 'cosinus']),
  violino: buildPartialsFromWaves(['softString', 'buzz', 'weird']),
  vozes: buildPartialsFromWaves(['hollow', 'softBell', 'wind']),
  cosinus: WAVE_TABLE_PARTIALS.cosinus,
  harmonicRich: WAVE_TABLE_PARTIALS.harmonicRich,
  softBell: WAVE_TABLE_PARTIALS.softBell,
  deepBass: WAVE_TABLE_PARTIALS.deepBass,
  hollow: WAVE_TABLE_PARTIALS.hollow,
  buzz: WAVE_TABLE_PARTIALS.buzz,
  softString: WAVE_TABLE_PARTIALS.softString,
  robotic: WAVE_TABLE_PARTIALS.robotic,
  waterDrop: WAVE_TABLE_PARTIALS.waterDrop,
  wind: WAVE_TABLE_PARTIALS.wind,
  weird: WAVE_TABLE_PARTIALS.weird,
}
