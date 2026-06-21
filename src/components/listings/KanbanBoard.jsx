import { useState } from "react";
import { User, Clock } from "lucide-react";
import { stageColors } from "../../data/constants";

// Generic Kanban board. `onDrop(item, newStage)` is called when a card is
// dragged onto a different column — the host decides whether the move is
// allowed (e.g. mandatory-field gate). Cards don't move on their own; the host
// owns the data, so the column a card appears in always reflects item[stageField].
export default function KanbanBoard({ stages, data, stageField = "stage", onCardClick, onDrop, renderCard }) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const handleDrop = (stage) => {
    const item = data.find((d) => d.id === draggingId);
    setDraggingId(null);
    setDragOverStage(null);
    if (item && item[stageField] !== stage) onDrop?.(item, stage);
  };

  return (
    <div className="flex-1 overflow-x-auto px-6 py-4">
      <div className="flex gap-4 min-w-max h-full">
        {stages.map((stage) => {
          const stageItems = data.filter((d) => d[stageField] === stage);
          const color = stageColors[stage] || "#6b7280";
          const isDragOver = dragOverStage === stage;
          return (
            <div
              key={stage}
              className="w-64 flex-shrink-0 flex flex-col"
              onDragOver={(e) => { if (draggingId != null) { e.preventDefault(); setDragOverStage(stage); } }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverStage(null); }}
              onDrop={(e) => { e.preventDefault(); handleDrop(stage); }}
            >
              {/* Column Header — 4px top border in the stage color */}
              <div
                className="flex items-center justify-between mb-3 px-2 py-2 bg-white rounded-t-lg border border-gray-200"
                style={{ borderTop: `4px solid ${color}` }}
              >
                <span className="text-sm font-semibold text-gray-700">{stage}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{stageItems.length}</span>
              </div>

              {/* Cards (drop zone) */}
              <div
                className={`flex-1 space-y-2.5 rounded-lg transition-colors ${
                  isDragOver ? "bg-indigo-50/60 ring-2 ring-indigo-200 ring-inset p-1" : ""
                }`}
              >
                {stageItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggingId(item.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }}
                    onClick={() => onCardClick?.(item)}
                    className={`bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-shadow ${
                      draggingId === item.id ? "opacity-40" : ""
                    }`}
                  >
                    {renderCard ? renderCard(item) : (
                      <>
                        <div className="font-medium text-sm text-gray-900 mb-1.5">{item.name}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><User size={11} />{item.rep}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{item.lastActivity}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span>{item.contacts} contacts</span>
                          <span>·</span>
                          <span>{item.deals} deals</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {stageItems.length === 0 && (
                  <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">
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
