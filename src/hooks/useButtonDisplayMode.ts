import { useState, useEffect, useCallback } from 'react';

export type ButtonDisplayMode = 'smart' | 'icon-only' | 'icon-text';

const DEFAULT_MODE: ButtonDisplayMode = 'smart';

export function getButtonDisplayMode(): ButtonDisplayMode {
  try {
    const raw = localStorage.getItem('cbtSettings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.buttonDisplayMode === 'smart' || parsed.buttonDisplayMode === 'icon-only' || parsed.buttonDisplayMode === 'icon-text') {
        return parsed.buttonDisplayMode;
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_MODE;
}

export function setButtonDisplayModeInStorage(mode: ButtonDisplayMode): void {
  try {
    const raw = localStorage.getItem('cbtSettings');
    const parsed = raw ? JSON.parse(raw) : {};
    parsed.buttonDisplayMode = mode;
    localStorage.setItem('cbtSettings', JSON.stringify(parsed));
    window.dispatchEvent(new CustomEvent('cbt_settings_changed', { detail: { buttonDisplayMode: mode } }));
  } catch {
    // ignore storage errors
  }
}

export function useButtonDisplayMode() {
  const [mode, setModeState] = useState<ButtonDisplayMode>(() => getButtonDisplayMode());

  useEffect(() => {
    const handleSettingsChange = () => {
      setModeState(getButtonDisplayMode());
    };
    window.addEventListener('cbt_settings_changed', handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);
    return () => {
      window.removeEventListener('cbt_settings_changed', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);

  const setMode = useCallback((nextMode: ButtonDisplayMode) => {
    setButtonDisplayModeInStorage(nextMode);
    setModeState(nextMode);
  }, []);

  /**
   * Helper for segmented/grouped toolbar buttons:
   * - 'smart' (default): show icon-only when inactive; when active (`isActive === true`), show slightly larger button with both icon and text label.
   * - 'icon-only': show only the icon in all states.
   * - 'icon-text': show both icon and text in all states.
   */
  const shouldShowLabel = useCallback(
    (isActive: boolean, isGrouped: boolean = true): boolean => {
      if (mode === 'icon-text') return true;
      if (mode === 'icon-only') return false;
      // 'smart' mode: show text only if grouped & active
      return isGrouped && isActive;
    },
    [mode]
  );

  return {
    mode,
    setMode,
    buttonDisplayMode: mode,
    setButtonDisplayMode: setMode,
    shouldShowLabel,
  };
}
