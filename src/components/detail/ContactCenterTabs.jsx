import { useState } from "react";
import { Plus } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import ActivityTimeline from "./ActivityTimeline";
import EmailViewSideSheet from "./EmailViewSideSheet";
import SideSheet from "../shared/SideSheet";
import ComposeEmail from "../side-sheets/email/ComposeEmail";
import {
  formatDate, formatDuration, meetingOutcomeStyles, taskStatusStyles,
  taskPriorityStyles, visitOutcomeStyles, visitPurposeStyles,
} from "../../data/constants";
import { useVisits } from "../../data/visitsStore";
import { useMeetings } from "../../data/meetingsStore";
import { useTasks } from "../../data/tasksStore";
import { useEntityActivities } from "../../data/activitiesStore";
import { groupEmailThreads } from "../../data/groupEmailThreads";

// Center panel for the Contact detail page. Tab set + styling + per-tab layout
// mirror the Company/Customer center view (CenterTabs) for consistency. Contact
// has no Quotes tab (Quotes are company-scoped, per PRD).
const TABS = ["Sales", "Deals", "Visits", "Meetings", "Tasks", "WizShop Activity", "Activities"];

const ORDER_STATUS_COLOR = {
  Pending: "bg-tonal text-muted",
  Confirmed: "bg-info-bg text-info-dark",
  Shipped: "bg-purple-50 text-purple-600",
  Delivered: "bg-success-bg text-success-dark",
};

export default function ContactCenterTabs({ contact, onActivityAction, onDealClick, onCreateDeal, onVisitClick, onTaskClick, onMeetingClick }) {
  const [active, setActive] = useState("Activities");
  const [openEmail, setOpenEmail] = useState(null);
  const [replyState, setReplyState] = useState(null); // { mode, original }
  const companyName = contact.company?.name;

  // Store-backed, contact-scoped collections (so newly-logged records show up).
  const contactVisits = useVisits().filter((v) => (v.contactIds || []).some((c) => c.contactId === contact.id));
  const contactMeetings = useMeetings().filter((m) => (m.attendees || []).some((a) => a.contactId === contact.id));
  const contactTasks = useTasks().filter((t) => (t.associations?.contactIds || []).some((c) => c.contactId === contact.id));
  const activities = useEntityActivities("contact", contact.id);

  // Real synced emails carry threadId — group them so opening one shows the
  // whole conversation (e.g. a reply that landed back), not just the message
  // that was clicked.
  const emailThreadGroups = groupEmailThreads(activities.filter((a) => a.type === "email" && a.date != null));
  const openThread = openEmail
    ? emailThreadGroups.find((g) => g.messages.some((m) => m.id === openEmail.id))?.messages || [openEmail]
    : null;

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
        {active === "Sales" && (
          <div>
            <div className="text-xs text-disabled mb-3">Via {companyName}</div>
            <MiniTable
              head={["Order #", "Date", "Amount", "Status", "Items"]}
              rows={(contact.companyOrders || []).map((o) => [
                <span className="font-medium text-ink">{o.id}</span>,
                formatDate(o.date),
                <span className="font-medium">{o.amount}</span>,
                <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLOR[o.status] || "bg-tonal text-muted"}`}>{o.status}</span>,
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
                <span onClick={() => onDealClick?.(d)} className="font-medium text-ink hover:underline cursor-pointer">{d.name}</span>,
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
                <span onClick={() => onVisitClick?.(v.id)} className="font-medium text-ink hover:underline cursor-pointer">{formatDate(v.visitDate)}</span>,
                v.rep?.repName || "—",
                <span className={`text-xs px-2 py-0.5 rounded-full ${visitPurposeStyles[v.purpose] || "bg-tonal text-muted"}`}>{v.purpose}</span>,
                <span className={`text-xs px-2 py-0.5 rounded-full ${visitOutcomeStyles[v.outcome] || "bg-tonal text-muted"}`}>{v.outcome}</span>,
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
                <span onClick={() => onMeetingClick?.(m.id)} className="font-medium text-ink hover:underline cursor-pointer">{m.title}</span>,
                formatDate(m.date),
                formatDuration(m.duration),
                `${(m.attendees || []).length} contact${(m.attendees || []).length === 1 ? "" : "s"}`,
                <span className={`text-xs px-2 py-0.5 rounded-full ${meetingOutcomeStyles[m.outcome] || "bg-tonal text-muted"}`}>{m.outcome}</span>,
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
                <span onClick={() => onTaskClick?.(t.id)} className="font-medium text-ink hover:underline cursor-pointer">{t.title}</span>,
                t.assignee?.repName || "—",
                formatDate(t.dueDate),
                <span className={`text-xs px-2 py-0.5 rounded-full ${taskPriorityStyles[t.priority] || "bg-tonal text-muted"}`}>{t.priority}</span>,
                <span className={`text-xs px-2 py-0.5 rounded-full ${taskStatusStyles[t.status] || "bg-tonal text-muted"}`}>{t.status}</span>,
              ])}
            />
          </div>
        )}

        {active === "WizShop Activity" && (
          <div className="space-y-2.5 max-w-xl">
            {(contact.wizShopActions || []).length === 0 && (
              <div className="text-sm text-disabled py-4 text-center">No WizShop activity</div>
            )}
            {(contact.wizShopActions || []).map((a, i) => (
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

        {active === "Activities" && (
          <ActivityTimeline
            activities={activities}
            onAction={onActivityAction}
            onVisitClick={onVisitClick}
            onTaskClick={onTaskClick}
            onMeetingClick={onMeetingClick}
            onEmailOpen={setOpenEmail}
            onEmailReply={(email) => setReplyState({ mode: "reply", original: email })}
            onEmailForward={(email) => setReplyState({ mode: "forward", original: email })}
          />
        )}
      </div>

      {openThread && <EmailViewSideSheet thread={openThread} onClose={() => setOpenEmail(null)} />}

      {replyState && (
        <SideSheet
          open={!!replyState}
          onClose={() => setReplyState(null)}
          title={replyState.mode === "reply" ? "Reply" : "Forward"}
        >
          <ComposeEmail
            mode={replyState.mode}
            original={replyState.original}
            onClose={() => setReplyState(null)}
            onSent={() => setReplyState(null)}
          />
        </SideSheet>
      )}
    </div>
  );
}

// Shared tab header: count + right-aligned CTA (mirrors CenterTabs).
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

// Shared read-only mini SSRM table (matches CenterTabs styling).
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
            <tr><td colSpan={head.length} className="py-10 text-center text-sm text-disabled">No records yet</td></tr>
          )}
          {rows.map((cells, i) => (
            <tr key={i} className="hover:bg-action-hover transition-colors duration-150">
              {cells.map((c, j) => <td key={j} className="py-3 px-4 text-muted">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
