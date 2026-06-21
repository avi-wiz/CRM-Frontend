import { useState, useRef, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import ListingPage from "../components/listings/ListingPage";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import CreateContact from "../components/side-sheets/CreateContact";
import { CreateTask } from "../components/side-sheets/log/index.jsx";
import { contacts as initialContacts, contactColumns, repNames } from "../data/constants";

const CONTACT_STAGES = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];

export default function ContactsPage({ onCompanyClick, onContactClick }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [contactData, setContactData] = useState(initialContacts);
  const [toast, setToast] = useState(null);

  // Bulk action state
  const [bulkTask, setBulkTask] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false);
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const stageRef = useRef(null);
  const ownerRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!stageRef.current?.contains(e.target)) setStagePickerOpen(false);
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
      label: "Change Stage",
      onClick: () => setStagePickerOpen((o) => !o),
    },
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
      onClick: (count) => setConfirmState({ type: "wizshop", count }),
    },
  ];

  const buildRowActions = (row) => [
    { label: "View Detail", onClick: () => onContactClick?.(row.id) },
    { label: "Edit", onClick: () => console.log("Edit contact", row.id) },
    {
      label: row.isWizShopUser ? "Manage WizShop Access" : "Create WizShop User",
      onClick: () => console.log("WizShop action for contact", row.id),
    },
    { label: "Archive", onClick: () => console.log("Archive contact", row.id), danger: true },
  ];

  const columns = onCompanyClick
    ? contactColumns.map((col) =>
        col.key === "companyName"
          ? {
              ...col,
              render: (v, row) => (
                <span
                  className="text-sm text-indigo-600 hover:underline cursor-pointer"
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
      {stagePickerOpen && (
        <div ref={stageRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-52">
          {CONTACT_STAGES.map((s) => (
            <button key={s} onClick={() => { setStagePickerOpen(false); setConfirmState({ type: "stage", count: null, extra: s }); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{s}</button>
          ))}
        </div>
      )}
      {ownerPickerOpen && (
        <div ref={ownerRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-52">
          {repNames.map((r) => (
            <button key={r} onClick={() => { setOwnerPickerOpen(false); setConfirmState({ type: "owner", count: null, extra: r }); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{r}</button>
          ))}
        </div>
      )}
      {exportPickerOpen && (
        <div ref={exportRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-40">
          {["CSV", "Excel"].map((fmt) => (
            <button key={fmt} onClick={() => { setExportPickerOpen(false); showToast(`Exporting records as ${fmt}…`); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{fmt}</button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <ListingPage
        entityType="Contacts"
        data={contactData}
        columns={columns}
        onRowClick={(row) => onContactClick?.(row.id)}
        rowActions={buildRowActions}
        onCreate={() => setCreateOpen(true)}
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
          confirmState?.type === "stage" ? `Change Stage to "${confirmState?.extra}"` :
          confirmState?.type === "owner" ? `Assign Owner: ${confirmState?.extra}` :
          confirmState?.type === "wizshop" ? "Create WizShop Users" : "Confirm"
        }
        message={
          confirmState?.type === "archive"
            ? `Archive ${confirmState.count} ${confirmState.count === 1 ? "contact" : "contacts"}? They can be restored later.`
            : confirmState?.type === "stage"
            ? `Move contacts to stage "${confirmState?.extra}"?`
            : confirmState?.type === "owner"
            ? `Assign ${confirmState?.extra} as owner of selected contacts?`
            : confirmState?.type === "wizshop"
            ? `Create WizShop user accounts for ${confirmState.count} ${confirmState.count === 1 ? "contact" : "contacts"}? They'll receive an invitation email.`
            : ""
        }
        confirmLabel={
          confirmState?.type === "archive" ? "Archive" :
          confirmState?.type === "wizshop" ? "Create Users" : "Apply"
        }
        onConfirm={() => {
          const { type, extra, count } = confirmState;
          if (type === "archive") showToast(`Archived ${count} ${count === 1 ? "contact" : "contacts"}`);
          else if (type === "stage") showToast(`Changed stage to "${extra}"`);
          else if (type === "owner") showToast(`Assigned ${extra} as owner`);
          else if (type === "wizshop") showToast(`WizShop invitations sent to ${count} ${count === 1 ? "contact" : "contacts"}`);
        }}
      />

      <SideSheet open={createOpen} onClose={() => setCreateOpen(false)} title="Create Contact">
        {createOpen && (
          <CreateContact onClose={() => setCreateOpen(false)} onDone={handleCreate} />
        )}
      </SideSheet>

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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-start gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>{toast.map((line, i) => <div key={i}>{line}</div>)}</div>
        </div>
      )}
    </>
  );
}
