import { create } from 'zustand'

export type HistoryItem = {
  id: string
  toolTitle: string
  inputCount: number
  outputDirectory: string
  outputFiles: string[]
  status: 'succeeded' | 'failed' | 'cancelled'
  finishedAt: string
  error?: string
}

type HistoryStore = {
  items: HistoryItem[]
  add: (item: HistoryItem) => void
  clear: () => void
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  items: [],
  add: (item) => set({ items: [item, ...get().items].slice(0, 100) }),
  clear: () => set({ items: [] }),
}))
