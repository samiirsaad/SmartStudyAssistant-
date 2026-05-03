import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    console.log('🔄 AuthContext useEffect - Checking localStorage for saved user');
    const savedUser = localStorage.getItem('user');
    console.log('💾 Saved user from localStorage:', savedUser);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ User loaded from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    console.log('✅ Setting loading to false');
    setLoading(false);
  }, []);

  const register = async (name, phone, email, password) => {
    try {
      console.log('📝 Attempting registration with:', email);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });

      const data = await response.json();
      console.log('📨 Response from server:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('✅ Account registered successfully');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', email);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('📨 Response from server:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save user to localStorage and state
      console.log('💾 Saving user to localStorage:', data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      console.log('✅ User logged in successfully:', data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
