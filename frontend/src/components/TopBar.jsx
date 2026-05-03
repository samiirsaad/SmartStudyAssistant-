import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggler from './ThemeToggler';
import styles from '../styles/TopBar.module.css';

export default function TopBar({ title = 'Smart Study Assistant', showBackButton = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isHome = location.pathname === '/';

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.topBar}>
      <div className={styles.topBarContent}>
        <div className={styles.topBarStart}>
          {showBackButton && !isHome && (
            <button
              onClick={handleBack}
              className={styles.backBtn}
              aria-label="العودة للصفحة السابقة"
              title="Back"
            >
              <ChevronRight size={24} />
            </button>
          )}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{title}</h1>
          </div>
        </div>

        <div className={styles.topBarEnd}>
          {user && (
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <User size={18} className={styles.userIcon} />
                <span className={styles.userName}>{user.name || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className={styles.logoutBtn}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
          <ThemeToggler />
        </div>
      </div>
    </nav>
  );
}
