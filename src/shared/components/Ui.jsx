import { Loader2 } from "lucide-react";

export function Input({ icon: IconComp, type = "text", placeholder, value, onChange, rightElement }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#4A544C]/50">
        <IconComp size={16} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#12302E]/15 text-sm
          text-[#12302E] placeholder-[#4A544C]/40 bg-white focus:outline-none
          focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-all"
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-3.5 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
}

export function PrimaryButton({ onClick, children, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3 px-4 rounded-xl bg-[#0D6E64] text-white text-sm font-semibold
        hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]
        transition-all duration-150 disabled:opacity-60
        flex items-center justify-center gap-2 cursor-pointer"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="text-xs text-[#8a2340] bg-[#FCE7EF] border border-[#8a2340]/15 rounded-xl px-3 py-2.5">
      {message}
    </div>
  );
}

export const serif = { fontFamily: "'Fraunces', serif" };