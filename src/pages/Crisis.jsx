import { useEffect, useRef, useState } from "react";
import {
  Siren,
  Phone,
  LifeBuoy,
  Pill,
  HeartHandshake,
  Baby,



  MessageCircle,
  Wind,
  ShieldAlert,
} from "lucide-react";


// TODO(backend): this is static reference content for now — no auth, no API
// calls needed. If you later let orgs self-report new hotlines, this becomes
// GET /api/crisis-resources instead of a hardcoded array.
// Numbers below are real, published hotlines for Kenya, gathered from NACADA,
// Childline Kenya, GVRC, Befrienders Kenya, EMKF, and Niskize's own public
// contact pages. Verify periodically — hotline numbers do change over time.

const EMERGENCY_LINES = [
  {
    id: "police",
    name: "Police / Ambulance Emergency",
    numbers: ["999", "112"],
    desc: "National emergency line for police, fire, and ambulance dispatch.",
  },
  {
    id: "redcross",
    name: "Kenya Red Cross Emergency",
    numbers: ["1199"],
    desc: "Kenya Red Cross Society emergency response and ambulance services.",
  },
];

const SUPPORT_CATEGORIES = [
  {
    id: "mental-health",
    title: "Suicide & Mental Health Crisis",
    Icon: LifeBuoy,
    color: "teal",
    lines: [
      {
        name: "Befrienders Kenya",
        numbers: ["0722 178 177"],
        tel: "+254722178177",
        whatsapp: "254722178177",
        desc: "Free, confidential emotional support by phone, SMS, and WhatsApp for anyone in distress or having thoughts of suicide.",
      },
      {
        name: "EMKF Suicide Prevention & Crisis Helpline",
        numbers: ["0800 723 253"],
        tel: "0800723253",
        desc: "Toll-free, nationwide crisis line run by Emergency Medicine Kenya Foundation.",
      },
      {
        name: "Niskize Counseling Helpline",
        numbers: ["0900 620 800"],
        tel: "0900620800",
        desc: "24-hour call center offering counseling for distress, grief, and substance use.",
      },
    ],
  },
  {
    id: "substance-abuse",
    title: "Alcohol & Drug Abuse",
    Icon: Pill,
    color: "cyan",
    lines: [
      {
        name: "NACADA National Helpline",
        numbers: ["1192"],
        tel: "1192",
        desc: "Free, confidential, 24/7 counseling and referrals for drug and alcohol use, run by the National Authority for the Campaign Against Alcohol and Drug Abuse.",
      },
    ],
  },
  {
    id: "gbv",
    title: "Gender-Based Violence",
    Icon: HeartHandshake,
    color: "rose",
    lines: [
      {
        name: "National GBV Hotline",
        numbers: ["1195"],
        tel: "1195",
        desc: "Toll-free national hotline for survivors of gender-based violence, available to all genders.",
      },
      {
        name: "Gender Violence Recovery Centre (GVRC)",
        numbers: ["0719 638 006", "0709 667 000"],
        tel: "0719638006",
        desc: "24/7 free medical treatment and psychosocial support for survivors, run by Nairobi Women's Hospital.",
      },
    ],
  },
  {
    id: "child-protection",
    title: "Child Protection",
    Icon: Baby,
    color: "violet",
    lines: [
      {
        name: "Childline Kenya",
        numbers: ["116"],
        tel: "116",
        desc: "Kenya's only 24-hour, toll-free helpline for children experiencing abuse or distress. Also open to adults reporting on a child's behalf.",
      },
    ],
  },
];

const COLOR_STYLES = {
  teal: {
    iconBg: "bg-[#D8E8E4]",
    iconColor: "text-[#0D6E64]",
    badge: "bg-[#D8E8E4] text-[#0D6E64] border-[#0D6E64]/15",
    button: "bg-[#0D6E64] hover:brightness-110",
  },
  cyan: {
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-100",
    button: "bg-cyan-600 hover:bg-cyan-500",
  },
  rose: {
    iconBg: "bg-[#FCE7EF]",
    iconColor: "text-[#c2417a]",
    badge: "bg-[#FCE7EF] text-[#8a2340] border-[#c2417a]/15",
    button: "bg-[#c2417a] hover:brightness-110",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    button: "bg-violet-600 hover:bg-violet-500",
  },
};

function telHref(raw) {
  return `tel:${raw.replace(/\s+/g, "")}`;
}

