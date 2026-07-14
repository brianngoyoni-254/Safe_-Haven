import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { serif } from "../styles/theme";
import Reveal from "./Reveal";

const BREATH_PHASES = ["Breathe in", "Hold", "Breathe out"];

// A slow, looping breathing guide — inhale (4s) / hold (4s) / exhale (4s) —
// so the hero visual doubles as a real grounding exercise, not just decoration.
function BreathingSun() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIndex((i) => (i + 1) % BREATH_PHASES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute left-1/2 w-44 h-44 flex items-center justify-center"
      style={{ top: "40%", transform: "translate(-50%, -50%)" }}
    >
      <div className="sh-ring absolute inset-0 rounded-full border-2 border-[#FFF3DA]/60" />
      <div
        className="sh-sun w-28 h-28 rounded-full"
        style={{ background: "radial-gradient(circle, #FFF3DA 0%, #C98A3E 70%)" }}
      />
      <span
        className="absolute text-[#12302E] text-xs font-semibold tracking-wide uppercase"
        style={serif}
      >
        {BREATH_PHASES[phaseIndex]}
      </span>
    </div>
  );
}

export default function Hero({ isLoggedIn, navigate }) {
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
            <BreathingSun />
            <div className="hidden md:flex absolute -left-6 top-7 items-center gap-2.5 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-lg text-xs font-semibold text-[#12302E]">
              <span className="w-2 h-2 rounded-full bg-[#0D6E64]" /> 
            </div>
            <div className="hidden md:flex absolute -right-4 bottom-16 items-center gap-2.5 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-lg text-xs font-semibold text-[#12302E]">
              <span className="w-2 h-2 rounded-full bg-[#0D6E64]" /> 
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