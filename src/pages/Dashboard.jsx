import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import {
  Shield,
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
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// TODO(backend): replace all mock data below with real API calls, e.g.
//   import { getRecentCheckIns, getEarnedMilestones, getTodayCheckIn } from "../api";
// getRecentCheckIns()   -> GET /api/checkins/recent  -> [{ date, mood, cravingLevel, soberToday, notes }]
// getTodayCheckIn()     -> GET /api/checkins/today    -> { mood, cravingLevel, soberToday, notes } | null
// Milestones are derived from soberDays on the client (same approach as Milestones.jsx)
// rather than fetched separately, so the two pages always agree.

const MILESTONES = [
  { days: 7, Icon: Sprout, color: "text-emerald-600", bg: "bg-emerald-50" },
  { days: 30, Icon: Leaf, color: "text-teal-600", bg: "bg-teal-50" },
  { days: 90, Icon: TreePine, color: "text-cyan-600", bg: "bg-cyan-50" },
  { days: 180, Icon: Star, color: "text-sky-600", bg: "bg-sky-50" },
  { days: 365, Icon: Trophy, color: "text-emerald-700", bg: "bg-emerald-50" },
];

function formatDate(dateStr, options) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", options);
}

function MoodChart({ checkIns }) {
  const last14 = [...checkIns].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  const data = last14.map((c) => ({
    date: formatDate(c.date, { month: "short", day: "numeric" }),
    mood: c.mood,
  }));

  if (data.length < 2) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3 tracking-tight">
        <BarChart2 className="w-4 h-4 text-teal-600" /> Mood trend
        <span className="text-gray-400 font-medium">· last 14 days</span>
      </h2>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 3, 5]}
            tick={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
            }}
            formatter={(v) => [v, "Mood"]}
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#0d9488"
            strokeWidth={2}
            fill="url(#moodGrad)"
            dot={{ r: 3, fill: "#0d9488" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  // TODO(backend): seed from getRecentCheckIns() / getTodayCheckIn() instead of these mocks.
  const [checkIns] = useState([]);
  const [todayCheckIn] = useState(null);

  const soberDays = useMemo(() => {
    if (!user?.sobriety_start) return null;
    const start = new Date(`${user.sobriety_start}T12:00:00`);
    return Math.max(0, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [user?.sobriety_start]);

  const streak = useMemo(() => {
    if (checkIns.length === 0) return 0;
    const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    let prev = new Date();
    for (const ci of sorted) {
      const d = new Date(`${ci.date}T12:00:00`);
      const diff = Math.round((prev.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 1 || !ci.soberToday) break;
      count++;
      prev = d;
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
    const last30 = checkIns.slice(0, 30);
    return Math.round((last30.filter((c) => c.soberToday).length / last30.length) * 100);
  }, [checkIns]);

  const nextMilestone = soberDays !== null ? MILESTONES.find((m) => m.days > soberDays) : undefined;
  const earnedMilestones = soberDays !== null ? MILESTONES.filter((m) => soberDays >= m.days) : [];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const stats = [
    {
      label: "Sober Days",
      value: soberDays !== null ? String(soberDays) : "—",
      Icon: Flame,
      color: "text-amber-500",
      bg: "bg-amber-50",
      sub: soberDays !== null
        ? `Since ${formatDate(user.sobriety_start, { month: "short", day: "numeric", year: "numeric" })}`
        : "Set start date in profile",
    },
    {
      label: "Sober Streak",
      value: `${streak}d`,
      Icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: `${streak} consecutive sober days`,
    },
    {
      label: "Avg Mood",
      value: moodAvg ? `${moodAvg}/5` : "—",
      Icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-50",
      sub: "Last 7 check-ins",
    },
    {
      label: "Sober Rate",
      value: soberPercentage !== null ? `${soberPercentage}%` : "—",
      Icon: TrendingUp,
      color: "text-teal-600",
      bg: "bg-teal-50",
      sub: "Last 30 days",
    },
  ];

  const quickLinks = [
    {
      to: "/groups",
      Icon: Users,
      label: "Support Groups",
      desc: "Find your community",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      to: "/journal",
      Icon: BookOpen,
      label: "Journal",
      desc: "Reflect on your day",
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
    {
      to: "/resources",
      Icon: MapPin,
      label: "Find Resources",
      desc: "Nearby services",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      to: "/crisis",
      Icon: Phone,
      label: "Crisis Support",
      desc: "Help is here 24/7",
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
  ];

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[28px] leading-tight font-extrabold text-gray-900 tracking-tight">
              {greeting}, {user?.username ?? "Friend"}
            </h1>
            <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {!todayCheckIn ? (
            <Link
              to="/check-in"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600
                shadow-sm shadow-teal-600/20 hover:bg-teal-500 hover:shadow-md transition-all duration-150 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5" /> Check In
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3.5 py-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked in today
            </span>
          )}
        </div>

        {/* Setup prompt */}
        {!user?.sobriety_start && (
          <section className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 tracking-tight">
                  Set your recovery start date
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Track your sober days and unlock milestone badges
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600
                shadow-sm hover:bg-teal-500 transition-colors cursor-pointer flex-shrink-0"
            >
              Set date
            </Link>
          </section>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.Icon className={`w-[18px] h-[18px] ${stat.color}`} />
              </div>
              <div className="text-[26px] leading-none font-extrabold text-gray-900 tabular-nums tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-2">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-snug">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Mood chart */}
        {checkIns.length >= 2 && <MoodChart checkIns={checkIns} />}

        {/* Next milestone progress */}
        {nextMilestone && soberDays !== null && (
          <section className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 p-5">
            <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-gray-900 tracking-tight">
                  Next milestone: {nextMilestone.days} days
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-teal-700 tabular-nums">
                  {soberDays} / {nextMilestone.days}
                </span>
                <span className="text-xs text-gray-500">({nextMilestone.days - soberDays} to go)</span>
              </div>
            </div>
            <div className="h-2.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, (soberDays / nextMilestone.days) * 100)}%` }}
              />
            </div>
          </section>
        )}

        {/* Earned badges */}
        {earnedMilestones.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3.5 tracking-tight">
              <TrendingUp className="w-4 h-4 text-teal-600" /> Earned badges
            </h2>
            <div className="flex flex-wrap gap-3">
              {earnedMilestones.map((m) => (
                <div
                  key={m.days}
                  className={`flex items-center gap-2 ${m.bg} rounded-xl px-3.5 py-2`}
                >
                  <m.Icon className={`w-4 h-4 ${m.color}`} />
                  <span className="text-xs font-semibold text-gray-900">{m.days} days</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today check-in status */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3.5 tracking-tight">
            <Heart className="w-4 h-4 text-rose-500" /> Today's check-in
          </h2>
          {todayCheckIn ? (
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm">
                {todayCheckIn.soberToday ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Sober today</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-600 font-semibold">Not sober today</span>
                  </>
                )}
              </div>
              <span className="text-sm text-gray-500">
                Mood: <strong className="text-gray-900 font-semibold">{todayCheckIn.mood}/5</strong>
              </span>
              <span className="text-sm text-gray-500">
                Cravings:{" "}
                <strong className="text-gray-900 font-semibold">{todayCheckIn.cravingLevel}/5</strong>
              </span>
              {todayCheckIn.notes && (
                <p className="text-xs text-gray-500 italic w-full">{todayCheckIn.notes}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-gray-500">You haven't checked in yet today. How are you feeling?</p>
              <Link
                to="/check-in"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600
                  shadow-sm hover:bg-teal-500 transition-colors cursor-pointer flex-shrink-0"
              >
                Check in now
              </Link>
            </div>
          )}
        </section>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className="cursor-pointer group">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-150 h-full p-4 flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center flex-shrink-0`}>
                  <link.Icon className={`w-[18px] h-[18px] ${link.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 leading-tight tracking-tight">
                    {link.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{link.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}