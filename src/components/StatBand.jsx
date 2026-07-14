import { serif } from "../styles/theme";
import Reveal from "./Reveal";

const stats = [
  { value: "100%", label: "Anonymous — you choose your display name, always" },
  { value: "24/7", label: "The NACADA helpline (1192) is one tap away, any time" },
  { value: "0 KES", label: "To join — Safe Haven is free, no paywall" },
];

export default function StatBand() {
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