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
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <div className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} style={{ background: "var(--wiz-overlay-scrim)" }} onClick={onClose} />
      <div className={`relative bg-surface rounded-2xl shadow-4 w-full max-w-md mx-4 overflow-hidden border border-border flex flex-col transition-all duration-300 ease-out transform ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-4 ${
          destructive ? "bg-red-50 border-b border-red-100" : "border-b border-divider bg-tonal"
        }`}>
          <div className="flex items-start gap-3">
            {destructive && (
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
            )}
            <div>
              <h3 className={`text-base font-semibold ${destructive ? "text-red-900" : "text-ink"}`}>
                {title}
              </h3>
              {count !== undefined && (
                <p className={`text-xs mt-0.5 font-medium ${destructive ? "text-red-500" : "text-primary"}`}>
                  {count} {count === 1 ? "record" : "records"} will be affected
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-disabled hover:text-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {message && (
            <p className="text-sm text-muted leading-relaxed">{message}</p>
          )}
          {undoable !== undefined && (
            <p className={`text-xs mt-3 font-medium ${
              undoable ? "text-success" : "text-warning"
            }`}>
              {undoable ? "✓ This action can be undone." : "⚠ This action cannot be undone."}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-divider bg-tonal">
          <button
            onClick={onClose}
            className="wiz-btn wiz-btn--text"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`wiz-btn ${destructive ? "wiz-btn--danger" : "wiz-btn--primary"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
