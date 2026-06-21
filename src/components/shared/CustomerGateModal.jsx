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
  if (!open) return null;

  const resolvedTitle = title || CONTEXT_TITLES[context] || "Customer Required";

  const defaultMessage = (
    <>
      <strong className="text-gray-900">{companyName}</strong> is a{" "}
      <strong className="text-gray-900">Company</strong>, not yet a{" "}
      <strong className="text-gray-900">Customer</strong>. Customers are required
      to place orders.
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Close */}
        <div className="flex justify-end px-3 pt-3">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Warning icon + heading */}
        <div className="px-6 pb-2 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
            <AlertTriangle size={26} className="text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{resolvedTitle}</h3>
          <p className="text-sm text-gray-600 leading-relaxed mt-2 max-w-xs">
            {message || defaultMessage}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mt-4" />

        {/* Actions */}
        <div className="px-6 py-4 flex flex-col gap-2">
          <button
            onClick={onConvert}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Convert to Customer Now <ArrowRight size={15} />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
