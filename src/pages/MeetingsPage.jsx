import { useMemo, useState } from "react";
import { Calendar, Plus, SlidersHorizontal, Search, CheckCircle, Users } from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import RowActions from "../components/shared/RowActions";
import LogMeeting from "../components/side-sheets/log/LogMeeting";
import LogNote from "../components/side-sheets/log/LogNote";
import { EditSheet } from "../components/side-sheets/EditSheet";
import {
  formatDate,
  formatDuration,
  isPastDate,
  meetingOutcomeStyles,
} from "../data/constants";
import { useMeetings, addMeeting, updateMeeting } from "../data/meetingsStore";
import { logActivityFromEntity } from "../data/logActivity";

// Editable fields for the Reschedule sheet.
const RESCHEDULE_GROUPS = [
  {
    title: "Reschedule",
    fields: [
      { key: "date", label: "Date", type: "text" },
      { key: "startTime", label: "Start Time", type: "text" },
      { key: "duration", label: "Duration (min)", type: "number" },
    ],
  },
];

const HEAD = ["Title", "Date", "Time", "Duration", "Company", "Attendees", "Outcome", "Owner", ""];

// Map a duration label from LogMeeting ("1 hour") into minutes for the store.
function durationToMinutes(label) {
  if (typeof label === "number") return label;
  const map = { "15 min": 15, "30 min": 30, "45 min": 45, "1 hour": 60, "1.5 hours": 90, "2 hours": 120 };
  return map[label] || 30;
}

// Meetings listing — table only (no Kanban). Rows link to MeetingDetailPage.
export default function MeetingsPage({ onMeetingClick, onCompanyClick }) {
  const meetings = useMeetings();
  const [query, setQuery] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [noteTarget, setNoteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return meetings;
    return meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.companyName || "").toLowerCase().includes(q)
    );
  }, [meetings, query]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-150 bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Meetings</h1>
          <span className="text-sm text-gray-400">{meetings.length} meetings</span>
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all duration-200"
        >
          <Plus size={15} /> Log Meeting
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-8 py-3 border-b border-gray-150 bg-white">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or company…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={14} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
        <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50/70">
                {HEAD.map((h, i) => (
                  <th key={i} className="py-3 px-4 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={HEAD.length} className="py-12 text-center">
                    <div className="text-sm text-gray-500">No meetings found</div>
                    <div className="text-xs text-gray-400 mt-1">Log a meeting to get started.</div>
                  </td>
                </tr>
              )}
              {filtered.map((m) => {
                const past = isPastDate(m.date);
                const attendeeNames = (m.attendees || []).map((a) => a.contactName).join(", ");
                return (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors duration-150"
                    onClick={() => onMeetingClick?.(m.id)}
                  >
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2 font-medium text-gray-900">
                        <Calendar size={14} className="text-indigo-500 flex-shrink-0" />
                        {m.title}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${past ? "text-gray-400" : "text-gray-700"}`}>{formatDate(m.date)}</td>
                    <td className="py-3 px-4 text-gray-600">{m.startTime}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDuration(m.duration)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); onCompanyClick?.(m.companyId); }}
                        className="text-gray-700 hover:text-indigo-600 hover:underline"
                      >
                        {m.companyName}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {(m.attendees || []).length > 0 ? (
                        <span className="inline-flex items-center gap-1.5" title={attendeeNames}>
                          <Users size={13} className="text-gray-400" />
                          {m.attendees.length} contact{m.attendees.length === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meetingOutcomeStyles[m.outcome] || "bg-gray-100 text-gray-600"}`}>
                        {m.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{m.createdBy}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <RowActions
                        actions={[
                          { label: "View Detail", onClick: () => onMeetingClick?.(m.id) },
                          { label: "Reschedule", onClick: () => setRescheduleTarget(m) },
                          ...(m.outcome === "Cancelled" ? [] : [{ label: "Cancel", onClick: () => { updateMeeting(m.id, { outcome: "Cancelled" }); showToast(`"${m.title}" cancelled`); } }]),
                          { label: "Log Note", onClick: () => setNoteTarget(m) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── LOG MEETING SIDE SHEET ─── */}
      <SideSheet open={logOpen} onClose={() => setLogOpen(false)} title="Log Meeting" width="max-w-lg">
        {logOpen && (
          <LogMeeting
            entity={null}
            onClose={() => setLogOpen(false)}
            onSave={(payload) => {
              const created = addMeeting({
                title: payload.title,
                date: payload.date,
                startTime: payload.startTime || "—",
                duration: durationToMinutes(payload.duration),
                location: payload.location || "—",
                notes: payload.notes || "",
                attendees: payload.attendees || [],
                internalAttendees: payload.internalAttendees || [],
                companyId: payload.companyId ?? null,
                companyName: payload.companyName || "—",
                dealId: payload.dealId ?? null,
                dealName: payload.dealName ?? null,
              });
              setLogOpen(false);
              showToast(`"${created.title}" logged`);
            }}
          />
        )}
      </SideSheet>

      {/* Reschedule */}
      <SideSheet open={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)} title={rescheduleTarget ? `Reschedule — ${rescheduleTarget.title}` : ""}>
        {rescheduleTarget && (
          <EditSheet
            groups={RESCHEDULE_GROUPS}
            values={rescheduleTarget}
            entityLabel="Meeting"
            onClose={() => setRescheduleTarget(null)}
            onSave={(updated) => {
              updateMeeting(rescheduleTarget.id, {
                date: updated.date,
                startTime: updated.startTime,
                duration: Number(updated.duration) || rescheduleTarget.duration,
                outcome: rescheduleTarget.outcome === "Cancelled" ? "Scheduled" : rescheduleTarget.outcome,
              });
              setRescheduleTarget(null);
              showToast(`"${rescheduleTarget.title}" rescheduled`);
            }}
          />
        )}
      </SideSheet>

      {/* Log Note (associated to the meeting's company) */}
      <SideSheet open={!!noteTarget} onClose={() => setNoteTarget(null)} title="Log Note">
        {noteTarget && (
          <LogNote
            entity={noteTarget.companyId ? { id: noteTarget.companyId, type: "company", name: noteTarget.companyName } : null}
            onClose={() => setNoteTarget(null)}
            onSave={(activity) => {
              if (noteTarget.companyId) {
                logActivityFromEntity({ id: noteTarget.companyId, type: "company", name: noteTarget.companyName }, activity);
              }
              setNoteTarget(null);
              showToast(`Note added to "${noteTarget.title}"`);
            }}
          />
        )}
      </SideSheet>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
