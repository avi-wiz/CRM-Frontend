import { X, ArrowLeft } from "lucide-react";

export default function SideSheet({ open, onClose, title, width = "max-w-md", headerAction, onHeaderBack, children }) {
  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} style={{ background: "var(--wiz-overlay-scrim)" }} onClick={onClose} />
      <div className={`relative ${width} w-full bg-surface backdrop-blur shadow-4 border-l border-border flex flex-col transition-transform duration-300 ease-out transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <div className="flex items-center gap-2 min-w-0">
            {onHeaderBack && (
              <button onClick={onHeaderBack} className="p-1 -ml-1 rounded-lg hover:bg-action-hover text-muted hover:text-ink transition-colors flex-shrink-0" title="Back">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-base font-bold text-ink truncate">{title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerAction}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-action-hover text-disabled hover:text-muted transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{open && children}</div>
      </div>
    </div>
  );
}
