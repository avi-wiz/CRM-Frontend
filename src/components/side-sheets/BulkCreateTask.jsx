import { useState, useMemo } from "react";
import { Search, ChevronLeft, Check, SlidersHorizontal } from "lucide-react";
import { companies, deals, repNames } from "../../data/constants";
import {
  Field, TextInput, TextArea, Chip, ChipMultiSelect,
  todayISO, Divider, Label,
} from "./log/_shared";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ALL_ENTITIES = companies.map((c) => ({
  id: `company:${c.id}`,
  name: c.name,
  type: c.isCustomer ? "Customer" : "Company",
  stage: c.stage,
  rep: c.rep,
  initials: c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
}));

const ALL_REPS = repNames.map((name) => ({
  id: name,
  name,
  initials: name.split(" ").map((w) => w[0]).join("").toUpperCase(),
  accountCount: companies.filter((c) => c.rep === name).length,
}));

function buildAssocPool(repSet) {
  return [
    ...companies
      .filter((c) => repSet.has(c.rep))
      .map((c) => ({
        id: `company:${c.id}`,
        label: c.name,
        sublabel: c.isCustomer ? "Customer" : "Company",
      })),
    ...deals
      .filter((d) => repSet.has(d.owner))
      .map((d) => ({
        id: `deal:${d.id}`,
        label: d.name,
        sublabel: `Deal · ${d.company}`,
      })),
  ];
}

// ─── SELECTION CARD ───────────────────────────────────────────────────────────

