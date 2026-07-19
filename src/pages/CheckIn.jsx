import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { checkInApi } from "../api";
import {
  Heart,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Calendar,
  Pencil,
  Flame,
  Frown,
  Meh,
  Smile,
  SmilePlus,
  Laugh,
} from "lucide-react";

const serif = { fontFamily: "'Fraunces', serif" };

const MOOD_LABELS = ["", "Very low", "Low", "Neutral", "Good", "Great"];
const CRAVING_LABELS = ["", "None", "Mild", "Moderate", "Strong", "Intense"];

// Mood
const MOOD_STEPS = [
  null,
  { Icon: Frown, color: "#c2417a", bg: "#FCE7EF" },
  { Icon: Meh, color: "#d18a4f", bg: "#F6E3D3" },
  { Icon: Smile, color: "#C98A3E", bg: "#F1DEBC" },
  { Icon: SmilePlus, color: "#4a9b7f", bg: "#DCEEE7" },
  { Icon: Laugh, color: "#0D6E64", bg: "#D8E8E4" },
];

// Craving: inverted — low craving is "good" (teal), high craving is "hard" (rose)
const CRAVING_COLORS = ["", "#0D6E64", "#4a9b7f", "#C98A3E", "#d18a4f", "#c2417a"];
const CRAVING_BG = ["", "#D8E8E4", "#DCEEE7", "#F1DEBC", "#F6E3D3", "#FCE7EF"];

