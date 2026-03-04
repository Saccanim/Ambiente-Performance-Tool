export const INSTRUMENT_OPTIONS = [
  'pad',
  'orgao',
  'violino',
  'vozes',
  'cosinus',
  'harmonicRich',
  'softBell',
  'deepBass',
  'hollow',
  'buzz',
  'softString',
  'robotic',
  'waterDrop',
  'wind',
  'weird',
] as const
export type InstrumentType = (typeof INSTRUMENT_OPTIONS)[number]

export const EFFECT_OPTIONS = ['reverb', 'delay', 'distortion', 'envelopeFilter', 'chorus'] as const
export type EffectType = (typeof EFFECT_OPTIONS)[number]
export type EffectIntensityMap = Record<EffectType, number>

export const TONALITY_OPTIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export type Tonality = (typeof TONALITY_OPTIONS)[number]

export const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  pad: 'Pad',
  orgao: 'Orgao',
  violino: 'Violino',
  vozes: 'Vozes',
  cosinus: 'Cosinus',
  harmonicRich: 'Harmonic Rich',
  softBell: 'Soft Bell',
  deepBass: 'Deep Bass',
  hollow: 'Hollow',
  buzz: 'Buzz',
  softString: 'Soft String',
  robotic: 'Robotic',
  waterDrop: 'Water Drop',
  wind: 'Wind',
  weird: 'Weird',
}

export const EFFECT_LABELS: Record<EffectType, string> = {
  reverb: 'Reverb',
  delay: 'Delay',
  distortion: 'Distorcao',
  envelopeFilter: 'Envelope Filter',
  chorus: 'Chorus',
}

export const DEFAULT_EFFECT_INTENSITY: EffectIntensityMap = {
  reverb: 0.28,
  delay: 0.18,
  distortion: 0.08,
  envelopeFilter: 0.22,
  chorus: 0.18,
}
