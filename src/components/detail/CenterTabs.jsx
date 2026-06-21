import { useState } from "react";
import StageBadge from "../shared/StageBadge";
import ActivityTimeline from "./ActivityTimeline";
import { formatDate } from "../../data/constants";

// Center panel — tab bar + tab content for the Company detail page.
// `company` carries the nested orders/deals/activities/wizshop data.
const TABS = ["Sales", "Deals", "Activities", "WizShop Activity"];

export default function CenterTabs({ company, onActivityAction, onDealClick }) {
  const [active, setActive] = useState("Activities");

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
      </div>
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
      <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden mb-4">
        {["Summary", "Analytics"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 text-sm ${view === v ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
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
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-900 mt-0.5">{value ?? "—"}</div>
    </div>
  );
}

// Shared read-only mini SSRM table.
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
        {rows.map((cells, i) => (
          <tr key={i} className="border-b border-gray-50">
            {cells.map((c, j) => (
              <td key={j} className="py-2.5 px-3 text-gray-700">{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
