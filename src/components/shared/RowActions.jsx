import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

export default function RowActions({ actions = [] }) {
  const [open, setOpen] = useState(false);

  const defaultActions = [
    { label: "Merge / Convert", onClick: () => {} },
    { label: "Grant Web Access", onClick: () => {} },
    { label: "Delete", onClick: () => {}, danger: true },
  ];

  const menuItems = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1 rounded hover:bg-gray-100">
        <MoreHorizontal size={16} className="text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm ${item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
