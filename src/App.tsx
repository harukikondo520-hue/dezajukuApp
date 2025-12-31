import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Opening from './components/Opening';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import NewHome from './pages/NewHome';
import AIChat from './pages/AIChat';
import VideoLectures from './pages/VideoLectures';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import DiagnosisPage from './pages/DiagnosisPage';
import DiagnosisResultPage from './pages/DiagnosisResultPage';
import ValueDiagnosisPage from './pages/ValueDiagnosisPage';
import OnboardingGoalPage from './pages/OnboardingGoalPage';
import SkillDiagnosisPage from './pages/SkillDiagnosisPage';
import SkillDiagnosisResultPage from './pages/SkillDiagnosisResultPage';
import SkillDiagnosisDetail from './pages/SkillDiagnosisDetail';
import SkillSelect from './pages/SkillSelect';
import IncomeManagement from './pages/IncomeManagement';
import ComprehensiveDiagnosis from './pages/ComprehensiveDiagnosis';
import Settings from './pages/Settings';

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

  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" />;
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

function OnboardingRoute({ children }: { children: React.ReactNode }) {
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

  if (profile?.onboarding_completed) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
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
        path="/onboarding"
        element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        }
      />
      <Route
        path="/onboarding/diagnosis"
        element={
          <OnboardingRoute>
            <DiagnosisPage />
          </OnboardingRoute>
        }
      />
      <Route
        path="/onboarding/result"
        element={
          <OnboardingRoute>
            <DiagnosisResultPage />
          </OnboardingRoute>
        }
      />
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
        path="/videos"
        element={
          <PrivateRoute>
            <VideoLectures />
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
        path="/income-management"
        element={
          <PrivateRoute>
            <IncomeManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/diagnosis"
        element={
          <AuthenticatedRoute>
            <DiagnosisPage />
          </AuthenticatedRoute>
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
      <Route
        path="/skill-diagnosis"
        element={
          <AuthenticatedRoute>
            <SkillDiagnosisPage />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/skill-diagnosis/result"
        element={
          <AuthenticatedRoute>
            <SkillDiagnosisResultPage />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/value-diagnosis"
        element={
          <AuthenticatedRoute>
            <ValueDiagnosisPage />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/onboarding/goal"
        element={
          <AuthenticatedRoute>
            <OnboardingGoalPage />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/comprehensive-diagnosis"
        element={
          <AuthenticatedRoute>
            <ComprehensiveDiagnosis />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/skill-diagnosis/:skillType"
        element={
          <AuthenticatedRoute>
            <SkillDiagnosisDetail />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/skill-select"
        element={
          <AuthenticatedRoute>
            <SkillSelect />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
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
