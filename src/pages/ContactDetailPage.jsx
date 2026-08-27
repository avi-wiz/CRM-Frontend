import { useState } from "react";
import { ArrowLeft, MoreHorizontal, CheckCircle, Globe } from "lucide-react";
import StageBadge from "../components/shared/StageBadge";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import PropertiesPanel from "../components/detail/PropertiesPanel";
import ContactCenterTabs from "../components/detail/ContactCenterTabs";
import ContactAssociations from "../components/detail/ContactAssociations";
import { LOG_SHEETS, nowStamp } from "../components/side-sheets/log";
import ComposeEmail from "../components/side-sheets/email/ComposeEmail";
import { EditSheet } from "../components/side-sheets/EditSheet";
import { CreateWizShopUserContent } from "../components/side-sheets/index";
import { normalizeContacts } from "../components/side-sheets/GrantAccess";
import CreateDeal from "../components/side-sheets/CreateDeal";
import { getContactDetail, getContactStage, repNames, leadSources } from "../data/constants";
import { logActivityFromEntity } from "../data/logActivity";

// Property-group config for the Contact entity (left panel).
const PROPERTY_GROUPS = [
  {
    title: "Personal Info",
    fields: [
      { key: "firstName", label: "First Name", type: "text", required: true },
      { key: "lastName", label: "Last Name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "jobTitle", label: "Job Title", type: "text" },
      { key: "department", label: "Department", type: "text" },
    ],
  },
  {
    title: "CRM Status",
    fields: [
      // Stage mirrors the associated company's pipeline stage 1:1 — read-only here.
      { key: "stage", label: "Stage (from Company)", type: "text", readOnly: true },
      { key: "contactOwner", label: "Contact Owner", type: "select", options: repNames },
      { key: "leadSource", label: "Lead Source", type: "select", options: leadSources },
    ],
  },
  {
    title: "WizShop User",
    fields: [
      { key: "isWizShopUser", label: "Is WizShop User", type: "boolean", readOnly: true },
      { key: "wizShopRole", label: "WizShop Role", type: "text", readOnly: true },
      { key: "wizShopStatus", label: "WizShop Status", type: "text", readOnly: true },
    ],
  },
];

export default function ContactDetailPage({ contactId, onBack, onCompanyClick, onDealClick, onVisitClick, onTaskClick, onMeetingClick }) {
  const [contact, setContact] = useState(() => {
    const c = getContactDetail(contactId);
    // Stage always mirrors the associated company's pipeline stage.
    return { ...c, stage: getContactStage(c) };
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [logSheet, setLogSheet] = useState(null); // activity action key or null
  const [editOpen, setEditOpen] = useState(false);
  const [wizShopOpen, setWizShopOpen] = useState(false);
  const [wizShopMode, setWizShopMode] = useState("create"); // "create" | "change"
  const [dealOpen, setDealOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const updateField = (key, value) => setContact((c) => ({ ...c, [key]: value }));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fullName = `${contact.firstName} ${contact.lastName}`;

  // Entity descriptor + log-save handler for the activity logging sheets.
  const entity = { id: contact.id, type: "contact", name: fullName };

  const handleLogSave = (activity) => {
    logActivityFromEntity(entity, activity);
    setLogSheet(null);
    showToast(`${LOG_SHEETS[logSheet]?.title || "Activity"} saved`);
  };

  // "email" opens the real Nylas ComposeEmail sheet instead of the manual
  // "log what happened" mock form — handled separately below.
  const isEmailAction = logSheet === "email";
  const ActiveLogSheet = logSheet && !isEmailAction ? LOG_SHEETS[logSheet].Component : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-divider bg-surface">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-action-hover text-muted hover:text-ink transition-colors" title="Back to listing">
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-bold text-disabled uppercase tracking-widest">Contact</span>
            <h1 className="text-xl font-bold text-ink tracking-tight">{fullName}</h1>
          </div>
          <StageBadge stage={contact.stage} />
          {contact.isWizShopUser && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-bg text-success-dark">
              WizShop {contact.wizShopRole || "User"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {contact.isWizShopUser ? (
            <button
              onClick={() => { setWizShopMode("change"); setWizShopOpen(true); }}
              className="wiz-btn flex items-center gap-1.5 bg-tonal text-primary-dark border-tonal hover:bg-tonal-hover"
            >
              <Globe size={15} /> Change WizShop Role
            </button>
          ) : (
            <button
              onClick={() => { setWizShopMode("create"); setWizShopOpen(true); }}
              className="wiz-btn wiz-btn--primary flex items-center gap-1.5"
            >
              <Globe size={15} /> Create WizShop User
            </button>
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="p-2 border border-border rounded-xl text-muted hover:bg-action-hover hover:text-ink shadow-1 transition-all duration-200">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-30 bg-surface border border-border rounded-lg shadow-3 py-1 w-48">
                  <button
                    onClick={() => { setMenuOpen(false); setArchiveOpen(true); }}
                    className="w-full text-left px-3 py-1.5 text-sm text-danger-dark hover:bg-danger-bg"
                  >
                    Archive Contact
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3-PANEL LAYOUT ─── */}
      <div className="flex-1 flex overflow-hidden">
        <PropertiesPanel groups={PROPERTY_GROUPS} values={contact} onEdit={() => setEditOpen(true)} />
        <ContactCenterTabs
          contact={contact}
          onActivityAction={(type) => setLogSheet(type)}
          onDealClick={(d) => onDealClick?.(d.id)}
          onCreateDeal={() => setDealOpen(true)}
          onVisitClick={(id) => onVisitClick?.(id)}
          onTaskClick={(id) => onTaskClick?.(id)}
          onMeetingClick={(id) => onMeetingClick?.(id)}
        />
        <ContactAssociations
          contact={contact}
          onCompanyClick={(c) => onCompanyClick?.(c.id)}
          onDealClick={(d) => onDealClick?.(d.id)}
        />
      </div>

      {/* ─── ACTIVITY LOG SIDE SHEET ─── */}
      <SideSheet
        open={!!logSheet}
        onClose={() => setLogSheet(null)}
        title={isEmailAction ? "Create Email" : logSheet ? LOG_SHEETS[logSheet].title : ""}
      >
        {isEmailAction && (
          <ComposeEmail
            mode="new"
            entity={entity}
            defaultTo={contact.email}
            contacts={normalizeContacts([contact])}
            onClose={() => setLogSheet(null)}
            onSent={() => setLogSheet(null)}
          />
        )}
        {ActiveLogSheet && (
          <ActiveLogSheet
            entity={entity}
            contacts={[contact]}
            onClose={() => setLogSheet(null)}
            onSave={handleLogSave}
          />
        )}
      </SideSheet>

      {/* ─── CREATE DEAL SIDE SHEET ─── */}
      <SideSheet open={dealOpen} onClose={() => setDealOpen(false)} title="Create Deal" width="max-w-lg">
        {dealOpen && (
          <CreateDeal
            initialCompany={contact.company}
            onClose={() => setDealOpen(false)}
            onDone={(deal) => {
              setDealOpen(false);
              showToast(`Deal "${deal.name}" created`);
            }}
          />
        )}
      </SideSheet>

      {/* ─── EDIT SIDE SHEET ─── */}
      <SideSheet open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${fullName}`}>
        {editOpen && (
          <EditSheet
            groups={PROPERTY_GROUPS}
            values={contact}
            entityLabel="Contact"
            onClose={() => setEditOpen(false)}
            onSave={(updated) => {
              setContact((c) => ({ ...c, ...updated }));
              setEditOpen(false);
              showToast("Contact updated");
            }}
          />
        )}
      </SideSheet>

      {/* ─── WIZSHOP USER SIDE SHEET (create / change role) ─── */}
      <SideSheet
        open={wizShopOpen}
        onClose={() => setWizShopOpen(false)}
        title={wizShopMode === "change" ? "Change WizShop Role" : "Create WizShop User"}
      >
        {wizShopOpen && (
          <CreateWizShopUserContent
            contact={contact}
            mode={wizShopMode}
            onClose={() => setWizShopOpen(false)}
            onDone={({ role }) => {
              setContact((c) => ({ ...c, isWizShopUser: true, wizShopRole: role, wizShopStatus: "Active" }));
              setWizShopOpen(false);
              showToast(
                wizShopMode === "change"
                  ? `WizShop role updated to ${role} for ${fullName}`
                  : `WizShop ${role} account created for ${fullName}`
              );
            }}
          />
        )}
      </SideSheet>

      {/* ─── ARCHIVE CONFIRM ─── */}
      <ConfirmModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archive Contact"
        message={`Archive ${fullName}? They will be hidden from the active contacts list but can be restored later.`}
        confirmLabel="Archive"
        destructive
        onConfirm={() => {
          setArchiveOpen(false);
          showToast(`${fullName} archived`);
          setTimeout(() => onBack?.(), 1800);
        }}
      />

      {/* ─── SUCCESS TOAST ─── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-success flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
