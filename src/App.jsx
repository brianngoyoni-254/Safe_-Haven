import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { signOut as firebaseSignOut } from "firebase/auth";

import { refreshToken, getMe, setAuthToken } from "./api/client";
import { auth } from "./firebase";
import Layout from "./shared/components/Layout";
import AuthPages from "./features/auth/AuthPages";
import LandingPage from "./landing/LandingPage";
import Onboarding from "./features/onboarding/OnboardingPage";
import Dashboard from "./features/dashboard/DashboardPage";
import CheckIn from "./features/check-in/CheckInPage";
import Milestones from "./features/milestones/MilestonesPage";
import Groups from "./features/groups/GroupsPage";
import Journal from "./features/journal/JournalPage";
import Resources from "./features/resources/ResourcesPage";
import Crisis from "./features/crisis/CrisisPage";
import Profile from "./features/profile/ProfilePage";
import Donations from "./features/donations/DonationsPage";
import DonationReceipt from "./features/donations/ReceiptPage";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    expiresAt: null,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { access_token, expires_in } = await refreshToken();
        setAuthToken(access_token);
        const user = await getMe();
        if (!cancelled) {
          setAuthState({
            user,
            token: access_token,
            expiresAt: Date.now() + expires_in * 1000,
          });
        }
      } catch {
        // Not authenticated
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!authState.expiresAt) return;
    const delay = authState.expiresAt - Date.now() - 5 * 60 * 1000;
    if (delay <= 0) return;

    const id = setTimeout(async () => {
      try {
        const { access_token, expires_in } = await refreshToken();
        setAuthToken(access_token);
        setAuthState((prev) => ({
          ...prev,
          token: access_token,
          expiresAt: Date.now() + expires_in * 1000,
        }));
      } catch {
        setAuthToken(null);
        setAuthState({ user: null, token: null, expiresAt: null });
      }
    }, delay);

    return () => clearTimeout(id);
  }, [authState.expiresAt]);

  const login = useCallback(({ user, access_token, expires_in }) => {
    setAuthToken(access_token);
    setAuthState({
      user,
      token: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
  }, []);

  const logout = useCallback(async () => {
    // Clear our own backend session (invalidates the httpOnly refresh_token cookie)
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Best-effort
    }

    // Clear Firebase's own persisted session (relevant for Google sign-in users;
    // Firebase keeps its session in IndexedDB independent of our JWT cookie)
    try {
      await firebaseSignOut(auth);
    } catch {
      // Best-effort
    }

    setAuthToken(null);
    setAuthState({ user: null, token: null, expiresAt: null });
  }, []);

  const updateUser = useCallback((patch) => {
    setAuthState((prev) => ({ ...prev, user: { ...prev.user, ...patch } }));
  }, []);

  const value = {
    user: authState.user,
    token: authState.token,
    isLoggedIn: Boolean(authState.user),
    isReady,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const serif = { fontFamily: "'Fraunces', serif" };

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F4EC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={40} className="text-[#0D6E64] animate-spin" />
        <p className="text-sm text-[#4A544C]" style={serif}>Loading Safe Haven…</p>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { isLoggedIn, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) return <LoadingScreen />;
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}

function GuestRoute() {
  const { isLoggedIn, isReady } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/onboarding";

  if (!isReady) return null;
  return isLoggedIn ? <Navigate to={from} replace /> : <Outlet />;
}

function GroupsGate() {
  const { isLoggedIn, isReady } = useAuth();
  if (!isReady) return <LoadingScreen />;
  return isLoggedIn ? (
    <Layout>
      <Groups />
    </Layout>
  ) : (
    <Groups publicView />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/groups/*" element={<GroupsGate />} />
      <Route path="/crisis" element={<Crisis />} />
      <Route path="/donations/receipt/:checkoutRequestId" element={<DonationReceipt />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<AuthPages view="login" />} />
        <Route path="/register" element={<AuthPages view="register" />} />
        <Route path="/forgot-password" element={<AuthPages view="forgot" />} />
        <Route path="/reset-password" element={<AuthPages view="reset" />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}