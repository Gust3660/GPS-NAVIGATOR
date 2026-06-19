import { useEffect } from 'react';

export function useThemeMode(theme) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
}
