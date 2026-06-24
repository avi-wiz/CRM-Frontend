import { useState } from "react";
import { Plus } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import ActivityTimeline from "./ActivityTimeline";
import {
  formatDate, formatDuration, meetingOutcomeStyles, taskStatusStyles,
  taskPriorityStyles, visitOutcomeStyles, visitPurposeStyles,
} from "../../data/constants";
import { useVisits } from "../../data/visitsStore";
import { useMeetings } from "../../data/meetingsStore";
import { useTasks } from "../../data/tasksStore";
import { useEntityActivities } from "../../data/activitiesStore";

// Center panel for the Contact detail page. Tab set + styling + per-tab layout
// mirror the Company/Customer center view (CenterTabs) for consistency. Contact
// has no Quotes tab (Quotes are company-scoped, per PRD).
const TABS = ["Sales", "Deals", "Visits", "Meetings", "Tasks", "WizShop Activity", "Activities"];

const ORDER_STATUS_COLOR = {
  Pending: "bg-gray-100 text-gray-600",
  Confirmed: "bg-blue-50 text-blue-600",
  Shipped: "bg-purple-50 text-purple-600",
  Delivered: "bg-emerald-50 text-emerald-700",
};

export default function ContactCenterTabs({ contact, onActivityAction, onDealClick, onCreateDeal, onVisitClick, onTaskClick, onMeetingClick }) {
  const [active, setActive] = useState("Activities");
  const companyName = contact.company?.name;

  // Store-backed, contact-scoped collections (so newly-logged records show up).
  const contactVisits = useVisits().filter((v) => (v.contactIds || []).some((c) => c.contactId === contact.id));
  const contactMeetings = useMeetings().filter((m) => (m.attendees || []).some((a) => a.contactId === contact.id));
  const contactTasks = useTasks().filter((t) => (t.associations?.contactIds || []).some((c) => c.contactId === contact.id));
  const activities = useEntityActivities("contact", contact.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-100 bg-white px-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              active === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
        {active === "Sales" && (
          <div>
            <div className="text-xs text-gray-400 mb-3">Via {companyName}</div>
            <MiniTable
              head={["Order #", "Date", "Amount", "Status", "Items"]}
              rows={(contact.companyOrders || []).map((o) => [
                <span className="font-medium text-gray-900">{o.id}</span>,
                formatDate(o.date),
                <span className="font-medium">{o.amount}</span>,
                <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status}</span>,
                o.items,
              ])}
            />
          </div>
        )}

        {active === "Deals" && (
          <div>
            <TabHeader count={(contact.deals || []).length} noun="deal" cta={{ label: "Create Deal", onClick: onCreateDeal }} />
            <MiniTable
              head={["Deal Name", "Amount", "Stage", "Owner", "Close Date"]}
              rows={(contact.deals || []).map((d) => [
                <span onClick={() => onDealClick?.(d)} className="font-medium text-gray-900 hover:underline cursor-pointer">{d.name}</span>,
                <span className="font-semibold">{d.amount}</span>,
                <StageBadge stage={d.stage} small />,
                d.owner,
                formatDate(d.closeDate),
              ])}
            />
          </div>
        )}

        {active === "Visits" && (
          <div>
            <TabHeader count={contactVisits.length} noun="visit" cta={{ label: "Log Visit", onClick: () => onActivityAction?.("visit") }} />
            <MiniTable
              head={["Date", "Rep", "Purpose", "Outcome", "Duration"]}
              rows={contactVisits.map((v) => [
                <span onClick={() => onVisitClick?.(v.id)} className="font-medium text-gray-900 hover:underline cursor-pointer">{formatDate(v.visitDate)}</span>,
                v.rep?.repName || "—",
                <span className={`text-xs px-2 py-0.5 rounded-full ${visitPurposeStyles[v.purpose] || "bg-gray-100 text-gray-600"}`}>{v.purpose}</span>,
                <span className={`text-xs px-2 py-0.5 rounded-full ${visitOutcomeStyles[v.outcome] || "bg-gray-100 text-gray-600"}`}>{v.outcome}</span>,
                formatDuration(v.duration),
              ])}
            />
          </div>
        )}

        {active === "Meetings" && (
          <div>
            <TabHeader count={contactMeetings.length} noun="meeting" cta={{ label: "Log Meeting", onClick: () => onActivityAction?.("meeting") }} />
            <MiniTable
              head={["Title", "Date", "Duration", "Attendees", "Outcome"]}
              rows={contactMeetings.map((m) => [
                <span onClick={() => onMeetingClick?.(m.id)} className="font-medium text-gray-900 hover:underline cursor-pointer">{m.title}</span>,
                formatDate(m.date),
                formatDuration(m.duration),
                `${(m.attendees || []).length} contact${(m.attendees || []).length === 1 ? "" : "s"}`,
                <span className={`text-xs px-2 py-0.5 rounded-full ${meetingOutcomeStyles[m.outcome] || "bg-gray-100 text-gray-600"}`}>{m.outcome}</span>,
              ])}
            />
          </div>
        )}

        {active === "Tasks" && (
          <div>
            <TabHeader count={contactTasks.length} noun="task" cta={{ label: "Create Task", onClick: () => onActivityAction?.("task") }} />
            <MiniTable
              head={["Title", "Assignee", "Due Date", "Priority", "Status"]}
              rows={contactTasks.map((t) => [
                <span onClick={() => onTaskClick?.(t.id)} className="font-medium text-gray-900 hover:underline cursor-pointer">{t.title}</span>,
                t.assignee?.repName || "—",
                formatDate(t.dueDate),
                <span className={`text-xs px-2 py-0.5 rounded-full ${taskPriorityStyles[t.priority] || "bg-gray-100 text-gray-600"}`}>{t.priority}</span>,
                <span className={`text-xs px-2 py-0.5 rounded-full ${taskStatusStyles[t.status] || "bg-gray-100 text-gray-600"}`}>{t.status}</span>,
              ])}
            />
          </div>
        )}

        {active === "WizShop Activity" && (
          <div className="space-y-2.5 max-w-xl">
            {(contact.wizShopActions || []).length === 0 && (
              <div className="text-sm text-gray-400 py-4 text-center">No WizShop activity</div>
            )}
            {(contact.wizShopActions || []).map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-150 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:border-indigo-100 transition-all duration-200">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex-shrink-0 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">{a.action}</span>
                  <span className="text-sm text-gray-500"> — {a.detail}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        )}

        {active === "Activities" && (
          <ActivityTimeline activities={activities} onAction={onActivityAction} onVisitClick={onVisitClick} onTaskClick={onTaskClick} onMeetingClick={onMeetingClick} />
        )}
      </div>
    </div>
  );
}

// Shared tab header: count + right-aligned CTA (mirrors CenterTabs).
function TabHeader({ count, noun, cta }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-gray-500">{count} {noun}{count === 1 ? "" : "s"}</span>
      {cta && (
        <button onClick={cta.onClick} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all duration-200">
          <Plus size={15} /> {cta.label}
        </button>
      )}
    </div>
  );
}

// Shared read-only mini SSRM table (matches CenterTabs styling).
function MiniTable({ head, rows }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-150 bg-gray-50/70">
            {head.map((h) => (
              <th key={h} className="py-3 px-4 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 && (
            <tr><td colSpan={head.length} className="py-10 text-center text-sm text-gray-400">No records yet</td></tr>
          )}
          {rows.map((cells, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors duration-150">
              {cells.map((c, j) => <td key={j} className="py-3 px-4 text-gray-700">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
