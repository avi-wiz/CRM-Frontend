import { AlertTriangle, ArrowRight, X } from "lucide-react";

const CONTEXT_TITLES = {
  quote_conversion: "Cannot Convert to Order",
  order_creation: "Cannot Create Order",
  stage_movement: "Cannot Move to Won",
};

/**
 * CustomerGateModal — blocking modal shown when an action requires the
 * associated company to be a Customer, but it isn't yet.
 *
 * Props:
 *   open, onClose
 *   companyName              – name of the blocking company
 *   title                    – heading (default contextual / "Customer Required")
 *   message                  – body JSX/string (default built from companyName)
 *   onConvert                – fires when "Convert to Customer Now" is clicked
 *   context                  – "quote_conversion" | "order_creation" | "stage_movement"
 */
export default function CustomerGateModal({
  open,
  onClose,
  companyName,
  title,
  message,
  onConvert,
  context,
}) {
  const resolvedTitle = title || CONTEXT_TITLES[context] || "Customer Required";

  const defaultMessage = (
    <>
      <strong className="text-ink">{companyName}</strong> is a{" "}
      <strong className="text-ink">Company</strong>, not yet a{" "}
      <strong className="text-ink">Customer</strong>. Customers are required
      to place orders.
    </>
  );

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <div className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} style={{ background: "var(--wiz-overlay-scrim)" }} onClick={onClose} />
      <div className={`relative bg-surface rounded-2xl shadow-4 w-full max-w-md mx-4 overflow-hidden border border-border flex flex-col transition-all duration-300 ease-out transform ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        {/* Close */}
        <div className="flex justify-end px-3 pt-3">
          <button onClick={onClose} className="text-disabled hover:text-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Warning icon + heading */}
        <div className="px-6 pb-2 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
            <AlertTriangle size={26} className="text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-ink">{resolvedTitle}</h3>
          <p className="text-sm text-muted leading-relaxed mt-2 max-w-xs">
            {message || defaultMessage}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-divider mt-4" />

        {/* Actions */}
        <div className="px-6 py-4 flex flex-col gap-2">
          <button
            onClick={onConvert}
            className="wiz-btn wiz-btn--primary w-full"
          >
            Convert to Customer Now <ArrowRight size={15} />
          </button>
          <button
            onClick={onClose}
            className="wiz-btn wiz-btn--text w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
