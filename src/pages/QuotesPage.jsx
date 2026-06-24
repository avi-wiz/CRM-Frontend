import { useState } from "react";
import { FileText, Plus, CheckCircle } from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import RowActions from "../components/shared/RowActions";
import CreateQuote from "../components/side-sheets/CreateQuote";
import {
  getQuoteCompany,
  formatDate,
  formatCurrency,
  quoteStatusStyles,
  isQuoteExpired,
} from "../data/constants";
import { useQuotes, addQuote, updateQuote, duplicateQuote } from "../data/quotesStore";

const HEAD = ["Quote #", "Company", "Amount", "Status", "Contact", "Valid Until", "Created", ""];

// Quotes listing — each row links to QuoteDetailPage.
export default function QuotesPage({ onQuoteClick }) {
  const quotes = useQuotes().filter((q) => !q.archived);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-150 bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quotes</h1>
          <span className="text-sm text-gray-400">{quotes.length} quotes</span>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all duration-200"
        >
          <Plus size={15} /> Create Quote
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
        <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50/70">
                {HEAD.map((h) => (
                  <th key={h} className="py-3 px-4 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={HEAD.length} className="py-12 text-center">
                    <div className="text-sm text-gray-500">No quotes found</div>
                    <div className="text-xs text-gray-400 mt-1">Quotes will appear here once created.</div>
                  </td>
                </tr>
              )}
              {quotes.map((q) => {
                const company = getQuoteCompany(q);
                const expired = isQuoteExpired(q.validUntil);
                return (
                  <tr
                    key={q.id}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors duration-150"
                    onClick={() => onQuoteClick?.(q.id)}
                  >
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2 font-medium text-gray-900">
                        <FileText size={14} className="text-indigo-500" />
                        {q.quoteNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="flex items-center gap-2">
                        {q.companyName}
                        {!company?.isCustomer && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">Not a Customer</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(q.grandTotal)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quoteStatusStyles[q.status] || "bg-gray-100 text-gray-600"}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{q.contactName || "—"}</td>
                    <td className={`py-3 px-4 ${expired ? "text-red-600 font-medium" : "text-gray-500"}`}>{formatDate(q.validUntil)}</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(q.createdAt)}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <RowActions
                        actions={[
                          { label: "View Detail", onClick: () => onQuoteClick?.(q.id) },
                          ...(q.status === "Draft" ? [{ label: "Send Quote", onClick: () => { updateQuote(q.id, { status: "Sent" }); showToast(`${q.quoteNumber} sent`); } }] : []),
                          { label: "Duplicate", onClick: () => { const copy = duplicateQuote(q.id); if (copy) showToast(`Duplicated as ${copy.quoteNumber}`); } },
                          ...(q.status === "Accepted"
                            ? [{ label: "Convert to Order", onClick: () => showToast(company?.isCustomer ? `Converting ${q.quoteNumber} to an order…` : `${q.companyName} must be a Customer first`) }]
                            : []),
                          { label: "Archive", onClick: () => { updateQuote(q.id, { archived: true }); showToast(`${q.quoteNumber} archived`); }, danger: true },
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

      {/* ─── CREATE QUOTE SIDE SHEET ─── */}
      <SideSheet open={createOpen} onClose={() => setCreateOpen(false)} title="Create Quote" width="max-w-lg">
        {createOpen && (
          <CreateQuote
            onClose={() => setCreateOpen(false)}
            onCreate={(quote) => {
              const created = addQuote(quote);
              setCreateOpen(false);
              showToast(`${created.quoteNumber} created`);
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
