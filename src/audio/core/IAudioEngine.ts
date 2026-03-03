export interface IAudioEngine {
  initialize(): Promise<void>
  togglePad(playing: boolean): void
  isPadPlaying(): boolean
  setBpm(value: number): void
  setVolume(value: number): void
  setFilter(lowCut: number, highCut: number): void
  dispose(): void
}
