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
    <div className="relative inline-flex">
      <button onClick={() => setOpen(!open)} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-ink hover:bg-action-hover transition-colors">
        <MoreHorizontal size={18} className="shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-30 bg-surface border border-border rounded-lg shadow-2 py-1 w-44">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm ${item.danger ? "text-danger hover:bg-danger-bg" : "text-muted hover:bg-action-hover"}`}
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
