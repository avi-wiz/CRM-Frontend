import { useState } from "react";
import StageBadge from "../shared/StageBadge";
import ActivityTimeline from "./ActivityTimeline";
import { formatDate, formatDuration, visitOutcomeStyles, visitPurposeStyles } from "../../data/constants";
import { useVisits } from "../../data/visitsStore";
import { useEntityActivities } from "../../data/activitiesStore";

// Center panel for the Contact detail page — 7 tabs.
const TABS = ["Sales", "Deals", "Meetings", "Tasks", "Visits", "WizShop Activity", "Activities"];

const ORDER_STATUS_COLOR = {
  Pending: "bg-gray-100 text-gray-600",
  Confirmed: "bg-blue-50 text-blue-600",
  Shipped: "bg-purple-50 text-purple-600",
  Delivered: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_COLOR = {
  High: "bg-red-50 text-red-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-gray-100 text-gray-500",
};

const TASK_STATUS_COLOR = {
  Done: "bg-emerald-50 text-emerald-600",
  Open: "bg-amber-50 text-amber-600",
};

export default function ContactCenterTabs({ contact, onActivityAction, onDealClick, onVisitClick, onTaskClick, onMeetingClick }) {
  const [active, setActive] = useState("Activities");
  const companyName = contact.company?.name;

  // Visits where this contact was met — sourced from the live visits store so
  // newly-logged visits show up here too.
  const allVisits = useVisits();
  const contactVisits = allVisits.filter((v) =>
    (v.contactIds || []).some((c) => c.contactId === contact.id)
  );
  // Unified activity timeline, filtered to this contact by explicit association.
  const activities = useEntityActivities("contact", contact.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-100 bg-white px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              active === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {active === "Sales" && (
          <div>
            <div className="text-xs text-gray-400 mb-2">Via {companyName}</div>
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
        )}

        {active === "Meetings" && (
          <MiniTable
            head={["Title", "Date", "Duration", "Outcome"]}
            rows={(contact.meetings || []).map((m) => [
              <span className="font-medium text-gray-900">{m.title}</span>,
              formatDate(m.date),
              m.duration,
              <span className={`text-xs px-2 py-0.5 rounded-full ${m.outcome === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-600"}`}>{m.outcome}</span>,
            ])}
          />
        )}

        {active === "Tasks" && (
          <MiniTable
            head={["Title", "Due Date", "Assignee", "Priority", "Status"]}
            rows={(contact.tasks || []).map((t) => [
              <span className="font-medium text-gray-900">{t.title}</span>,
              formatDate(t.due),
              t.assignee,
              <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLOR[t.priority] || "bg-gray-100 text-gray-500"}`}>{t.priority}</span>,
              <span className={`text-xs px-2 py-0.5 rounded-full ${TASK_STATUS_COLOR[t.status] || "bg-gray-100 text-gray-500"}`}>{t.status}</span>,
            ])}
          />
        )}

        {active === "Visits" && (
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
        )}

        {active === "WizShop Activity" && (
          <div className="space-y-2.5 max-w-xl">
            {(contact.wizShopActions || []).length === 0 && (
              <div className="text-sm text-gray-400 py-4 text-center">No WizShop activity</div>
            )}
            {(contact.wizShopActions || []).map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 bg-white">
                <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
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

// Shared read-only mini SSRM table (mirrors CenterTabs).
function MiniTable({ head, rows }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {head.map((h) => (
            <th key={h} className="py-2 px-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td colSpan={head.length} className="py-6 text-center text-gray-400 text-xs">No records</td></tr>
        )}
        {rows.map((cells, i) => (
          <tr key={i} className="border-b border-gray-50">
            {cells.map((c, j) => <td key={j} className="py-2.5 px-3 text-gray-700">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
