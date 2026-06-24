import { useState, useMemo } from "react";
import { Search, X, Plus, ChevronDown, CheckCircle } from "lucide-react";
import FullScreenForm, { FormSection } from "../components/shared/FullScreenForm";
import { companies, wizShopRoles } from "../data/constants";

const DEPARTMENTS = ["Sales", "Marketing", "Operations", "Finance", "Engineering", "Executive", "Other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200";

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
      <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all ${
          created ? "bg-emerald-500" : canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"
        }`}
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
                  className={`${inputCls} ${emailTouched && email && !emailValid ? "border-red-300 focus:ring-red-300/30 focus:border-red-400" : ""}`}
                  placeholder="jane@example.com"
                />
                {emailTouched && email && !emailValid && (
                  <span className="text-[11px] text-red-500 mt-1 block">Enter a valid email address.</span>
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
            <p className="text-xs text-gray-400 -mt-3 mb-4">Required <span className="text-red-500">*</span></p>
            {selectedCompany ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 max-w-md">
                <span className="text-sm font-medium text-indigo-800 flex-1 truncate">{selectedCompany.name}</span>
                <span className="text-xs text-indigo-400 truncate">{selectedCompany.domain}</span>
                {!lockCompany && (
                  <button onClick={() => setSelectedCompany(null)} className="text-indigo-400 hover:text-indigo-700">
                    <X size={15} />
                  </button>
                )}
              </div>
            ) : (
              <div className="max-w-md">
                {!createCompanyOpen && (
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search companies..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {query.trim() && (
                      <div className="mt-1.5 space-y-1">
                        {results.length === 0 && <div className="text-xs text-gray-400 px-1 py-2">No companies match “{query}”.</div>}
                        {results.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => selectCompany(c)}
                            className="w-full flex items-center justify-between gap-2 p-2 rounded-lg border border-gray-200 hover:border-indigo-300 text-left"
                          >
                            <span className="text-sm text-gray-800 truncate">{c.name}</span>
                            <span className="text-xs text-gray-400 truncate">{c.domain}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2">
                  <button
                    onClick={() => setCreateCompanyOpen((o) => !o)}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {createCompanyOpen ? <ChevronDown size={13} /> : <Plus size={13} />}
                    {createCompanyOpen ? "Back to search" : "Or create a new company"}
                  </button>

                  {createCompanyOpen && (
                    <div className="mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
                      <Field label="Company Name" required>
                        <input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} className={inputCls} placeholder="Acme Inc." />
                      </Field>
                      <Field label="Domain">
                        <input value={newCompanyDomain} onChange={(e) => setNewCompanyDomain(e.target.value)} className={inputCls} placeholder="acme.com" />
                      </Field>
                      <p className="text-[11px] text-gray-500">Both the company and contact will be created.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </FormSection>

          <FormSection id="wizshop-access" title="WizShop Access" registerSection={registerSection}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={wizEnabled} onChange={(e) => setWizEnabled(e.target.checked)} className="rounded accent-indigo-600" />
              <span className="text-sm text-gray-700">Create as WizShop User</span>
            </label>
            {wizEnabled && (
              <div className="mt-4 pl-6 space-y-4 max-w-md">
                <Field label="Role">
                  <select value={wizRole} onChange={(e) => setWizRole(e.target.value)} className={inputCls}>
                    {wizShopRoles.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={wizInvite} onChange={(e) => setWizInvite(e.target.checked)} className="rounded accent-indigo-600" />
                  <span className="text-sm text-gray-700">Send invite email</span>
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">Status</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Active</span>
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
      <label className="text-xs font-medium text-gray-500 block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
