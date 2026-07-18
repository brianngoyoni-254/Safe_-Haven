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



const serif = { fontFamily: "'Fraunces', serif" };

const MILESTONES = [
  { days: 7, Icon: Sprout, color: "#0d9668", bg: "#E3F5EC" },
  { days: 30, Icon: Leaf, color: "#0D6E64", bg: "#D8E8E4" },
  { days: 90, Icon: TreePine, color: "#0e7c8c", bg: "#DDF0F3" },
  { days: 180, Icon: Star, color: "#1c7fa8", bg: "#DFEFF7" },
  { days: 365, Icon: Trophy, color: "#C98A3E", bg: "#F1DEBC" },
];

function formatDate(dateStr, options) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", options);
}

// Streak ring (signature dashboard element)
function StreakRing({ soberDays, streak, nextMilestone }) {
  const size = 168;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = nextMilestone
    ? Math.min(1, soberDays / nextMilestone.days)
    : 1;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#12302E1A" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D6E64" />
            <stop offset="100%" stopColor="#C98A3E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Flame size={18} className="text-[#C98A3E] mb-1" />
        <div className="text-[32px] leading-none font-bold text-[#12302E] tabular-nums" style={serif}>
          {soberDays !== null ? soberDays : "—"}
        </div>
        <div className="text-[11px] font-medium text-[#4A544C] mt-1">sober days</div>
      </div>
    </div>
  );
}

