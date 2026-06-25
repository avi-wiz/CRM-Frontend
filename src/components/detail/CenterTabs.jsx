import { useState } from "react";
import { Plus } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import ActivityTimeline from "./ActivityTimeline";
import {
  formatDate, formatCurrency, formatDuration, quoteStatusStyles, isQuoteExpired,
  meetingOutcomeStyles, taskStatusStyles, taskPriorityStyles, visitPurposeStyles, visitOutcomeStyles,
} from "../../data/constants";
import { useEntityActivities } from "../../data/activitiesStore";
import { useMeetings } from "../../data/meetingsStore";
import { useTasks } from "../../data/tasksStore";
import { useVisits } from "../../data/visitsStore";

// Center panel — tab bar + tab content for the Company / Customer detail page.
// Tab set + styling mirror the Contact detail page (ContactCenterTabs) for
// consistency. `company` carries the nested orders/deals/wizshop data; the
// Visits/Meetings/Tasks tabs source from their stores, filtered to this company.
const TABS = ["Sales", "Deals", "Visits", "Meetings", "Tasks", "WizShop Activity", "Activities", "Quotes"];

export default function CenterTabs({ company, onActivityAction, onDealClick, quotes = [], onQuoteClick, onCreateQuote, onVisitClick, onTaskClick, onMeetingClick }) {
  const [active, setActive] = useState("Activities");

  const entityType = company.isCustomer ? "customer" : "company";
  const activities = useEntityActivities(entityType, company.id);

  // Store-backed, company-scoped collections.
  const companyVisits = useVisits().filter((v) => v.companyId === company.id);
  const companyMeetings = useMeetings().filter((m) => m.companyId === company.id);
  const companyTasks = useTasks().filter((t) => t.associations?.companyId === company.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-border bg-surface px-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              active === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-default">
        {active === "Sales" && <SalesTab orders={company.orders} />}
        {active === "Deals" && <DealsTab deals={company.deals} onDealClick={onDealClick} onCreateDeal={() => onActivityAction?.("addDeal")} />}
        {active === "Visits" && <VisitsTab visits={companyVisits} onVisitClick={onVisitClick} onLogVisit={() => onActivityAction?.("visit")} />}
        {active === "Meetings" && <MeetingsTab meetings={companyMeetings} onMeetingClick={onMeetingClick} onLogMeeting={() => onActivityAction?.("meeting")} />}
        {active === "Tasks" && <TasksTab tasks={companyTasks} onTaskClick={onTaskClick} onCreateTask={() => onActivityAction?.("task")} />}
        {active === "Activities" && (
          <ActivityTimeline
            activities={activities}
            onAction={onActivityAction}
            onVisitClick={onVisitClick}
            onTaskClick={onTaskClick}
            onMeetingClick={onMeetingClick}
          />
        )}
        {active === "WizShop Activity" && <WizShopTab company={company} />}
        {active === "Quotes" && <QuotesTab quotes={quotes} onQuoteClick={onQuoteClick} onCreateQuote={onCreateQuote} />}
      </div>
    </div>
  );
}

// Shared tab header: count + right-aligned CTA.
function TabHeader({ count, noun, cta }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-muted">{count} {noun}{count === 1 ? "" : "s"}</span>
      {cta && (
        <button onClick={cta.onClick} className="wiz-btn wiz-btn--primary flex items-center gap-1.5">
          <Plus size={15} /> {cta.label}
        </button>
      )}
    </div>
  );
}

// ─── Visits (company-scoped SSRM + Log Visit CTA) ───
function VisitsTab({ visits = [], onVisitClick, onLogVisit }) {
  return (
    <div>
      <TabHeader count={visits.length} noun="visit" cta={{ label: "Log Visit", onClick: onLogVisit }} />
      <MiniTable
        head={["Date", "Rep", "Purpose", "Outcome", "Duration"]}
        rows={visits.map((v) => [
          <span onClick={() => onVisitClick?.(v.id)} className="font-medium text-ink hover:underline cursor-pointer">{formatDate(v.visitDate)}</span>,
          v.rep?.repName || "—",
          <span className={`text-xs px-2 py-0.5 rounded-full ${visitPurposeStyles[v.purpose] || "bg-tonal text-muted"}`}>{v.purpose}</span>,
          <span className={`text-xs px-2 py-0.5 rounded-full ${visitOutcomeStyles[v.outcome] || "bg-tonal text-muted"}`}>{v.outcome}</span>,
          formatDuration(v.duration),
        ])}
      />
    </div>
  );
}

// ─── Meetings (company-scoped SSRM + Log Meeting CTA) ───
function MeetingsTab({ meetings = [], onMeetingClick, onLogMeeting }) {
  return (
    <div>
      <TabHeader count={meetings.length} noun="meeting" cta={{ label: "Log Meeting", onClick: onLogMeeting }} />
      <MiniTable
        head={["Title", "Date", "Duration", "Attendees", "Outcome"]}
        rows={meetings.map((m) => [
          <span onClick={() => onMeetingClick?.(m.id)} className="font-medium text-ink hover:underline cursor-pointer">{m.title}</span>,
          formatDate(m.date),
          formatDuration(m.duration),
          `${(m.attendees || []).length} contact${(m.attendees || []).length === 1 ? "" : "s"}`,
          <span className={`text-xs px-2 py-0.5 rounded-full ${meetingOutcomeStyles[m.outcome] || "bg-tonal text-muted"}`}>{m.outcome}</span>,
        ])}
      />
    </div>
  );
}

