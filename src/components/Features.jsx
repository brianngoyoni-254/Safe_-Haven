import { Heart, TrendingUp, Users, MapPin, BookOpen, Shield } from "lucide-react";
import { serif } from "../styles/theme";
import Reveal from "./Reveal";

const features = [
  {
    Icon: Heart,
    title: "Daily check-ins",
    desc: "A 30-second way to say how you're really doing — mood, sleep, cravings — tracked gently, never graded.",
  },
  {
    Icon: Users,
    title: "Peer groups",
    desc: "Small, real conversations with people further along in recovery — not a feed, not strangers shouting into a void.",
  },
  {
    Icon: MapPin,
    title: "Treatment map",
    desc: "Browse rehab centers, counseling services, and trusted recovery literature and videos near you across Kenya.",
  },
  {
    Icon: TrendingUp,
    title: "Milestone badges",
    desc: "Set your recovery start date and watch progress add up — 7, 30, 90, 180, and 365 days, each one earned.",
  },
  {
    Icon: BookOpen,
    title: "Private journal",
    desc: "Write freely in your personal journal — completely private, completely yours.",
  },
  {
    Icon: Shield,
    title: "1192, one tap away",
    desc: "The NACADA helpline is never more than one tap from wherever you are in the app — no menus, no searching.",
    highlight: true,
  },
];

export default function Features() {
  return (
    <section id="support" className="bg-[#EFEAE0] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-xl mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C98A3E] mb-3">
            What's here for you
          </span>
          <h2 className="text-[32px] md:text-[42px] font-medium text-[#12302E] leading-[1.15] mb-4" style={serif}>
            Not another tracker. A place that actually holds you.
          </h2>
          <p className="text-[#4A544C] text-[16.5px]">
            Every part of Safe Haven exists to answer one question honestly: what do you actually need right now?
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div
                className={`h-full rounded-[20px] p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  f.highlight
                    ? "bg-[#12302E] border-transparent text-[#F7F4EC]"
                    : "bg-[#F7F4EC] border-[#12302E]/10 text-[#12302E]"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                    f.highlight ? "bg-[#C98A3E]/25" : "bg-[#D8E8E4]"
                  }`}
                >
                  <f.Icon size={20} className={f.highlight ? "text-[#C98A3E]" : "text-[#0D6E64]"} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className={`text-sm leading-relaxed ${f.highlight ? "text-[#F7F4EC]/75" : "text-[#4A544C]"}`}>
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}