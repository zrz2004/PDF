import { invoke } from '@tauri-apps/api/core'

export async function safeInvoke<T>(command: string, args?: Record<string, unknown>, fallback?: T): Promise<T> {
  try {
    return await invoke<T>(command, args)
  } catch (error) {
    if (fallback !== undefined) return fallback
    throw error
  }
}
