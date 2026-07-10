import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import logo from "../assets/logo.jpeg";
import {
  Shield,
  Heart,
  TrendingUp,
  Users,
  MapPin,
  BookOpen,
  Calendar,
  MessageCircle,
  PenLine,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";



const serif = { fontFamily: "'Fraunces', serif" };

//  Navbar 
function Navbar({ name, navigate }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#EFEAE0]/90 backdrop-blur-md border-b border-[#12302E]/10">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Safe Haven logo" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-semibold text-[#12302E] text-lg tracking-tight" style={serif}>
            Safe Haven
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-[#0D6E64] text-[#F7F4EC] px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
        >
          Skip to dashboard <ArrowRight size={16} />
        </button>
      </div>
    </nav>
  );
}

// Welcome hero
function Welcome({ name, navigate }) {
  return (
    <section className="relative bg-[#12302E] pt-[136px] pb-20 px-6 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, #0D6E64 0%, transparent 45%), radial-gradient(circle at 85% 15%, #C98A3E 0%, transparent 35%)",
        }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[#F1DEBC] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C98A3E]" />
          Your account is ready
        </span>
        <h1
          className="text-[34px] md:text-[48px] font-medium text-[#F7F4EC] leading-[1.1] tracking-tight mb-5"
          style={serif}
        >
          Welcome{name ? `, ${name}` : ""}.<br />
          You're in a safe place now.
        </h1>
        <p className="text-lg text-[#D8E8E4] max-w-xl mx-auto mb-10 leading-relaxed">
          Everything here is private and anonymous — only you can see your
          real identity. Take a minute to look around, or jump straight into
          your first check-in.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate("/check-in")}
            className="inline-flex items-center gap-2 bg-[#C98A3E] text-[#12302E] px-7 py-3.5 rounded-full font-bold text-[15px] hover:brightness-105 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Start today's check-in <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 border-[1.5px] border-[#F7F4EC]/40 text-[#F7F4EC] px-7 py-3 rounded-full font-semibold text-[15px] hover:bg-white/10 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            Go to my dashboard
          </button>
        </div>
      </div>
    </section>
  );
}

//Getting started checklist 
const gettingStarted = [
  {
    num: "01",
    Icon: MessageCircle,
    title: "Do your first check-in",
    desc: "Log your mood, cravings, and whether you stayed sober today. About 30 seconds.",
    to: "/check-in",
    cta: "Check in now",
  },
  {
    num: "02",
    Icon: Calendar,
    title: "Set your recovery start date",
    desc: "This is what unlocks your day count and milestone badges — 7, 30, 90, 180, 365 days.",
    to: "/milestones",
    cta: "Set my date",
  },
  {
    num: "03",
    Icon: Users,
    title: "Find a support group",
    desc: "Join a peer group inside Safe Haven, or browse established fellowships near you.",
    to: "/groups",
    cta: "Browse groups",
  },
  {
    num: "04",
    Icon: PenLine,
    title: "Write your first journal entry",
    desc: "A private space for anything you're not ready to say out loud yet. Only you can read it.",
    to: "/journal",
    cta: "Open journal",
  },
];

function GettingStarted({ navigate }) {
  return (
    <section className="bg-[#EFEAE0] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C98A3E] mb-3">
            Getting started
          </span>
          <h2 className="text-[30px] md:text-[38px] font-medium text-[#12302E] leading-[1.15]" style={serif}>
            Four small things worth doing today.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {gettingStarted.map((s) => (
            <button
              key={s.num}
              onClick={() => navigate(s.to)}
              className="group text-left bg-[#F7F4EC] rounded-[20px] p-7 border border-[#12302E]/10 hover:border-[#0D6E64]/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#D8E8E4] flex items-center justify-center">
                  <s.Icon size={20} className="text-[#0D6E64]" />
                </div>
                <span className="italic text-sm text-[#C98A3E]" style={serif}>{s.num}</span>
              </div>
              <h3 className="text-lg font-semibold text-[#12302E] mb-1.5">{s.title}</h3>
              <p className="text-sm text-[#4A544C] leading-relaxed mb-4">{s.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D6E64] group-hover:gap-2.5 transition-all">
                {s.cta} <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// What's here for you 
const features = [
  {
    Icon: Heart,
    title: "Daily check-ins",
    desc: "A 30-second way to log mood, sleep, and cravings — tracked gently, never graded.",
  },
  {
    Icon: Users,
    title: "Support groups",
    desc: "Join or start peer groups inside Safe Haven, plus directories of outside fellowships.",
  },
  {
    Icon: MapPin,
    title: "Resources",
    desc: "Browse treatment centers, counseling services, and recovery literature near you.",
  },
  {
    Icon: TrendingUp,
    title: "Milestone badges",
    desc: "Set your start date and watch progress add up — 7, 30, 90, 180, and 365 days.",
  },
  {
    Icon: BookOpen,
    title: "Private journal",
    desc: "Write freely. Your entries are visible only to you, always.",
  },
  {
    Icon: Shield,
    title: "Anonymous by design",
    desc: "You choose your display name. Your real identity is never shown to other members.",
  },
];

function Features() {
  return (
    <section className="bg-[#F7F4EC] py-24 px-6 border-y border-[#12302E]/10">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C98A3E] mb-3">
            What's here for you
          </span>
          <h2 className="text-[30px] md:text-[38px] font-medium text-[#12302E] leading-[1.15]" style={serif}>
            Take your time. It's all still here whenever you need it.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D8E8E4] flex items-center justify-center flex-shrink-0">
                <f.Icon size={18} className="text-[#0D6E64]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#12302E] mb-1">{f.title}</h3>
                <p className="text-sm text-[#4A544C] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Crisis reassurance 
function CrisisNote({ navigate }) {
  return (
    <section className="bg-[#EFEAE0] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#12302E] rounded-[28px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#C98A3E]/20 flex items-center justify-center flex-shrink-0">
            <PhoneCall size={24} className="text-[#F1DEBC]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#F7F4EC] mb-1.5">
              If today is harder than most, help is one tap away.
            </h3>
            <p className="text-sm text-[#D8E8E4]">
              The NACADA helpline (1192) and other crisis lines are always
              free, confidential, and available — no need to wait until
              you're on the dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate("/crisis")}
            className="flex-shrink-0 bg-[#C98A3E] text-[#12302E] font-bold px-6 py-3 rounded-full text-sm hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Crisis support
          </button>
        </div>
      </div>
    </section>
  );
}

// Footer 
function Footer() {
  return (
    <footer className="bg-[#EFEAE0] pt-4 pb-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-7 border-t border-[#12302E]/10 text-sm text-[#4A544C]">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Safe Haven logo" className="w-6 h-6 rounded-full object-cover" />
          <span className="font-semibold text-[#12302E]" style={serif}>Safe Haven</span>
        </div>
        <span>© 2026 Safe Haven. Built in Kenya.</span>
      </div>
    </footer>
  );
}

// Root 
export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.username ?? "";

  return (
    <div className="min-h-screen font-sans">
      <Navbar name={name} navigate={navigate} />
      <Welcome name={name} navigate={navigate} />
      <GettingStarted navigate={navigate} />
      <Features />
      <CrisisNote navigate={navigate} />
      <Footer />
    </div>
  );
}