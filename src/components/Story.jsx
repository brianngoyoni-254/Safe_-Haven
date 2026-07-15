import { serif } from "../styles/theme";
import Reveal from "./Reveal";

export default function Story() {
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