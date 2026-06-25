import { useState, useMemo } from "react";
import { Search, Plus, X, CheckCircle } from "lucide-react";
import {
  companies,
  products,
  getCompanyContacts,
  getCompanyDeals,
  formatCurrency,
} from "../../data/constants";

// Default validity window: today + 30 days, as an ISO yyyy-mm-dd string.
function defaultValidUntil() {
  const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

// One blank line item.
function blankItem() {
  return { sku: "", productName: "", quantity: 1, unitPrice: 0, total: 0 };
}

// Create Quote side-sheet content. Render inside a <SideSheet title="Create Quote">.
// `company` — pre-fills + locks the company when opened from a Company detail page.
// `onCreate(quote)` — called with the assembled quote object.
// `onClose` — cancel handler.
/**
 * FORM SOURCE: Org Settings → Forms → Quote
 * System fields: Quote Number (auto-generated), Company/Customer
 * Line items are NOT form-builder configured — they use the Product catalog.
 *
 * TODO(form-builder-parity): Discount and Tax render as currency inputs here, but
 *   the builder defines them as Percentage fields ("Discount", "Tax Rate").
 *   Reconcile against Org Settings → Forms → Quote sample data.
 */
export default function CreateQuote({ company = null, onCreate, onClose }) {
  const [companyId, setCompanyId] = useState(company?.id ?? "");
  const [contactId, setContactId] = useState("");
  const [dealName, setDealName] = useState("");
  const [validUntil, setValidUntil] = useState(defaultValidUntil());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([blankItem()]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [created, setCreated] = useState(false);

  const lockedCompany = !!company;
  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === Number(companyId)) || company || null,
    [companyId, company]
  );

  const companyContacts = selectedCompany ? getCompanyContacts(selectedCompany.id) : [];
  const companyDeals = selectedCompany ? getCompanyDeals(selectedCompany.name) : [];

  const subtotal = items.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const grandTotal = subtotal - (Number(discount) || 0) + (Number(tax) || 0);

  const validItems = items.filter((i) => i.sku && Number(i.quantity) > 0);
  const canSubmit = selectedCompany && validItems.length > 0 && !created;

  const setItem = (idx, patch) =>
    setItems((arr) =>
      arr.map((it, i) => {
        if (i !== idx) return it;
        const next = { ...it, ...patch };
        next.total = (Number(next.quantity) || 0) * (Number(next.unitPrice) || 0);
        return next;
      })
    );

  const addItem = () => setItems((arr) => [...arr, blankItem()]);
  const removeItem = (idx) => setItems((arr) => (arr.length === 1 ? [blankItem()] : arr.filter((_, i) => i !== idx)));

  const handleSubmit = () => {
    const contact = companyContacts.find((c) => c.id === Number(contactId));
    const deal = companyDeals.find((d) => d.name === dealName);
    const quote = {
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      isCustomerCompany: !!selectedCompany.isCustomer,
      contactId: contact?.id ?? null,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
      dealId: deal?.id ?? null,
      dealName: deal?.name ?? null,
      items: validItems.map(({ sku, productName, quantity, unitPrice, total }) => ({
        sku,
        productName,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        total: Number(total),
      })),
      subtotal,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      grandTotal,
      status: "Draft",
      validUntil,
      notes: notes.trim(),
    };
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      onCreate?.(quote);
    }, 900);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* ─── QUOTE DETAILS ─── */}
        <Section title="Quote Details">
          <Field label="Company / Customer" required>
            {lockedCompany ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-tonal border border-primary text-sm font-medium text-primary-dark">
                {company.name}
                {company.isCustomer && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success-bg text-success-dark">Customer</span>
                )}
              </div>
            ) : (
              <select
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  setContactId("");
                  setDealName("");
                }}
                className={selectCls}
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.isCustomer ? " (Customer)" : ""}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Contact">
            <select value={contactId} onChange={(e) => setContactId(e.target.value)} disabled={!selectedCompany} className={selectCls}>
              <option value="">{selectedCompany ? "None" : "Select a company first"}</option>
              {companyContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} — {c.jobTitle}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Deal">
            <select value={dealName} onChange={(e) => setDealName(e.target.value)} disabled={!selectedCompany} className={selectCls}>
              <option value="">{selectedCompany ? "Not linked to a deal" : "Select a company first"}</option>
              {companyDeals.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} — {d.amount}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Valid Until">
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputCls} />
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes for this quote…"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </Section>

        {/* ─── LINE ITEMS ─── */}
        <Section title="Line Items">
          <div className="space-y-3">
            {items.map((item, idx) => (
              <LineItemRow
                key={idx}
                item={item}
                onChange={(patch) => setItem(idx, patch)}
                onRemove={() => removeItem(idx)}
              />
            ))}
          </div>

          <button
            onClick={addItem}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <Plus size={15} /> Add Line Item
          </button>

          {/* Totals */}
          <div className="mt-5 space-y-2 border-t border-divider pt-4">
            <TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Discount</span>
              <CurrencyInput value={discount} onChange={setDiscount} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Tax</span>
              <CurrencyInput value={tax} onChange={setTax} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-divider">
              <span className="text-sm font-bold text-ink">Grand Total</span>
              <span className="text-base font-bold text-success-dark">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </Section>

        {/* ─── SETTINGS ─── */}
        <Section title="Settings">
          <Field label="Status">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-default border border-border text-sm text-muted">
              <span className="text-xs px-2 py-0.5 rounded-full bg-action-hover text-muted font-medium">Draft</span>
              New quotes always start as Draft.
            </div>
          </Field>
        </Section>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-divider space-y-2">
        {created ? (
          <div className="w-full py-2.5 bg-success text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle size={15} /> Quote created!
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="wiz-btn wiz-btn--primary w-full"
          >
            Create Quote
          </button>
        )}
        <button onClick={onClose} className="wiz-btn wiz-btn--text w-full">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Line item row with product search ───
