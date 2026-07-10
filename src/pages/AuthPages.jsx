import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useAuth } from "../App";
import logo from "../assets/logo.jpeg";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";



const serif = { fontFamily: "'Fraunces', serif" };

// Google logo 
const GoogleLogo = () => (
  <svg width={18} height={18} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

//  Firebase error → friendly message 
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
    "auth/expired-action-code":    "This reset link has expired. Request a new one.",
    "auth/invalid-action-code":    "This reset link is invalid or already used.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}


 // Exchange a Firebase ID token for our app's JWT via Flask.
 // POST /api/auth/firebase  →  { user, access_token, expires_in }
 
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

//Shared UI pieces 
function Input({ icon: IconComp, type = "text", placeholder, value, onChange, rightElement }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#4A544C]/50">
        <IconComp size={16} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#12302E]/15 text-sm
          text-[#12302E] placeholder-[#4A544C]/40 bg-white focus:outline-none
          focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-all"
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-3.5 flex items-center">
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
        border border-[#12302E]/15 bg-white text-sm font-medium text-[#12302E]
        hover:border-[#12302E]/30 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
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
      className="w-full py-3 px-4 rounded-xl bg-[#0D6E64] text-white text-sm font-semibold
        hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]
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
      <div className="flex-1 h-px bg-[#12302E]/10" />
      <span className="text-xs text-[#4A544C]/60">or</span>
      <div className="flex-1 h-px bg-[#12302E]/10" />
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="text-xs text-[#8a2340] bg-[#FCE7EF] border border-[#8a2340]/15 rounded-xl px-3 py-2.5">
      {message}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="w-full max-w-sm">
      {children}
    </div>
  );
}

function FormHeader({ title, subtitle }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-medium text-[#12302E] tracking-tight" style={serif}>{title}</h1>
      <p className="text-sm text-[#4A544C] mt-1">{subtitle}</p>
    </div>
  );
}


// LOGIN VIEW


function LoginView({ onSwitch }) {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const redirectTo = location.state?.redirectTo ?? "/onboarding";

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
      navigate(redirectTo, { replace: true });
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
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(friendlyError(err.code ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <FormHeader title="Welcome back" subtitle="Sign in to your anonymous account" />

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
              className="text-[#4A544C]/50 hover:text-[#12302E] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        <div className="flex justify-end -mt-1">
          <button
            onClick={() => onSwitch("forgot")}
            className="text-xs text-[#0D6E64] hover:text-[#12302E] hover:underline transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <ErrorBanner message={error} />

        <PrimaryButton onClick={handleEmailLogin} loading={loading}>
          Sign in
        </PrimaryButton>
      </div>

      <p className="text-center text-xs text-[#4A544C] mt-5">
        No account?{" "}
        <button
          onClick={() => onSwitch("register")}
          className="text-[#0D6E64] hover:text-[#12302E] hover:underline font-semibold transition-colors cursor-pointer"
        >
          Create one
        </button>
      </p>
    </Card>
  );
}


// REGISTER VIEW


function RegisterView({ onSwitch }) {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const redirectTo = location.state?.redirectTo ?? "/onboarding";

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
      navigate(redirectTo, { replace: true });
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
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(friendlyError(err.code ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <FormHeader title="Create your account" subtitle="Anonymous, free, and ready in under a minute" />

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
              className="text-[#4A544C]/50 hover:text-[#12302E] transition-colors"
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

      <p className="text-xs text-[#4A544C]/70 text-center mt-4 leading-relaxed">
        By signing up you agree to our{" "}
        <span className="text-[#0D6E64] cursor-pointer hover:text-[#12302E] hover:underline transition-colors">privacy policy</span>.
        Your identity stays anonymous.
      </p>

      <p className="text-center text-xs text-[#4A544C] mt-4">
        Already have an account?{" "}
        <button
          onClick={() => onSwitch("login")}
          className="text-[#0D6E64] hover:text-[#12302E] hover:underline font-semibold transition-colors cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </Card>
  );
}


// FORGOT PASSWORD VIEW


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
        className="flex items-center gap-1.5 text-xs text-[#4A544C] hover:text-[#12302E] mb-6 -ml-1 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to sign in
      </button>

      <FormHeader title="Reset your password" subtitle="We'll send a secure link to your email" />

      {sent ? (
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-[#D8E8E4] flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-[#0D6E64]" />
          </div>
          <p className="text-sm font-semibold text-[#12302E] mb-1">Check your inbox</p>
          <p className="text-xs text-[#4A544C] leading-relaxed">
            A reset link was sent to{" "}
            <span className="font-medium text-[#12302E]">{email}</span>.
            It may take a minute to arrive.
          </p>
          <button
            onClick={() => onSwitch("login")}
            className="mt-6 text-xs text-[#0D6E64] hover:text-[#12302E] hover:underline transition-colors cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <div className="space-y-3">
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


// RESET PASSWORD VIEW (from the emailed link — /reset-password?oobCode=...)


function ResetView({ onSwitch }) {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [done,            setDone]            = useState(false);
  const [error,           setError]           = useState("");

  const handleConfirm = async () => {
    if (!oobCode) { setError("This reset link is missing or invalid."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setError("");
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
    } catch (err) {
      setError(friendlyError(err.code ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <FormHeader title="Set a new password" subtitle="Choose a new password for your account" />

      {!oobCode ? (
        <ErrorBanner message="This reset link is missing or invalid. Request a new one from the sign-in page." />
      ) : done ? (
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-[#D8E8E4] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={22} className="text-[#0D6E64]" />
          </div>
          <p className="text-sm font-semibold text-[#12302E] mb-1">Password updated</p>
          <p className="text-xs text-[#4A544C] leading-relaxed mb-6">
            You can now sign in with your new password.
          </p>
          <PrimaryButton onClick={() => onSwitch("login")}>Back to sign in</PrimaryButton>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            icon={Lock}
            type={showPassword ? "text" : "password"}
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightElement={
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="text-[#4A544C]/50 hover:text-[#12302E] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <Input
            icon={Lock}
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <ErrorBanner message={error} />
          <PrimaryButton onClick={handleConfirm} loading={loading}>
            Update password
          </PrimaryButton>
        </div>
      )}

      <p className="text-center text-xs text-[#4A544C] mt-5">
        <button
          onClick={() => onSwitch("login")}
          className="text-[#0D6E64] hover:text-[#12302E] hover:underline font-semibold transition-colors cursor-pointer"
        >
          Back to sign in
        </button>
      </p>
    </Card>
  );
}


// LEFT BRAND PANEL (desktop only)


const trustPoints = [
  { Icon: ShieldCheck, text: "You choose your display name — your real identity is never shown" },
  { Icon: CheckCircle2, text: "Free to join, always. No paywall on support" },
  { Icon: Mail, text: "Your email is only ever used for sign-in and account recovery" },
];

function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-[42%] bg-[#12302E] p-12 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, #0D6E64 0%, transparent 45%), radial-gradient(circle at 85% 80%, #C98A3E 0%, transparent 40%)",
        }}
      />
      <div className="relative flex items-center gap-2.5">
        <img src={logo} alt="Safe Haven logo" className="w-9 h-9 rounded-full object-cover" />
        <span className="font-semibold text-[#F7F4EC] text-lg tracking-tight" style={serif}>
          Safe Haven
        </span>
      </div>

      <div className="relative">
        <h2
          className="text-[32px] font-medium text-[#F7F4EC] leading-[1.2] mb-6"
          style={serif}
        >
          You don't have to<br />
          <span className="italic text-[#F1DEBC]">recover</span> alone.
        </h2>
        <div className="space-y-4">
          {trustPoints.map((t) => (
            <div key={t.text} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <t.Icon size={15} className="text-[#F1DEBC]" />
              </div>
              <p className="text-sm text-[#D8E8E4] leading-relaxed pt-1.5">{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-xs text-[#D8E8E4]/50">© 2026 Safe Haven. Built in Kenya.</p>
    </div>
  );
}


// ROOT


export default function AuthPages({ view: initialView = "login" }) {
  const [view, setView] = useState(initialView);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[#F7F4EC]">
      <BrandPanel />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Back to home */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-[#4A544C]
            hover:text-[#12302E] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Mobile-only logo (BrandPanel is hidden below lg) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <img src={logo} alt="Safe Haven logo" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-semibold text-[#12302E] text-lg tracking-tight" style={serif}>
            Safe Haven
          </span>
        </div>

        {view === "login"    && <LoginView    onSwitch={setView} />}
        {view === "register" && <RegisterView onSwitch={setView} />}
        {view === "forgot"   && <ForgotView   onSwitch={setView} />}
        {view === "reset"    && <ResetView    onSwitch={setView} />}
      </div>
    </div>
  );
}