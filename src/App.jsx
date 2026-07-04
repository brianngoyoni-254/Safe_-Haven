import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { Loader2 } from "lucide-react";

// Pages 
import LandingPage  from "./pages/LandingPage";
import AuthPages    from "./pages/AuthPages";
import Onboarding   from "./pages/Onboarding";
import Dashboard    from "./pages/Dashboard";
import CheckIn      from "./pages/CheckIn";
import Milestones   from "./pages/Milestones";
import Groups       from "./pages/Groups";
import Journal      from "./pages/Journals";
import Resources    from "./pages/Resources";
import Crisis       from "./pages/Crisis";
import Profile      from "./pages/Profile";

//Layout 
import Layout from "./components/Layout";

// API 
import { getMe, refreshToken } from "./api";


// AUTH CONTEXT


const AuthContext = createContext(null);


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}


function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user:      null,  // { id, username, email, sobriety_start,}
    token:     null,  // JWT access token (in memory)
    expiresAt: null,  // ms timestamp
  });
  const [isReady, setIsReady] = useState(false);

  // Silent refresh on mount 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { access_token, expires_in } = await refreshToken();
        const user = await getMe(access_token);
        if (!cancelled) {
          setAuthState({
            user,
            token: access_token,
            expiresAt: Date.now() + expires_in * 1000,
          });
        }
      } catch {
        // Not authenticated — that's fine; leave authState as null.
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Proactive token refresh (5 min before expiry) 
  useEffect(() => {
    if (!authState.expiresAt) return;
    const delay = authState.expiresAt - Date.now() - 5 * 60 * 1000;
    if (delay <= 0) return;

    const id = setTimeout(async () => {
      try {
        const { access_token, expires_in } = await refreshToken();
        setAuthState((prev) => ({
          ...prev,
          token:     access_token,
          expiresAt: Date.now() + expires_in * 1000,
        }));
      } catch {
        setAuthState({ user: null, token: null, expiresAt: null });
      }
    }, delay);

    return () => clearTimeout(id);
  }, [authState.expiresAt]);

  // Public API 

  // login – called by AuthPages after a successful /api/auth/firebase response.
  const login = useCallback(({ user, access_token, expires_in }) => {
    setAuthState({
      user,
      token:     access_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
  }, []);

  //logout – clears memory and hits the server to invalidate the refresh token. 
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Best-effort.
    } finally {
      setAuthState({ user: null, token: null, expiresAt: null });
    }
  }, []);

  
  const updateUser = useCallback((patch) => {
    setAuthState((prev) => ({ ...prev, user: { ...prev.user, ...patch } }));
  }, []);

  const value = {
    user:      authState.user,
    token:     authState.token,
    isLoggedIn: Boolean(authState.user),
    isReady,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


// ROUTE GUARDS

function ProtectedRoute() {
  const { isLoggedIn, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-teal-600 animate-spin" />
          <p className="text-sm text-gray-400">Loading Safe Haven…</p>
        </div>
      </div>
    );
  }

  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}


function GuestRoute() {
  const { isLoggedIn, isReady } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/onboarding";

  if (!isReady) return null;

  return isLoggedIn ? <Navigate to={from} replace /> : <Outlet />;
}

// Groups is the one page that needs to work both logged-out (public browsing)
// and logged-in (inside the app shell). Routing it as two separate <Route>
// entries — one at "/groups" and one nested at "/groups/*" under <Layout /> —
// caused React Router to always match the plain "/groups" path first, since
// an exact static path outranks a wildcard one regardless of nesting. That's
// why Groups was rendering full-page for logged-in users instead of inside
// the sidebar shell like every other page.
// Fix: a single route that picks the right view itself, so there's no path
// collision for React Router to resolve.
function GroupsGate() {
  const { isLoggedIn, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-teal-600 animate-spin" />
          <p className="text-sm text-gray-400">Loading Safe Haven…</p>
        </div>
      </div>
    );
  }

  return isLoggedIn ? (
    <Layout>
      <Groups />
    </Layout>
  ) : (
    <Groups publicView />
  );
}


// ROUTER


function AppRoutes() {
  return (
    <Routes>
    
      <Route path="/" element={<LandingPage />} />

      {/* Support groups: browsable without login, full shell when logged in.
          GroupsGate decides which to render, avoiding the path collision
          that used to exist between this and the nested /groups/* route. */}
      <Route path="/groups/*" element={<GroupsGate />} />

      {/* Crisis support always accessible — no login required */}
      <Route path="/crisis" element={<Crisis />} />

      {/* Auth (redirect away if already logged in) */}
      <Route element={<GuestRoute />}>
        <Route path="/login"           element={<AuthPages view="login"    />} />
        <Route path="/register"        element={<AuthPages view="register" />} />
        <Route path="/forgot-password" element={<AuthPages view="forgot"   />} />
        <Route path="/reset-password"  element={<AuthPages view="reset"    />} />
      </Route>

      {/*Protected (require auth)*/}
      <Route element={<ProtectedRoute />}>

        {/* Onboarding — full-screen, no Layout chrome */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* All other protected pages use the shared Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard"  element={<Dashboard  />} />
          <Route path="/check-in"   element={<CheckIn    />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/journal"    element={<Journal    />} />
          <Route path="/resources"  element={<Resources  />} />
          <Route path="/profile"    element={<Profile    />} />
        </Route>

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


// ROOT


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}