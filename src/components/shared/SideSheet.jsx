import { X } from "lucide-react";

export default function SideSheet({ open, onClose, title, width = "max-w-md", children }) {
  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`relative ${width} w-full bg-white/95 backdrop-blur shadow-2xl border-l border-gray-150 flex flex-col transition-transform duration-300 ease-out transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{open && children}</div>
      </div>
    </div>
  );
}
