# Ambient Performance Tool

Ferramenta de performance em tempo real com foco em arquitetura offline-first, pronta para evoluir de Web para PWA e empacotamento mobile com Capacitor.

## Stack

- React 18 + Vite + TypeScript
- Tone.js (isolado na camada de audio)
- Zustand para state manager com persistencia local

## Estrutura principal

```txt
src/
  audio/
    core/
    pads/
    effects/
    loops/
  store/
  hooks/
  components/
```

## Regras arquiteturais aplicadas

- React nao importa `tone` diretamente.
- Singleton de engine em `src/audio/core/ToneAudioEngine.ts`.
- Contrato de engine em `src/audio/core/IAudioEngine.ts`.
- Logica de audio desacoplada da UI.
- Estado persistido localmente para uso offline.

## Desenvolvimento

```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
```

## Documentacao de arquitetura

- `docs/architecture.md`
