import { useEffect, useState } from 'react';

const THEME_KEY = 'salary-tracker-theme';

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // Vẫn cho phép đổi giao diện khi trình duyệt chặn localStorage.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Lựa chọn vẫn có hiệu lực trong phiên đang mở.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return {
    isDark: theme === 'dark',
    toggleTheme,
  };
}