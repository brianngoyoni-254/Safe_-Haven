import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { User, Save, LogOut, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

// TODO(backend): replace the mock save below with a real API call, e.g.
//   import { updateProfile } from "../api";
// updateProfile({ username, sobrietyStart, goals }) -> PUT /api/profile
//   -> { id, username, email, sobriety_start, goals }
// Right now this page only updates the in-memory auth user via updateUser(),
// so a page refresh will lose anything not already on the user object
// (username / sobriety_start persist via context, "goals" does not yet).



const serif = { fontFamily: "'Fraunces', serif" };

// Deterministic fallback avatar color — same helper used in Layout.jsx,
// but reusing the brand palette instead of arbitrary cyans/violets.
// TODO(backend): prefer user.avatarColor once the API returns one.
function colorFromName(name) {
  const palette = ["#0D6E64", "#0d9668", "#0e7c8c", "#1c7fa8", "#C98A3E", "#c2417a"];
  if (!name) return palette[0];
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username ?? "");
  const [startDate, setStartDate] = useState(user?.sobriety_start ?? "");
  const [goals, setGoals] = useState(user?.goals ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSave = async () => {
    setError("");
    if (!username.trim()) {
      setError("Please set a display name.");
      return;
    }
    setIsSaving(true);
    setIsSaved(false);
    try {
      // TODO(backend): await updateProfile({ username, sobrietyStart: startDate || undefined, goals: goals || undefined });
      await new Promise((resolve) => setTimeout(resolve, 500)); // simulated save
      updateUser({ username, sobriety_start: startDate || null, goals: goals || "" });
      setIsSaved(true);
    } catch {
      setError("Couldn't save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] leading-tight font-medium text-[#12302E] tracking-tight" style={serif}>
          My Profile
        </h1>
        <p className="flex items-center gap-1.5 text-sm text-[#4A544C] mt-1.5">
          <ShieldCheck size={14} className="text-[#0D6E64]/60" />
          Your profile is anonymous. Only you can see your real identity.
        </p>
      </div>

      {/* Avatar */}
      <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold text-[#F7F4EC] shadow-sm flex-shrink-0"
          style={{ ...serif, backgroundColor: colorFromName(user?.username) }}
        >
          {(user?.username ?? "?")[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[#12302E] truncate tracking-tight">
            {user?.username ?? "Anonymous"}
          </div>
          <div className="text-sm text-[#4A544C] truncate">{user?.email ?? "—"}</div>
        </div>
      </section>

      {/* Recovery profile form */}
      <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#12302E] tracking-tight">
          <User className="w-4 h-4 text-[#0D6E64]" /> Recovery Profile
        </h2>

        <div>
          <label className="block text-sm font-medium text-[#12302E] mb-1.5">
            Anonymous Display Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Phoenix, River, Sage"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white
              placeholder-[#4A544C]/40
              focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
          />
          <p className="text-xs text-[#4A544C]/70 mt-1.5">
            This is how others in the community will see you.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#12302E] mb-1.5">Recovery Start Date</label>
          <input
            type="date"
            value={startDate ?? ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white
              focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#12302E] mb-1.5">Personal Recovery Goals</label>
          <textarea
            placeholder="What are you working towards? What does success look like for you?"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-[#12302E]/15 p-3 text-sm text-[#12302E] bg-white
              placeholder-[#4A544C]/40
              focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
          />
        </div>

        {error && (
          <p className="text-sm text-[#8a2340] bg-[#FCE7EF] border border-[#8a2340]/15 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}
        {isSaved && !error && (
          <p className="flex items-center gap-1.5 text-sm text-[#0D6E64] bg-[#D8E8E4] border border-[#0D6E64]/15 rounded-xl px-3.5 py-2.5">
            <CheckCircle2 className="w-4 h-4" /> Profile saved!
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-[#0D6E64]
            hover:brightness-110 hover:shadow-lg active:scale-[0.99] transition-all duration-150 cursor-pointer
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Profile
            </>
          )}
        </button>
      </section>

      {/* Sign out */}
      <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
        <p className="text-sm text-[#4A544C] mb-3">Ready to sign out of Safe Haven?</p>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-[#12302E] bg-[#EFEAE0]
            hover:bg-[#12302E]/10 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Signing out…
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" /> Sign Out
            </>
          )}
        </button>
      </section>
    </div>
  );
}