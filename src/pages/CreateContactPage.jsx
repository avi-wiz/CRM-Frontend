import { useState, useMemo } from "react";
import { Search, X, Plus, ChevronDown, CheckCircle } from "lucide-react";
import FullScreenForm, { FormSection } from "../components/shared/FullScreenForm";
import { companies, wizShopRoles } from "../data/constants";

const DEPARTMENTS = ["Sales", "Marketing", "Operations", "Finance", "Engineering", "Executive", "Other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls = "wiz-input w-full";

// Resolve a companies[] row from an arbitrary company-like object.
function toPickerCompany(c) {
  if (!c) return null;
  const match = companies.find((co) => co.id === c.id) || companies.find((co) => co.name === c.name);
  return match || { id: c.id, name: c.name, domain: c.domain || "" };
}

// Full-screen Create Contact form.
// `initialCompany` — pre-selects + locks the company association (when launched
// from a Company detail page). onDone(contact, newCompany?) / onBack owned by host.
const SECTIONS = [
  { id: "contact-info", label: "Contact Information" },
  { id: "company-association", label: "Company Association" },
  { id: "wizshop-access", label: "WizShop Access" },
];

export default function CreateContactPage({ initialCompany = null, onDone, onBack }) {
  const seedCompany = toPickerCompany(initialCompany);
  const lockCompany = !!seedCompany;

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");

  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(seedCompany);
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDomain, setNewCompanyDomain] = useState("");

  const [wizEnabled, setWizEnabled] = useState(false);
  const [wizRole, setWizRole] = useState("Buyer");
  const [wizInvite, setWizInvite] = useState(true);

  const [emailTouched, setEmailTouched] = useState(false);
  const [created, setCreated] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return companies
      .filter((c) => c.name.toLowerCase().includes(q) || (c.domain || "").toLowerCase().includes(q))
      .slice(0, 6);
  }, [query]);

  const emailValid = EMAIL_RE.test(email);
  const newCompanyValid = createCompanyOpen && newCompanyName.trim().length > 0;
  const companyProvided = !!selectedCompany || newCompanyValid;
  const canSubmit = first.trim() && last.trim() && email.trim() && emailValid && companyProvided && !created;

  const selectCompany = (c) => {
    setSelectedCompany(c);
    setQuery("");
    setCreateCompanyOpen(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    let newCompany = null;
    let companyId, companyName;
    if (selectedCompany) {
      companyId = selectedCompany.id;
      companyName = selectedCompany.name;
    } else {
      newCompany = { name: newCompanyName.trim(), domain: newCompanyDomain.trim() };
      companyName = newCompany.name;
      companyId = null;
    }
    const contact = {
      firstName: first.trim(),
      lastName: last.trim(),
      email: email.trim(),
      phone: phone.trim(),
      jobTitle: jobTitle.trim(),
      department: department || "Other",
      companyId,
      companyName,
      isWizShopUser: wizEnabled,
      wizShopRole: wizEnabled ? wizRole : null,
      // Stage is not stored on the contact — it mirrors the associated
      // company's pipeline stage 1:1 (see getContactStage).
    };
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      onDone?.(contact, newCompany);
    }, 700);
  };

  const actions = (
    <>
      <button onClick={onBack} className="wiz-btn wiz-btn--secondary">
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`wiz-btn wiz-btn--primary ${created ? "bg-success border-success hover:bg-success" : ""}`}
      >
        {created ? <><CheckCircle size={15} /> Created</> : "Create Contact"}
      </button>
    </>
  );

  return (
    <FullScreenForm title="Add Contact" onBack={onBack} actions={actions} sections={SECTIONS}>
      {({ registerSection }) => (
        <>
          <FormSection id="contact-info" title="Contact Information" registerSection={registerSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="First Name" required>
                <input value={first} onChange={(e) => setFirst(e.target.value)} className={inputCls} placeholder="Jane" />
              </Field>
              <Field label="Last Name" required>
                <input value={last} onChange={(e) => setLast(e.target.value)} className={inputCls} placeholder="Doe" />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  className={`${inputCls} ${emailTouched && email && !emailValid ? "wiz-input--error" : ""}`}
                  placeholder="jane@example.com"
                />
                {emailTouched && email && !emailValid && (
                  <span className="text-[11px] text-danger mt-1 block">Enter a valid email address.</span>
                )}
              </Field>
              <Field label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+1 (555) 000-0000" />
              </Field>
              <Field label="Job Title">
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputCls} placeholder="Procurement Manager" />
              </Field>
              <Field label="Department">
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection id="company-association" title="Company Association" registerSection={registerSection}>
            <p className="text-xs text-disabled -mt-3 mb-4">Required <span className="text-danger">*</span></p>
            {selectedCompany ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-tonal border border-primary max-w-md">
                <span className="text-sm font-medium text-primary-dark flex-1 truncate">{selectedCompany.name}</span>
                <span className="text-xs text-primary truncate">{selectedCompany.domain}</span>
                {!lockCompany && (
                  <button onClick={() => setSelectedCompany(null)} className="text-primary hover:text-primary-dark">
                    <X size={15} />
                  </button>
                )}
              </div>
            ) : (
              <div className="max-w-md">
                {!createCompanyOpen && (
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-3 text-disabled" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search companies..."
                      className="wiz-input w-full pl-9"
                    />
                    {query.trim() && (
                      <div className="mt-1.5 space-y-1">
                        {results.length === 0 && <div className="text-xs text-disabled px-1 py-2">No companies match “{query}”.</div>}
                        {results.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => selectCompany(c)}
                            className="w-full flex items-center justify-between gap-2 p-2 rounded-lg border border-border hover:border-primary text-left"
                          >
                            <span className="text-sm text-ink truncate">{c.name}</span>
                            <span className="text-xs text-disabled truncate">{c.domain}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2">
                  <button
                    onClick={() => setCreateCompanyOpen((o) => !o)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    {createCompanyOpen ? <ChevronDown size={13} /> : <Plus size={13} />}
                    {createCompanyOpen ? "Back to search" : "Or create a new company"}
                  </button>

                  {createCompanyOpen && (
                    <div className="mt-2 p-3 rounded-xl border border-border bg-default space-y-3">
                      <Field label="Company Name" required>
                        <input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} className={inputCls} placeholder="Acme Inc." />
                      </Field>
                      <Field label="Domain">
                        <input value={newCompanyDomain} onChange={(e) => setNewCompanyDomain(e.target.value)} className={inputCls} placeholder="acme.com" />
                      </Field>
                      <p className="text-[11px] text-muted">Both the company and contact will be created.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </FormSection>

          <FormSection id="wizshop-access" title="WizShop Access" registerSection={registerSection}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={wizEnabled} onChange={(e) => setWizEnabled(e.target.checked)} className="rounded accent-primary" />
              <span className="text-sm text-muted">Create as WizShop User</span>
            </label>
            {wizEnabled && (
              <div className="mt-4 pl-6 space-y-4 max-w-md">
                <Field label="Role">
                  <select value={wizRole} onChange={(e) => setWizRole(e.target.value)} className={inputCls}>
                    {wizShopRoles.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={wizInvite} onChange={(e) => setWizInvite(e.target.checked)} className="rounded accent-primary" />
                  <span className="text-sm text-muted">Send invite email</span>
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-disabled">Status</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-success-bg text-success-dark">Active</span>
                </div>
              </div>
            )}
          </FormSection>
        </>
      )}
    </FullScreenForm>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted block mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
