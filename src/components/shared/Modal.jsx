import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} style={{ background: "var(--wiz-overlay-scrim)" }} onClick={onClose} />
      <div className={`relative bg-surface backdrop-blur-md rounded-2xl shadow-4 max-w-md w-full mx-4 border border-border flex flex-col transition-all duration-300 ease-out transform ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <h3 className="text-base font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-action-hover text-muted hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{open && children}</div>
      </div>
    </div>
  );
}
