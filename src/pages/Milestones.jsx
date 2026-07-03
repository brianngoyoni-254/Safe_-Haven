import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import {
  Sprout,
  Leaf,
  TreeDeciduous,
  Star,
  Trophy,
  Lock,
  Calendar,
  TrendingUp,
  CircleDot,
} from "lucide-react";

// TODO(backend): replace these mock helpers with real API calls, e.g.
//   import { getEarnedMilestones, awardMilestone } from "../api";
// getEarnedMilestones() -> GET /api/milestones          -> [{ days, achievedAt }]
// awardMilestone(days)  -> POST /api/milestones          -> { days, achievedAt }

const MILESTONES = [
  {
    days: 7,
    Icon: Sprout,
    label: "First Week",
    desc: "7 sober days",
    motivation: "The hardest week is behind you.",
    accent: "text-emerald-600",
    iconBg: "bg-emerald-50",
    ring: "border-emerald-200",
    bar: "bg-emerald-500",
  },
  {
    days: 30,
    Icon: Leaf,
    label: "One Month",
    desc: "30 days of courage",
    motivation: "Your body is healing. Your mind is clearing.",
    accent: "text-teal-600",
    iconBg: "bg-teal-50",
    ring: "border-teal-200",
    bar: "bg-teal-500",
  },
  {
    days: 90,
    Icon: TreeDeciduous,
    label: "Three Months",
    desc: "90 days of growth",
    motivation: "New routines are forming. Keep going.",
    accent: "text-cyan-600",
    iconBg: "bg-cyan-50",
    ring: "border-cyan-200",
    bar: "bg-cyan-500",
  },
  {
    days: 180,
    Icon: Star,
    label: "Six Months",
    desc: "180 days of strength",
    motivation: "Half a year. You are transforming.",
    accent: "text-blue-600",
    iconBg: "bg-blue-50",
    ring: "border-blue-200",
    bar: "bg-blue-500",
  },
  {
    days: 365,
    Icon: Trophy,
    label: "One Full Year",
    desc: "365 days — extraordinary",
    motivation: "A complete year. You are an inspiration.",
    accent: "text-violet-600",
    iconBg: "bg-violet-50",
    ring: "border-violet-200",
    bar: "bg-violet-500",
  },
];

const REMINDERS = [
  "Recovery is not linear — setbacks don't erase progress.",
  "Each milestone is a celebration, not a finish line.",
  "You are worthy of recovery, regardless of how many times you've tried.",
];

function currentBadgeIcon(soberDays) {
  if (soberDays === null) return CircleDot;
  if (soberDays >= 365) return Trophy;
  if (soberDays >= 180) return Star;
  if (soberDays >= 90) return TreeDeciduous;
  if (soberDays >= 30) return Leaf;
  if (soberDays >= 7) return Sprout;
  return CircleDot;
}

function formatDate(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Milestones() {
  const { user } = useAuth();

  // TODO(backend): replace with the real earned-milestones fetch on mount.
  const [earned, setEarned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // TODO(backend): const data = await getEarnedMilestones();
        await new Promise((resolve) => setTimeout(resolve, 300)); // simulated fetch
        if (!cancelled) setEarned([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const soberDays = useMemo(() => {
    if (!user?.sobriety_start) return null;
    const start = new Date(user.sobriety_start);
    const diff = Date.now() - start.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [user?.sobriety_start]);

  const earnedMap = useMemo(() => {
    return new Map(earned.map((m) => [m.days, m]));
  }, [earned]);

  // Auto-award any milestone that's been reached but not yet recorded.
  useEffect(() => {
    if (soberDays === null) return;
    const toAward = MILESTONES.filter(
      (m) => soberDays >= m.days && !earnedMap.has(m.days)
    );
    if (toAward.length === 0) return;

    // TODO(backend): Promise.all(toAward.map((m) => awardMilestone(m.days)))
    setEarned((prev) => [
      ...prev,
      ...toAward.map((m) => ({ days: m.days, achievedAt: new Date().toISOString() })),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soberDays]);

  const completedCount = useMemo(
    () => MILESTONES.filter((m) => soberDays !== null && soberDays >= m.days).length,
    [soberDays]
  );
  const progressPct = Math.round((completedCount / MILESTONES.length) * 100);

  const CurrentBadge = currentBadgeIcon(soberDays);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-28 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-52 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
        <p className="text-gray-500 text-sm mt-1">Every day counts. Celebrate every victory.</p>
      </div>

      {/* Summary bar */}
      {soberDays !== null ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-violet-500" />
          <div className="p-5 flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
                <CurrentBadge className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{soberDays}</div>
                <div className="text-sm text-gray-500">days sober</div>
              </div>
            </div>

            <div className="flex-1 min-w-[160px]">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>
                  {completedCount} of {MILESTONES.length} milestones
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Since{" "}
              <strong className="text-gray-900">
                {formatDate(user.sobriety_start)}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <Calendar className="w-8 h-8 text-teal-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Set your recovery start date</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Track sober days and unlock milestone badges
            </p>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            Set Date
          </Link>
        </div>
      )}

      {/* Milestone cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MILESTONES.map((m) => {
          const isUnlocked = soberDays !== null && soberDays >= m.days;
          const earnedEntry = earnedMap.get(m.days);
          const progress =
            soberDays !== null ? Math.min(100, (soberDays / m.days) * 100) : 0;

          return (
            <div
              key={m.days}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow ${
                isUnlocked ? m.ring : "border-gray-100 opacity-80"
              }`}
            >
              <div className={`h-1.5 ${isUnlocked ? m.bar : "bg-gray-200"}`} />
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      isUnlocked ? m.iconBg : "bg-gray-100"
                    }`}
                  >
                    {isUnlocked ? (
                      <m.Icon className={`w-7 h-7 ${m.accent}`} />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {earnedEntry && (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                      ✓ Earned
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">{m.label}</h3>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                  {isUnlocked && (
                    <p className={`text-xs mt-1 italic ${m.accent}`}>{m.motivation}</p>
                  )}
                </div>

                {earnedEntry && (
                  <p className="text-xs text-gray-400">
                    Achieved {formatDate(earnedEntry.achievedAt)}
                  </p>
                )}

                {!isUnlocked && soberDays !== null && (
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        {soberDays} / {m.days} days
                      </span>
                      <span>{m.days - soberDays} to go</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.bar} transition-all duration-700 ease-out`}
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
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-semibold text-gray-900">Remember</h2>
        </div>
        <div className="space-y-2">
          {REMINDERS.map((quote, i) => (
            <p key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="text-teal-600 font-bold mt-0.5">•</span> {quote}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}