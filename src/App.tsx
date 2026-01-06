import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Opening from './components/Opening';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import NewHome from './pages/NewHome';
import AIChat from './pages/AIChat';
import ProfilePage from './pages/ProfilePage';
import DiagnosisPage from './pages/DiagnosisPage';
import DiagnosisResultPage from './pages/DiagnosisResultPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // 診断未完了の場合は診断画面へ
  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/diagnosis" />;
  }

  return <Layout>{children}</Layout>;
}

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function DiagnosisRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // 既に診断完了している場合はホームへ（再診断の場合は除く）
  // ※ profileページから「やり直す」を押した場合は許可
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (user) {
    // 診断完了済みならホームへ、未完了なら診断へ
    if (profile?.onboarding_completed) {
      return <Navigate to="/" />;
    } else {
      return <Navigate to="/diagnosis" />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* 認証画面 */}
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

      {/* 診断画面 */}
      <Route
        path="/diagnosis"
        element={
          <DiagnosisRoute>
            <DiagnosisPage />
          </DiagnosisRoute>
        }
      />
      <Route
        path="/diagnosis/result"
        element={
          <AuthenticatedRoute>
            <DiagnosisResultPage />
          </AuthenticatedRoute>
        }
      />

      {/* メイン画面（タブナビゲーション） */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <NewHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <AIChat />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  const [showOpening] = useState(() => {
    return !sessionStorage.getItem('hasSeenOpening');
  });

  const handleOpeningComplete = () => {
    sessionStorage.setItem('hasSeenOpening', 'true');
    window.location.reload();
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
