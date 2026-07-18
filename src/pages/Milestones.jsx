import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../App";
import { milestonesApi, usersApi } from "../api";
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

// Recovery start date lives on the user record (sobriety_start), set/updated
// via PUT /api/users/me/sobriety-start. Earned badges are synced server-side
// (GET /api/milestones) so each one keeps a fixed achieved-on date once
// unlocked — soberDays below still drives which badges *show* as unlocked,
// since that's identical to what the backend just computed.



const serif = { fontFamily: "'Fraunces', serif" };

const MILESTONES = [
  {
    days: 7,
    Icon: Sprout,
    label: "First Week",
    desc: "7 sober days",
    motivation: "The hardest week is behind you.",
    color: "#0d9668",
    bg: "#E3F5EC",
  },
  {
    days: 30,
    Icon: Leaf,
    label: "One Month",
    desc: "30 days of courage",
    motivation: "Your body is healing. Your mind is clearing.",
    color: "#0D6E64",
    bg: "#D8E8E4",
  },
  {
    days: 90,
    Icon: TreePine,
    label: "Three Months",
    desc: "90 days of growth",
    motivation: "New routines are forming. Keep going.",
    color: "#0e7c8c",
    bg: "#DDF0F3",
  },
  {
    days: 180,
    Icon: Star,
    label: "Six Months",
    desc: "180 days of strength",
    motivation: "Half a year. You are transforming.",
    color: "#1c7fa8",
    bg: "#DFEFF7",
  },
  {
    days: 365,
    Icon: Trophy,
    label: "One Full Year",
    desc: "365 days — extraordinary",
    motivation: "A complete year. You are an inspiration.",
    color: "#C98A3E",
    bg: "#F1DEBC",
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
    <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        <div className="w-12 h-12 rounded-xl bg-[#D8E8E4] flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-[#0D6E64]" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="font-semibold text-[#12302E] text-sm tracking-tight">Set your recovery start date</h2>
          <p className="text-xs text-[#4A544C] mt-0.5">
            Track sober days and unlock milestone badges.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={value}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 sm:flex-none rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white
              focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
          />
          <button
            type="button"
            disabled={!value}
            onClick={() => onSave(value)}
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
              shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 whitespace-nowrap"
          >
            Save date
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Milestones() {
  const { user, updateUser } = useAuth();

  const recoveryStartDate = user?.sobriety_start ?? null;
  const [error, setError] = useState("");

  // Sync earned badges server-side whenever there's a start date to check
  // against — locks in achieved_at for any threshold newly crossed. The UI
  // itself doesn't need the response yet (isUnlocked below is still derived
  // from soberDays), so this is fire-and-forget.
  useEffect(() => {
    if (!recoveryStartDate) return;
    milestonesApi.list().catch(() => {
      // Non-fatal — badges will just sync next time this page loads.
    });
  }, [recoveryStartDate]);

  const soberDays = useMemo(() => {
    if (!recoveryStartDate) return null;
    const start = new Date(`${recoveryStartDate}T12:00:00`);
    const diff = Date.now() - start.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [recoveryStartDate]);

  const handleSaveDate = async (dateStr) => {
    setError("");
    try {
      await usersApi.setSobrietyStart(dateStr);
      updateUser({ sobriety_start: dateStr });
    } catch {
      setError("Couldn't save your start date. Please try again.");
    }
  };

  const completedCount = soberDays === null
    ? 0
    : MILESTONES.filter((m) => soberDays >= m.days).length;

  const CurrentIcon = soberDays !== null ? currentTierIcon(soberDays) : Sprout;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] leading-tight font-medium text-[#12302E] tracking-tight" style={serif}>
          Milestones
        </h1>
        <p className="text-[#4A544C] text-sm mt-1.5">Every day counts. Celebrate every victory.</p>
      </div>

      {/* Summary bar */}
      {error && (
        <p className="text-sm text-[#8a2340] bg-[#FCE7EF] border border-[#8a2340]/15 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      {soberDays !== null ? (
        <section className="bg-[#12302E] rounded-[24px] overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{ background: "radial-gradient(circle at 85% 20%, #C98A3E 0%, transparent 40%)" }}
          />
          <div className="relative p-6 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <CurrentIcon className="w-7 h-7 text-[#F1DEBC]" />
              </div>
              <div>
                <div className="text-[32px] leading-none font-bold text-[#F7F4EC] tabular-nums" style={serif}>
                  {soberDays}
                </div>
                <div className="text-sm text-[#D8E8E4] mt-1">days sober</div>
              </div>
            </div>

            <div className="flex-1 min-w-[160px]">
              <div className="flex justify-between text-xs text-[#D8E8E4] mb-1.5">
                <span>{completedCount} of {MILESTONES.length} milestones</span>
                <span>{Math.round((completedCount / MILESTONES.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(completedCount / MILESTONES.length) * 100}%`,
                    background: "linear-gradient(90deg, #0D6E64, #C98A3E)",
                    transition: "width 0.7s ease-out",
                  }}
                />
              </div>
            </div>

            <div className="text-sm text-[#D8E8E4]">
              Since <strong className="text-[#F7F4EC]">{formatDate(recoveryStartDate)}</strong>
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
              className="bg-[#F7F4EC] rounded-[20px] border shadow-sm overflow-hidden h-full flex flex-col"
              style={{ borderColor: isUnlocked ? `${m.color}40` : "rgba(18,48,46,0.10)" }}
            >
              <div
                className="h-1.5"
                style={{ background: isUnlocked ? m.color : "#EFEAE0" }}
              />
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: isUnlocked ? m.bg : "#EFEAE0" }}
                  >
                    {isUnlocked ? (
                      <Icon className="w-6 h-6" style={{ color: m.color }} />
                    ) : (
                      <Lock className="w-5 h-5 text-[#4A544C]/50" />
                    )}
                  </div>
                  {isUnlocked && (
                    <span
                      className="flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1"
                      style={{ color: m.color, background: m.bg }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Earned
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-[#12302E] tracking-tight">{m.label}</h3>
                  <p className="text-sm text-[#4A544C]">{m.desc}</p>
                  {isUnlocked && (
                    <p className="text-xs mt-1 italic" style={{ color: m.color }}>{m.motivation}</p>
                  )}
                </div>

                {!isUnlocked && soberDays !== null && (
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-[#4A544C] mb-1">
                      <span>{soberDays} / {m.days} days</span>
                      <span>{m.days - soberDays} to go</span>
                    </div>
                    <div className="h-1.5 bg-[#EFEAE0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progress}%`, background: m.color, transition: "width 0.7s ease-out" }}
                      />
                    </div>
                  </div>
                )}

                {soberDays === null && (
                  <p className="text-xs text-[#4A544C]/60 italic mt-auto">
                    Set your start date to track progress
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational section */}
      <section className="bg-[#D8E8E4]/60 rounded-[20px] border border-[#0D6E64]/15 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#12302E] mb-3 tracking-tight">
          <TrendingUp className="w-4 h-4 text-[#0D6E64]" /> Remember
        </h2>
        <div className="space-y-2">
          {REMINDERS.map((quote, i) => (
            <p key={i} className="text-sm text-[#4A544C] flex gap-2">
              <span className="text-[#0D6E64] font-bold mt-0.5">•</span> {quote}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}