function SelectionCard({ name, line1, line2, initials, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
        selected ? "border-primary bg-tonal" : "border-border bg-surface hover:bg-action-hover"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
          selected ? "bg-primary text-white" : "bg-default text-muted"
        }`}
      >
        {selected ? <Check size={14} /> : initials}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-ink truncate">{name}</p>
        {line1 && <p className="text-xs text-disabled mt-0.5 truncate">{line1}</p>}
        {line2 && <p className="text-xs text-disabled truncate">{line2}</p>}
      </div>
    </button>
  );
}

// ─── STEP 1: COMBINED SELECTOR (Company/Customer tab · Sales Reps tab) ────────

const TABS = ["Company / Customer", "Sales Reps"];

function StepSelect({ initialEntities, onNext, onCancel }) {
  const [tab, setTab] = useState("Company / Customer");
  const [query, setQuery] = useState("");
  const [repFilter, setRepFilter] = useState("");

  // Entity selection state
  const [selectedEntityIds, setSelectedEntityIds] = useState(
    new Set(initialEntities.map((e) => e.id))
  );
  // Rep selection state
  const [selectedRepIds, setSelectedRepIds] = useState(new Set());

  // ── Entity list (Company/Customer tab) ──
  const entityPool = useMemo(() => {
    return ALL_ENTITIES.filter((e) => {
      if (repFilter && e.rep !== repFilter) return false;
      if (query.trim()) return e.name.toLowerCase().includes(query.toLowerCase());
      return true;
    });
  }, [query, repFilter]);

  // ── Rep list (Sales Reps tab) ──
  const repPool = useMemo(() => {
    if (!query.trim()) return ALL_REPS;
    return ALL_REPS.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const toggleEntity = (id) =>
    setSelectedEntityIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleRep = (id) =>
    setSelectedRepIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const switchTab = (t) => {
    setTab(t);
    setQuery("");
    setRepFilter("");
  };

  const isEntityTab = tab === "Company / Customer";
  const count = isEntityTab ? selectedEntityIds.size : selectedRepIds.size;

  const handleNext = () => {
    if (isEntityTab) {
      onNext({
        mode: "entity",
        entities: ALL_ENTITIES.filter((e) => selectedEntityIds.has(e.id)),
        reps: [],
      });
    } else {
      onNext({
        mode: "rep",
        entities: [],
        reps: ALL_REPS.filter((r) => selectedRepIds.has(r.id)),
      });
    }
  };

  return (
    <div className="flex flex-col h-full -mx-5 -mt-2">
      {/* ── Tabs (matching reference image style) ── */}
      <div className="flex border-b border-divider px-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-5 pt-4">
        {/* ── Search + filters row ── */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-disabled pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isEntityTab ? "Search companies, customers…" : "Search reps…"}
              className="wiz-input w-full pl-8 py-1.5 text-sm"
            />
          </div>
          {/* Rep filter only on entity tab */}
          {isEntityTab && (
            <>
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="wiz-input py-1.5 text-sm"
                style={{ width: "auto", maxWidth: 130 }}
              >
                <option value="">Sales rep</option>
                {repNames.map((r) => (
                  <option key={r} value={r}>{r.split(" ")[0]}</option>
                ))}
              </select>
              <button className="p-2 border border-border rounded-xl text-muted hover:bg-action-hover transition-colors flex-shrink-0">
                <SlidersHorizontal size={14} />
              </button>
            </>
          )}
        </div>

        {/* ── Count label ── */}
        <p className="text-xs text-disabled mb-2">
          {isEntityTab
            ? `Showing ${entityPool.length} ${entityPool.length === 1 ? "record" : "records"}`
            : `${repPool.length} sales rep${repPool.length === 1 ? "" : "s"}`}
        </p>

        {/* ── Card list ── */}
        <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1 pb-2">
          {isEntityTab
            ? entityPool.map((e) => (
                <SelectionCard
                  key={e.id}
                  name={e.name}
                  line1={
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          e.type === "Customer"
                            ? "bg-success-bg text-success-dark"
                            : "bg-default text-muted"
                        }`}
                      >
                        {e.type}
                      </span>
                      <span>{e.stage}</span>
                    </span>
                  }
                  line2={e.rep ? `Rep: ${e.rep}` : "No rep assigned"}
                  initials={e.initials}
                  selected={selectedEntityIds.has(e.id)}
                  onToggle={() => toggleEntity(e.id)}
                />
              ))
            : repPool.map((r) => (
                <SelectionCard
                  key={r.id}
                  name={r.name}
                  line1={`${r.accountCount} account${r.accountCount === 1 ? "" : "s"}`}
                  initials={r.initials}
                  selected={selectedRepIds.has(r.id)}
                  onToggle={() => toggleRep(r.id)}
                />
              ))}

          {isEntityTab && entityPool.length === 0 && (
            <div className="text-sm text-disabled text-center py-10">No results</div>
          )}
          {!isEntityTab && repPool.length === 0 && (
            <div className="text-sm text-disabled text-center py-10">No results</div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-divider pt-4 mt-2 flex items-center justify-between px-5">
        <button type="button" onClick={onCancel} className="wiz-btn wiz-btn--text">
          Cancel
        </button>
        <button
          type="button"
          disabled={count === 0}
          onClick={handleNext}
          className="wiz-btn wiz-btn--primary"
        >
          Next{count > 0 ? ` (${count} selected)` : ""}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: TASK FORM ────────────────────────────────────────────────────────

const PRIORITIES = [
  { value: "Low", color: "#9ca3af" },
  { value: "Medium", color: "#3b82f6" },
  { value: "High", color: "#f59e0b" },
  { value: "Urgent", color: "#ef4444" },
];

// Non-editable display of assigned reps (read-only chips).
function AssigneeDisplay({ repNames: names }) {
  if (!names || names.length === 0) return <span className="text-sm text-disabled">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-default border border-border rounded-lg">
      {names.map((n) => (
        <span key={n} className="inline-flex items-center gap-1 bg-surface border border-border text-xs px-2 py-1 rounded-full text-ink">
          {n}
        </span>
      ))}
    </div>
  );
}

function StepTaskForm({ mode, entities, reps, onBack, onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [priority, setPriority] = useState("Medium");

  // Entity mode: collect all unique reps from selected entities (non-editable).
  const entityAssignees = useMemo(() => {
    if (mode !== "entity") return [];
    const seen = new Set();
    const result = [];
    entities.forEach((e) => {
      if (e.rep && !seen.has(e.rep)) { seen.add(e.rep); result.push(e.rep); }
    });
    return result.sort();
  }, [mode, entities]);

  // Rep mode: assignees = selected reps (non-editable).
  const repAssignees = useMemo(() => {
    if (mode !== "rep") return [];
    return reps.map((r) => r.name);
  }, [mode, reps]);

  // Entity mode: X tasks (1 per company). Rep mode: Z tasks (1 per rep).
  const taskCount = mode === "entity" ? entities.length : reps.length;
  const canSave = title.trim() && dueDate;

  const handleSubmit = () => {
    if (!canSave) return;
    const tasks = [];
    const base = { type: "task", title: title.trim(), description: description.trim(), due: dueDate, priority, status: "Open" };

    if (mode === "entity") {
      // 1 task per company; store all reps as `assignees`, primary rep as `assignee`.
      entities.forEach((entity) => {
        const entityReps = entity.rep ? [entity.rep] : [];
        tasks.push({
          ...base,
          companyName: entity.name,
          assignees: entityReps.length > 0 ? entityReps : ["Unassigned"],
          assignee: entityReps[0] || "Unassigned",
        });
      });
    } else {
      // 1 task per rep; no company association.
      reps.forEach((rep) => {
        tasks.push({
          ...base,
          assignees: [rep.name],
          assignee: rep.name,
        });
      });
    }
    onSubmit(tasks);
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-muted hover:text-ink mb-4 -mt-1 transition-colors"
      >
        <ChevronLeft size={13} /> Back to selection
      </button>

      <div className="flex-1 overflow-y-auto space-y-4 pb-2">

        {/* Associated With — entity mode only: locked company chips */}
        {mode === "entity" && (
          <div>
            <Label>Associated With</Label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-default rounded-xl border border-border min-h-[2.5rem]">
              {entities.map((e) => (
                <Chip key={e.id} label={e.name} locked />
              ))}
            </div>
          </div>
        )}

        {mode === "entity" && <Divider />}

        <Field label="Title" required>
          <TextInput value={title} onChange={setTitle} placeholder="Task title" />
        </Field>

        <Field label="Description">
          <TextArea value={description} onChange={setDescription} rows={3} placeholder="Details…" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Due Date" required>
            <TextInput type="date" value={dueDate} onChange={setDueDate} />
          </Field>
          <Field label="Priority">
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="wiz-input w-full pl-7 appearance-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.value}</option>
                ))}
              </select>
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full pointer-events-none"
                style={{ backgroundColor: PRIORITIES.find((p) => p.value === priority)?.color }}
              />
            </div>
          </Field>
        </div>

        <Divider />

        {/* Assign To — non-editable, derived from previous step */}
        <div>
          <Label>Assign To</Label>
          <AssigneeDisplay repNames={mode === "entity" ? entityAssignees : repAssignees} />
          <p className="text-xs text-disabled mt-1">
            {mode === "entity"
              ? "Account owners of the selected companies"
              : "Sales reps selected in the previous step"}
          </p>
        </div>
      </div>

      <div className="border-t border-divider pt-4 mt-2 flex items-center justify-between">
        <button type="button" onClick={onCancel} className="wiz-btn wiz-btn--text">
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSubmit}
          className="wiz-btn wiz-btn--primary"
        >
          Create {taskCount} Task{taskCount === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function BulkCreateTask({ initialEntities = [], onClose, onSave }) {
  const hasPreselected = initialEntities.length > 0;
  const [step, setStep] = useState(hasPreselected ? 2 : 1);
  const [formProps, setFormProps] = useState(
    hasPreselected ? { mode: "entity", entities: initialEntities, reps: [] } : null
  );

  const handleNext = ({ mode, entities, reps }) => {
    setFormProps({ mode, entities, reps });
    setStep(2);
  };

  if (step === 1) {
    return (
      <StepSelect
        initialEntities={initialEntities}
        onNext={handleNext}
        onCancel={onClose}
      />
    );
  }

  return (
    <StepTaskForm
      {...formProps}
      onBack={() => setStep(1)}
      onSubmit={onSave}
      onCancel={onClose}
    />
  );
}
