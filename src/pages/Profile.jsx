import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { User, Save, LogOut, Loader2, CheckCircle2 } from "lucide-react";

// TODO(backend): replace the mock save below with a real API call, e.g.
//   import { updateProfile } from "../api";
// updateProfile({ username, sobrietyStart, goals }) -> PUT /api/profile
//   -> { id, username, email, sobriety_start, goals }
// Right now this page only updates the in-memory auth user via updateUser(),
// so a page refresh will lose anything not already on the user object
// (username / sobriety_start persist via context, "goals" does not yet).

// Deterministic fallback avatar color — same helper used in Layout.jsx.
// TODO(backend): prefer user.avatarColor once the API returns one.
function colorFromName(name) {
  const palette = ["#0891b2", "#0d9488", "#059669", "#7c3aed", "#db2777", "#ea580c"];
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
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your profile is anonymous. Only you can see your real identity.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md flex-shrink-0"
          style={{ backgroundColor: colorFromName(user?.username) }}
        >
          {(user?.username ?? "?")[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{user?.username ?? "Anonymous"}</div>
          <div className="text-sm text-gray-500 truncate">{user?.email ?? "—"}</div>
        </div>
      </div>

      {/* Recovery profile form */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <User className="w-4 h-4 text-teal-600" /> Recovery Profile
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Anonymous Display Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Phoenix, River, Sage"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          />
          <p className="text-xs text-gray-400 mt-1">This is how others in the community will see you.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Recovery Start Date</label>
          <input
            type="date"
            value={startDate ?? ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Personal Recovery Goals</label>
          <textarea
            placeholder="What are you working towards? What does success look like for you?"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          />
        </div>

        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {isSaved && !error && (
          <p className="flex items-center gap-1.5 text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4" /> Profile saved!
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-teal-600
            hover:bg-teal-500 active:scale-[0.99] transition-all duration-150 cursor-pointer
            disabled:opacity-70 disabled:cursor-not-allowed"
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
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-500 mb-3">Ready to sign out of Safe Haven?</p>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100
            hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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