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
    isInitializing,
    audioError,
    initializeAudio,
    togglePad,
    updateBpm,
    updateVolume,
    updateLowCut,
    updateHighCut,
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
        <ControlSlider label="BPM" min={40} max={180} step={1} value={bpm} onChange={updateBpm} />
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
