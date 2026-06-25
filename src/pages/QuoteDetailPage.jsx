import { useState, useEffect } from "react";
import { ArrowLeft, MoreHorizontal, CheckCircle, Send } from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import CustomerGateModal from "../components/shared/CustomerGateModal";
import ConvertCustomer from "../components/side-sheets/ConvertCustomer";
import {
  getQuoteCompany,
  formatDate,
  formatCurrency,
  quoteStatusStyles,
  isQuoteExpired,
} from "../data/constants";
import { useQuote, useQuotes, updateQuote, duplicateQuote } from "../data/quotesStore";

export default function QuoteDetailPage({ quoteId, onBack, onCompanyClick, onOpenQuote }) {
  const all = useQuotes();
  const quote = useQuote(quoteId) || all[0];

  // Local company copy so a Customer conversion sticks for the session.
  const [company, setCompany] = useState(() => getQuoteCompany(quote));

  // Re-sync the company when navigating to a different quote (e.g. via Duplicate).
  useEffect(() => {
    setCompany(getQuoteCompany(quote));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote.id]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [resumeAfterConvert, setResumeAfterConvert] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Convert to Order (Customer Gate, Flow 10) ───
  const handleConvertToOrder = () => {
    if (company?.isCustomer) {
      showToast("Converting to order…");
    } else {
      setGateOpen(true);
    }
  };
  const handleConvertNow = () => {
    setGateOpen(false);
    setResumeAfterConvert(true);
    setConvertOpen(true);
  };
  const handleConverted = (values) => {
    setConvertOpen(false);
    setCompany((c) => ({ ...c, ...values, isCustomer: true }));
    if (resumeAfterConvert) {
      setResumeAfterConvert(false);
      showToast("Company converted. Resuming order conversion…");
      setTimeout(() => showToast("Converting to order…"), 1600);
    } else {
      showToast(`${company?.name} converted to Customer`);
    }
  };

  const isDraft = quote.status === "Draft";
  const isAccepted = quote.status === "Accepted";
  const expired = isQuoteExpired(quote.validUntil);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-divider bg-surface">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-action-hover text-muted hover:text-ink transition-colors" title="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-disabled uppercase tracking-widest">Quote</span>
            <h1 className="text-xl font-bold text-ink tracking-tight truncate">{quote.quoteNumber}</h1>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quoteStatusStyles[quote.status] || "bg-default text-muted"}`}>
            {quote.status}
          </span>
          <button
            onClick={() => company && onCompanyClick?.(company.id)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {company?.name}
          </button>
          <span className="text-lg font-semibold text-success">{formatCurrency(quote.grandTotal)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Edit quote — coming soon")}
            className="wiz-btn wiz-btn--secondary"
          >
            Edit
          </button>
          {isDraft && (
            <button
              onClick={() => { updateQuote(quote.id, { status: "Sent" }); showToast("Quote sent"); }}
              className="wiz-btn wiz-btn--primary flex items-center gap-1.5"
            >
              <Send size={14} /> Send Quote
            </button>
          )}
          {isAccepted && (
            <button
              onClick={handleConvertToOrder}
              className="wiz-btn flex items-center gap-1.5 bg-success text-white hover:bg-success-dark border-success"
            >
              <CheckCircle size={14} /> Convert to Order
            </button>
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="p-2 border border-border rounded-xl text-muted hover:bg-action-hover hover:text-ink shadow-1 transition-all duration-200">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-30 bg-surface border border-border rounded-lg shadow-3 py-1 w-44">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      const copy = duplicateQuote(quote.id);
                      if (copy) {
                        showToast(`Duplicated as ${copy.quoteNumber}`);
                        setTimeout(() => onOpenQuote?.(copy.id), 600);
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-muted hover:bg-action-hover"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); showToast("Download PDF — coming soon"); }}
                    className="w-full text-left px-3 py-1.5 text-sm text-muted hover:bg-action-hover"
                  >
                    Download PDF
                  </button>
                  <div className="border-t border-divider mt-1 pt-1">
                    <button
                      onClick={() => { setMenuOpen(false); setArchiveOpen(true); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-danger-dark hover:bg-danger-bg"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── BODY (single pane, two columns) ─── */}
      <div className="flex-1 overflow-y-auto bg-default p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          {/* Left: quote properties */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-surface rounded-2xl border border-border shadow-2 p-5">
              <h3 className="text-[10px] font-bold text-disabled uppercase tracking-widest mb-4">Quote Details</h3>
              <dl className="space-y-3">
                <Prop label="Company">
                  <button onClick={() => company && onCompanyClick?.(company.id)} className="text-primary hover:underline">
                    {company?.name}
                  </button>
                  {!company?.isCustomer && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-warning-bg text-warning-dark">Not a Customer</span>
                  )}
                </Prop>
                <Prop label="Contact">{quote.contactName || "—"}</Prop>
                <Prop label="Deal">{quote.dealName || "—"}</Prop>
                <Prop label="Valid Until">
                  <span className={expired ? "text-danger-dark font-medium" : ""}>{formatDate(quote.validUntil)}{expired ? " (expired)" : ""}</span>
                </Prop>
                <Prop label="Created By">{quote.createdBy || "—"}</Prop>
                <Prop label="Created">{formatDate(quote.createdAt)}</Prop>
                {quote.notes && <Prop label="Notes">{quote.notes}</Prop>}
              </dl>
            </div>
          </div>

          {/* Right: line items + summary */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl border border-border shadow-2 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider bg-default">
                    {["SKU", "Product", "Qty", "Unit Price", "Total"].map((h, i) => (
                      <th key={h} className={`py-3 px-4 font-bold text-muted text-[10px] uppercase tracking-wider ${i >= 2 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {(quote.items || []).map((it, i) => (
                    <tr key={i} className="hover:bg-action-hover transition-colors">
                      <td className="py-3 px-4 text-muted font-mono text-xs">{it.sku}</td>
                      <td className="py-3 px-4 text-ink font-medium">{it.productName}</td>
                      <td className="py-3 px-4 text-right text-ink">{it.quantity}</td>
                      <td className="py-3 px-4 text-right text-ink">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-ink">{formatCurrency(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="border-t border-divider px-4 py-4 bg-default">
                <div className="ml-auto max-w-xs space-y-2">
                  <SummaryRow label="Subtotal" value={formatCurrency(quote.subtotal)} />
                  <SummaryRow label="Discount" value={`− ${formatCurrency(quote.discount || 0)}`} />
                  <SummaryRow label="Tax" value={formatCurrency(quote.tax || 0)} />
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-bold text-ink">Grand Total</span>
                    <span className="text-base font-bold text-success">{formatCurrency(quote.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CUSTOMER GATE ─── */}
      <CustomerGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        companyName={company?.name}
        context="quote_conversion"
        onConvert={handleConvertNow}
      />

      {/* ─── CONVERT TO CUSTOMER ─── */}
      <SideSheet open={convertOpen} onClose={() => setConvertOpen(false)} title="Convert to Customer">
        {convertOpen && (
          <ConvertCustomer company={company} onClose={() => setConvertOpen(false)} onDone={handleConverted} />
        )}
      </SideSheet>

      {/* ─── ARCHIVE CONFIRM ─── */}
      <ConfirmModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archive Quote"
        message={`Archive ${quote.quoteNumber}? It will be hidden from the active quotes list but can be restored later.`}
        confirmLabel="Archive"
        destructive
        onConfirm={() => {
          showToast(`${quote.quoteNumber} archived`);
          setTimeout(() => onBack?.(), 1800);
        }}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-success flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}

function Prop({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-disabled uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
