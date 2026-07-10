import { useState, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

const MENU_WIDTH = 176; // w-44
const GAP = 4;

export default function RowActions({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // { top, left } in viewport coords
  const btnRef = useRef(null);

  const defaultActions = [
    { label: "Merge / Convert", onClick: () => {} },
    { label: "Grant Web Access", onClick: () => {} },
    { label: "Delete", onClick: () => {}, danger: true },
  ];

  const menuItems = actions.length > 0 ? actions : defaultActions;

  // Position the portal menu from the trigger's on-screen rect, flipping up
  // when there isn't room below. Right-aligned to the trigger.
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const estHeight = menuItems.length * 34 + 8;
    const openUp = rect.bottom + GAP + estHeight > window.innerHeight && rect.top > estHeight;
    setPos({
      top: openUp ? rect.top - GAP - estHeight : rect.bottom + GAP,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  }, [open, menuItems.length]);

  // Close on scroll/resize — the fixed menu would otherwise detach from the trigger.
  useLayoutEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div className="relative inline-flex">
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-ink hover:bg-action-hover transition-colors"
      >
        <MoreHorizontal size={18} className="shrink-0" />
      </button>
      {open && pos && createPortal(
        <>
          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div
            className="fixed z-[91] bg-surface border border-border rounded-lg shadow-4 py-1"
            style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
            onClick={(e) => e.stopPropagation()}
          >
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
        </>,
        document.body
      )}
    </div>
  );
}
