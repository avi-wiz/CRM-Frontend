import { useState } from "react";
import { ArrowLeft, FileText, CheckCircle, Calendar, DollarSign } from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import CustomerGateModal from "../components/shared/CustomerGateModal";
import ConvertCustomer from "../components/side-sheets/ConvertCustomer";
import { quotes, getQuoteCompany } from "../data/constants";

const STATUS_STYLES = {
  Approved: "bg-emerald-50 text-emerald-700",
  Sent: "bg-blue-50 text-blue-700",
  Draft: "bg-gray-100 text-gray-600",
};

export default function QuoteDetailPage({ quoteId, onBack }) {
  const quote = quotes.find((q) => q.id === quoteId) || quotes[0];

  // Local copy of the company so a conversion sticks for the rest of the session.
  const [company, setCompany] = useState(() => getQuoteCompany(quote));

  const [gateOpen, setGateOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [toast, setToast] = useState(null);
  // When the convert flow was launched by the gate, we resume the order conversion after.
  const [resumeAfterConvert, setResumeAfterConvert] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Step 1: "Convert to Order" CTA.
  const handleConvertToOrder = () => {
    if (company?.isCustomer) {
      showToast("Converting to order…");
    } else {
      setGateOpen(true);
    }
  };

  // Step 2: user chose "Convert to Customer Now" inside the gate.
  const handleConvertNow = () => {
    setGateOpen(false);
    setResumeAfterConvert(true);
    setConvertOpen(true);
  };

  // Step 3: conversion completed in the ConvertCustomer side sheet.
  const handleConverted = (values) => {
    setConvertOpen(false);
    setCompany((c) => ({ ...c, ...values, isCustomer: true }));
    if (resumeAfterConvert) {
      setResumeAfterConvert(false);
      showToast("Company converted. Resuming order conversion…");
      // Then the order conversion succeeds (prototype ends here).
      setTimeout(() => showToast("Converting to order…"), 1600);
    } else {
      showToast(`${company?.name} converted to Customer`);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              Quote #{quote.quoteNumber} — {company?.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Quote</span>
              {company?.isCustomer ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Customer</span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Company</span>
              )}
            </div>
          </div>
        </div>

        {/* Right-side CTA */}
        <button
          onClick={handleConvertToOrder}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
        >
          <CheckCircle size={15} /> Convert to Order
        </button>
      </div>

      {/* Body — basic quote info */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-2xl">
          <div className="grid grid-cols-3 gap-4">
            <InfoCard icon={DollarSign} label="Amount" value={quote.amount} />
            <InfoCard
              label="Status"
              value={
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[quote.status] || "bg-gray-100 text-gray-600"}`}>
                  {quote.status}
                </span>
              }
            />
            <InfoCard icon={Calendar} label="Created" value={quote.createdAt} />
          </div>

          <div className="mt-6 rounded-xl border border-gray-100 p-4 bg-gray-50/40">
            <p className="text-sm text-gray-500">
              This is a simplified quote view for the prototype. The{" "}
              <strong className="text-gray-700">Convert to Order</strong> action checks whether{" "}
              <strong className="text-gray-700">{company?.name}</strong> is a Customer before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Gate modal */}
      <CustomerGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        companyName={company?.name}
        context="quote_conversion"
        onConvert={handleConvertNow}
      />

      {/* Convert to Customer side sheet (Flow 1-D) */}
      <SideSheet open={convertOpen} onClose={() => setConvertOpen(false)} title="Convert to Customer">
        {convertOpen && (
          <ConvertCustomer
            company={company}
            onClose={() => setConvertOpen(false)}
            onDone={handleConverted}
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

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
        {Icon && <Icon size={12} />}
        {label}
      </div>
      <div className="text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}
