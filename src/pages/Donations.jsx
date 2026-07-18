import { useState, useMemo } from "react";
import {
  Heart,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  Info,
  Lock,
  Users,
  LifeBuoy,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";

// TODO(backend): wire this page up to real endpoints, e.g. in api.js:
//
//   export const donationsApi = {
//     initiateStkPush: (data) => api.post("/api/donations/mpesa/stk-push", data),
//     //   data: { amount, phone, name, message, anonymous, frequency }
//     //   -> { checkoutRequestId }
//     status: (checkoutRequestId) =>
//       api.get(`/api/donations/mpesa/status/${checkoutRequestId}`),
//     //   -> { status: "pending" | "success" | "failed" }
//   };
//
// STK push is asynchronous on Safaricom's side — the initiate call only
// confirms the prompt was sent to the phone. The actual PIN entry happens
// on the user's device, so the real flow polls `status` every few seconds
// (or listens on a websocket/callback) until it resolves. Below this is
// simulated with a timeout so the page is fully clickable/demoable.

const serif = { fontFamily: "'Fraunces', serif" };

const PRESET_AMOUNTS = [10, 20, 50, 100, 300, 500, 1000, 2500, 5000];

const IMPACT_ITEMS = [
  {
    Icon: LifeBuoy,
    title: "Keeps crisis support free",
    desc: "Every hotline and breathing exercise on the Crisis page stays free and ad-free for anyone who needs it.",
  },
  {
    Icon: Users,
    title: "Grows peer support groups",
    desc: "Donations fund the infrastructure that keeps group chats and check-ins running smoothly as our community grows.",
  },
  {
    Icon: BookOpen,
    title: "Expands the resource library",
    desc: "Helps us keep adding vetted treatment centers, counselors, and recovery literature for Kenyans in recovery.",
  },
];

function formatKES(n) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

// Basic Kenyan mobile number check: 07xx/01xx (10 digits) or 2547xx/2541xx (12 digits)
function isValidKenyanPhone(raw) {
  const digits = raw.replace(/[\s-]/g, "");
  return /^(07|01)\d{8}$/.test(digits) || /^254(7|1)\d{8}$/.test(digits) || /^\+254(7|1)\d{8}$/.test(digits);
}

function normalizePhone(raw) {
  const digits = raw.replace(/[\s-]/g, "");
  if (digits.startsWith("+254")) return digits.slice(1);
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

//  Impact strip 

function ImpactStrip() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {IMPACT_ITEMS.map((item) => (
        <div
          key={item.title}
          className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5"
        >
          <div className="w-11 h-11 rounded-xl bg-[#D8E8E4] flex items-center justify-center mb-3">
            <item.Icon size={20} className="text-[#0D6E64]" />
          </div>
          <h3 className="font-semibold text-[#12302E] text-sm mb-1.5 tracking-tight">{item.title}</h3>
          <p className="text-xs text-[#4A544C] leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </section>
  );
}

// Amount + details form

function AmountForm({
  amount, setAmount,
  customAmount, setCustomAmount,
  frequency, setFrequency,
  name, setName,
  message, setMessage,
  anonymous, setAnonymous,
}) {
  return (
    <section className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-5 space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#12302E] tracking-tight">
          <Sparkles className="w-4 h-4 text-[#C98A3E]" /> Choose an amount
        </h2>
        <p className="text-xs text-[#4A544C] mt-1">Every contribution, of any size, helps keep Safe Haven running.</p>
      </div>

      {/* Frequency toggle */}
      <div className="inline-flex rounded-full bg-[#EFEAE0] p-1 text-sm font-medium">
        {["once", "monthly"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFrequency(f)}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              frequency === f
                ? "bg-[#0D6E64] text-[#F7F4EC] shadow-sm"
                : "text-[#4A544C] hover:text-[#12302E]"
            }`}
          >
            {f === "once" ? "One-time" : "Monthly"}
          </button>
        ))}
      </div>

      {/* Preset amounts */}
      <div className="grid grid-cols-3 gap-2.5">
        {PRESET_AMOUNTS.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={amount === v && !customAmount}
            onClick={() => {
              setAmount(v);
              setCustomAmount("");
            }}
            className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E64] focus-visible:ring-offset-2
              ${
                amount === v && !customAmount
                  ? "border-[#0D6E64] bg-[#D8E8E4] text-[#0D6E64]"
                  : "border-[#12302E]/10 text-[#12302E] hover:border-[#0D6E64]/40"
              }`}
          >
            {formatKES(v)}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div>
        <label className="block text-sm font-medium text-[#12302E] mb-1.5">Or enter a custom amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#4A544C]/70 font-medium">
            KES
          </span>
          <input
            type="number"
            min="1"
            placeholder="1,000"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(null);
            }}
            className="w-full rounded-xl border border-[#12302E]/15 pl-12 pr-3 py-2.5 text-sm text-[#12302E] bg-white
              placeholder-[#4A544C]/40
              focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      <div className="h-px bg-[#12302E]/10" />

      {/* Name + message */}
      <div className="space-y-4">
        <label className="flex items-center gap-2.5 text-sm text-[#12302E] select-none cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-4 h-4 rounded border-[#12302E]/25 text-[#0D6E64] focus:ring-[#0D6E64] cursor-pointer"
          />
          Give anonymously
        </label>

        {!anonymous && (
          <div>
            <label className="block text-sm font-medium text-[#12302E] mb-1.5">Your name (optional)</label>
            <input
              type="text"
              placeholder="e.g. Phoenix, or your real name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white
                placeholder-[#4A544C]/40
                focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#12302E] mb-1.5">A note of appreciation (optional)</label>
          <textarea
            placeholder="Say a few words — what Safe Haven has meant to you, or why you're giving."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-[#12302E]/15 p-3 text-sm text-[#12302E] bg-white
              placeholder-[#4A544C]/40
              focus:outline-none focus:ring-2 focus:ring-[#0D6E64] focus:border-transparent transition-shadow"
          />
        </div>
      </div>
    </section>
  );
}

//  M-Pesa payment card 
// M-Pesa's own brand green/black are used deliberately here so this section
// reads as "this is the Safaricom payment step" at a glance, distinct from
// the teal/cream Safe Haven chrome around it.

const MPESA_GREEN = "#4CAF00";
const MPESA_DARK = "#1A2E1A";

function MpesaCard({ finalAmount, phone, setPhone, status, error, onPay, copied, onCopyTill }) {
  const disabled = !finalAmount || finalAmount < 1 || !isValidKenyanPhone(phone) || status === "sending" || status === "pending";

  return (
    <section
      className="rounded-[20px] shadow-sm overflow-hidden border"
      style={{ borderColor: `${MPESA_GREEN}30` }}
    >
      {/* Header bar */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: MPESA_DARK }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: MPESA_GREEN, color: MPESA_DARK }}
          >
            M
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Pay with M-Pesa</div>
            <div className="text-[11px] text-white/60 leading-tight">Lipa na M-Pesa · STK Push</div>
          </div>
        </div>
        <Smartphone size={20} className="text-white/50" />
      </div>

      <div className="bg-[#F7F4EC] p-5 space-y-4">
        {status === "success" ? (
          <div className="text-center py-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: `${MPESA_GREEN}20` }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: MPESA_GREEN }} />
            </div>
            <h3 className="text-lg font-medium text-[#12302E] tracking-tight mb-1.5" style={serif}>
              Asante sana — thank you!
            </h3>
            <p className="text-sm text-[#4A544C]">
              Your {formatKES(finalAmount)} contribution was received. A confirmation SMS from M-Pesa
              is on its way to your phone.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-[#12302E] mb-1.5">M-Pesa phone number</label>
              <input
                type="tel"
                placeholder="07XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={status === "sending" || status === "pending"}
                className="w-full rounded-xl border border-[#12302E]/15 px-3 py-2.5 text-sm text-[#12302E] bg-white
                  placeholder-[#4A544C]/40
                  focus:outline-none focus:ring-2 focus-visible:ring-offset-0 transition-shadow disabled:opacity-60"
                style={{ "--tw-ring-color": MPESA_GREEN }}
                onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${MPESA_GREEN}`)}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
              {phone && !isValidKenyanPhone(phone) && (
                <p className="text-xs text-[#8a2340] mt-1.5">Enter a valid Safaricom number, e.g. 0722 123 456</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm bg-white rounded-xl border border-[#12302E]/10 px-3.5 py-2.5">
              <span className="text-[#4A544C]">Amount to pay</span>
              <span className="font-semibold text-[#12302E] tabular-nums">
                {finalAmount ? formatKES(finalAmount) : "—"}
              </span>
            </div>

            {error && (
              <p className="text-sm text-[#8a2340] bg-[#FCE7EF] border border-[#8a2340]/15 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            {status === "pending" && (
              <div className="flex items-start gap-2.5 text-sm text-[#12302E] bg-[#F1DEBC]/50 border border-[#C98A3E]/25 rounded-xl px-3.5 py-3">
                <Loader2 size={16} className="animate-spin flex-shrink-0 mt-0.5" style={{ color: MPESA_GREEN }} />
                <span>Check your phone — enter your M-Pesa PIN to confirm the payment.</span>
              </div>
            )}

            <button
              onClick={onPay}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white
                hover:brightness-105 hover:shadow-lg active:scale-[0.99] transition-all duration-150 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: status === "sending" || status === "pending" ? MPESA_DARK : MPESA_GREEN, color: MPESA_DARK === "#1A2E1A" && (status === "sending" || status === "pending") ? "#fff" : MPESA_DARK }}
            >
              {status === "sending" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending prompt…
                </>
              ) : status === "pending" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Waiting for confirmation…
                </>
              ) : (
                <>
                  Send M-Pesa prompt <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="flex items-center gap-1.5 text-xs text-[#4A544C]/80 justify-center">
              <Lock size={12} /> Secured by Safaricom M-Pesa. We never see or store your PIN.
            </p>
          </>
        )}
      </div>

      {/* Manual paybill fallback */}
      {status !== "success" && (
        <div className="bg-[#F7F4EC] border-t border-[#12302E]/10 p-5">
          <div className="flex items-start gap-2 mb-3">
            <Info size={14} className="text-[#4A544C] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#4A544C]">
              Prefer to pay manually? Go to M-Pesa → Lipa na M-Pesa → Paybill on your phone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-[#12302E]/10 px-3.5 py-2.5">
              <div className="text-[11px] text-[#4A544C]/70 uppercase tracking-wide">Paybill Number</div>
              <div className="font-semibold text-[#12302E] tabular-nums">400200</div>
            </div>
            <button
              onClick={onCopyTill}
              className="bg-white rounded-xl border border-[#12302E]/10 px-3.5 py-2.5 text-left hover:border-[#0D6E64]/40 transition-colors cursor-pointer"
            >
              <div className="text-[11px] text-[#4A544C]/70 uppercase tracking-wide flex items-center justify-between">
                Account Number
                {copied ? <Check size={12} className="text-[#0D6E64]" /> : <Copy size={12} className="text-[#4A544C]/50" />}
              </div>
              <div className="font-semibold text-[#12302E]">SAFEHAVEN</div>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// Root

export default function Donations() {
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | pending | success
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const finalAmount = useMemo(() => {
    if (customAmount) {
      const n = parseInt(customAmount, 10);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return amount;
  }, [amount, customAmount]);

  const handlePay = async () => {
    setError("");
    setStatus("sending");
    try {
      // TODO(backend): replace with donationsApi.initiateStkPush({
      //   amount: finalAmount,
      //   phone: normalizePhone(phone),
      //   name: anonymous ? undefined : name || undefined,
      //   message: message || undefined,
      //   anonymous,
      //   frequency,
      // }) -> { checkoutRequestId }, then poll donationsApi.status(checkoutRequestId)
      // every ~3s until it resolves to "success" or "failed"/timeout.
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus("pending");
      await new Promise((resolve) => setTimeout(resolve, 2200));
      setStatus("success");
    } catch {
      setStatus("idle");
      setError("Couldn't reach M-Pesa right now. Please try again.");
    }
  };

  const handleCopyTill = async () => {
    try {
      await navigator.clipboard.writeText("SAFEHAVEN");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied — fine, the number is visible to copy manually.
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2.5 text-[28px] leading-tight font-medium text-[#12302E] tracking-tight" style={serif}>
          <Heart className="w-6 h-6 text-[#c2417a]" /> Support Safe Haven
        </h1>
        <p className="text-[#4A544C] text-sm mt-1.5 max-w-xl">
          Safe Haven stays free for everyone who needs it. Your donation — as thanks, or simply to
          help us grow — keeps it that way.
        </p>
      </div>

      <ImpactStrip />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <AmountForm
          amount={amount} setAmount={setAmount}
          customAmount={customAmount} setCustomAmount={setCustomAmount}
          frequency={frequency} setFrequency={setFrequency}
          name={name} setName={setName}
          message={message} setMessage={setMessage}
          anonymous={anonymous} setAnonymous={setAnonymous}
        />

        <MpesaCard
          finalAmount={finalAmount}
          phone={phone}
          setPhone={setPhone}
          status={status}
          error={error}
          onPay={handlePay}
          copied={copied}
          onCopyTill={handleCopyTill}
        />
      </div>

      {/* Trust footer */}
      <section className="bg-[#EFEAE0] border border-[#12302E]/10 rounded-[20px] p-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0D6E64] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#4A544C]">
          Donations are optional and never affect your access to any part of Safe Haven. All
          check-ins, groups, journaling, milestones, and crisis support remain free regardless of
          whether you give.
        </p>
      </section>
    </div>
  );
}