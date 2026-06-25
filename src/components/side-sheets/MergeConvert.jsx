import { useState, useMemo, useEffect } from "react";
import { Search, Sparkles, ArrowRight, Info, ChevronDown } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import {
  companies, contacts, deals, quotes, visits, meetings, tasks, wizShopRoles,
  getKaiMatches,
} from "../../data/constants";

// Count of the source record's associated entities that will roll into the
// primary on merge. Activities (notes/emails) aren't a standalone array in the
// prototype, so they're folded into the record's own activity figure if present.
function getMergeCounts(record) {
  if (!record) return { contacts: 0, others: 0 };
  const byId = (arr, key = "companyId") => arr.filter((x) => x[key] === record.id).length;
  const byName = (arr) => arr.filter((x) => x.company === record.name).length;

  const contactsN = contacts.filter((c) => c.companyId === record.id).length || record.contactCount || 0;
  const dealsN = byName(deals) || record.dealCount || 0;
  const quotesN = byId(quotes);
  const visitsN = byId(visits);
  const meetingsN = byId(meetings);
  const tasksN = tasks.filter((t) => t.associations?.companyId === record.id).length;

  return {
    contacts: contactsN,
    others: dealsN + quotesN + visitsN + meetingsN + tasksN,
  };
}

const STEP_TITLES = {
  1: "Merge / Convert",
  2: "Select Primary",
  3: "Merge",
};

// An inactive customer cannot be selected as primary when merging. Records carry
// no explicit active flag in the prototype, so we treat `isActive === false`
// (only ever set deliberately) as inactive and everything else as eligible.
const isSelectablePrimary = (record) => !(record?.isCustomer && record?.isActive === false);

// ─── ROOT: drives the 4-step flow inside one SideSheet body ───
// `source` is the company the row action was fired on. `onComplete`/`onClose`
// are provided by the host (CompaniesPage) which owns the SideSheet wrapper.
export default function MergeConvertContent({ source, onComplete, onClose, onTitleChange, onHeaderBackChange }) {
  const [step, setStep] = useState(1);
  const [target, setTarget] = useState(null);
  // Which of source/target is primary in the merge: "source" | "target" | null.
  const [primary, setPrimary] = useState(null);

  // Keep the host's SideSheet header title in sync with the current step.
  useEffect(() => {
    onTitleChange?.(STEP_TITLES[step] || "Merge / Convert");
  }, [step, onTitleChange]);

  // Report a header back handler to the host for every step past the first.
  useEffect(() => {
    if (!onHeaderBackChange) return;
    if (step === 1) {
      onHeaderBackChange(null);
    } else {
      onHeaderBackChange(() => setStep((s) => Math.max(1, s - 1)));
    }
  }, [step, onHeaderBackChange]);

  const selectTarget = (company) => {
    setTarget(company);
    // Default primary to the existing record being merged into (the target),
    // but only if it's an eligible (active) customer/company.
    setPrimary(isSelectablePrimary(company) ? "target" : null);
    setStep(2);
  };

  const handleComplete = ({ grantAccess, granted } = {}) => {
    const primaryRecord = primary === "source" ? source : target;
    const secondaryRecord = primary === "source" ? target : source;
    console.log("Merge complete", {
      primary: primaryRecord?.name,
      mergedIn: secondaryRecord?.name,
      grantAccess,
      granted,
    });
    onComplete?.({ source, target, primary, grantAccess, granted });
  };

  // Records offered as primary candidates on step 2.
  const primaryCandidates = [
    { key: "source", record: source },
    { key: "target", record: target },
  ].filter((c) => c.record);

  return (
    <div className="flex flex-col h-full">

      {step === 1 && (
        <Step1FindTarget source={source} onSelect={selectTarget} />
      )}
      {step === 2 && (
        <Step2SelectPrimary
          candidates={primaryCandidates}
          primary={primary}
          setPrimary={setPrimary}
          onCancel={onClose}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3Merge
          primaryRecord={primary === "source" ? source : target}
          secondaryRecord={primary === "source" ? target : source}
          onBack={() => setStep(2)}
          onMerge={handleComplete}
        />
      )}
    </div>
  );
}

