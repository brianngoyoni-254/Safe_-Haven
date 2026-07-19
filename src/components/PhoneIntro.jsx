import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PenLine } from "lucide-react";

// A small, self-contained "iPhone 17" that flips open when the Journals
// section loads, then types out a welcome message inviting the person to
// write. Built entirely with CSS/SVG-ish divs + motion — no external phone
// asset needed. Dismissed via the CTA on-screen, or the "Skip" link, both
// of which call onFinish() so the real journal UI can take over.

const serif = { fontFamily: "'Fraunces', serif" };

const WELCOME_LINES = [
  "You showed up today. That matters.",
  "This space is yours — write whatever you need to.",
];

// Types the given lines out one at a time (no looping). Returns the fully
// "committed" lines, the in-progress line, and whether typing has finished.
function useSequentialTyping(active, lines, { typingSpeed = 45, pauseBetween = 650, startDelay = 250 } = {}) {
  const [committedLines, setCommittedLines] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;

    const typeChar = () => {
      if (cancelled) return;
      if (lineIndex >= lines.length) {
        setDone(true);
        return;
      }
      const line = lines[lineIndex];
      if (charIndex <= line.length) {
        setCurrentText(line.slice(0, charIndex));
        charIndex += 1;
        setTimeout(typeChar, typingSpeed);
      } else {
        setCommittedLines((prev) => [...prev, line]);
        setCurrentText("");
        lineIndex += 1;
        charIndex = 0;
        setTimeout(typeChar, pauseBetween);
      }
    };

    const startTimer = setTimeout(typeChar, startDelay);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { committedLines, currentText, done };
}

export default function PhoneIntro({ onFinish }) {
  // closed -> opening -> lit  (lit = screen is on and typing can begin)
  const [phase, setPhase] = useState("closed");
  const { committedLines, currentText, done } = useSequentialTyping(phase === "lit", WELCOME_LINES);

  useEffect(() => {
    const openTimer = setTimeout(() => setPhase("opening"), 250);
    const litTimer = setTimeout(() => setPhase("lit"), 1250);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(litTimer);
    };
  }, []);

  const isOpen = phase !== "closed";

  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-16">
      <div style={{ perspective: 1400 }}>
        <motion.div
          className="relative w-[230px] h-[470px] sm:w-[260px] sm:h-[530px] rounded-[46px] bg-gradient-to-b from-[#3a3a3c] to-[#161618] shadow-2xl border-[6px] border-[#111112]"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: -110, rotateX: 14, scale: 0.8, opacity: 0 }}
          animate={
            isOpen
              ? { rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }
              : { rotateY: -110, rotateX: 14, scale: 0.8, opacity: 0 }
          }
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Titanium edge highlight */}
          <div className="absolute inset-0 rounded-[46px] ring-1 ring-white/10 pointer-events-none" />

          {/* Dynamic island */}
          <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[86px] h-[24px] rounded-full bg-black z-20" />

          {/* Screen */}
          <div className="absolute inset-[6px] rounded-[38px] overflow-hidden bg-black">
            <AnimatePresence>
              {phase === "lit" && (
                <motion.div
                  key="screen-on"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full flex flex-col items-center justify-center px-6 text-center"
                  style={{ background: "linear-gradient(160deg, #12302E 0%, #0b201f 100%)" }}
                >
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#C98A3E] mb-4 font-semibold">
                    Safe Haven
                  </span>

                  <div className="min-h-[110px] flex flex-col justify-center gap-2">
                    {committedLines.map((line, i) => (
                      <p key={i} className="text-[#F7F4EC] text-[15px] leading-snug" style={serif}>
                        {line}
                      </p>
                    ))}
                    {!done && (
                      <p className="text-[#F7F4EC] text-[15px] leading-snug" style={serif}>
                        {currentText}
                        <motion.span
                          className="inline-block w-[2px] h-[14px] bg-[#F7F4EC] ml-0.5 align-middle"
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      </p>
                    )}
                  </div>

                  <AnimatePresence>
                    {done && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        onClick={onFinish}
                        className="mt-6 flex items-center gap-1.5 bg-[#C98A3E] text-[#12302E] text-[13px] font-bold px-4 py-2.5 rounded-full cursor-pointer hover:brightness-105 active:scale-95 transition-all duration-150"
                      >
                        <PenLine className="w-3.5 h-3.5" /> Start writing
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side buttons */}
          <div className="absolute -left-[2px] top-[108px] w-[3px] h-[26px] bg-[#111112] rounded-l" />
          <div className="absolute -left-[2px] top-[148px] w-[3px] h-[46px] bg-[#111112] rounded-l" />
          <div className="absolute -right-[2px] top-[128px] w-[3px] h-[64px] bg-[#111112] rounded-r" />
        </motion.div>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="mt-7 text-xs text-[#4A544C] hover:text-[#12302E] underline underline-offset-2 transition-colors cursor-pointer"
      >
        Skip
      </button>
    </div>
  );
}