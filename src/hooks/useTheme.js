'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { saveThemePreference } from '@/services/storageService';

/**
 * Tema claro/escuro. O valor real fica no atributo data-theme do <html>
 * (definido antes da primeira pintura pelo script do layout).
 */
const listeners = new Set();

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function getServerSnapshot() {
  return 'light';
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next = getSnapshot() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    saveThemePreference(next);
    listeners.forEach((l) => l());
  }, []);

  return { theme, toggleTheme };
}
