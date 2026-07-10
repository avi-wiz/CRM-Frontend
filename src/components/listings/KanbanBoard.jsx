import { useState } from "react";
import { Clock } from "lucide-react";
import { stageColors } from "../../data/constants";
import RowActions from "../shared/RowActions";

// Helper to extract initials for representations
function repInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// Generic Kanban board. `onDrop(item, newStage)` is called when a card is
// dragged onto a different column — the host decides whether the move is
// allowed (e.g. mandatory-field gate). Cards don't move on their own; the host
// owns the data, so the column a card appears in always reflects item[stageField].
// `columnMeta` is an optional object keyed by stage name with { bg, borderColor, total }
// that allows hosts to customize column header appearance and show aggregate totals.
// `cardActions` is an optional `(item) => [{ label, onClick, danger? }]` that,
// when provided, renders an Actions kebab menu in the top-right of each card.
export default function KanbanBoard({ stages, data, stageField = "stage", onCardClick, onDrop, renderCard, cardActions, columnMeta }) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const handleDrop = (stage) => {
    const item = data.find((d) => d.id === draggingId);
    setDraggingId(null);
    setDragOverStage(null);
    if (item && item[stageField] !== stage) onDrop?.(item, stage);
  };

  return (
    <div className="flex-1 overflow-x-auto px-8 py-6">
      <div className="flex gap-5 min-w-max h-full items-start">
        {stages.map((stage) => {
          const stageItems = data.filter((d) => d[stageField] === stage);
          const color = stageColors[stage] || "#6b7280";
          const isDragOver = dragOverStage === stage;
          const meta = columnMeta?.[stage];
          return (
            <div
              key={stage}
              className="w-72 flex-shrink-0 flex flex-col rounded-2xl p-3 border border-divider"
              style={{ backgroundColor: meta?.bg || "rgba(248,250,252,0.3)", borderTopWidth: meta?.borderColor ? 3 : undefined, borderTopColor: meta?.borderColor || undefined }}
              onDragOver={(e) => {
                // Always preventDefault so this stays a valid HTML5 drop target —
                // gating relies on the drop firing even when React's draggingId
                // state hasn't propagated to this closure yet.
                e.preventDefault();
                if (dragOverStage !== stage) setDragOverStage(stage);
              }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverStage(null); }}
              onDrop={(e) => { e.preventDefault(); handleDrop(stage); }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1 py-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-bold text-ink tracking-tight">{stage}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {meta?.total && <span className="text-xs font-semibold text-disabled">{meta.total}</span>}
                  <span className="text-xs font-bold text-muted bg-surface px-2 py-0.5 rounded-lg border border-border shadow-1">{stageItems.length}</span>
                </div>
              </div>

              {/* Cards (drop zone) */}
              <div
                className={`flex-1 space-y-3 rounded-xl transition-all duration-200 p-1 min-h-[500px] ${
                  isDragOver ? "bg-action-hover border border-dashed border-primary animate-pulse-glow" : ""
                }`}
              >
                {stageItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggingId(item.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }}
                    onClick={() => onCardClick?.(item)}
                    className={`relative bg-surface border border-border rounded-2xl p-4 cursor-pointer hover:shadow-3 hover:border-primary transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] ${
                      draggingId === item.id ? "opacity-35 scale-95" : ""
                    }`}
                  >
                    {cardActions && (
                      <div
                        className="absolute top-2 right-2 z-10"
                        draggable
                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RowActions actions={cardActions(item)} />
                      </div>
                    )}
                    {cardActions ? <div className="pr-7">{renderCard ? renderCard(item) : null}</div> : (renderCard ? renderCard(item) : (
                      <>
                        <div className="font-bold text-sm text-ink mb-2 tracking-tight">{item.name}</div>
                        <div className="flex items-center gap-2.5 text-xs text-muted mb-3">
                          <div className="w-5 h-5 rounded-full bg-tonal text-primary-dark text-[9px] font-extrabold flex items-center justify-center shadow-1">
                            {repInitials(item.rep)}
                          </div>
                          <span className="font-medium text-muted">{item.rep || "Unassigned"}</span>
                          <span className="text-disabled">·</span>
                          <span className="flex items-center gap-1"><Clock size={11} className="text-disabled" />{item.lastActivity}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-divider text-xs text-disabled">
                          <span>{item.contacts} contacts</span>
                          <span>·</span>
                          <span>{item.deals} deals</span>
                        </div>
                      </>
                    ))}
                  </div>
                ))}
                {stageItems.length === 0 && (
                  <div className="border border-dashed border-border rounded-xl p-6 text-center text-xs text-disabled bg-white/40">
                    {isDragOver ? "Drop here" : "No items"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
