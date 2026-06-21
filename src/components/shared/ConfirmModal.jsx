import { AlertTriangle, X } from "lucide-react";

/**
 * Reusable confirmation modal.
 *
 * Props:
 *   open          – boolean
 *   onClose       – dismiss without confirming
 *   onConfirm     – user clicked the primary action
 *   title         – modal heading
 *   message       – body text (string or JSX)
 *   confirmLabel  – primary button label (default "Confirm")
 *   destructive   – red header + red button (default false)
 *   undoable      – show "This action can be undone" (default false)
 *   count         – number of affected records (optional, shown as badge)
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  destructive = false,
  undoable = false,
  count,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-4 ${
          destructive ? "bg-red-50 border-b border-red-100" : "border-b border-gray-100"
        }`}>
          <div className="flex items-start gap-3">
            {destructive && (
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
            )}
            <div>
              <h3 className={`text-base font-semibold ${destructive ? "text-red-900" : "text-gray-900"}`}>
                {title}
              </h3>
              {count !== undefined && (
                <p className={`text-xs mt-0.5 font-medium ${destructive ? "text-red-500" : "text-indigo-600"}`}>
                  {count} {count === 1 ? "record" : "records"} will be affected
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {message && (
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          )}
          {undoable !== undefined && (
            <p className={`text-xs mt-3 font-medium ${
              undoable ? "text-emerald-600" : "text-amber-600"
            }`}>
              {undoable ? "✓ This action can be undone." : "⚠ This action cannot be undone."}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              destructive
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
