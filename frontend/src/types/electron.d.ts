declare global {
  interface Window {
    electronAPI?: {
      getPlatform: () => Promise<string>
      minimize: () => void
      maximize: () => void
      close: () => void
      isElectron: boolean
    }
  }
}

export const isElectron = (): boolean =>
  typeof window !== 'undefined' && window.electronAPI?.isElectron === true

export {}