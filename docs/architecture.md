# Arquitetura - Ambient Performance Tool

## Objetivo

Arquitetura offline-first para audio em tempo real, com entrega web imediata e caminho direto para PWA e app mobile empacotado via Capacitor.

## Stack e justificativa

- **React 18 + Vite + TypeScript**: base estavel para UI e build rapido.
- **Tone.js**: abstrai Web Audio para clock musical e DSP modular, sem acoplamento na camada React.
- **Zustand + persist**: estado enxuto com persistencia local para uso offline.

## Estrutura de pastas

```txt
src/
  audio/
    core/
      IAudioEngine.ts
      ToneAudioEngine.ts
      Transport.ts
    pads/
      PadEngine.ts
    effects/
      FilterChain.ts
    loops/
      LoopEngine.ts
  store/
    audioStore.ts
  hooks/
    useAudioControls.ts
  components/
    AudioControlPanel.tsx
    ControlSlider.tsx
  App.tsx
  main.tsx
  index.css
```

## Separacao obrigatoria aplicada

- **Audio Engine (core)**: contrato (`IAudioEngine`) e implementacao (`ToneAudioEngine`).
- **Feature Engines**: `PadEngine`, `LoopEngine`, `FilterChain`.
- **State Manager**: `store/audioStore.ts`.
- **UI React**: `components/*`, `App.tsx`.
- **Regra critica**: nenhum arquivo React importa `tone`.

## Fluxo de inicializacao e latencia

1. Botao **Enable Audio** chama `audioEngine.initialize()`.
2. `Tone.start()` ocorre apenas apos interacao do usuario.
3. Engine configura:
   - `latencyHint = "interactive"`
   - `lookAhead = 0.03`
4. `Transport` e engines de feature sao ativados.

## Controle de BPM e parametros

- BPM centralizado em `TransportController`.
- `PadEngine` recebe:
  - transposicao global em semitons
  - low cut / high cut
  - volume
- Mudancas usam automacao (`rampTo`) para evitar clicks.

## Offline-first e PWA readiness

- Parametros persistidos localmente com Zustand `persist`.
- Sem dependencia de backend para operar.
- Audio core independente de framework UI, pronto para reuso em shell Capacitor.
