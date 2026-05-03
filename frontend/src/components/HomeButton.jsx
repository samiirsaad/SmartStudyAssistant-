import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import styles from '../styles/HomeButton.module.css';

export default function HomeButton() {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleHome}
      className={styles.homeBtn}
      aria-label="Go to home"
      title="Home"
    >
      <Home size={20} />
    </button>
  );
}