function LineItemRow({ item, onChange, onRemove }) {
  const [query, setQuery] = useState(item.productName || "");
  const [openList, setOpenList] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const pick = (p) => {
    onChange({ sku: p.sku, productName: p.name, unitPrice: p.unitPrice });
    setQuery(p.name);
    setOpenList(false);
  };

  return (
    <div className="rounded-xl border border-border p-3 bg-surface">
      <div className="flex items-start gap-2">
        {/* Product search */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-disabled" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenList(true);
                if (!e.target.value) onChange({ sku: "", productName: "", unitPrice: 0 });
              }}
              onFocus={() => setOpenList(true)}
              onBlur={() => setTimeout(() => setOpenList(false), 150)}
              placeholder="Search product…"
              className="wiz-input w-full pl-7 pr-2 py-1.5"
            />
          </div>
          {openList && matches.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-3 py-1 max-h-56 overflow-y-auto">
              {matches.map((p) => (
                <button
                  key={p.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(p)}
                  className="w-full text-left px-3 py-1.5 hover:bg-action-hover flex items-center justify-between gap-2"
                >
                  <span className="text-sm text-ink">{p.name}</span>
                  <span className="text-xs text-disabled">{p.sku} · {formatCurrency(p.unitPrice)}</span>
                </button>
              ))}
            </div>
          )}
          {item.sku && <div className="mt-1 text-[11px] text-disabled">SKU: {item.sku}</div>}
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-lg text-disabled hover:text-danger hover:bg-danger-bg transition-colors" title="Remove">
          <X size={15} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] font-medium text-disabled uppercase tracking-wide block mb-0.5">Qty</label>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => onChange({ quantity: e.target.value === "" ? "" : Number(e.target.value) })}
            className="wiz-input w-full px-2 py-1.5"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-disabled uppercase tracking-wide block mb-0.5">Unit Price</label>
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-sm text-disabled">$</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => onChange({ unitPrice: e.target.value === "" ? "" : Number(e.target.value) })}
              className="wiz-input w-full pl-5 pr-2 py-1.5"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-medium text-disabled uppercase tracking-wide block mb-0.5">Total</label>
          <div className="px-2 py-1.5 text-sm font-semibold text-ink bg-default rounded-lg border border-border">
            {formatCurrency(item.total)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── small presentational helpers ───
const inputCls = "wiz-input w-full";
const selectCls = inputCls;

function Section({ title, children }) {
  return (
    <section>
      <h3 className="text-[10px] font-bold text-disabled uppercase tracking-widest mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted block mb-1">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TotalRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function CurrencyInput({ value, onChange }) {
  return (
    <div className="relative w-28">
      <span className="absolute left-2 top-1.5 text-sm text-disabled">$</span>
      <input
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="wiz-input w-full pl-5 pr-2 py-1.5 text-right"
      />
    </div>
  );
}
