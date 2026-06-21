import { useState, useMemo, useEffect } from "react";
import { Search, Sparkles, Zap, ArrowRight, Check } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import {
  companies, contacts, wizShopRoles,
  getMergeFields, getKaiMatches,
} from "../../data/constants";

// Fields resolved in Step 2 (source → target conflict resolution).
const MERGE_FIELDS = [
  { key: "name", label: "Company Name" },
  { key: "domain", label: "Domain" },
  { key: "industry", label: "Industry" },
  { key: "employeeCount", label: "Employee Count" },
  { key: "annualRevenue", label: "Annual Revenue" },
  { key: "stage", label: "Stage", badge: true },
  { key: "rep", label: "Rep" },
  { key: "leadSource", label: "Lead Source" },
];

const STEP_TITLES = {
  1: "Merge / Convert",
  2: "Merge Fields",
  3: "Handle Contacts",
  4: "WizShop Access",
};

const isEmpty = (v) => v === "" || v == null;

// ─── ROOT: drives the 4-step flow inside one SideSheet body ───
// `source` is the company the row action was fired on. `onComplete`/`onClose`
// are provided by the host (CompaniesPage) which owns the SideSheet wrapper.
export default function MergeConvertContent({ source, onComplete, onClose, onTitleChange }) {
  const [step, setStep] = useState(1);
  const [target, setTarget] = useState(null);

  // Keep the host's SideSheet header in sync with the current step.
  useEffect(() => {
    onTitleChange?.(STEP_TITLES[step] || "Merge / Convert");
  }, [step, onTitleChange]);

  // Lazily computed once a target is chosen.
  const sourceFields = useMemo(() => getMergeFields(source), [source]);
  const targetFields = useMemo(() => getMergeFields(target), [target]);

  const sourceContacts = useMemo(
    () => (source ? contacts.filter((c) => c.companyId === source.id) : []),
    [source]
  );
  const targetContacts = useMemo(
    () => (target ? contacts.filter((c) => c.companyId === target.id) : []),
    [target]
  );

  const hadWizShopUsers = sourceContacts.some((c) => c.isWizShopUser);

  // Step 2 resolution: { fieldKey: "source" | "target" }
  const [fieldChoice, setFieldChoice] = useState({});
  // Step 3 contact decisions: { contactId: "add" | "skip" | "override" | "keep" }
  const [contactChoice, setContactChoice] = useState({});
  // Step 4 wizshop setup: { contactId: { enabled, role, invite } }
  const [wizSetup, setWizSetup] = useState({});

  const selectTarget = (company) => {
    setTarget(company);

    // Seed field choices: auto-pick the obvious cases, leave true conflicts blank.
    const src = getMergeFields(source);
    const tgt = getMergeFields(company);
    const seededFields = {};
    for (const f of MERGE_FIELDS) {
      const sv = src[f.key];
      const tv = tgt[f.key];
      if (isEmpty(sv) && !isEmpty(tv)) seededFields[f.key] = "target";
      else if (!isEmpty(sv) && isEmpty(tv)) seededFields[f.key] = "source";
      else if (String(sv) === String(tv)) seededFields[f.key] = "target"; // same → no-op
      // else: leave undefined (genuine conflict, user must choose)
    }
    setFieldChoice(seededFields);

    // Seed contact decisions by email match against the target.
    const tgtEmails = new Set(contacts.filter((c) => c.companyId === company.id).map((c) => c.email));
    const seededContacts = {};
    const seededWiz = {};
    for (const c of contacts.filter((x) => x.companyId === source.id)) {
      seededContacts[c.id] = tgtEmails.has(c.email) ? "keep" : "add";
      if (c.isWizShopUser) {
        seededWiz[c.id] = { enabled: true, role: c.wizShopRole || "Buyer", invite: true };
      }
    }
    setContactChoice(seededContacts);
    setWizSetup(seededWiz);

    setStep(2);
  };

  // All genuine conflicts must be resolved before leaving Step 2.
  const unresolvedFields = MERGE_FIELDS.filter((f) => !fieldChoice[f.key]);
  const step2Complete = unresolvedFields.length === 0;

  const finalStep = hadWizShopUsers ? 4 : 3;

  const handleComplete = () => {
    console.log("Merge complete", {
      source: source?.name,
      target: target?.name,
      fieldChoice,
      contactChoice,
      wizSetup,
    });
    onComplete?.({ source, target });
  };

  return (
    <div className="flex flex-col h-full">
      <StepIndicator step={step} totalSteps={finalStep} />

      {step === 1 && (
        <Step1FindTarget source={source} onSelect={selectTarget} onCreateNew={onClose} />
      )}
      {step === 2 && (
        <Step2Fields
          source={source}
          target={target}
          sourceFields={sourceFields}
          targetFields={targetFields}
          fieldChoice={fieldChoice}
          setFieldChoice={setFieldChoice}
          step2Complete={step2Complete}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3Contacts
          sourceContacts={sourceContacts}
          targetContacts={targetContacts}
          contactChoice={contactChoice}
          setContactChoice={setContactChoice}
          isFinal={finalStep === 3}
          onNext={() => setStep(4)}
          onComplete={handleComplete}
        />
      )}
      {step === 4 && (
        <Step4WizShop
          source={source}
          target={target}
          sourceWizUsers={sourceContacts.filter((c) => c.isWizShopUser)}
          contactChoice={contactChoice}
          wizSetup={wizSetup}
          setWizSetup={setWizSetup}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

// ─── STEP INDICATOR ───
function StepIndicator({ step, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {steps.map((n, i) => (
        <div key={n} className="flex items-center gap-1.5">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
              n < step ? "bg-emerald-500 text-white" : n === step ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
            }`}
          >
            {n < step ? <Check size={12} /> : n}
          </div>
          {i < steps.length - 1 && <div className={`w-5 h-px ${n < step ? "bg-emerald-300" : "bg-gray-200"}`} />}
        </div>
      ))}
      <span className="ml-2 text-xs text-gray-400">Step {step} of {totalSteps}</span>
    </div>
  );
}

// ─── STEP 1: FIND EXISTING COMPANY / CUSTOMER ───
function Step1FindTarget({ source, onSelect, onCreateNew }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return companies
      .filter((c) => c.id !== source?.id)
      .filter((c) => c.name.toLowerCase().includes(q) || (c.domain || "").toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, source]);

  const kaiMatches = useMemo(() => getKaiMatches(source?.id), [source]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-5">
      <p className="text-sm text-gray-500 -mt-1">
        Find the company or customer to merge <strong className="text-gray-700">{source?.name}</strong> into.
      </p>

      {/* Search */}
      <div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies by name or domain..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
        </div>

        {query.trim() && (
          <div className="mt-2 space-y-1.5">
            {results.length === 0 && (
              <div className="text-xs text-gray-400 py-2 px-1">No companies match “{query}”.</div>
            )}
            {results.map((c) => (
              <ResultRow key={c.id} company={c} onSelect={() => onSelect(c)} />
            ))}
          </div>
        )}
      </div>

      {/* KAI Recommendations */}
      <div className="rounded-xl bg-purple-50 border border-purple-100 p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles size={14} className="text-purple-500" />
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">KAI Recommendations</span>
        </div>
        <div className="space-y-2">
          {kaiMatches.length === 0 && (
            <div className="text-xs text-purple-400">No suggested matches.</div>
          )}
          {kaiMatches.map((m) => (
            <KaiCard key={m.company.id} match={m} onSelect={() => onSelect(m.company)} />
          ))}
        </div>
      </div>

      {/* Create-new fallback */}
      <button
        onClick={() => { console.log("Create new company flow"); onCreateNew?.(); }}
        className="w-full py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
      >
        No match? Create as new company
      </button>
    </div>
  );
}

function ResultRow({ company, onSelect }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 border border-gray-200 rounded-lg hover:border-indigo-300">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{company.name}</div>
        <div className="text-xs text-gray-400 truncate">{company.domain}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StageBadge stage={company.stage} small />
        <span className="text-xs text-gray-400">{company.contactCount} contacts</span>
        <button
          onClick={onSelect}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Select <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function KaiCard({ match, onSelect }) {
  const { company, match: pct, reasons } = match;
  return (
    <div className="flex items-start justify-between gap-3 p-2.5 bg-white border border-purple-100 rounded-lg">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">{company.name}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium flex-shrink-0">
            {pct}% match
          </span>
        </div>
        <div className="text-xs text-gray-400 truncate">{company.domain}</div>
        <div className="text-xs text-gray-500 mt-1">{reasons.join(" · ")}</div>
      </div>
      <button
        onClick={onSelect}
        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex-shrink-0 mt-0.5"
      >
        Select
      </button>
    </div>
  );
}

// ─── STEP 2: FIELD RESOLUTION ───
function Step2Fields({ source, target, sourceFields, targetFields, fieldChoice, setFieldChoice, step2Complete, onNext }) {
  const pick = (key, side) => setFieldChoice((c) => ({ ...c, [key]: side }));

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="grid grid-cols-2 gap-3 mb-2 px-1">
        <div className="text-xs font-semibold text-gray-500 truncate">
          Source: <span className="text-gray-800">{source?.name}</span>
        </div>
        <div className="text-xs font-semibold text-gray-500 truncate">
          Target: <span className="text-gray-800">{target?.name}</span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {MERGE_FIELDS.map((f) => (
          <FieldRow
            key={f.key}
            field={f}
            sourceValue={sourceFields[f.key]}
            targetValue={targetFields[f.key]}
            choice={fieldChoice[f.key]}
            onPick={(side) => pick(f.key, side)}
          />
        ))}
      </div>

      <div className="pt-3 mt-2 border-t border-gray-100">
        {!step2Complete && (
          <div className="text-xs text-amber-600 mb-2 text-center">Resolve all conflicting fields to continue.</div>
        )}
        <button
          onClick={onNext}
          disabled={!step2Complete}
          className={`w-full py-2 rounded-lg text-sm font-medium ${
            step2Complete ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next: Handle Contacts →
        </button>
      </div>
    </div>
  );
}

function FieldRow({ field, sourceValue, targetValue, choice, onPick }) {
  const sEmpty = isEmpty(sourceValue);
  const tEmpty = isEmpty(targetValue);
  const same = !sEmpty && !tEmpty && String(sourceValue) === String(targetValue);
  const autoFilled = (sEmpty && !tEmpty) || (!sEmpty && tEmpty);
  const conflict = !sEmpty && !tEmpty && !same;

  const rowBg = autoFilled ? "bg-emerald-50/60" : same ? "bg-gray-50" : conflict && !choice ? "bg-amber-50/40" : "";

  return (
    <div className={`rounded-lg border border-gray-100 p-2 ${rowBg}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{field.label}</span>
        {autoFilled && <span className="text-[10px] text-emerald-600 font-medium">Auto-filled</span>}
        {same && <span className="text-[10px] text-gray-400">Identical</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ValueCell
          value={sourceValue}
          badge={field.badge}
          selected={choice === "source"}
          disabled={same}
          onClick={() => onPick("source")}
        />
        <ValueCell
          value={targetValue}
          badge={field.badge}
          selected={choice === "target"}
          disabled={same}
          onClick={() => onPick("target")}
        />
      </div>
    </div>
  );
}

function ValueCell({ value, badge, selected, disabled, onClick }) {
  const empty = isEmpty(value);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center gap-2 text-left px-2 py-1.5 rounded-lg border text-sm transition-colors ${
        selected ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"
      } ${disabled ? "opacity-60 cursor-default" : ""}`}
    >
      <span
        className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center ${
          selected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
        }`}
      >
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      <span className="min-w-0 truncate">
        {empty ? (
          <span className="text-gray-300 italic">empty</span>
        ) : badge ? (
          <StageBadge stage={value} small />
        ) : (
          <span className="text-gray-700">{value}</span>
        )}
      </span>
    </button>
  );
}

// ─── STEP 3: CONTACT HANDLING ───
function Step3Contacts({ sourceContacts, targetContacts, contactChoice, setContactChoice, isFinal, onNext, onComplete }) {
  const targetEmails = useMemo(() => new Set(targetContacts.map((c) => c.email)), [targetContacts]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <p className="text-sm text-gray-500 mb-3 -mt-1">
        Decide what happens to each contact on the source company.
      </p>

      <div className="flex-1 space-y-2.5">
        {sourceContacts.length === 0 && (
          <div className="text-sm text-gray-400 py-4 text-center">Source company has no contacts.</div>
        )}
        {sourceContacts.map((c) => {
          const exists = targetEmails.has(c.email);
          const choice = contactChoice[c.id];
          return (
            <div key={c.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</div>
                  <div className="text-xs text-gray-400 truncate">{c.email} · {c.phone}</div>
                  <div className="text-xs text-gray-400">{c.jobTitle}</div>
                </div>
                {exists ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex-shrink-0">
                    <Zap size={10} /> Already in target
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex-shrink-0">
                    New to target
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {exists ? (
                  <>
                    <RadioOption name={`c-${c.id}`} label="Override target contact" checked={choice === "override"} onChange={() => setContactChoice((s) => ({ ...s, [c.id]: "override" }))} />
                    <RadioOption name={`c-${c.id}`} label="Skip — keep target" checked={choice === "keep"} onChange={() => setContactChoice((s) => ({ ...s, [c.id]: "keep" }))} />
                  </>
                ) : (
                  <>
                    <RadioOption name={`c-${c.id}`} label="Add to target" checked={choice === "add"} onChange={() => setContactChoice((s) => ({ ...s, [c.id]: "add" }))} />
                    <RadioOption name={`c-${c.id}`} label="Skip — do not move" checked={choice === "skip"} onChange={() => setContactChoice((s) => ({ ...s, [c.id]: "skip" }))} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 mt-2 border-t border-gray-100">
        {isFinal ? (
          <button onClick={onComplete} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Complete Merge
          </button>
        ) : (
          <button onClick={onNext} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Next: Review →
          </button>
        )}
      </div>
    </div>
  );
}

function RadioOption({ name, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-indigo-600" />
      <span className="text-xs text-gray-600">{label}</span>
    </label>
  );
}

// ─── STEP 4: WIZSHOP USER PROMPT (conditional) ───
function Step4WizShop({ source, target, sourceWizUsers, contactChoice, wizSetup, setWizSetup, onComplete }) {
  // Only WizShop users actually being moved into the target (not skipped/kept).
  const eligible = sourceWizUsers.filter((c) => {
    const ch = contactChoice[c.id];
    return ch === "add" || ch === "override";
  });

  const update = (id, patch) => setWizSetup((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <p className="text-sm text-gray-500 mb-3 -mt-1">
        <strong className="text-gray-700">{source?.name}</strong> had WizShop users. Create WizShop access for them on{" "}
        <strong className="text-gray-700">{target?.name}</strong>?
      </p>

      <div className="flex-1 space-y-2.5">
        {eligible.length === 0 && (
          <div className="text-sm text-gray-400 py-4 text-center">
            No WizShop users are being moved (all were skipped or kept on target).
          </div>
        )}
        {eligible.map((c) => {
          const cfg = wizSetup[c.id] || { enabled: true, role: "Buyer", invite: true };
          return (
            <div key={c.id} className={`border rounded-lg p-3 ${cfg.enabled ? "border-indigo-200 bg-indigo-50/40" : "border-gray-200"}`}>
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={cfg.enabled}
                  onChange={(e) => update(c.id, { enabled: e.target.checked })}
                  className="accent-indigo-600 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</div>
                  <div className="text-xs text-gray-400 truncate">{c.email}</div>
                  <div className={`flex items-center gap-3 mt-2 ${cfg.enabled ? "" : "opacity-40 pointer-events-none"}`}>
                    <select
                      value={cfg.role}
                      onChange={(e) => update(c.id, { role: e.target.value })}
                      className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                    >
                      {wizShopRoles.map((r) => <option key={r}>{r}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg.invite}
                        onChange={(e) => update(c.id, { invite: e.target.checked })}
                        className="accent-indigo-600"
                      />
                      <span className="text-xs text-gray-600">Send invite email</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
        <button onClick={onComplete} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          Complete Merge
        </button>
        <button onClick={onComplete} className="w-full py-1.5 text-sm text-gray-500 hover:text-gray-700">
          Skip — Merge Without WizShop Setup
        </button>
      </div>
    </div>
  );
}
