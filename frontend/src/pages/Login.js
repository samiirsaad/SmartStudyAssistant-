import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import styles from '../styles/Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!signInEmail || !signInPassword) {
      toast.error('Please enter email and password');
      return;
    }

    if (!validateEmail(signInEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await login(signInEmail, signInPassword);

      if (result.success) {
        toast.success('✅ Login successful!');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        toast.error(`❌ ${result.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    if (!validateEmail(signUpEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (signUpPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register(fullName, phone, signUpEmail, signUpPassword);

      if (result.success) {
        toast.success('✅ Account created successfully!');
        // auto-login after registration
        const loginResult = await login(signUpEmail, signUpPassword);
        if (loginResult.success) {
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        }
      } else {
        toast.error(`❌ ${result.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        {/* Left side - Welcome section */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <div className={styles.logo}>
              <span className={styles.logoEmoji}>📚</span>
            </div>
            <h1 className={styles.brandTitle}>Smart Study Assistant</h1>
            <p className={styles.brandSubtitle}>Your AI-powered learning companion</p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✨</span>
                <span>AI-Generated Quizzes</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>💬</span>
                <span>Smart Chatbot</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <span>Progress Tracking</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🎯</span>
                <span>Personalized Learning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form section */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className={styles.formSubtitle}>
                {isSignUp
                  ? 'Join thousands of students learning smarter'
                  : 'Sign in to continue your learning journey'}
              </p>
            </div>

            {/* Sign In Form */}
            {!isSignUp && (
              <form onSubmit={handleSignIn} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="signin-email" className={styles.label}>
                    <Mail size={18} />
                    Email Address
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="signin-password" className={styles.label}>
                    <Lock size={18} />
                    Password
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {isSignUp && (
              <form onSubmit={handleSignUp} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullname" className={styles.label}>
                    <User size={18} />
                    Full Name
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    <Phone size={18} />
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="signup-email" className={styles.label}>
                    <Mail size={18} />
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="signup-password" className={styles.label}>
                    <Lock size={18} />
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirm-password" className={styles.label}>
                    <Lock size={18} />
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Toggle Sign In / Sign Up */}
            <div className={styles.toggleAuth}>
              <p>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    // Clear form fields
                    setSignInEmail('');
                    setSignInPassword('');
                    setFullName('');
                    setPhone('');
                    setSignUpEmail('');
                    setSignUpPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={loading}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Demo credentials - Only for Sign In */}
            {!isSignUp && (
              <div className={styles.demoInfo}>
                <p className={styles.demoTitle}>Demo Credentials:</p>
                <p>📧 Email: demo@example.com</p>
                <p>🔑 Password: demo123</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