function MoodSelector({ value, onChange }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        {[1, 2, 3, 4, 5].map((v) => {
          const { Icon, color, bg } = MOOD_STEPS[v];
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={active}
              aria-label={`${MOOD_LABELS[v]} (${v} of 5)`}
              onClick={() => onChange(v)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group
                focus-visible:outline-none"
            >
              <span
                className={`flex items-center justify-center rounded-full transition-all duration-150 ${
                  active ? "w-11 h-11" : "w-9 h-9 group-hover:w-10 group-hover:h-10"
                }`}
                style={{
                  background: bg,
                  color,
                  boxShadow: active ? `0 0 0 2px ${color}` : "none",
                }}
              >
                <Icon className={active ? "w-5 h-5" : "w-4 h-4"} />
              </span>
              <span
                className="text-[11px] transition-colors"
                style={{ color: active ? "#12302E" : "#4A544C", fontWeight: active ? 600 : 400 }}
              >
                {MOOD_LABELS[v]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CravingBar({ value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: CRAVING_COLORS[value], background: CRAVING_BG[value] }}>
          {CRAVING_LABELS[value]}
        </span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            aria-label={`${CRAVING_LABELS[v]} (${v} of 5)`}
            onClick={() => onChange(v)}
            className="flex-1 h-2.5 rounded-full cursor-pointer transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: v <= value ? CRAVING_COLORS[value] : "#EFEAE0",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CheckIn() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mood, setMood] = useState(3);
  const [craving, setCraving] = useState(1);
  const [soberToday, setSoberToday] = useState(true);
  const [notes, setNotes] = useState("");

  // isLoading: fetching any existing check-in for today on mount.
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Streak ring in the header — purely a lightweight nod to progress, not a
  // replacement for the full picture on /milestones. Shows only once a
  // recovery start date is set; otherwise the header just shows the date.
  const soberDays = useMemo(() => {
    if (!user?.sobriety_start) return null;
    const start = new Date(`${user.sobriety_start}T12:00:00`);
    const diff = Date.now() - start.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [user?.sobriety_start]);

  const streakPercent = soberDays === null ? 0 : Math.min(100, (soberDays % 30 === 0 && soberDays > 0 ? 30 : soberDays % 30) / 30 * 100);

  // On mount: pre-fill the form if the user already checked in today, and
  // land straight on the "You're checked in" view instead of the blank form.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: existing } = await checkInApi.today();
        if (cancelled || !existing) return;
        setMood(existing.mood);
        setCraving(existing.cravingLevel);
        setSoberToday(existing.soberToday);
        setNotes(existing.notes ?? "");
        setIsSaved(true);
      } catch {
        // Non-fatal — user can still fill out and submit a fresh check-in.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    setError("");
    setIsSaving(true);
    try {
      await checkInApi.create({ mood, cravingLevel: craving, soberToday, notes: notes || undefined });
      setIsSaved(true);
    } catch {
      setError("Couldn't save your check-in. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={24} className="animate-spin text-[#0D6E64]" />
      </div>
    );
  }

  if (isSaved) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#D8E8E4] flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-[#0D6E64]" />
        </div>
        <h1 className="text-2xl font-medium text-[#12302E] tracking-tight mb-2" style={serif}>
          You're checked in
        </h1>
        <p className="text-[#4A544C] mb-9">
          Nice work{user?.username ? `, ${user.username}` : ""}. Showing up today counts.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => setIsSaved(false)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#12302E]
              bg-[#EFEAE0] hover:bg-[#12302E]/10 transition-colors cursor-pointer"
          >
            <Pencil size={16} /> Edit check-in
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
              shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            Back to dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-tight font-medium text-[#12302E] tracking-tight" style={serif}>
            Daily check-in
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-[#4A544C] mt-1.5">
            <Calendar size={14} className="text-[#4A544C]/60" />
            {today}
            {soberDays !== null && <span className="text-[#4A544C]/50">· Day {soberDays} of your streak</span>}
          </p>
        </div>
        {soberDays !== null && (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `conic-gradient(#0D6E64 ${streakPercent}%, #EFEAE0 ${streakPercent}%)` }}
          >
            <div className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#C98A3E]" />
            </div>
          </div>
        )}
      </div>

      {/* Sober today */}
      <section className="bg-[#12302E] rounded-[20px] p-5">
        <h2 className="text-base font-semibold text-[#F7F4EC] mb-3 tracking-tight">Were you sober today?</h2>
        <div className="flex gap-2.5">
          <button
            type="button"
            aria-pressed={soberToday}
            onClick={() => setSoberToday(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E64] focus-visible:ring-offset-2
              ${
                soberToday
                  ? "bg-[#0D6E64] text-[#F7F4EC]"
                  : "bg-white/10 text-[#D8E8E4] hover:bg-white/15"
              }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Yes, I was sober
          </button>
          <button
            type="button"
            aria-pressed={!soberToday}
            onClick={() => setSoberToday(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2417a] focus-visible:ring-offset-2
              ${
                !soberToday
                  ? "bg-[#c2417a] text-[#F7F4EC]"
                  : "bg-white/10 text-[#D8E8E4] hover:bg-white/15"
              }`}
          >
            <XCircle className="w-4 h-4" /> No
          </button>
        </div>
        {!soberToday && (
          <p className="text-sm text-[#D8E8E4] mt-3 p-3 bg-white/10 rounded-lg">
            That's okay. Recovery isn't linear — tomorrow is a new opportunity.
          </p>
        )}
      </section>

      {/* Mood */}
      <section className="bg-white rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
        <h2 className="text-base font-semibold text-[#12302E] mb-4 flex items-center gap-2 tracking-tight">
          <Heart className="w-4 h-4 text-[#c2417a]" /> How is your mood?
        </h2>
        <MoodSelector value={mood} onChange={setMood} />
      </section>

      {/* Craving */}
      <section className="bg-white rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
        <h2 className="text-base font-semibold text-[#12302E] mb-4 flex items-center gap-2 tracking-tight">
          <Zap className="w-4 h-4 text-[#C98A3E]" /> Craving level?
        </h2>
        <CravingBar value={craving} onChange={setCraving} />
      </section>

      {/* Notes */}
      <section className="bg-white rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
        <h2 className="text-base font-semibold text-[#12302E] mb-3 tracking-tight">Notes (optional)</h2>
        <textarea
          placeholder="How are you feeling? What helped today? Any challenges?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-[#12302E]/15 p-3 text-sm text-[#12302E]
            placeholder-[#4A544C]/40 bg-[#F7F4EC]
            focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
        />
      </section>

      {error && (
        <p className="text-sm text-[#8a2340] bg-[#FCE7EF] border border-[#8a2340]/15 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSubmit}
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
          "Save today's check-in"
        )}
      </button>
    </div>
  );
}