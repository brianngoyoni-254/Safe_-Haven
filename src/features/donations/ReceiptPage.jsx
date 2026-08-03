import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, CheckCircle2, Printer, Download, Loader2, AlertCircle } from "lucide-react";
import { donationsApi } from "../../api/endpoints";

const serif = { fontFamily: "'Fraunces', serif" };

function formatKES(n) {
  return typeof n === "number" ? `KES ${n.toLocaleString("en-KE")}` : "—";
}

function formatReceivedAt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const datePart = d.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
  const timePart = d.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

/**
 * Diagonal repeating "SAFE HAVEN" watermark, purely CSS — no image asset needed.
 */
function Watermark() {
  const rows = Array.from({ length: 10 });
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0 }}
    >
      <div
        className="absolute -inset-full flex flex-col items-center justify-center gap-8"
        style={{ transform: "rotate(-28deg)" }}
      >
        {rows.map((_, i) => (
          <div
            key={i}
            className="whitespace-nowrap text-[13px] font-bold tracking-[0.3em]"
            style={{ color: "#12302E", opacity: 0.045 }}
          >
            {Array.from({ length: 6 }).map((__, j) => (
              <span key={j} className="mx-6">SAFE HAVEN</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  const { checkoutRequestId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await donationsApi.getReceipt(checkoutRequestId);
        if (!cancelled) {
          setReceipt(data.data);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            err?.response?.data?.message ||
              "We couldn't find that receipt. If you just paid, it can take a few seconds to confirm — try refreshing."
          );
          setStatus("error");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [checkoutRequestId]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#F7F4EC",
        scale: 2,
      });
      const link = document.createElement("a");
      const code = receipt?.mpesa_receipt_number || "receipt";
      link.download = `SafeHaven-Receipt-${code}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      // If html2canvas isn't installed yet, printing to PDF still works.
      console.error("Receipt download failed:", e);
      window.alert("Couldn't generate the image. You can still use Print → Save as PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEAE0] flex items-center justify-center px-4 py-10">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-card, #receipt-card * { visibility: visible; }
          #receipt-card {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="w-full max-w-md">
        {status === "loading" && (
          <div className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0D6E64] mb-3" />
            <p className="text-sm text-[#4A544C]">Loading your receipt…</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-[#8a2340] mb-3" />
            <h2 className="font-semibold text-[#12302E] mb-1.5" style={serif}>Receipt not available</h2>
            <p className="text-sm text-[#4A544C]">{errorMessage}</p>
          </div>
        )}

        {status === "ready" && receipt && (
          <>
            <div
              id="receipt-card"
              ref={cardRef}
              className="relative overflow-hidden bg-[#F7F4EC] rounded-[20px] border border-[#12302E]/10 shadow-sm px-7 py-8"
            >
              <Watermark />

              <div className="relative" style={{ zIndex: 1 }}>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Heart className="w-5 h-5 text-[#c2417a]" />
                  <span className="text-sm font-semibold tracking-wide text-[#12302E]" style={serif}>
                    SAFE HAVEN
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#D8E8E4] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-[#0D6E64]" />
                  </div>
                  <h1 className="text-xl font-medium text-[#12302E] tracking-tight" style={serif}>
                    Asante sana{receipt.donor_name ? `, ${receipt.donor_name}` : ""}!
                  </h1>
                  <p className="text-sm text-[#4A544C] mt-1.5">
                    Thank you for supporting Safe Haven{receipt.anonymous ? " with an anonymous gift" : ""}.
                  </p>
                </div>

                <div className="h-px bg-[#12302E]/10 mb-5" />

                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-[#4A544C]">Amount</dt>
                    <dd className="font-semibold text-[#12302E] tabular-nums">{formatKES(receipt.amount)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#4A544C]">Frequency</dt>
                    <dd className="text-[#12302E] capitalize">{receipt.frequency === "monthly" ? "Monthly" : "One-time"}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#4A544C]">M-Pesa number</dt>
                    <dd className="text-[#12302E] tabular-nums">{receipt.phone_masked || "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#4A544C]">M-Pesa code</dt>
                    <dd className="font-semibold text-[#12302E] tracking-wide">{receipt.mpesa_receipt_number || "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#4A544C]">Received</dt>
                    <dd className="text-[#12302E] text-right">{formatReceivedAt(receipt.received_at)}</dd>
                  </div>
                </dl>

                <div className="h-px bg-[#12302E]/10 my-5" />

                <p className="text-[11px] text-[#4A544C]/70 text-center leading-relaxed">
                  This receipt confirms an M-Pesa payment made to Safe Haven.
                  <br />
                  Ref: {receipt.checkout_request_id}
                </p>
              </div>
            </div>

            <div className="no-print flex gap-3 mt-4">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm text-[#12302E] bg-white border border-[#12302E]/15 hover:border-[#0D6E64]/40 transition-colors cursor-pointer"
              >
                <Printer size={16} /> Print
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm text-white bg-[#0D6E64] hover:brightness-105 transition-all cursor-pointer disabled:opacity-60"
              >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {downloading ? "Preparing…" : "Download"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}