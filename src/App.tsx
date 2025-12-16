import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Opening from './components/Opening';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Survey from './pages/Survey';
import Learning from './pages/Learning';
import Announcements from './pages/Announcements';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  return user ? <Navigate to="/" /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/survey"
        element={
          <PrivateRoute>
            <Survey />
          </PrivateRoute>
        }
      />
      <Route
        path="/learning"
        element={
          <PrivateRoute>
            <Learning />
          </PrivateRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <PrivateRoute>
            <Announcements />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    const hasSeenOpening = sessionStorage.getItem('hasSeenOpening');
    if (hasSeenOpening) {
      setShowOpening(false);
    }
  }, []);

  const handleOpeningComplete = () => {
    sessionStorage.setItem('hasSeenOpening', 'true');
    setShowOpening(false);
  };

  if (showOpening) {
    return <Opening onComplete={handleOpeningComplete} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