// Simple, non-strenuous breathing pacer: 4s in, 4s hold, 4s out, repeat.
// No cold/pain-based grounding techniques — just a visual breathing guide.
function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("in"); // "in" | "hold" | "out"
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const sequence = [
      { phase: "in", duration: 4000 },
      { phase: "hold", duration: 4000 },
      { phase: "out", duration: 4000 },
    ];
    let i = 0;
    const step = () => {
      setPhase(sequence[i].phase);
      timeoutRef.current = setTimeout(() => {
        i = (i + 1) % sequence.length;
        step();
      }, sequence[i].duration);
    };
    step();
    return () => clearTimeout(timeoutRef.current);
  }, [running]);

  const label = { in: "Breathe in…", hold: "Hold…", out: "Breathe out…" }[phase];
  const scale = phase === "in" ? "scale-100" : phase === "out" ? "scale-50" : "scale-100";

  return (
    <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-6 flex flex-col items-center text-center gap-4">
      <div className="flex items-center gap-2 text-[#12302E] font-semibold text-sm">
        <Wind className="w-4 h-4 text-[#0D6E64]" /> A moment to breathe
      </div>

      <div className="relative w-32 h-32 flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full bg-[#D8E8E4] transition-transform duration-[4000ms] ease-in-out ${
            running ? scale : "scale-75"
          }`}
        />
        <div className="absolute inset-4 rounded-full bg-[#0D6E64]/20" />
        <span className="relative text-sm font-medium text-[#0D6E64]">
          {running ? label : "Ready"}
        </span>
      </div>

      <p className="text-xs text-[#4A544C] max-w-xs">
        Four seconds in, four seconds hold, four seconds out. Repeat for as long as it helps.
      </p>

      <button
        onClick={() => setRunning((r) => !r)}
        className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#F7F4EC] bg-[#0D6E64]
          shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
      >
        {running ? "Stop" : "Start breathing exercise"}
      </button>
    </section>
  );
}

function HotlineCard({ line, color }) {
  const styles = COLOR_STYLES[color];
  return (
    <div className="rounded-xl border border-[#12302E]/10 bg-[#F7F4EC]/60 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <h3 className="font-semibold text-[#12302E] text-sm">{line.name}</h3>
        <div className="flex gap-1.5 flex-wrap">
          {line.numbers.map((n) => (
            <span key={n} className={`text-xs px-2 py-0.5 rounded-full border ${styles.badge}`}>
              {n}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs text-[#4A544C]">{line.desc}</p>
      <div className="flex gap-2 pt-1">
        <a href={telHref(line.tel)} className="flex-1">
          <span
            className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer ${styles.button}`}
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </span>
        </a>
        {line.whatsapp && (
          <a
            href={`https://wa.me/${line.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <span className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

const serif = { fontFamily: "'Fraunces', serif" };

export default function Crisis() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] leading-tight font-medium text-[#12302E] tracking-tight" style={serif}>
          Crisis Support
        </h1>
        <p className="text-[#4A544C] text-sm mt-1.5">
          You don't have to face this alone. Free, confidential help is available right now.
        </p>
      </div>

      {/* Immediate danger callout */}
      <section className="bg-[#FCE7EF] border border-[#c2417a]/25 rounded-[20px] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#c2417a]" />
          <h2 className="font-semibold text-[#8a2340] text-sm tracking-tight">If you or someone else is in immediate danger</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EMERGENCY_LINES.map((line) => (
            <div key={line.id} className="bg-[#F7F4EC] rounded-[18px] border border-[#c2417a]/15 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Siren className="w-4 h-4 text-[#c2417a]" />
                <h3 className="font-semibold text-[#12302E] text-sm">{line.name}</h3>
              </div>
              <p className="text-xs text-[#4A544C] mb-3">{line.desc}</p>
              <div className="flex gap-2 flex-wrap">
                {line.numbers.map((n) => (
                  <a key={n} href={telHref(n)} className="flex-1 min-w-[100px]">
                    <span className="flex items-center justify-center gap-1.5 h-10 rounded-lg text-sm font-semibold text-white bg-[#c2417a] hover:brightness-110 transition-colors cursor-pointer">
                      <Phone className="w-4 h-4" /> {n}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reassurance */}
      <p className="text-sm text-[#4A544C] bg-[#D8E8E4]/50 border border-[#0D6E64]/15 rounded-[20px] p-4">
        If you're having thoughts of suicide, please reach out to one of the lines below — someone is
        ready to listen, day or night. Recovery isn't linear, and reaching out is a sign of strength,
        not failure.
      </p>

      {/* Breathing exercise */}
      <BreathingExercise />

      {/* Support categories */}
      <div className="space-y-4">
        {SUPPORT_CATEGORIES.map((cat) => {
          const styles = COLOR_STYLES[cat.color];
          const Icon = cat.Icon;
          return (
            <section key={cat.id} className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${styles.iconColor}`} />
                </div>
                <h2 className="font-semibold text-[#12302E] tracking-tight">{cat.title}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.lines.map((line) => (
                  <HotlineCard key={line.name} line={line} color={cat.color} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Talk to someone you trust */}
      <section className="bg-[#EFEAE0] border border-[#12302E]/10 rounded-[20px] p-5 text-center">
        <p className="text-sm text-[#4A544C]">
          Hotlines aren't the only option. If there's a friend, family member, sponsor, or counselor you
          trust, reaching out to them matters too — you don't have to carry this by yourself.
        </p>
      </section>
    </div>
  );
}