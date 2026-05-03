import React from 'react';
import styles from '../styles/ProgressBar.module.css';

export default function ProgressBar({ current = 0, total = 100, showPercentage = false }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={styles.progressbarContainer}>
      <div className={styles.progressbarTrack}>
        <div
          className={styles.progressbarFill}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      {showPercentage && (
        <span className={styles.progressbarLabel}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