// ─── STEP INDICATOR ───

// ─── STEP 1: FIND EXISTING COMPANY / CUSTOMER ───
// Layout: KAI Recommendations on top, then a Customers / Companies tab pair on a
// single line. The active tab's records render below a shared search box.
const TARGET_TABS = ["Customers", "Companies"];

function Step1FindTarget({ source, onSelect }) {
  const [tab, setTab] = useState("Customers");
  const [query, setQuery] = useState("");

  const kaiMatches = useMemo(() => getKaiMatches(source?.id), [source]);

  const isCustomerTab = tab === "Customers";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies
      .filter((c) => c.id !== source?.id && (isCustomerTab ? c.isCustomer : !c.isCustomer))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || (c.domain || "").toLowerCase().includes(q));
  }, [query, source, isCustomerTab]);

  const switchTab = (t) => { setTab(t); setQuery(""); };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 -mx-6 px-6">
      <p className="text-sm text-muted -mt-1">
        Find the company or customer to merge <strong className="text-muted">{source?.name}</strong> into.
      </p>

      {/* KAI Recommendations — top */}
      <div className="rounded-xl bg-secondary-bg border border-secondary p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles size={14} className="text-secondary-dark" />
          <span className="text-xs font-semibold text-secondary-dark uppercase tracking-wider">KAI Recommendations</span>
        </div>
        <div className="space-y-2">
          {kaiMatches.length === 0 && (
            <div className="text-xs text-secondary-dark">No suggested matches.</div>
          )}
          {kaiMatches.map((m) => (
            <KaiCard key={m.company.id} match={m} onSelect={() => onSelect(m.company)} />
          ))}
        </div>
      </div>

      {/* Customers / Companies tabs — single line */}
      <div className="flex border-b border-divider -mx-6 px-6">
        {TARGET_TABS.map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Shared search for the active tab */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-disabled pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${tab.toLowerCase()} by name or domain…`}
          className="wiz-input w-full pl-8 py-1.5 text-sm"
        />
      </div>

      <p className="text-xs text-disabled -mt-1.5">Showing {results.length} {tab.toLowerCase()}</p>

      {/* Records for the active tab */}
      <div className="space-y-1.5">
        {results.length === 0 ? (
          <div className="text-xs text-disabled py-6 text-center">No {tab.toLowerCase()} found.</div>
        ) : (
          results.map((c) => <ResultRow key={c.id} company={c} onSelect={() => onSelect(c)} />)
        )}
      </div>
    </div>
  );
}

function ResultRow({ company, onSelect }) {
  const initials = company.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-2.5 border border-border rounded-xl bg-surface text-left hover:border-primary hover:bg-action-hover transition-all"
    >
      <div className="w-9 h-9 rounded-full bg-default text-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink truncate">{company.name}</div>
        <div className="text-xs text-disabled truncate">{company.domain}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StageBadge stage={company.stage} small />
        <span className="text-xs text-disabled">{company.contactCount} contacts</span>
        <ArrowRight size={14} className="text-primary" />
      </div>
    </button>
  );
}

function KaiCard({ match, onSelect }) {
  const { company, match: pct, reasons } = match;
  return (
    <div className="flex items-start justify-between gap-3 p-2.5 bg-surface border border-secondary rounded-lg">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink truncate">{company.name}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-bg text-secondary-dark font-medium flex-shrink-0">
            {pct}% match
          </span>
        </div>
        <div className="text-xs text-disabled truncate">{company.domain}</div>
        <div className="text-xs text-muted mt-1">{reasons.join(" · ")}</div>
      </div>
      <button
        onClick={onSelect}
        className="text-xs font-medium text-primary hover:text-primary-dark flex-shrink-0 mt-0.5"
      >
        Select
      </button>
    </div>
  );
}

// ─── STEP 2: SELECT PRIMARY ───
// Pick which of the two records (the row's source + the chosen target) survives
// as the primary after the merge. An inactive customer can't be primary.
function Step2SelectPrimary({ candidates, primary, setPrimary, onCancel, onNext }) {
  return (
    <div className="flex-1 flex flex-col -mx-6 -my-5">
      {/* Note banner */}
      <div className="m-6 mb-4 flex items-start gap-2.5 rounded-xl bg-warning-bg border border-warning px-4 py-3">
        <Info size={16} className="text-warning-dark flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold text-ink">Please note: </span>
          <span className="text-muted">An inactive customer cannot be selected as primary when merging.</span>
        </div>
      </div>

      {/* Candidate radio cards */}
      <div className="flex-1 overflow-y-auto px-6 space-y-3">
        {candidates.map(({ key, record }) => {
          const selectable = isSelectablePrimary(record);
          const selected = primary === key;
          const initials = record.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
          return (
            <button
              key={key}
              type="button"
              disabled={!selectable}
              onClick={() => setPrimary(key)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                selected ? "border-primary bg-tonal" : "border-border bg-surface hover:bg-action-hover"
              } ${!selectable ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {/* Radio */}
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-primary" : "border-border"}`}>
                {selected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </span>
              {/* Avatar */}
              <span className="w-10 h-10 rounded-full bg-default text-muted flex items-center justify-center text-sm font-bold flex-shrink-0">
                {initials}
              </span>
              {/* Name + code */}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-ink truncate">{record.name}</span>
                <span className="block text-xs text-disabled truncate">{record.domain || "No domain"}</span>
              </span>
              {/* Type pill */}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                record.isCustomer ? "bg-info text-white" : "bg-default text-muted"
              }`}>
                {record.isCustomer ? "Customer" : "Company"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer: Cancel + Next */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-divider">
        <button type="button" onClick={onCancel} className="wiz-btn wiz-btn--secondary">Cancel</button>
        <button type="button" disabled={!primary} onClick={onNext} className="wiz-btn wiz-btn--primary">Next</button>
      </div>
    </div>
  );
}

// ─── STEP 3: MERGE RECORDS ───
// Final step. All associated entities of the secondary record roll into the
// primary — the merge is mandatory for every category, so each row shows a
// fixed, pre-selected "Merge" radio (no "Ignore" option in our flow).
function Step3Merge({ primaryRecord, secondaryRecord, onBack, onMerge }) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [grantAccess, setGrantAccess] = useState(true); // on by default → contacts expand
  const counts = useMemo(() => getMergeCounts(secondaryRecord), [secondaryRecord]);

  // Contacts being merged in from the secondary record.
  const mergingContacts = useMemo(
    () => (secondaryRecord ? contacts.filter((c) => c.companyId === secondaryRecord.id) : []),
    [secondaryRecord]
  );

  // Per-contact WizShop setup: { [contactId]: { role, invite } }.
  const [wizSetup, setWizSetup] = useState({});
  useEffect(() => {
    const seed = {};
    for (const c of mergingContacts) {
      seed[c.id] = { role: c.wizShopRole || "Buyer", invite: true };
    }
    setWizSetup(seed);
  }, [mergingContacts]);

  const updateWiz = (id, patch) => setWizSetup((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const handleMerge = () => {
    const granted = grantAccess
      ? mergingContacts.map((c) => ({ id: c.id, ...wizSetup[c.id] }))
      : [];
    onMerge({ grantAccess, granted });
  };

  return (
    <div className="flex-1 flex flex-col -mx-6 -my-5">
      {/* Note banner */}
      <div className="m-6 mb-4 flex items-start gap-2.5 rounded-xl bg-warning-bg border border-warning px-4 py-3">
        <Info size={16} className="text-warning-dark flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold text-ink">Please note: </span>
          <span className="text-muted">An inactive customer cannot be selected as primary when merging.</span>
        </div>
      </div>

      {/* Primary summary bar */}
      <div className="mx-6 mb-5">
        <button
          type="button"
          onClick={() => setSummaryOpen((e) => !e)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-action-selected border border-border text-left"
        >
          <span className="text-sm font-semibold text-ink truncate">
            Primary: {primaryRecord?.name}
          </span>
          <span className="flex items-center gap-2 flex-shrink-0 text-muted">
            <span className="text-sm">2 selected</span>
            <ChevronDown size={16} className={`transition-transform ${summaryOpen ? "rotate-180" : ""}`} />
          </span>
        </button>
        {summaryOpen && (
          <div className="mt-1 rounded-xl border border-border bg-surface overflow-hidden">
            {[primaryRecord, secondaryRecord].filter(Boolean).map((r, i) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-divider last:border-b-0">
                <span className="text-ink truncate">{r.name}</span>
                <span className="text-xs text-disabled flex-shrink-0 ml-2">
                  {i === 0 ? "Primary" : "Will merge in"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Merge categories */}
      <div className="flex-1 overflow-y-auto px-6">
        <p className="text-sm font-semibold text-ink mb-3">What would you like to merge?</p>
        <div className="space-y-3">
          <MergeCategoryRow
            label="Orders, Quotes etc"
            count={counts.others}
            hint="Deals, Quotes, Visits, Meetings, Tasks, Notes & Emails"
          />
          <MergeCategoryRow label="Contacts" count={counts.contacts} />

          {/* Contacts expand into WizShop access cards when "Grant" is on */}
          {grantAccess && mergingContacts.length > 0 && (
            <div className="space-y-2.5 pl-1">
              {mergingContacts.map((c) => {
                const cfg = wizSetup[c.id] || { role: "Buyer", invite: true };
                return (
                  <div key={c.id} className="border border-border rounded-xl p-3 bg-surface">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="accent-primary mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-disabled truncate">{c.email}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <select
                            value={cfg.role}
                            onChange={(e) => updateWiz(c.id, { role: e.target.value })}
                            className="wiz-input text-xs px-1.5 py-1"
                          >
                            {wizShopRoles.map((r) => <option key={r}>{r}</option>)}
                          </select>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cfg.invite}
                              onChange={(e) => updateWiz(c.id, { invite: e.target.checked })}
                              className="accent-primary"
                            />
                            <span className="text-xs text-muted">Send invite email</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grant WizShop Access toggle — above the footer divider */}
      <label className="flex items-center gap-2.5 px-6 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={grantAccess}
          onChange={(e) => setGrantAccess(e.target.checked)}
          className="accent-primary"
        />
        <span className="text-sm font-medium text-ink">Grant WizShop Access</span>
      </label>

      {/* Footer: Back + Merge */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-divider">
        <button type="button" onClick={onBack} className="wiz-btn wiz-btn--secondary">Back</button>
        <button type="button" onClick={handleMerge} className="wiz-btn wiz-btn--primary">Merge</button>
      </div>
    </div>
  );
}

// A single mandatory-merge row: label + count, with a fixed, checked "Merge"
// radio. No "Ignore" — every category must merge in our flow.
function MergeCategoryRow({ label, count, hint }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-border bg-surface">
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm text-ink">{label}</span>
        {hint && (
          <span className="relative group flex-shrink-0">
            <Info size={13} className="text-disabled cursor-default" />
            <span className="absolute left-0 top-5 z-30 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
              {hint}
            </span>
          </span>
        )}
        <span className="text-sm text-muted">({count})</span>
      </span>
      <span className="flex items-center gap-2 flex-shrink-0">
        <span className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        </span>
        <span className="text-sm text-ink">Merge</span>
      </span>
    </div>
  );
}
