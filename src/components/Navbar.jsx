import logo from "../assets/logo.jpeg";
import { ArrowRight, LogIn } from "lucide-react";
import { serif } from "../styles/theme";

export default function Navbar({ isLoggedIn, navigate }) {
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