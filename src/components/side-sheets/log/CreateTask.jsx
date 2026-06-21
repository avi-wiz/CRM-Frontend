import { useState, useMemo } from "react";
import { repNames, companies, contacts as allContacts, deals } from "../../../data/constants";
import {
  AssociatedWith, Field, TextInput, TextArea, Select, ChipMultiSelect, Chip, Footer,
  Divider, Label, todayISO,
} from "./_shared";

// Priority with color indicator dots.
const PRIORITIES = [
  { value: "Low", color: "#9ca3af" },
  { value: "Medium", color: "#3b82f6" },
  { value: "High", color: "#f59e0b" },
  { value: "Urgent", color: "#ef4444" },
];

// Build a combined, searchable association pool (companies, contacts, deals).
// Each association id is namespaced by type to avoid collisions.
function buildAssociationPool(excludeKey) {
  const pool = [
    ...companies.map((c) => ({ id: `company:${c.id}`, label: c.name, sublabel: "Company" })),
    ...allContacts.map((c) => ({ id: `contact:${c.id}`, label: `${c.firstName} ${c.lastName}`, sublabel: "Contact" })),
    ...deals.map((d) => ({ id: `deal:${d.id}`, label: d.name, sublabel: "Deal" })),
  ];
  return pool.filter((o) => o.id !== excludeKey);
}

// Create Task — emits one { type: "task" } activity per assignee.
export default function CreateTask({ entity, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [priority, setPriority] = useState("Medium");
  const [assignees, setAssignees] = useState([]);
  const [extraAssociations, setExtraAssociations] = useState([]);
  const [showAddAssoc, setShowAddAssoc] = useState(false);

  const repOpts = useMemo(() => repNames.map((r) => ({ id: r, label: r })), []);
  const lockedKey = entity ? `${entity.type === "customer" ? "company" : entity.type}:${entity.id}` : null;
  const assocPool = useMemo(() => buildAssociationPool(lockedKey), [lockedKey]);

  const taskCount = Math.max(1, assignees.length);
  const canSave = title.trim() && dueDate;

  const handleSave = () => {
    if (!canSave) return;
    // One activity per assignee (each is its own task). If no assignee picked,
    // create a single unassigned task.
    const targets = assignees.length > 0 ? assignees.map((a) => a.label) : ["Unassigned"];
    const associations = extraAssociations.map((a) => a.label);
    targets.forEach((assignee) => {
      onSave({
        type: "task",
        title: title.trim(),
        description: description.trim(),
        due: dueDate,
        priority,
        assignee,
        status: "Open",
        associations,
      });
    });
  };

  return (
    <div>
      <AssociatedWith entity={entity} />

      <div className="space-y-4">
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
                className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 appearance-none"
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

        <Field label="Assign To">
          <ChipMultiSelect
            options={repOpts}
            selected={assignees}
            onAdd={(o) => setAssignees((p) => [...p, o])}
            onRemove={(id) => setAssignees((p) => p.filter((a) => a.id !== id))}
            placeholder="Search reps…"
          />
          <p className="text-xs text-gray-400 mt-1">One task per assignee will be created</p>
        </Field>

        <Divider />

        {/* Associations: locked current entity + addable extras */}
        <div>
          <Label>Associate With</Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {entity && <Chip label={entity.name} locked />}
            {extraAssociations.map((a) => (
              <Chip
                key={a.id}
                label={a.label}
                onRemove={() => setExtraAssociations((p) => p.filter((x) => x.id !== a.id))}
              />
            ))}
          </div>
          {showAddAssoc ? (
            <ChipMultiSelect
              options={assocPool}
              selected={extraAssociations}
              onAdd={(o) => setExtraAssociations((p) => [...p, o])}
              onRemove={(id) => setExtraAssociations((p) => p.filter((x) => x.id !== id))}
              placeholder="Search companies, contacts, deals…"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowAddAssoc(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Association
            </button>
          )}
        </div>
      </div>

      <Footer
        onCancel={onClose}
        onSubmit={handleSave}
        submitLabel={`Create ${taskCount} Task${taskCount === 1 ? "" : "s"}`}
        disabled={!canSave}
      />
    </div>
  );
}
