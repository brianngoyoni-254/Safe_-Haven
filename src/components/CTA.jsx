import { serif } from "../styles/theme";
import Reveal from "./Reveal";

export default function CTA({ isLoggedIn, navigate }) {
  return (
    <section className="bg-[#EFEAE0] pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <div className="bg-[#12302E] rounded-[36px] py-16 px-8 md:px-14 text-center">
            <h2 className="text-[28px] md:text-[38px] font-medium text-[#F7F4EC] mb-4" style={serif}>
              You don't have to know what you need yet.
            </h2>
            <p className="text-[#F7F4EC]/75 max-w-md mx-auto mb-9">
              Create your free, anonymous account and take it one day — one check-in — at a time.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/register")}
                className="bg-[#C98A3E] text-[#12302E] font-bold px-7 py-3.5 rounded-full text-sm hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                {isLoggedIn ? "Open my dashboard" : "Create free account"}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}