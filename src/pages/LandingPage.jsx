import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import logo from "../assets/logo.jpeg";
import {
  Heart,
  TrendingUp,
  Users,
  MapPin,
  BookOpen,
  Shield,
  ArrowRight,
  LogIn,
  PhoneCall,
} from "lucide-react";



const serif = { fontFamily: "'Fraunces', serif" };

const keyframeStyles = `
  @keyframes sh-rise {
    0%, 100% { top: 40%; }
    50% { top: 34%; }
  }
  .sh-sun { animation: sh-rise 8s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .sh-sun { animation: none !important; }
  }
`;

// Scroll-reveal, mirrors the Figma prototype's IntersectionObserver behavior
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Crisis strip 
function CrisisStrip() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[70] bg-[#12302E] text-[#F7F4EC] text-xs md:text-sm py-2 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-wrap text-center">
        <PhoneCall size={14} className="text-[#F1DEBC] shrink-0" />
        <span>Need to talk to someone right now?</span>
        <a href="tel:1192" className="font-semibold text-[#F1DEBC] underline underline-offset-2">
          Call NACADA 1192
        </a>
        <span className="hidden sm:inline">— free, confidential, 24/7</span>
      </div>
    </div>
  );
}

//  Navbar 
function Navbar({ isLoggedIn, navigate }) {
  return (
    <nav className="fixed top-8 md:top-9 left-0 right-0 z-[60] bg-[#EFEAE0]/85 backdrop-blur-md border-b border-[#12302E]/10">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Safe Haven logo" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-semibold text-[#12302E] text-lg tracking-tight" style={serif}>
            Safe Haven
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#12302E]/80">
          <a href="#support" className="hover:text-[#12302E] transition-colors">Support</a>
          <a href="#how" className="hover:text-[#12302E] transition-colors">How it works</a>
          <a href="#story" className="hover:text-[#12302E] transition-colors">Stories</a>
          <a href="/crisis" className="hover:text-[#12302E] transition-colors">Get help</a>
        </div>
        {isLoggedIn ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-[#0D6E64] text-[#F7F4EC] px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            Dashboard <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-[#0D6E64] text-[#F7F4EC] px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <LogIn size={16} /> Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

//  Hero 
function Hero({ isLoggedIn, navigate }) {
  return (
    <section className="relative bg-[#EFEAE0] pt-[168px] pb-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        {/* Left: copy */}
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[#0D6E64] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C98A3E]" />
            Built for Kenya, by people who get it
          </span>
          <h1
            className="text-[38px] md:text-[56px] font-medium text-[#12302E] leading-[1.06] tracking-tight mb-6"
            style={serif}
          >
            You don't have<br />
            to <span className="italic font-normal text-[#0D6E64]">recover</span> alone.
          </h1>
          <p className="text-lg text-[#4A544C] max-w-md mb-9 leading-relaxed">
            Safe Haven is a private, supportive space to track your progress,
            connect with peers, and discover nearby recovery resources — all
            with complete anonymity.
          </p>
          <div className="flex flex-wrap gap-4 mb-5">
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 bg-[#12302E] text-[#F7F4EC] px-7 py-3.5 rounded-full font-semibold text-[15px] hover:bg-[#0D6E64] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Open my dashboard <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 bg-[#12302E] text-[#F7F4EC] px-7 py-3.5 rounded-full font-semibold text-[15px] hover:bg-[#0D6E64] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  Create your free account <ArrowRight size={18} />
                </button>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 border-[1.5px] border-[#12302E] text-[#12302E] px-7 py-3 rounded-full font-semibold text-[15px] hover:bg-[#12302E]/[0.06] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                >
                  See how it works
                </a>
              </>
            )}
          </div>
          <p className="text-sm text-[#4A544C]">
            <b className="text-[#12302E]">Free to join. Takes under a minute.</b>&nbsp;Your identity stays private, always.
          </p>
        </div>

        {/* Right: animated sunrise visual (signature element) */}
        <Reveal>
          <div
            className="relative rounded-[28px] overflow-hidden shadow-2xl"
            style={{
              aspectRatio: "4 / 5",
              background:
                "linear-gradient(180deg, #F4E3C4 0%, #E9C68F 22%, #B98A5C 42%, #4C6B62 68%, #12302E 100%)",
            }}
          >
            <div className="absolute left-0 right-0 top-[58%] h-px bg-white/35" />
            <div
              className="sh-sun absolute left-1/2 w-28 h-28 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                top: "40%",
                background: "radial-gradient(circle, #FFF3DA 0%, #C98A3E 70%)",
              }}
            />
            <div className="hidden md:flex absolute -left-6 top-7 items-center gap-2.5 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-lg text-xs font-semibold text-[#12302E]">
              <span className="w-2 h-2 rounded-full bg-[#0D6E64]" /> 100% anonymous, always
            </div>
            <div className="hidden md:flex absolute -right-4 bottom-16 items-center gap-2.5 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-lg text-xs font-semibold text-[#12302E]">
              <span className="w-2 h-2 rounded-full bg-[#0D6E64]" /> Free, no credit card
            </div>
            <p
              className="absolute left-6 right-6 bottom-6 text-[#F7F4EC] italic text-lg leading-snug"
              style={serif}
            >
              "One day at a time — starting with this one."
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Sunrise divider 
function SunriseDivider() {
  return (
    <div className="bg-[#EFEAE0] px-6">
      <div
        className="max-w-6xl mx-auto h-px opacity-60"
        style={{
          background:
            "linear-gradient(90deg, transparent, #C98A3E 20%, #0D6E64 55%, transparent 90%)",
        }}
      />
    </div>
  );
}

// tat band 
function StatBand() {
  const stats = [
    { value: "100%", label: "Anonymous — you choose your display name, always" },
    { value: "24/7", label: "The NACADA helpline (1192) is one tap away, any time" },
    { value: "0 KES", label: "To join — Safe Haven is free, no paywall" },
  ];
  return (
    <div className="bg-[#12302E] py-14 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-9 text-center">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 100}>
            <div className="text-[40px] font-medium text-[#F1DEBC]" style={serif}>
              {s.value}
            </div>
            <div className="text-sm text-[#F7F4EC]/75 mt-1.5">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

//  Features 
const features = [
  {
    Icon: Heart,
    title: "Daily check-ins",
    desc: "A 30-second way to say how you're really doing — mood, sleep, cravings — tracked gently, never graded.",
  },
  {
    Icon: Users,
    title: "Peer groups",
    desc: "Small, real conversations with people further along in recovery — not a feed, not strangers shouting into a void.",
  },
  {
    Icon: MapPin,
    title: "Treatment map",
    desc: "Browse rehab centers, counseling services, and trusted recovery literature and videos near you across Kenya.",
  },
  {
    Icon: TrendingUp,
    title: "Milestone badges",
    desc: "Set your recovery start date and watch progress add up — 7, 30, 90, 180, and 365 days, each one earned.",
  },
  {
    Icon: BookOpen,
    title: "Private journal",
    desc: "Write freely in your personal journal — completely private, completely yours.",
  },
  {
    Icon: Shield,
    title: "1192, one tap away",
    desc: "The NACADA helpline is never more than one tap from wherever you are in the app — no menus, no searching.",
    highlight: true,
  },
];

function Features() {
  return (
    <section id="support" className="bg-[#EFEAE0] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-xl mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C98A3E] mb-3">
            What's here for you
          </span>
          <h2 className="text-[32px] md:text-[42px] font-medium text-[#12302E] leading-[1.15] mb-4" style={serif}>
            Not another tracker. A place that actually holds you.
          </h2>
          <p className="text-[#4A544C] text-[16.5px]">
            Every part of Safe Haven exists to answer one question honestly: what do you actually need right now?
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div
                className={`h-full rounded-[20px] p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  f.highlight
                    ? "bg-[#12302E] border-transparent text-[#F7F4EC]"
                    : "bg-[#F7F4EC] border-[#12302E]/10 text-[#12302E]"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                    f.highlight ? "bg-[#C98A3E]/25" : "bg-[#D8E8E4]"
                  }`}
                >
                  <f.Icon size={20} className={f.highlight ? "text-[#C98A3E]" : "text-[#0D6E64]"} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className={`text-sm leading-relaxed ${f.highlight ? "text-[#F7F4EC]/75" : "text-[#4A544C]"}`}>
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

//  How it works (numbered — a real sequence) 
const steps = [
  { num: "One", title: "Create your account", desc: "Pick an anonymous display name, add an email and password — or continue with Google. Under a minute, no forms to mail in." },
  { num: "Two", title: "Do your first check-in", desc: "Log your mood, cravings, and whether you stayed sober today. Takes about 30 seconds." },
  { num: "Three", title: "Set your recovery date", desc: "Add your sobriety start date to begin tracking days and unlocking milestone badges." },
  { num: "Four", title: "Explore what helps", desc: "Join a support group, browse nearby resources, or write in your private journal — whenever you're ready." },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-[#EFEAE0] pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-xl mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C98A3E] mb-3">
            How starting actually works
          </span>
          <h2 className="text-[32px] md:text-[42px] font-medium text-[#12302E] leading-[1.15]" style={serif}>
            Four steps. That's genuinely all it takes.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-[#12302E]/10">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="p-8 border-b border-r border-[#12302E]/10 h-full lg:border-r last:lg:border-r-0">
                <div className="italic text-sm text-[#C98A3E] mb-3" style={serif}>{s.num}</div>
                <h4 className="text-base font-semibold text-[#12302E] mb-2">{s.title}</h4>
                <p className="text-sm text-[#4A544C]">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Story 
function Story() {
  return (
    <section id="story" className="bg-[#EFEAE0] pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="bg-[#D8E8E4] rounded-[32px] p-10 md:p-16 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-10 items-center relative overflow-hidden">
            <div
              className="rounded-[20px] aspect-square relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #F1DEBC, #0D6E64)" }}
            >
              <span
                className="absolute right-4 -bottom-6 text-[180px] leading-none text-white/25"
                style={serif}
              >
                "
              </span>
            </div>
            <div>
              <blockquote
                className="italic text-[22px] md:text-[26px] leading-snug text-[#12302E]"
                style={serif}
              >
                Recovery isn't linear, and reaching out is a sign of
                strength, not failure. Safe Haven was built so that checking
                in, finding a peer, or locating real help never has to wait
                until you're ready to explain yourself.
              </blockquote>
              <cite className="not-italic block mt-5 text-sm font-semibold text-[#0D6E64]">
                — Why we built Safe Haven
              </cite>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// CTA 
function CTA({ isLoggedIn, navigate }) {
  return (
    <section className="bg-[#EFEAE0] pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <div className="bg-[#12302E] rounded-[36px] py-16 px-8 md:px-14 text-center">
            <h2 className="text-[28px] md:text-[38px] font-medium text-[#F7F4EC] mb-4" style={serif}>
              You don't have to know what you need yet.
            </h2>
            <p className="text-[#F7F4EC]/75 max-w-md mx-auto mb-9">
              Create your free, anonymous account and take it one day — one check-in — at a time.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/register")}
                className="bg-[#C98A3E] text-[#12302E] font-bold px-7 py-3.5 rounded-full text-sm hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                {isLoggedIn ? "Open my dashboard" : "Create free account"}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// -Footer 
function Footer() {
  return (
    <footer className="bg-[#EFEAE0] pt-4 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-[#12302E]/10">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <img src={logo} alt="Safe Haven logo" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-semibold text-[#12302E]" style={serif}>Safe Haven</span>
            </div>
            <p className="text-sm text-[#4A544C] max-w-[240px]">
              A recovery support platform built for Kenya — quiet, honest, and never further than one tap away.
            </p>
          </div>
          <div>
            <h5 className="text-xs font-bold tracking-wide uppercase text-[#0D6E64] mb-4">Platform</h5>
            <a href="#support" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Daily check-ins</a>
            <a href="#support" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Support groups</a>
            <a href="#support" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Treatment map & resources</a>
            <a href="#support" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Private journal</a>
          </div>
          <div>
            <h5 className="text-xs font-bold tracking-wide uppercase text-[#0D6E64] mb-4">Get help</h5>
            <a href="/crisis" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">NACADA — 1192</a>
            <a href="/resources" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Find a center</a>
            <a href="/login" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Sign in or create an account</a>
          </div>
          <div>
            <h5 className="text-xs font-bold tracking-wide uppercase text-[#0D6E64] mb-4">About</h5>
            <a href="#" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Our approach</a>
            <a href="#" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Privacy</a>
            <a href="#" className="block text-sm text-[#4A544C] hover:text-[#12302E] mb-3 transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7 text-sm text-[#4A544C]">
          <span>© 2026 Safe Haven. Built in Kenya.</span>
          <p className="text-xs text-[#4A544C]/70">Supporting recovery, one day at a time.</p>
        </div>
      </div>
    </footer>
  );
}

//  Root 
export default function LandingPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans">
      <style>{keyframeStyles}</style>
      <CrisisStrip />
      <Navbar isLoggedIn={isLoggedIn} navigate={navigate} />
      <Hero isLoggedIn={isLoggedIn} navigate={navigate} />
      <SunriseDivider />
      <StatBand />
      <Features />
      <HowItWorks />
      <Story />
      <CTA isLoggedIn={isLoggedIn} navigate={navigate} />
      <Footer />
    </div>
  );
}