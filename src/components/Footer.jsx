import logo from "../assets/logo.jpeg";
import { serif } from "../styles/theme";

export default function Footer() {
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