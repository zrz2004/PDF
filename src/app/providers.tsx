import { useEffect, type PropsWithChildren } from 'react'
import { useSettingsStore, type AppSettings, type EngineStatus } from '@/features/settings/settingsStore'

function applyTheme(theme: AppSettings['theme']) {
  const root = document.documentElement
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
  root.setAttribute('data-theme', resolved)
}

export function AppProviders({ children }: PropsWithChildren) {
  const theme = useSettingsStore((state) => state.theme)
  const hydrateSettings = useSettingsStore((state) => state.hydrateSettings)
  const setEngineStatus = useSettingsStore((state) => state.setEngineStatus)

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      try {
        const settings = await window.electronAPI?.getSettings?.()
        if (!cancelled) hydrateSettings(settings ?? {})
      } catch {
        if (!cancelled) hydrateSettings({})
      }

      try {
        const detected = await window.electronAPI?.detectEngines?.()
        if (!cancelled && Array.isArray(detected)) setEngineStatus(detected as EngineStatus[])
      } catch {
        // Engine detection is best-effort; settings and built-in tools remain usable.
      }
    }
    hydrate().catch(() => undefined)
    return () => { cancelled = true }
  }, [hydrateSettings, setEngineStatus])

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return undefined
    const query = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!query) return undefined
    const listener = () => applyTheme('system')
    query.addEventListener?.('change', listener)
    return () => query.removeEventListener?.('change', listener)
  }, [theme])

  return <>{children}</>
}
