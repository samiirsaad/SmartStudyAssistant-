import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Study from './pages/Study';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import Subjects from './pages/Subjects';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1f2937'
      }}>
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ User authenticated - Rendering dashboard');
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/study" element={
              <ProtectedRoute>
                <Study />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/quiz" element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } />

            <Route path="/subjects" element={
              <ProtectedRoute>
                <Subjects />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;