import { useState } from "react";
import { Plus } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import ActivityTimeline from "./ActivityTimeline";
import { formatDate, formatCurrency, quoteStatusStyles, isQuoteExpired } from "../../data/constants";

// Center panel — tab bar + tab content for the Company detail page.
// `company` carries the nested orders/deals/activities/wizshop data.
const TABS = ["Sales", "Deals", "WizShop Activity", "Activities", "Quotes"];

export default function CenterTabs({ company, onActivityAction, onDealClick, quotes = [], onQuoteClick, onCreateQuote }) {
  const [active, setActive] = useState("Activities");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-150 bg-white px-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`relative px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              active === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {t}
            {active === t && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
        {active === "Sales" && <SalesTab orders={company.orders} />}
        {active === "Deals" && <DealsTab deals={company.deals} onDealClick={onDealClick} />}
        {active === "Activities" && (
          <ActivityTimeline
            activities={company.activities}
            contacts={company.contacts}
            deals={company.deals}
            onAction={onActivityAction}
          />
        )}
        {active === "WizShop Activity" && <WizShopTab company={company} />}
        {active === "Quotes" && <QuotesTab quotes={quotes} onQuoteClick={onQuoteClick} onCreateQuote={onCreateQuote} />}
      </div>
    </div>
  );
}

// ─── Tab 5: Quotes (associated quotes SSRM + Create CTA) ───
function QuotesTab({ quotes = [], onQuoteClick, onCreateQuote }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{quotes.length} quote{quotes.length === 1 ? "" : "s"}</span>
        <button
          onClick={onCreateQuote}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all duration-200"
        >
          <Plus size={15} /> Create Quote
        </button>
      </div>
      <MiniTable
        head={["Quote #", "Amount", "Status", "Contact", "Deal", "Valid Until", "Created"]}
        rows={quotes.map((q) => {
          const expired = isQuoteExpired(q.validUntil);
          return [
            <span onClick={() => onQuoteClick?.(q.id)} className="font-medium text-gray-900 hover:underline cursor-pointer">{q.quoteNumber}</span>,
            <span className="font-semibold">{formatCurrency(q.grandTotal)}</span>,
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quoteStatusStyles[q.status] || "bg-gray-100 text-gray-600"}`}>{q.status}</span>,
            q.contactName || "—",
            q.dealName || "—",
            <span className={expired ? "text-red-600 font-medium" : ""}>{formatDate(q.validUntil)}</span>,
            formatDate(q.createdAt),
          ];
        })}
      />
    </div>
  );
}

// ─── Tab 1: Sales (read-only orders SSRM) ───
const ORDER_STATUS_COLOR = {
  Pending: "bg-gray-100 text-gray-600",
  Confirmed: "bg-blue-50 text-blue-600",
  Shipped: "bg-purple-50 text-purple-600",
  Delivered: "bg-emerald-50 text-emerald-700",
};

function SalesTab({ orders = [] }) {
  return (
    <MiniTable
      head={["Order #", "Date", "Amount", "Status", "Items"]}
      rows={orders.map((o) => [
        <span className="font-medium text-gray-900">{o.id}</span>,
        formatDate(o.date),
        <span className="font-medium">{o.amount}</span>,
        <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status}</span>,
        o.items,
      ])}
    />
  );
}

// ─── Tab 2: Deals (associated deals SSRM) ───
function DealsTab({ deals = [], onDealClick }) {
  return (
    <MiniTable
      head={["Deal Name", "Amount", "Stage", "Owner", "Close Date"]}
      rows={deals.map((d) => [
        <span onClick={() => onDealClick?.(d)} className="font-medium text-gray-900 hover:underline cursor-pointer">{d.name}</span>,
        <span className="font-semibold">{d.amount}</span>,
        <StageBadge stage={d.stage} small />,
        d.owner,
        formatDate(d.closeDate),
      ])}
    />
  );
}

// ─── Tab 4: WizShop Activity (Summary / Analytics segmented control) ───
function WizShopTab({ company }) {
  const [view, setView] = useState("Summary");
  const w = company.wizshop || {};
  return (
    <div>
      <div className="inline-flex border border-gray-200 rounded-xl overflow-hidden mb-4 bg-gray-50 p-0.5">
        {["Summary", "Analytics"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ${view === v ? "bg-white text-indigo-600 font-semibold shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="border border-gray-150 rounded-2xl p-4 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.06)] hover:border-indigo-100 transition-all duration-300">
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold text-gray-900 mt-1 tracking-tight">{value ?? "—"}</div>
    </div>
  );
}

// Shared read-only mini SSRM table.
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
            <tr>
              <td colSpan={head.length} className="py-10 text-center text-sm text-gray-400">No records yet</td>
            </tr>
          )}
          {rows.map((cells, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors duration-150">
              {cells.map((c, j) => (
                <td key={j} className="py-3 px-4 text-gray-700">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
