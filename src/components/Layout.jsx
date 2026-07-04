import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Heart,
  TrendingUp,
  Users,
  BookOpen,
  MapPin,
  AlertTriangle,
  Phone,
  Menu,
  X,
  User,
} from "lucide-react";
import { useAuth } from "../App";

// Routes match the rest of the app (CheckIn.jsx, Milestones.jsx, Crisis.jsx, etc.)
const navLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/check-in", icon: Heart, label: "Check-in" },
  { to: "/milestones", icon: TrendingUp, label: "Milestones" },
  { to: "/groups", icon: Users, label: "Groups" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/resources", icon: MapPin, label: "Resources" },
];

const mobileNavLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/check-in", icon: Heart, label: "Check-in" },
  { to: "/groups", icon: Users, label: "Groups" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
];

// Deterministic fallback avatar color from the username, so each anonymous
// user gets a stable color without the backend needing to store one.
// TODO(backend): prefer user.avatarColor once the API returns it.
function colorFromName(name) {
  const palette = ["#0891b2", "#0d9488", "#059669", "#7c3aed", "#db2777", "#ea580c"];
  if (!name) return palette[0];
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function CrisisBanner({ onClose }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white px-4 py-3
        flex items-center justify-between gap-4 shadow-lg animate-[fadeIn_0.3s_ease-out]"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">Crisis support is available 24/7</span>
        <a href="tel:1192" className="text-sm font-bold underline">
          Call 1192 (NACADA)
        </a>
        <span className="text-sm opacity-80 hidden sm:inline">or</span>
        <a
          href="https://wa.me/254722178177"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold underline hidden sm:inline"
        >
          WhatsApp Befrienders Kenya
        </a>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <NavLink
          to="/crisis"
          onClick={onClose}
          className="text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors cursor-pointer"
        >
          More Resources
        </NavLink>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-lg leading-none cursor-pointer px-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function SidebarNav({ user, onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900">Safe Haven</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
              ${isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Pinned Crisis Support SOS button */}
      <div className="px-3 pb-3">
        <NavLink
          to="/crisis"
          onClick={onNavigate}
          className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold
            text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <Phone className="w-[18px] h-[18px]" />
            Crisis Support
          </span>
          <span className="text-[10px] font-bold text-white bg-rose-500 rounded-full px-2 py-0.5">
            SOS
          </span>
        </NavLink>
      </div>

      {/* Profile link */}
      <div className="p-3 border-t border-gray-100">
        <NavLink
          to="/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
          }
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ backgroundColor: colorFromName(user?.username) }}
          >
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate">{user?.username ?? "My Profile"}</p>
            <p className="text-xs text-gray-400 truncate font-normal">{user?.email ?? ""}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-gray-100 bg-white lg:hidden z-50 py-1 px-1">
      {mobileNavLinks.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl cursor-pointer min-w-0 flex-1
              ${active ? "text-teal-600" : "text-gray-400"}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        );
      })}
      <NavLink
        to="/profile"
        className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl cursor-pointer min-w-0 flex-1
          ${location.pathname === "/profile" ? "text-teal-600" : "text-gray-400"}`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">Profile</span>
      </NavLink>
      <NavLink
        to="/crisis"
        className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl cursor-pointer min-w-0 flex-1 text-rose-500"
      >
        <Phone className="w-5 h-5" />
        <span className="text-[10px] font-medium">SOS</span>
      </NavLink>
    </nav>
  );
}

export default function Layout({ children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(
    () => sessionStorage.getItem("sh_crisis_banner_dismissed") !== "1"
  );

  const dismissBanner = () => {
    setShowCrisisBanner(false);
    sessionStorage.setItem("sh_crisis_banner_dismissed", "1");
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {showCrisisBanner && <CrisisBanner onClose={dismissBanner} />}

      {/* Sidebar (desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex
          ${showCrisisBanner ? "mt-11" : ""} lg:mt-0`}
      >
        <SidebarNav user={user} onNavigate={() => setOpen(false)} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${showCrisisBanner ? "mt-11" : ""}`}>
        {/* Mobile topbar */}
        <header className="lg:hidden h-16 flex items-center gap-4 px-4 bg-white border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Safe Haven</span>
          </div>
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="ml-auto p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        
        <main className="relative flex-1 min-h-0 overflow-y-auto bg-slate-50 pb-16 lg:pb-0">
          {/* Decorative background — shared across all pages rendered inside Layout */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-teal-200/35 blur-3xl" />
            <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.05)_1px,transparent_0)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/40" />
          </div>

          <div className="relative z-10 p-6">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}