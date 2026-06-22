import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-150 flex flex-col transition-all duration-300 ease-out transform ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{open && children}</div>
      </div>
    </div>
  );
}