function MoodChart({ checkIns }) {
  const last14 = [...checkIns].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  const data = last14.map((c) => ({
    date: formatDate(c.date, { month: "short", day: "numeric" }),
    mood: c.mood,
  }));

  if (data.length < 2) return null;

  return (
    <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#12302E] mb-3 tracking-tight">
        <BarChart2 className="w-4 h-4 text-[#0D6E64]" /> Mood trend
        <span className="text-[#4A544C]/60 font-medium">· last 14 days</span>
      </h2>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D6E64" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0D6E64" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[1, 5]} ticks={[1, 3, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              border: "1px solid #12302E1A",
              borderRadius: 10,
              background: "#F7F4EC",
            }}
            formatter={(v) => [v, "Mood"]}
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#0D6E64"
            strokeWidth={2}
            fill="url(#moodGrad)"
            dot={{ r: 3, fill: "#C98A3E" }}
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

  const secondaryStats = [
    {
      label: "Sober Streak",
      value: `${streak}d`,
      Icon: CheckCircle2,
      color: "#0d9668",
      bg: "#E3F5EC",
      sub: `${streak} consecutive sober days`,
    },
    {
      label: "Avg Mood",
      value: moodAvg ? `${moodAvg}/5` : "—",
      Icon: Heart,
      color: "#c2417a",
      bg: "#FCE7EF",
      sub: "Last 7 check-ins",
    },
    {
      label: "Sober Rate",
      value: soberPercentage !== null ? `${soberPercentage}%` : "—",
      Icon: TrendingUp,
      color: "#0D6E64",
      bg: "#D8E8E4",
      sub: "Last 30 days",
    },
  ];

  const quickLinks = [
    {
      to: "/groups",
      Icon: Users,
      label: "Support Groups",
      desc: "Find your community",
      color: "#0D6E64",
      bg: "#D8E8E4",
    },
    {
      to: "/journal",
      Icon: BookOpen,
      label: "Journal",
      desc: "Reflect on your day",
      color: "#7c5cbf",
      bg: "#EEE9FA",
    },
    {
      to: "/resources",
      Icon: MapPin,
      label: "Find Resources",
      desc: "Nearby services",
      color: "#0d9668",
      bg: "#E3F5EC",
    },
    {
      to: "/crisis",
      Icon: Phone,
      label: "Crisis Support",
      desc: "Help is here 24/7",
      color: "#c2417a",
      bg: "#FCE7EF",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[30px] leading-tight font-medium text-[#12302E] tracking-tight" style={serif}>
            {greeting}, {user?.username ?? "Friend"}
          </h1>
          <p className="flex items-center gap-1.5 text-[#4A544C] text-sm mt-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#4A544C]/60" />
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        {!todayCheckIn ? (
          <Link
            to="/check-in"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
              shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5" /> Check In
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#0D6E64] bg-[#D8E8E4] border border-[#0D6E64]/15 rounded-full px-3.5 py-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked in today
          </span>
        )}
      </div>

      {/* Setup prompt */}
      {!user?.sobriety_start && (
        <section className="bg-[#D8E8E4] border border-[#0D6E64]/15 rounded-[20px] p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F7F4EC] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Calendar className="w-5 h-5 text-[#0D6E64]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#12302E] tracking-tight">Set your recovery start date</p>
              <p className="text-xs text-[#4A544C] mt-0.5">Track your sober days and unlock milestone badges</p>
            </div>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
              shadow-sm hover:brightness-110 transition-all cursor-pointer flex-shrink-0"
          >
            Set date
          </Link>
        </section>
      )}

      {/* Recovery snapshot — signature hero card */}
      <section className="bg-[#12302E] rounded-[24px] p-6 md:p-7 flex flex-col md:flex-row items-center gap-7 overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle at 85% 20%, #C98A3E 0%, transparent 40%)" }}
        />
        <StreakRing soberDays={soberDays} streak={streak} nextMilestone={nextMilestone} />

        <div className="relative flex-1 w-full min-w-0">
          {soberDays !== null ? (
            <>
              <p className="text-sm text-[#D8E8E4] mb-1">
                Since{" "}
                <strong className="text-[#F7F4EC]">
                  {formatDate(user.sobriety_start, { month: "long", day: "numeric", year: "numeric" })}
                </strong>
              </p>
              {nextMilestone ? (
                <>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
                    <span className="text-sm font-semibold text-[#F7F4EC]">
                      Next milestone: {nextMilestone.days} days
                    </span>
                    <span className="text-xs text-[#F1DEBC] font-medium">
                      {nextMilestone.days - soberDays} to go
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (soberDays / nextMilestone.days) * 100)}%`,
                        background: "linear-gradient(90deg, #0D6E64, #C98A3E)",
                        transition: "width 0.7s ease-out",
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#F1DEBC] font-medium">
                  Every milestone earned. Extraordinary — truly.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#F7F4EC] mb-1">No start date set yet</p>
              <p className="text-sm text-[#D8E8E4]">
                Add your recovery start date to begin tracking days and unlocking milestone badges.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {secondaryStats.map((stat) => (
          <div key={stat.label} className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: stat.bg }}
            >
              <stat.Icon className="w-[18px] h-[18px]" style={{ color: stat.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-[22px] leading-none font-bold text-[#12302E] tabular-nums tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-[#12302E]/80 mt-1.5">{stat.label}</div>
              <div className="text-[11px] text-[#4A544C]/70 mt-0.5 leading-snug truncate">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mood chart */}
      {checkIns.length >= 2 && <MoodChart checkIns={checkIns} />}

      {/* Earned badges */}
      {earnedMilestones.length > 0 && (
        <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#12302E] mb-3.5 tracking-tight">
            <TrendingUp className="w-4 h-4 text-[#0D6E64]" /> Earned badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {earnedMilestones.map((m) => (
              <div
                key={m.days}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2"
                style={{ background: m.bg }}
              >
                <m.Icon className="w-4 h-4" style={{ color: m.color }} />
                <span className="text-xs font-semibold text-[#12302E]">{m.days} days</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Today check-in status */}
      <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#12302E] mb-3.5 tracking-tight">
          <Heart className="w-4 h-4 text-[#c2417a]" /> Today's check-in
        </h2>
        {todayCheckIn ? (
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm">
              {todayCheckIn.soberToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#0d9668]" />
                  <span className="text-[#0d9668] font-semibold">Sober today</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-[#c2417a]" />
                  <span className="text-[#c2417a] font-semibold">Not sober today</span>
                </>
              )}
            </div>
            <span className="text-sm text-[#4A544C]">
              Mood: <strong className="text-[#12302E] font-semibold">{todayCheckIn.mood}/5</strong>
            </span>
            <span className="text-sm text-[#4A544C]">
              Cravings: <strong className="text-[#12302E] font-semibold">{todayCheckIn.cravingLevel}/5</strong>
            </span>
            {todayCheckIn.notes && (
              <p className="text-xs text-[#4A544C] italic w-full">{todayCheckIn.notes}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-[#4A544C]">You haven't checked in yet today. How are you feeling?</p>
            <Link
              to="/check-in"
              className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
                shadow-sm hover:brightness-110 transition-all cursor-pointer flex-shrink-0"
            >
              Check in now
            </Link>
          </div>
        )}
      </section>

      {/* Support Safe Haven — warm, low-pressure donation nudge.
          Placed after the core recovery actions (check-in, badges) so it
          never competes with them, but before quick links so it isn't lost
          at the very bottom of the page. */}
      <section className="bg-[#F1DEBC]/45 border border-[#C98A3E]/25 rounded-[20px] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F7F4EC] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Heart className="w-5 h-5 text-[#c2417a]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#12302E] tracking-tight">Enjoying Safe Haven?</p>
            <p className="text-xs text-[#4A544C] mt-0.5">
              A small M-Pesa donation helps keep it free for everyone in recovery.
            </p>
          </div>
        </div>
        <Link
          to="/donations"
          className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#12302E] bg-[#C98A3E]
            shadow-sm hover:brightness-105 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer flex-shrink-0"
        >
          Support us
        </Link>
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to} className="cursor-pointer group">
            <div className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm hover:shadow-md hover:border-[#0D6E64]/30 hover:-translate-y-0.5 transition-all duration-150 h-full p-4 flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: link.bg }}
              >
                <link.Icon className="w-[18px] h-[18px]" style={{ color: link.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#12302E] leading-tight tracking-tight">
                  {link.label}
                </div>
                <div className="text-xs text-[#4A544C] mt-0.5">{link.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#12302E]/30 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}