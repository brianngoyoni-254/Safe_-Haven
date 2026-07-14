import { PhoneCall } from "lucide-react";

export default function CrisisStrip() {
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