// ─── Tasks (company-scoped SSRM + Create Task CTA) ───
function TasksTab({ tasks = [], onTaskClick, onCreateTask }) {
  return (
    <div>
      <TabHeader count={tasks.length} noun="task" cta={{ label: "Create Task", onClick: onCreateTask }} />
      <MiniTable
        head={["Title", "Assignee", "Due Date", "Priority", "Status"]}
        rows={tasks.map((t) => [
          <span onClick={() => onTaskClick?.(t.id)} className="font-medium text-ink hover:underline cursor-pointer">{t.title}</span>,
          t.assignee?.repName || "—",
          formatDate(t.dueDate),
          <span className={`text-xs px-2 py-0.5 rounded-full ${taskPriorityStyles[t.priority] || "bg-tonal text-muted"}`}>{t.priority}</span>,
          <span className={`text-xs px-2 py-0.5 rounded-full ${taskStatusStyles[t.status] || "bg-tonal text-muted"}`}>{t.status}</span>,
        ])}
      />
    </div>
  );
}

// ─── Tab 5: Quotes (associated quotes SSRM + Create CTA) ───
function QuotesTab({ quotes = [], onQuoteClick, onCreateQuote }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted">{quotes.length} quote{quotes.length === 1 ? "" : "s"}</span>
        <button
          onClick={onCreateQuote}
          className="wiz-btn wiz-btn--primary flex items-center gap-1.5"
        >
          <Plus size={15} /> Create Quote
        </button>
      </div>
      <MiniTable
        head={["Quote #", "Amount", "Status", "Contact", "Deal", "Valid Until", "Created"]}
        rows={quotes.map((q) => {
          const expired = isQuoteExpired(q.validUntil);
          return [
            <span onClick={() => onQuoteClick?.(q.id)} className="font-medium text-ink hover:underline cursor-pointer">{q.quoteNumber}</span>,
            <span className="font-semibold">{formatCurrency(q.grandTotal)}</span>,
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quoteStatusStyles[q.status] || "bg-tonal text-muted"}`}>{q.status}</span>,
            q.contactName || "—",
            q.dealName || "—",
            <span className={expired ? "text-danger-dark font-medium" : ""}>{formatDate(q.validUntil)}</span>,
            formatDate(q.createdAt),
          ];
        })}
      />
    </div>
  );
}

// ─── Tab 1: Sales (read-only orders SSRM) ───
const ORDER_STATUS_COLOR = {
  Pending: "bg-tonal text-muted",
  Confirmed: "bg-info-bg text-info-dark",
  Shipped: "bg-purple-50 text-purple-600",
  Delivered: "bg-success-bg text-success-dark",
};

function SalesTab({ orders = [] }) {
  return (
    <MiniTable
      head={["Order #", "Date", "Amount", "Status", "Items"]}
      rows={orders.map((o) => [
        <span className="font-medium text-ink">{o.id}</span>,
        formatDate(o.date),
        <span className="font-medium">{o.amount}</span>,
        <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLOR[o.status] || "bg-tonal text-muted"}`}>{o.status}</span>,
        o.items,
      ])}
    />
  );
}

// ─── Tab 2: Deals (associated deals SSRM + Create Deal CTA) ───
function DealsTab({ deals = [], onDealClick, onCreateDeal }) {
  return (
    <div>
      <TabHeader count={deals.length} noun="deal" cta={{ label: "Create Deal", onClick: onCreateDeal }} />
      <MiniTable
        head={["Deal Name", "Amount", "Stage", "Owner", "Close Date"]}
        rows={deals.map((d) => [
          <span onClick={() => onDealClick?.(d)} className="font-medium text-ink hover:underline cursor-pointer">{d.name}</span>,
          <span className="font-semibold">{d.amount}</span>,
          <StageBadge stage={d.stage} small />,
          d.owner,
          formatDate(d.closeDate),
        ])}
      />
    </div>
  );
}

// ─── Tab 4: WizShop Activity (Summary / Analytics segmented control) ───
function WizShopTab({ company }) {
  const [view, setView] = useState("Summary");
  const w = company.wizshop || {};
  return (
    <div>
      <div className="inline-flex border border-border rounded-xl overflow-hidden mb-4 bg-default p-0.5">
        {["Summary", "Analytics"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ${view === v ? "bg-surface text-primary font-semibold shadow-1" : "text-muted hover:text-ink"}`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "Summary" ? (
        <div className="grid grid-cols-2 gap-3 max-w-lg">
          <MetricCard label="Total Orders" value={w.totalOrders} />
          <MetricCard label="Total Revenue" value={w.totalRevenue} />
          <MetricCard label="Last Order Date" value={w.lastOrderDate ? formatDate(w.lastOrderDate) : "—"} />
          <MetricCard label="Average Order Value" value={w.avgOrderValue} />
        </div>
      ) : (
        <div className="space-y-2.5 max-w-xl">
          {(company.wizshopActions || []).map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface shadow-1 hover:border-primary transition-all duration-200">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 shadow-2" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-ink">{a.action}</span>
                <span className="text-sm text-muted"> — {a.detail}</span>
              </div>
              <span className="text-xs text-disabled flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="border border-border rounded-2xl p-4 bg-surface shadow-2 hover:shadow-4 hover:border-primary transition-all duration-300">
      <div className="text-[11px] font-medium text-disabled uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold text-ink mt-1 tracking-tight">{value ?? "—"}</div>
    </div>
  );
}

// Shared read-only mini SSRM table.
function MiniTable({ head, rows }) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-2 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-default">
            {head.map((h) => (
              <th key={h} className="py-3 px-4 text-left font-bold text-disabled text-[10px] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-10 text-center text-sm text-disabled">No records yet</td>
            </tr>
          )}
          {rows.map((cells, i) => (
            <tr key={i} className="hover:bg-action-hover transition-colors duration-150">
              {cells.map((c, j) => (
                <td key={j} className="py-3 px-4 text-muted">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
