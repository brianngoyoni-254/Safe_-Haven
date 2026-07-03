import { useState, useMemo } from "react";
import { useAuth } from "../App";
import {
  Sprout,
  Leaf,
  TreePine,
  Star,
  Trophy,
  Lock,
  CheckCircle2,
  Calendar,
  TrendingUp,
} from "lucide-react";

// TODO(backend): replace all mock logic below with real API calls, e.g.
//   import { getRecoveryStartDate, setRecoveryStartDate, getEarnedMilestones } from "../api";
// getRecoveryStartDate()   -> GET  /api/profile/recovery-start -> { recoveryStartDate: "YYYY-MM-DD" } | null
// setRecoveryStartDate(d)  -> PUT  /api/profile/recovery-start -> { recoveryStartDate }
// getEarnedMilestones()    -> GET  /api/milestones            -> [{ days, achievedAt }]
// Milestones are derived from soberDays on the client for now; the backend should
// eventually own "achievedAt" so earned badges keep a fixed date once unlocked.

const MILESTONES = [
  {
    days: 7,
    Icon: Sprout,
    label: "First Week",
    desc: "7 sober days",
    motivation: "The hardest week is behind you.",
    ring: "from-emerald-400 to-teal-400",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    days: 30,
    Icon: Leaf,
    label: "One Month",
    desc: "30 days of courage",
    motivation: "Your body is healing. Your mind is clearing.",
    ring: "from-teal-400 to-teal-500",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    days: 90,
    Icon: TreePine,
    label: "Three Months",
    desc: "90 days of growth",
    motivation: "New routines are forming. Keep going.",
    ring: "from-teal-500 to-cyan-500",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    days: 180,
    Icon: Star,
    label: "Six Months",
    desc: "180 days of strength",
    motivation: "Half a year. You are transforming.",
    ring: "from-cyan-500 to-teal-600",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    days: 365,
    Icon: Trophy,
    label: "One Full Year",
    desc: "365 days — extraordinary",
    motivation: "A complete year. You are an inspiration.",
    ring: "from-teal-600 to-emerald-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
];

const REMINDERS = [
  "Recovery is not linear — setbacks don't erase progress.",
  "Each milestone is a celebration, not a finish line.",
  "You are worthy of recovery, regardless of how many times you've tried.",
];

function currentTierIcon(soberDays) {
  if (soberDays >= 365) return Trophy;
  if (soberDays >= 180) return Star;
  if (soberDays >= 90) return TreePine;
  if (soberDays >= 30) return Leaf;
  if (soberDays >= 7) return Sprout;
  return Sprout;
}

function formatDate(dateStr) {
  // dateStr is "YYYY-MM-DD"; construct at noon to avoid timezone off-by-one
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function SetStartDateCard({ onSave }) {
  const [value, setValue] = useState("");

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="font-semibold text-gray-900 text-sm">Set your recovery start date</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track sober days and unlock milestone badges.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={value}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 sm:flex-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          />
          <button
            type="button"
            disabled={!value}
            onClick={() => onSave(value)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600
              hover:bg-teal-500 active:scale-[0.98] transition-all duration-150 cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Save date
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Milestones() {
  const { user } = useAuth();

  // TODO(backend): seed from getRecoveryStartDate() instead of user context / null.
  const [recoveryStartDate, setRecoveryStartDateState] = useState(
    user?.sobriety_start ?? null
  );

  const soberDays = useMemo(() => {
    if (!recoveryStartDate) return null;
    const start = new Date(`${recoveryStartDate}T12:00:00`);
    const diff = Date.now() - start.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [recoveryStartDate]);

  const handleSaveDate = (dateStr) => {
    // TODO(backend): await setRecoveryStartDate(dateStr)
    setRecoveryStartDateState(dateStr);
  };

  const completedCount = soberDays === null
    ? 0
    : MILESTONES.filter((m) => soberDays >= m.days).length;

  const CurrentIcon = soberDays !== null ? currentTierIcon(soberDays) : Sprout;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
        <p className="text-gray-500 text-sm mt-1">Every day counts. Celebrate every victory.</p>
      </div>

      {/* Summary bar */}
      {soberDays !== null ? (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
          <div className="p-5 flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
                <CurrentIcon className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{soberDays}</div>
                <div className="text-sm text-gray-500">days sober</div>
              </div>
            </div>

            <div className="flex-1 min-w-[160px]">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{completedCount} of {MILESTONES.length} milestones</span>
                <span>{Math.round((completedCount / MILESTONES.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(completedCount / MILESTONES.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Since <strong className="text-gray-900">{formatDate(recoveryStartDate)}</strong>
            </div>
          </div>
        </section>
      ) : (
        <SetStartDateCard onSave={handleSaveDate} />
      )}

      {/* Milestone cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MILESTONES.map((m) => {
          const isUnlocked = soberDays !== null && soberDays >= m.days;
          const progress = soberDays !== null ? Math.min(100, (soberDays / m.days) * 100) : 0;
          const Icon = m.Icon;

          return (
            <div
              key={m.days}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden h-full flex flex-col
                ${isUnlocked ? "border-teal-200" : "border-gray-100"}`}
            >
              <div className={`h-1.5 bg-gradient-to-r ${isUnlocked ? m.ring : "bg-gray-100"}`} />
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center
                      ${isUnlocked ? m.iconBg : "bg-gray-100"}`}
                  >
                    {isUnlocked ? (
                      <Icon className={`w-6 h-6 ${m.iconColor}`} />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {isUnlocked && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Earned
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">{m.label}</h3>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                  {isUnlocked && (
                    <p className="text-xs text-teal-600 mt-1 italic">{m.motivation}</p>
                  )}
                </div>

                {!isUnlocked && soberDays !== null && (
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{soberDays} / {m.days} days</span>
                      <span>{m.days - soberDays} to go</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${m.ring} transition-all duration-700 ease-out`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {soberDays === null && (
                  <p className="text-xs text-gray-400 italic mt-auto">
                    Set your start date to track progress
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational section */}
      <section className="bg-teal-50/60 rounded-2xl border border-teal-100 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <TrendingUp className="w-4 h-4 text-teal-600" /> Remember
        </h2>
        <div className="space-y-2">
          {REMINDERS.map((quote, i) => (
            <p key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="text-teal-600 font-bold mt-0.5">•</span> {quote}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}