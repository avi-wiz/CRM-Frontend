import { useState, useRef, useEffect } from "react";
import { CheckCircle, Plus, User, Clock, List, LayoutGrid } from "lucide-react";
import ListingPage from "../components/listings/ListingPage";
import KanbanBoard from "../components/listings/KanbanBoard";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import CreateContactPage from "./CreateContactPage";
import { CreateTask } from "../components/side-sheets/log/index.jsx";
import { EditSheet } from "../components/side-sheets/EditSheet";
import { CreateWizShopUserContent } from "../components/side-sheets/index";
import GrantAccessContent, { normalizeContacts } from "../components/side-sheets/GrantAccess";
import {
  contacts as initialContacts, contactColumns, repNames, leadSources, kanbanStages,
  getContactStage, formatRelativeTime,
  WebsiteAccessChip, websiteAccessRequestType,
} from "../data/constants";

// Editable fields for the row-level Edit sheet (mirrors ContactDetailPage).
const CONTACT_EDIT_GROUPS = [
  {
    title: "Contact Info",
    fields: [
      { key: "firstName", label: "First Name", type: "text", required: true },
      { key: "lastName", label: "Last Name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "jobTitle", label: "Job Title", type: "text" },
      { key: "leadSource", label: "Lead Source", type: "select", options: leadSources },
    ],
  },
];

export default function ContactsPage({ onCompanyClick, onContactClick }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [contactData, setContactData] = useState(initialContacts);
  const [viewMode, setViewMode] = useState("table");
  const [toast, setToast] = useState(null);

  // A contact's stage mirrors its company's pipeline stage 1:1 (read-only).
  const rows = contactData.map((c) => ({ ...c, stage: getContactStage(c) }));

  // Row-action state
  const [editTarget, setEditTarget] = useState(null); // contact being edited
  const [wizTarget, setWizTarget] = useState(null); // contact for WizShop create/manage
  const [bulkWizContacts, setBulkWizContacts] = useState(null); // contacts for bulk Create WizShop Users sheet

  // Bulk action state
  const [bulkTask, setBulkTask] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false);
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const ownerRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ownerRef.current?.contains(e.target)) setOwnerPickerOpen(false);
      if (!exportRef.current?.contains(e.target)) setExportPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (lines) => {
    setToast(Array.isArray(lines) ? lines : [lines]);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = (contact, newCompany) => {
    setCreateOpen(false);
    const id = Math.max(0, ...contactData.map((c) => c.id)) + 1;
    const companyId = contact.companyId ?? id * 1000;
    const today = new Date().toISOString().slice(0, 10);
    const record = { ...contact, id, companyId, createdAt: today, lastActivity: today };
    setContactData((prev) => [record, ...prev]);
    const lines = [`Contact created: ${contact.firstName} ${contact.lastName}`];
    if (newCompany) lines.push(`Company created: ${newCompany.name}`);
    showToast(lines);
  };

  const bulkActions = [
    {
      label: "Export",
      onClick: () => setExportPickerOpen((o) => !o),
    },
    {
      label: "Archive",
      danger: true,
      onClick: (count) => setConfirmState({ type: "archive", count }),
    },
    {
      label: "Create Task",
      onClick: () => setBulkTask(true),
    },
    {
      label: "Assign Owner",
      overflow: true,
      onClick: () => setOwnerPickerOpen((o) => !o),
    },
    {
      label: "Create WizShop Users",
      overflow: true,
      onClick: (count, scope, selectedRows = []) => setBulkWizContacts(selectedRows),
    },
  ];

  const buildRowActions = (row) => [
    { label: "View Detail", onClick: () => onContactClick?.(row.id) },
    { label: "Edit", onClick: () => setEditTarget(row) },
    {
      label: row.isWizShopUser ? "Change WizShop Role" : "Grant Website Access",
      onClick: () => setWizTarget(row),
    },
    { label: "Archive", onClick: () => setConfirmState({ type: "archive", count: 1, row }), danger: true },
  ];

  const columns = onCompanyClick
    ? contactColumns.map((col) =>
        col.key === "companyName"
          ? {
              ...col,
              render: (v, row) => (
                <span
                  className="text-sm text-primary hover:underline cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onCompanyClick(row.companyId); }}
                >
                  {v}
                </span>
              ),
            }
          : col
      )
    : contactColumns;

  // Picker dropdowns anchored above the bulk toolbar
  const BulkPickers = () => (
    <>
      {ownerPickerOpen && (
        <div ref={ownerRef} className="fixed top-24 right-8 bg-surface border border-border rounded-xl shadow-4 py-1 z-50 w-52">
          {repNames.map((r) => (
            <button key={r} onClick={() => { setOwnerPickerOpen(false); setConfirmState({ type: "owner", count: null, extra: r }); }}
              className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-action-hover">{r}</button>
          ))}
        </div>
      )}
      {exportPickerOpen && (
        <div ref={exportRef} className="fixed top-24 right-8 bg-surface border border-border rounded-xl shadow-4 py-1 z-50 w-40">
          {["CSV", "Excel"].map((fmt) => (
            <button key={fmt} onClick={() => { setExportPickerOpen(false); showToast(`Exporting records as ${fmt}…`); }}
              className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-action-hover">{fmt}</button>
          ))}
        </div>
      )}
    </>
  );

  // Full-screen create flow replaces the listing while open.
  if (createOpen) {
    return (
      <CreateContactPage
        onBack={() => setCreateOpen(false)}
        onDone={handleCreate}
      />
    );
  }

  // Read-only Kanban card — stage is owned by the company, so no drag.
  const renderContactCard = (item) => (
    <>
      <div className="font-semibold text-sm text-ink mb-1.5">{item.firstName} {item.lastName}</div>
      <div className="text-xs text-muted mb-1.5">{item.jobTitle || "—"}</div>
      <div className="flex items-center gap-3 text-xs text-muted mb-1.5">
        <span className="flex items-center gap-1 truncate"><User size={11} />{item.companyName}</span>
        <span className="flex items-center gap-1 flex-shrink-0"><Clock size={11} />{formatRelativeTime(item.lastActivity)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <WebsiteAccessChip type={websiteAccessRequestType(item)} />
      </div>
    </>
  );

  if (viewMode === "kanban") {
    return (
      <>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-ink">Contacts</h1>
              <span className="text-xs text-disabled font-medium px-2 py-0.5 rounded-full bg-default">Stage mirrors company pipeline</span>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle mode={viewMode} onChange={setViewMode} />
              <button
                onClick={() => setCreateOpen(true)}
                className="wiz-btn wiz-btn--primary flex items-center gap-1.5 px-3 py-1.5"
              >
                <Plus size={14} />Create Contact
              </button>
            </div>
          </div>
          <KanbanBoard
            stages={kanbanStages}
            data={rows}
            onCardClick={(item) => onContactClick?.(item.id)}
            renderCard={renderContactCard}
            cardActions={buildRowActions}
          />
        </div>
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-start gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
            <CheckCircle size={15} className="text-success flex-shrink-0 mt-0.5" />
            <div>{toast.map((line, i) => <div key={i}>{line}</div>)}</div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <ListingPage
        entityType="Contacts"
        data={rows}
        columns={columns}
        onRowClick={(row) => onContactClick?.(row.id)}
        rowActions={buildRowActions}
        onCreate={() => setCreateOpen(true)}
        onViewChange={setViewMode}
        viewMode={viewMode}
        bulkActions={bulkActions}
      />

      <BulkPickers />

      <ConfirmModal
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        count={confirmState?.count ?? undefined}
        destructive={confirmState?.type === "archive"}
        undoable={confirmState?.type === "archive" ? true : undefined}
        title={
          confirmState?.type === "archive" ? "Archive Contacts" :
          confirmState?.type === "owner" ? `Assign Owner: ${confirmState?.extra}` : "Confirm"
        }
        message={
          confirmState?.type === "archive"
            ? `Archive ${confirmState.count} ${confirmState.count === 1 ? "contact" : "contacts"}? They can be restored later.`
            : confirmState?.type === "owner"
            ? `Assign ${confirmState?.extra} as owner of selected contacts?`
            : ""
        }
        confirmLabel={
          confirmState?.type === "archive" ? "Archive" : "Apply"
        }
        onConfirm={() => {
          const { type, extra, count, row } = confirmState;
          if (type === "archive") {
            if (row) {
              setContactData((prev) => prev.filter((c) => c.id !== row.id));
              showToast(`Archived ${row.firstName} ${row.lastName}`);
            } else {
              showToast(`Archived ${count} ${count === 1 ? "contact" : "contacts"}`);
            }
          }
          else if (type === "owner") showToast(`Assigned ${extra} as owner`);
        }}
      />

      <SideSheet open={bulkTask} onClose={() => setBulkTask(false)} title="Create Task">
        {bulkTask && (
          <CreateTask
            entity={{ id: 0, type: "contact", name: "Selected Contacts" }}
            contacts={contactData}
            onClose={() => setBulkTask(false)}
            onSave={() => {
              setBulkTask(false);
              showToast("Task(s) created for selected contacts");
            }}
          />
        )}
      </SideSheet>

      {/* Row Edit */}
      <SideSheet open={!!editTarget} onClose={() => setEditTarget(null)} title={editTarget ? `Edit ${editTarget.firstName} ${editTarget.lastName}` : ""}>
        {editTarget && (
          <EditSheet
            groups={CONTACT_EDIT_GROUPS}
            values={editTarget}
            entityLabel="Contact"
            onClose={() => setEditTarget(null)}
            onSave={(updated) => {
              setContactData((prev) => prev.map((c) => (c.id === editTarget.id ? { ...c, ...updated } : c)));
              setEditTarget(null);
              showToast(`${updated.firstName} ${updated.lastName} updated`);
            }}
          />
        )}
      </SideSheet>

      {/* Bulk Create WizShop Users — role + send-invite per contact */}
      <SideSheet open={!!bulkWizContacts} onClose={() => setBulkWizContacts(null)} title="Create WizShop Users">
        {bulkWizContacts && (
          <GrantAccessContent
            contacts={normalizeContacts(bulkWizContacts)}
            onClose={() => setBulkWizContacts(null)}
            onDone={(count) => {
              const ids = new Set(bulkWizContacts.filter((c) => !c.isWizShopUser).map((c) => c.id));
              setContactData((prev) => prev.map((c) => (ids.has(c.id) ? { ...c, isWizShopUser: true, wizShopStatus: "Active" } : c)));
              setBulkWizContacts(null);
              showToast(`Created WizShop access for ${count} ${count === 1 ? "contact" : "contacts"}`);
            }}
          />
        )}
      </SideSheet>

      {/* Row: Grant Website Access (new user) / Change WizShop Role (existing user) */}
      <SideSheet open={!!wizTarget} onClose={() => setWizTarget(null)} title={wizTarget?.isWizShopUser ? "Change WizShop Role" : "Grant Website Access"}>
        {wizTarget && (wizTarget.isWizShopUser ? (
          <CreateWizShopUserContent
            contact={wizTarget}
            mode="change"
            onClose={() => setWizTarget(null)}
            onDone={({ role }) => {
              setContactData((prev) => prev.map((c) => (c.id === wizTarget.id ? { ...c, isWizShopUser: true, wizShopRole: role, wizShopStatus: "Active" } : c)));
              const name = `${wizTarget.firstName} ${wizTarget.lastName}`;
              setWizTarget(null);
              showToast(`WizShop role updated to ${role} for ${name}`);
            }}
          />
        ) : (
          <GrantAccessContent
            contacts={normalizeContacts([wizTarget])}
            onClose={() => setWizTarget(null)}
            onDone={(count) => {
              const id = wizTarget.id;
              const name = `${wizTarget.firstName} ${wizTarget.lastName}`;
              setContactData((prev) => prev.map((c) => (c.id === id ? { ...c, isWizShopUser: true, wizShopStatus: "Active" } : c)));
              setWizTarget(null);
              showToast(`Granted website access to ${name}`);
            }}
          />
        ))}
      </SideSheet>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-start gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-success flex-shrink-0 mt-0.5" />
          <div>{toast.map((line, i) => <div key={i}>{line}</div>)}</div>
        </div>
      )}
    </>
  );
}

function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex border border-border rounded-lg overflow-hidden mr-2">
      <button onClick={() => onChange("table")} className={`p-1.5 ${mode === "table" ? "bg-action-selected" : "hover:bg-action-hover"}`}><List size={16} /></button>
      <button onClick={() => onChange("kanban")} className={`p-1.5 ${mode === "kanban" ? "bg-action-selected" : "hover:bg-action-hover"}`}><LayoutGrid size={16} /></button>
    </div>
  );
}
