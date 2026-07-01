import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  Shield,
  Heart,
  TrendingUp,
  Users,
  MapPin,
  BookOpen,
  ArrowRight,
  LogIn,
  Star,
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1762181702079-40f2f9ac56e4?fm=jpg&q=80&w=2400&auto=format&fit=crop";

// Nav 
function Navbar({ isLoggedIn, navigate }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/15">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/80 backdrop-blur-sm border border-teal-400/40 flex items-center justify-center shadow-lg">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white text-lg">Safe Haven</span>
        </div>
        {isLoggedIn ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            Go to Dashboard <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <LogIn size={16} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}

// Hero 
function Hero({ isLoggedIn, navigate }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/85 via-teal-900/75 to-teal-950/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <span className="inline-block text-sm text-teal-50 bg-white/10 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-8">
          A Recovery Support Network
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-sm">
          You don't have<br />
          to <span className="text-teal-300">recover alone</span>
        </h1>
        <p className="text-lg text-teal-50/90 max-w-xl mx-auto mb-10 leading-relaxed">
          Safe Haven is a private, supportive space to track your progress, connect with peers,
          and discover nearby recovery resources — all with complete anonymity.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
            >
              Open My Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
              >
                <LogIn size={18} /> Sign In
              </button>
              <button
                onClick={() => navigate("/groups")}
                className="px-6 py-3 rounded-lg font-medium text-white bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
              >
                Browse Support Groups
              </button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/20 pt-12">
          {[
            { value: "500+", label: "Community Members" },
            { value: "100+",   label: "Sober Days Tracked" },
            { value: "50+",    label: "Support Groups" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-teal-50/75 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features 
const features = [
  {
    Icon:      Heart,
    iconColor: "text-rose-400",
    iconBg:    "bg-rose-500/20 border border-rose-400/25",
    title:     "Daily Check-ins",
    desc:      "Track your mood, cravings, and sobriety every day with compassionate prompts.",
  },
  {
    Icon:      TrendingUp,
    iconColor: "text-teal-300",
    iconBg:    "bg-teal-500/20 border border-teal-400/25",
    title:     "Milestone Badges",
    desc:      "Celebrate every 7, 30, 90, 180, and 365 day milestone with achievement badges.",
  },
  {
    Icon:      Users,
    iconColor: "text-teal-300",
    iconBg:    "bg-teal-500/20 border border-teal-400/25",
    title:     "Support Groups",
    desc:      "Join peer support communities organized by people who understand your journey.",
  },
  {
    Icon:      MapPin,
    iconColor: "text-teal-300",
    iconBg:    "bg-teal-500/20 border border-teal-400/25",
    title:     "Resource Map",
    desc:      "Find nearby rehab centers and counseling services on an interactive map.",
  },
  {
    Icon:      BookOpen,
    iconColor: "text-purple-300",
    iconBg:    "bg-purple-500/20 border border-purple-400/25",
    title:     "Private Journal",
    desc:      "Write freely in your personal journal — completely private and secure.",
  },
  {
    Icon:      Shield,
    iconColor: "text-blue-300",
    iconBg:    "bg-blue-500/20 border border-blue-400/25",
    title:     "Anonymous Profiles",
    desc:      "Your identity stays private. Choose your own anonymous display name.",
  },
];

function Features() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Continued background */}
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-teal-950/92" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">Everything you need on your journey</h2>
          <p className="text-teal-200/70 max-w-xl mx-auto">
            Six powerful tools designed for people in recovery, built with privacy and compassion at the core.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/12 cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
                <f.Icon size={20} className={f.iconColor} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-teal-200/65 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials 
const testimonials = [
  {
    quote:   "Safe Haven gave me a community when I needed it most. The daily check-ins keep me accountable.",
    name:    "Phoenix R.",
    days:    "187 days sober",
    initial: "P",
  },
  {
    quote:   "One full year. The milestone badges made every single day feel like a victory.",
    name:    "River S.",
    days:    "365 days sober",
    initial: "R",
  },
  {
    quote:   "The resource map helped me find a counselor within miles of my home. Life-changing.",
    name:    "Sage M.",
    days:    "42 days sober",
    initial: "S",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

function Testimonials() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/90 to-teal-900/88" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-3">Stories from our community</h2>
          <p className="text-teal-200/70">Real people, real journeys. Names changed for privacy.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 cursor-default"
            >
              <StarRating />
              <p className="text-teal-50/85 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-500/40 border border-teal-400/30 flex items-center justify-center text-teal-200 font-semibold text-sm">
                  {t.initial}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{t.name}</p>
                  <p className="text-xs text-teal-300/70">{t.days}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA 
function CTA({ isLoggedIn, navigate }) {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-teal-950/94" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl py-16 px-8 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Start your journey today</h2>
          <p className="text-teal-100/80 mb-8 max-w-md mx-auto">
            Join thousands finding strength in community. Your first step is private, anonymous, and free.
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
            className="flex items-center gap-2 bg-teal-500 text-white font-semibold px-6 py-3 rounded-lg mx-auto hover:bg-teal-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            {isLoggedIn ? (
              <><ArrowRight size={18} /> Open Dashboard</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

// Footer 
function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 py-8 px-6">
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-teal-950/95" />
      </div>
      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-teal-500/70 border border-teal-400/30 flex items-center justify-center">
            <Shield size={12} className="text-white" />
          </div>
          <span className="text-sm font-medium text-teal-100">Safe Haven</span>
        </div>
        <p className="text-xs text-teal-300/50">© 2026 Safe Haven. Supporting recovery, one day at a time.</p>
      </div>
    </footer>
  );
}

// Root 
export default function LandingPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans">
      <Navbar isLoggedIn={isLoggedIn} navigate={navigate} />
      <Hero isLoggedIn={isLoggedIn} navigate={navigate} />
      <Features />
      <Testimonials />
      <CTA isLoggedIn={isLoggedIn} navigate={navigate} />
      <Footer />
    </div>
  );
}