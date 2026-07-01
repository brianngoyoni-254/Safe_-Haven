import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useAuth } from "../App";
import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Loader2,
} from "lucide-react";

// ─── Google logo ──────────────────────────────────────────────────────────────
const GoogleLogo = () => (
  <svg width={18} height={18} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── Firebase error → friendly message ───────────────────────────────────────
function friendlyError(code) {
  const map = {
    "auth/user-not-found":         "No account found with that email.",
    "auth/wrong-password":         "Incorrect password.",
    "auth/email-already-in-use":   "That email is already registered.",
    "auth/invalid-email":          "Please enter a valid email address.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/too-many-requests":      "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user":   "Sign-in popup was closed.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential":     "Incorrect email or password.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

/**
 * Exchange a Firebase ID token for our app's JWT via Flask.
 * POST /api/auth/firebase  →  { user, access_token, expires_in }
 */
async function exchangeFirebaseToken(firebaseToken, username = null) {
  const res = await fetch("/api/auth/firebase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      token: firebaseToken,
      ...(username ? { username } : {}),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Authentication failed");
  return data;
}

// ─── Background (same hero image as LandingPage) ─────────────────────────────
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1762181702079-40f2f9ac56e4?fm=jpg&q=80&w=2400&auto=format&fit=crop";

// ─── Shared UI pieces ─────────────────────────────────────────────────────────
function Input({ icon: IconComp, type = "text", placeholder, value, onChange, rightElement }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-teal-200/70">
        <IconComp size={16} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/20 text-sm
          text-white placeholder-teal-200/50 bg-white/10 backdrop-blur-sm focus:outline-none
          focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
}

function SocialButton({ onClick, logo, label, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl
        border border-white/25 bg-white/90 text-sm font-medium text-gray-700
        hover:bg-white hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]
        transition-all duration-150 disabled:opacity-50 cursor-pointer"
    >
      {logo}
      {label}
    </button>
  );
}

function PrimaryButton({ onClick, children, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3 px-4 rounded-xl bg-teal-500 text-white text-sm font-semibold
        hover:bg-teal-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]
        transition-all duration-150 disabled:opacity-60
        flex items-center justify-center gap-2 cursor-pointer"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-white/20" />
      <span className="text-xs text-teal-200/70">or</span>
      <div className="flex-1 h-px bg-white/20" />
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="text-xs text-red-200 bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-2.5">
      {message}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
      {children}
    </div>
  );
}

function Logo({ subtitle }) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-12 h-12 rounded-full bg-teal-500/80 backdrop-blur-sm border border-teal-400/40 flex items-center justify-center mb-3 shadow-lg">
        <Shield size={20} className="text-white" />
      </div>
      <h1 className="text-xl font-bold text-white">Safe Haven</h1>
      <p className="text-sm text-teal-200/80 mt-0.5">{subtitle}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function LoginView({ onSwitch }) {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [gLoading,     setGLoading]     = useState(false);
  const [error,        setError]        = useState("");

  const handleGoogle = async () => {
    setError("");
    setGLoading(true);
    try {
      const result        = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();
      const data          = await exchangeFirebaseToken(firebaseToken);
      login(data);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(friendlyError(err.code ?? err.message));
    } finally {
      setGLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    try {
      const result        = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await result.user.getIdToken();
      const data          = await exchangeFirebaseToken(firebaseToken);
      login(data);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(friendlyError(err.code ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Logo subtitle="Sign in to your account" />

      <SocialButton
        onClick={handleGoogle}
        loading={gLoading}
        logo={<GoogleLogo />}
        label="Continue with Google"
      />

      <Divider />

      <div className="space-y-3">
        <Input
          icon={Mail}
          type="email"
          placeholder="name@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="text-teal-200/60 hover:text-teal-100 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        <div className="flex justify-end -mt-1">
          <button
            onClick={() => onSwitch("forgot")}
            className="text-xs text-teal-300 hover:text-white hover:underline transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <ErrorBanner message={error} />

        <PrimaryButton onClick={handleEmailLogin} loading={loading}>
          Sign in
        </PrimaryButton>
      </div>

      <p className="text-center text-xs text-teal-200/70 mt-5">
        No account?{" "}
        <button
          onClick={() => onSwitch("register")}
          className="text-teal-300 hover:text-white hover:underline font-medium transition-colors cursor-pointer"
        >
          Create one
        </button>
      </p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTER VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function RegisterView({ onSwitch }) {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [username,     setUsername]     = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [gLoading,     setGLoading]     = useState(false);
  const [error,        setError]        = useState("");

  const handleGoogle = async () => {
    setError("");
    setGLoading(true);
    try {
      const result        = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();
      const data          = await exchangeFirebaseToken(
        firebaseToken,
        result.user.displayName ?? undefined
      );
      login(data);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(friendlyError(err.code ?? err.message));
    } finally {
      setGLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim())    { setError("Choose an anonymous display name."); return; }
    if (!email)              { setError("Please enter your email.");           return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      const result        = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseToken = await result.user.getIdToken();
      const data          = await exchangeFirebaseToken(firebaseToken, username.trim());
      login(data);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(friendlyError(err.code ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Logo subtitle="Create your anonymous account" />

      <SocialButton
        onClick={handleGoogle}
        loading={gLoading}
        logo={<GoogleLogo />}
        label="Continue with Google"
      />

      <Divider />

      <div className="space-y-3">
        <Input
          icon={User}
          placeholder="Anonymous display name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          icon={Mail}
          type="email"
          placeholder="name@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="text-teal-200/60 hover:text-teal-100 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        <ErrorBanner message={error} />

        <PrimaryButton onClick={handleRegister} loading={loading}>
          Create account
        </PrimaryButton>
      </div>

      <p className="text-xs text-teal-200/60 text-center mt-4 leading-relaxed">
        By signing up you agree to our{" "}
        <span className="text-teal-300 cursor-pointer hover:text-white hover:underline transition-colors">privacy policy</span>.
        Your identity stays anonymous.
      </p>

      <p className="text-center text-xs text-teal-200/70 mt-4">
        Already have an account?{" "}
        <button
          onClick={() => onSwitch("login")}
          className="text-teal-300 hover:text-white hover:underline font-medium transition-colors cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ForgotView({ onSwitch }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleReset = async () => {
    if (!email) { setError("Enter your email address."); return; }
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(friendlyError(err.code ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <button
        onClick={() => onSwitch("login")}
        className="flex items-center gap-1.5 text-xs text-teal-200/70 hover:text-white mb-6 -ml-1 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to sign in
      </button>

      <Logo subtitle="Reset your password" />

      {sent ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-teal-500/30 border border-teal-400/30 flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-teal-300" />
          </div>
          <p className="text-sm font-medium text-white mb-1">Check your inbox</p>
          <p className="text-xs text-teal-200/70 leading-relaxed">
            A reset link was sent to{" "}
            <span className="font-medium text-teal-200">{email}</span>.
            It may take a minute to arrive.
          </p>
          <button
            onClick={() => onSwitch("login")}
            className="mt-6 text-xs text-teal-300 hover:text-white hover:underline transition-colors cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-teal-200/70 text-center -mt-3 mb-2">
            Enter your email and we'll send a reset link.
          </p>
          <Input
            icon={Mail}
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <ErrorBanner message={error} />
          <PrimaryButton onClick={handleReset} loading={loading}>
            Send reset link
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AuthPages({ view: initialView = "login" }) {
  const [view, setView] = useState(initialView);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background — same hero image as LandingPage */}
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/85 via-teal-900/75 to-teal-950/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

      {/* Back to home */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-teal-200/80
          hover:text-white transition-colors z-10 cursor-pointer"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {view === "login"    && <div className="relative z-10 w-full flex justify-center"><LoginView    onSwitch={setView} /></div>}
      {view === "register" && <div className="relative z-10 w-full flex justify-center"><RegisterView onSwitch={setView} /></div>}
      {view === "forgot"   && <div className="relative z-10 w-full flex justify-center"><ForgotView   onSwitch={setView} /></div>}
    </div>
  );
}