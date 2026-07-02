import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  Heart,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Calendar,
  Pencil,
} from "lucide-react";

// TODO(backend): replace these mock helpers with real API calls, e.g.
//   import { getTodayCheckIn, submitCheckIn } from "../api";
// getTodayCheckIn() -> GET /api/checkins/today  -> { mood, cravingLevel, soberToday, notes } | null
// submitCheckIn(payload) -> POST /api/checkins  -> saved check-in record

const MOOD_LABELS = ["", "Very low", "Low", "Neutral", "Good", "Great"];
const CRAVING_LABELS = ["", "None", "Mild", "Moderate", "Strong", "Intense"];

// Mood: low -> high mapped onto a rose -> teal scale (matches the app's teal identity)
const MOOD_COLORS = ["", "bg-rose-500", "bg-orange-400", "bg-amber-400", "bg-lime-500", "bg-teal-500"];
// Craving: inverted — low craving is "good" (teal), high craving is "hard" (rose)
const CRAVING_COLORS = ["", "bg-teal-500", "bg-lime-500", "bg-amber-400", "bg-orange-400", "bg-rose-500"];

function ScaleSelector({ value, onChange, colors, labels, activeRing }) {
  return (
    <div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            aria-label={`${labels[v]} (${v} of 5)`}
            onClick={() => onChange(v)}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${activeRing}
              ${
                value === v
                  ? `${colors[v]} text-white scale-105 shadow-md`
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
          >
            {v}
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">{labels[value]}</p>
    </div>
  );
}

export default function CheckIn() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // TODO(backend): initialize from getTodayCheckIn() on mount instead of these defaults.
  const [mood, setMood] = useState(3);
  const [craving, setCraving] = useState(1);
  const [soberToday, setSoberToday] = useState(true);
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleSubmit = async () => {
    setError("");
    setIsSaving(true);
    try {
      // TODO(backend): await submitCheckIn({ mood, cravingLevel: craving, soberToday, notes: notes || undefined });
      await new Promise((resolve) => setTimeout(resolve, 600)); // simulated save
      setIsSaved(true);
    } catch {
      setError("Couldn't save your check-in. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaved) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're checked in</h1>
        <p className="text-gray-500 mb-8">
          Nice work{user?.username ? `, ${user.username}` : ""}. Showing up today counts.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => setIsSaved(false)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Pencil size={16} /> Edit check-in
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer"
          >
            Back to dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daily check-in</h1>
        <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
          <Calendar size={14} /> {today}
        </p>
      </div>

      {/* Sober today */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Were you sober today?</h2>
        <div className="flex gap-3">
          <button
            type="button"
            aria-pressed={soberToday}
            onClick={() => setSoberToday(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all cursor-pointer font-medium text-sm
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
              ${
                soberToday
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 text-gray-500 hover:border-teal-300"
              }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Yes, I was sober
          </button>
          <button
            type="button"
            aria-pressed={!soberToday}
            onClick={() => setSoberToday(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all cursor-pointer font-medium text-sm
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2
              ${
                !soberToday
                  ? "border-rose-400 bg-rose-50 text-rose-600"
                  : "border-gray-200 text-gray-500 hover:border-rose-300"
              }`}
          >
            <XCircle className="w-4 h-4" /> No
          </button>
        </div>
        {!soberToday && (
          <p className="text-sm text-gray-500 mt-3 p-3 bg-gray-50 rounded-lg">
            That's okay. Recovery isn't linear — tomorrow is a new opportunity.
          </p>
        )}
      </section>

      {/* Mood */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" /> How is your mood?
        </h2>
        <ScaleSelector
          value={mood}
          onChange={setMood}
          colors={MOOD_COLORS}
          labels={MOOD_LABELS}
          activeRing="focus-visible:ring-teal-500"
        />
      </section>

      {/* Craving */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Craving level?
        </h2>
        <ScaleSelector
          value={craving}
          onChange={setCraving}
          colors={CRAVING_COLORS}
          labels={CRAVING_LABELS}
          activeRing="focus-visible:ring-amber-500"
        />
      </section>

      {/* Notes */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Notes (optional)</h2>
        <textarea
          placeholder="How are you feeling? What helped today? Any challenges?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-800 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
        />
      </section>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSubmit}
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
          "Save today's check-in"
        )}
      </button>
    </div>
  );
}