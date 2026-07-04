import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import {
  Heart,
  TrendingUp,
  Users,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Flame,
  Calendar,
  BarChart2,
  Phone,
  MapPin,
  Sprout,
  Leaf,
  TreePine,
  Star,
  Trophy,
} from "lucide-react";

// TODO(backend): replace all mock logic below with real API calls, e.g.
//   import { getRecentCheckIns, getTodayCheckIn, getEarnedMilestones, awardMilestone } from "../api";
// getRecentCheckIns()   -> GET  /api/checkins/recent      -> [{ date, mood, cravingLevel, soberToday, notes }]
// getTodayCheckIn()     -> GET  /api/checkins/today        -> { mood, cravingLevel, soberToday, notes } | null
// getEarnedMilestones() -> GET  /api/milestones             -> [{ days, achievedAt }]
// awardMilestone(days)  -> POST /api/milestones              -> { days, achievedAt }
// soberDays is derived from user.sobriety_start (set on the Milestones page) — same
// source of truth used there, so both pages always agree on the count.

const MILESTONE_META = {
  7: { label: "First Week", Icon: Sprout, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
  30: { label: "One Month", Icon: Leaf, iconColor: "text-teal-600", iconBg: "bg-teal-50" },
  90: { label: "Three Months", Icon: TreePine, iconColor: "text-cyan-600", iconBg: "bg-cyan-50" },
  180: { label: "Six Months", Icon: Star, iconColor: "text-sky-600", iconBg: "bg-sky-50" },
  365: { label: "One Full Year", Icon: Trophy, iconColor: "text-emerald-700", iconBg: "bg-emerald-50" },
};
const MILESTONE_DAYS = [7, 30, 90, 180, 365];

// Small deterministic seed so the dashboard has something to show before a
// real check-in API is wired up. Remove once getRecentCheckIns() is live.
function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const MOCK_CHECKINS = [
  { date: dateNDaysAgo(9), mood: 3, cravingLevel: 3, soberToday: true, notes: "" },
  { date: dateNDaysAgo(8), mood: 3, cravingLevel: 2, soberToday: true, notes: "" },
  { date: dateNDaysAgo(7), mood: 2, cravingLevel: 4, soberToday: true, notes: "Rough day, stayed strong." },
  { date: dateNDaysAgo(6), mood: 4, cravingLevel: 2, soberToday: true, notes: "" },
  { date: dateNDaysAgo(5), mood: 4, cravingLevel: 1, soberToday: true, notes: "" },
  { date: dateNDaysAgo(4), mood: 3, cravingLevel: 2, soberToday: true, notes: "" },
  { date: dateNDaysAgo(3), mood: 5, cravingLevel: 1, soberToday: true, notes: "Best day in a while." },
  { date: dateNDaysAgo(2), mood: 4, cravingLevel: 2, soberToday: true, notes: "" },
  { date: dateNDaysAgo(1), mood: 4, cravingLevel: 1, soberToday: true, notes: "" },
];

function soberDaysFromStart(startDate) {
  if (!startDate) return null;
  const start = new Date(`${startDate}T12:00:00`);
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function MoodTrend({ checkIns }) {
  const last14 = useMemo(
    () => [...checkIns].sort((a, b) => a.date.localeCompare(b.date)).slice(-14),
    [checkIns]
  );

  if (last14.length < 2) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
        <BarChart2 className="w-4 h-4 text-teal-600" /> Mood trend (last {last14.length} check-ins)
      </h2>
      <div className="flex items-end gap-2 h-28">
        {last14.map((c) => (
          <div key={c.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group">
            <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {c.mood}/5
            </span>
            <div
              title={`${formatDate(c.date)} — mood ${c.mood}/5`}
              className="w-full rounded-t-md bg-gradient-to-t from-teal-500 to-teal-300 transition-all"
              style={{ height: `${(c.mood / 5) * 100}%`, minHeight: 6 }}
            />
            <span
              className={`w-1.5 h-1.5 rounded-full ${c.soberToday ? "bg-teal-500" : "bg-rose-400"}`}
              title={c.soberToday ? "Sober" : "Not sober"}
            />
            <span className="text-[10px] text-gray-400">{formatDate(c.date)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, sub, Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-tight">{value}</div>
      <div className="text-xs font-semibold text-gray-900 mt-0.5">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5 leading-tight">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  // TODO(backend): seed from getRecentCheckIns() / getTodayCheckIn() instead of the mock array.
  const checkIns = MOCK_CHECKINS;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCheckIn = checkIns.find((c) => c.date === todayStr) ?? null;

  const soberDays = soberDaysFromStart(user?.sobriety_start);

  const streak = useMemo(() => {
    const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    let prev = new Date();
    for (const ci of sorted) {
      const d = new Date(`${ci.date}T12:00:00`);
      const diff = Math.round((prev.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 1) break;
      if (ci.soberToday) {
        count++;
        prev = d;
      } else break;
    }
    return count;
  }, [checkIns]);

  const moodAvg = useMemo(() => {
    if (checkIns.length === 0) return null;
    const last7 = [...checkIns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    return (last7.reduce((s, c) => s + c.mood, 0) / last7.length).toFixed(1);
  }, [checkIns]);

  const soberPercentage = useMemo(() => {
    if (checkIns.length === 0) return null;
    const last30 = [...checkIns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
    return Math.round((last30.filter((c) => c.soberToday).length / last30.length) * 100);
  }, [checkIns]);

  // TODO(backend): replace with getEarnedMilestones(); today it's derived client-side from soberDays.
  const earnedDays = soberDays !== null ? MILESTONE_DAYS.filter((d) => soberDays >= d) : [];
  const nextMilestone = MILESTONE_DAYS.find((d) => soberDays !== null && d > soberDays);

  const greeting = greetingForNow();
  const displayName = user?.username ?? "Friend";

  const quickLinks = [
    { to: "/groups", Icon: Users, label: "Support Groups", desc: "Find your community", color: "text-teal-600" },
    { to: "/journal", Icon: BookOpen, label: "Journal", desc: "Reflect on your day", color: "text-violet-500" },
    { to: "/resources", Icon: MapPin, label: "Find Resources", desc: "Nearby services", color: "text-emerald-600" },
    { to: "/crisis", Icon: Phone, label: "Crisis Support", desc: "Help is here 24/7", color: "text-rose-500" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {displayName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        {todayCheckIn ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked in today
          </span>
        ) : (
          <Link
            to="/check-in"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white bg-teal-600
              hover:bg-teal-500 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5" /> Check In
          </Link>
        )}
      </div>

      {/* Setup prompt */}
      {!user?.sobriety_start && (
        <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Set your recovery start date</p>
              <p className="text-xs text-gray-500">Track your sober days and unlock milestone badges</p>
            </div>
          </div>
          <Link
            to="/milestones"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            Set date
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Sober Days"
          value={soberDays !== null ? String(soberDays) : "—"}
          sub={
            soberDays !== null
              ? `Since ${new Date(`${user.sobriety_start}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : "Set start date above"
          }
          Icon={Flame}
          color="text-amber-500"
          bg="bg-amber-50"
        />
        <StatCard
          label="Sober Streak"
          value={`${streak}d`}
          sub={`${streak} consecutive sober days`}
          Icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          label="Avg Mood"
          value={moodAvg ? `${moodAvg}/5` : "—"}
          sub="Last 7 check-ins"
          Icon={Heart}
          color="text-rose-500"
          bg="bg-rose-50"
        />
        <StatCard
          label="Sober Rate"
          value={soberPercentage !== null ? `${soberPercentage}%` : "—"}
          sub="Last 30 days"
          Icon={TrendingUp}
          color="text-teal-600"
          bg="bg-teal-50"
        />
      </div>

      {/* Mood trend */}
      <MoodTrend checkIns={checkIns} />

      {/* Next milestone progress */}
      {nextMilestone !== undefined && soberDays !== null && (
        <section className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-gray-900">Next milestone: {nextMilestone} days</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-teal-700">
                {soberDays} / {nextMilestone}
              </span>
              <span className="text-xs text-gray-500">({nextMilestone - soberDays} to go)</span>
            </div>
          </div>
          <div className="h-2.5 bg-white/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, (soberDays / nextMilestone) * 100)}%` }}
            />
          </div>
        </section>
      )}

      {/* Earned badges */}
      {earnedDays.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <TrendingUp className="w-4 h-4 text-teal-600" /> Earned badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {earnedDays.map((d) => {
              const meta = MILESTONE_META[d];
              const Icon = meta.Icon;
              return (
                <div key={d} className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${meta.iconBg}`}>
                  <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  <span className="text-xs font-medium text-gray-800">{d} days</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Today's check-in status */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Heart className="w-4 h-4 text-rose-500" /> Today's check-in
        </h2>
        {todayCheckIn ? (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm">
              {todayCheckIn.soberToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Sober today</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-600 font-medium">Not sober today</span>
                </>
              )}
            </div>
            <span className="text-sm text-gray-500">
              Mood: <strong className="text-gray-900">{todayCheckIn.mood}/5</strong>
            </span>
            <span className="text-sm text-gray-500">
              Cravings: <strong className="text-gray-900">{todayCheckIn.cravingLevel}/5</strong>
            </span>
            {todayCheckIn.notes && (
              <p className="text-xs text-gray-500 italic w-full">"{todayCheckIn.notes}"</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-gray-500">You haven't checked in yet today. How are you feeling?</p>
            <Link
              to="/check-in"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              Check in now
            </Link>
          </div>
        )}
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to} className="cursor-pointer group">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all p-4 flex items-center gap-3 h-full">
              <link.Icon className={`w-5 h-5 ${link.color} flex-shrink-0`} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 leading-tight">{link.label}</div>
                <div className="text-xs text-gray-500">{link.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}