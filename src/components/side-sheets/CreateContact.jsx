import { useState, useMemo } from "react";
import { Search, X, Plus, ChevronDown } from "lucide-react";
import { companies, wizShopRoles } from "../../data/constants";

const DEPARTMENTS = ["Sales", "Marketing", "Operations", "Finance", "Engineering", "Executive", "Other"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create Contact side sheet. `onClose`/`onDone` are owned by the host SideSheet.
// onDone(contact, newCompany?) — newCompany is set when the inline create-company
// path was used so the host can toast/persist both.
export default function CreateContact({ onClose, onDone }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");

  // Company association — either a selected existing company or an inline new one.
  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDomain, setNewCompanyDomain] = useState("");

  // WizShop access
  const [wizEnabled, setWizEnabled] = useState(false);
  const [wizRole, setWizRole] = useState("Buyer");
  const [wizInvite, setWizInvite] = useState(true);

  const [emailTouched, setEmailTouched] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return companies
      .filter((c) => c.name.toLowerCase().includes(q) || (c.domain || "").toLowerCase().includes(q))
      .slice(0, 6);
  }, [query]);

  const emailValid = EMAIL_RE.test(email);
  // Company is "provided" via an existing selection OR a named new company.
  const newCompanyValid = createCompanyOpen && newCompanyName.trim().length > 0;
  const companyProvided = !!selectedCompany || newCompanyValid;

  const canSubmit =
    first.trim() && last.trim() && email.trim() && emailValid && companyProvided;

  const selectCompany = (c) => {
    setSelectedCompany(c);
    setQuery("");
    setCreateCompanyOpen(false);
  };

  const handleSubmit = () => {
    let newCompany = null;
    let companyId, companyName;

    if (selectedCompany) {
      companyId = selectedCompany.id;
      companyName = selectedCompany.name;
    } else {
      // Inline-created company.
      newCompany = { name: newCompanyName.trim(), domain: newCompanyDomain.trim() };
      companyName = newCompany.name;
      companyId = null; // host assigns
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
      stage: "New",
    };

    console.log("Create contact", { contact, newCompany, wizShop: wizEnabled ? { role: wizRole, invite: wizInvite, status: "Active" } : null });
    onDone?.(contact, newCompany);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-5">
        {/* ── Contact Information ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="First Name" required>
                <input value={first} onChange={(e) => setFirst(e.target.value)} className={inputCls} placeholder="Jane" />
              </Field>
              <Field label="Last Name" required>
                <input value={last} onChange={(e) => setLast(e.target.value)} className={inputCls} placeholder="Doe" />
              </Field>
            </div>
            <Field label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                className={`${inputCls} ${emailTouched && email && !emailValid ? "border-red-300 focus:ring-red-300" : ""}`}
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
        </section>

        {/* ── Company Association ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Company Association <span className="text-red-500">*</span>
          </h3>

          {selectedCompany ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
              <span className="text-sm font-medium text-indigo-800 flex-1 truncate">{selectedCompany.name}</span>
              <span className="text-xs text-indigo-400 truncate">{selectedCompany.domain}</span>
              <button onClick={() => setSelectedCompany(null)} className="text-indigo-400 hover:text-indigo-700">
                <X size={15} />
              </button>
            </div>
          ) : (
            <>
              {!createCompanyOpen && (
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search companies..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
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

              {/* Or create a new company */}
              <div className="mt-2">
                <button
                  onClick={() => setCreateCompanyOpen((o) => !o)}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {createCompanyOpen ? <ChevronDown size={13} /> : <Plus size={13} />}
                  {createCompanyOpen ? "Back to search" : "Or create a new company"}
                </button>

                {createCompanyOpen && (
                  <div className="mt-2 p-3 rounded-lg border border-gray-200 bg-gray-50/60 space-y-3">
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
            </>
          )}
        </section>

        {/* ── WizShop Access ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">WizShop Access</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={wizEnabled} onChange={(e) => setWizEnabled(e.target.checked)} className="rounded accent-indigo-600" />
            <span className="text-sm text-gray-700">Create as WizShop User</span>
          </label>
          {wizEnabled && (
            <div className="mt-3 pl-6 space-y-3">
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
        </section>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            canSubmit ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Create Contact
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
