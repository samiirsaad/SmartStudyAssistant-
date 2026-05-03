import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import styles from '../styles/ThemeToggler.module.css';

export default function ThemeToggler() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggler}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      {isDark ? (
        <Sun size={20} className={styles.icon} />
      ) : (
        <Moon size={20} className={styles.icon} />
      )}
    </button>
  );
}
