import {
  EFFECT_LABELS,
  EFFECT_OPTIONS,
  INSTRUMENT_LABELS,
  INSTRUMENT_OPTIONS,
  TONALITY_OPTIONS,
} from '@/audio/core/audioConfig'
import { ControlSlider } from '@/components/ControlSlider'
import { useAudioControls } from '@/hooks/useAudioControls'

export function AudioControlPanel() {
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
  } = useAudioControls()

  return (
    <section className="panel">
      <h1>Ambient Performance Tool</h1>
      <p className="subtitle">Controle em tempo real de pad ambiente</p>

      <div className="button-row">
        <button className="primary" onClick={() => void initializeAudio()} disabled={audioEnabled || isInitializing}>
          {audioEnabled ? 'Audio Enabled' : isInitializing ? 'Enabling...' : 'Enable Audio'}
        </button>
        <button className="secondary" onClick={togglePad} disabled={!audioEnabled}>
          {padPlaying ? 'Stop Pad' : 'Play Pad'}
        </button>
      </div>
      {audioError ? <p className="error-text">Erro de audio: {audioError}</p> : null}

      <div className="controls">
        <label className="control-row">
          <span className="control-label">Som</span>
          <select
            className="control-select"
            value={instrument}
            onChange={(event) => updateInstrument(event.target.value as (typeof INSTRUMENT_OPTIONS)[number])}
          >
            {INSTRUMENT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {INSTRUMENT_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="control-row">
          <span className="control-label">Tonalidade</span>
          <select
            className="control-select"
            value={tonality}
            onChange={(event) => updateTonality(event.target.value as (typeof TONALITY_OPTIONS)[number])}
          >
            {TONALITY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="effect-group">
          <legend className="control-label">Efeitos</legend>
          <div className="effect-grid">
            {EFFECT_OPTIONS.map((effect) => (
              <div key={effect} className="effect-item">
                <label className="effect-option">
                  <input
                    type="checkbox"
                    checked={effects.includes(effect)}
                    onChange={(event) => toggleEffect(effect, event.target.checked)}
                  />
                  <span>{EFFECT_LABELS[effect]}</span>
                </label>
                <div className="effect-intensity">
                  <input
                    className="effect-slider"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(effectIntensity[effect] * 100)}
                    onChange={(event) => updateEffectIntensity(effect, Number(event.target.value) / 100)}
                    disabled={!effects.includes(effect)}
                  />
                  <span className="effect-value">{Math.round(effectIntensity[effect] * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <ControlSlider label="BPM" min={40} max={300} step={1} value={bpm} onChange={updateBpm} />
        <ControlSlider label="Volume" min={0} max={1} step={0.01} value={volume} onChange={updateVolume} />
        <ControlSlider
          label="Low Cut"
          min={20}
          max={4000}
          step={1}
          value={lowCut}
          onChange={updateLowCut}
          unit=" Hz"
        />
        <ControlSlider
          label="High Cut"
          min={1000}
          max={20000}
          step={1}
          value={highCut}
          onChange={updateHighCut}
          unit=" Hz"
        />
      </div>
    </section>
  )
}
