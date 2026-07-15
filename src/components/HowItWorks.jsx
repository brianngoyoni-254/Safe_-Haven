import { serif } from "../styles/theme";
import Reveal from "./Reveal";

const steps = [
  { num: "One", title: "Create your account", desc: "Pick an anonymous display name, add an email and password — or continue with Google. Under a minute, no forms to mail in." },
  { num: "Two", title: "Do your first check-in", desc: "Log your mood, cravings, and whether you stayed sober today. Takes about 30 seconds." },
  { num: "Three", title: "Set your recovery date", desc: "Add your sobriety start date to begin tracking days and unlocking milestone badges." },
  { num: "Four", title: "Explore what helps", desc: "Join a support group, browse nearby resources, or write in your private journal — whenever you're ready." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-[#EFEAE0] pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-xl mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C98A3E] mb-3">
            How starting actually works
          </span>
          <h2 className="text-[32px] md:text-[42px] font-medium text-[#12302E] leading-[1.15]" style={serif}>
            Four steps. That's genuinely all it takes.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-[#12302E]/10">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="p-8 border-b border-r border-[#12302E]/10 h-full lg:border-r last:lg:border-r-0">
                <div className="italic text-sm text-[#C98A3E] mb-3" style={serif}>{s.num}</div>
                <h4 className="text-base font-semibold text-[#12302E] mb-2">{s.title}</h4>
                <p className="text-sm text-[#4A544C]">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}