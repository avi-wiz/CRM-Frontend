import { FileText } from "lucide-react";
import { quotes, getQuoteCompany } from "../data/constants";

const STATUS_STYLES = {
  Approved: "bg-emerald-50 text-emerald-700",
  Sent: "bg-blue-50 text-blue-700",
  Draft: "bg-gray-100 text-gray-600",
};

// Simple Quotes listing — each row links to QuoteDetailPage (Customer Gate demo).
export default function QuotesPage({ onQuoteClick }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">Quotes</h1>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Quote #", "Company", "Amount", "Status", "Created"].map((h) => (
                <th key={h} className="py-2.5 px-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="text-sm text-gray-500">No quotes found</div>
                  <div className="text-xs text-gray-400 mt-1">Quotes will appear here once created.</div>
                </td>
              </tr>
            )}
            {quotes.map((q) => {
              const company = getQuoteCompany(q);
              return (
                <tr
                  key={q.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => onQuoteClick?.(q.id)}
                >
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-2 font-medium text-gray-900">
                      <FileText size={14} className="text-indigo-500" />
                      {q.quoteNumber}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">
                    <span className="flex items-center gap-2">
                      {q.companyName}
                      {!company?.isCustomer && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          Not a Customer
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{q.amount}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[q.status] || "bg-gray-100 text-gray-600"}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">{q.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
