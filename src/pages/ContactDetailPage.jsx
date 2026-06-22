import { useState } from "react";
import { ArrowLeft, MoreHorizontal, CheckCircle } from "lucide-react";
import StageBadge from "../components/shared/StageBadge";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import PropertiesPanel from "../components/detail/PropertiesPanel";
import ContactCenterTabs from "../components/detail/ContactCenterTabs";
import ContactAssociations from "../components/detail/ContactAssociations";
import { LOG_SHEETS, nowStamp } from "../components/side-sheets/log";
import { EditSheet } from "../components/side-sheets/EditSheet";
import { CreateWizShopUserContent } from "../components/side-sheets/index";
import { getContactDetail, repNames, leadSources } from "../data/constants";

const CONTACT_STAGES = ["New", "Open", "In Progress", "Qualified", "Unqualified"];

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
      { key: "stage", label: "Stage", type: "select", options: CONTACT_STAGES },
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

export default function ContactDetailPage({ contactId, onBack, onCompanyClick, onDealClick }) {
  const [contact, setContact] = useState(() => getContactDetail(contactId));
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [logSheet, setLogSheet] = useState(null); // activity action key or null
  const [editOpen, setEditOpen] = useState(false);
  const [wizShopOpen, setWizShopOpen] = useState(false);
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
    setContact((c) => {
      const nextId = Math.max(0, ...(c.activities || []).map((a) => a.id || 0)) + 1;
      return { ...c, activities: [{ id: nextId, time: nowStamp(), ...activity }, ...(c.activities || [])] };
    });
    setLogSheet(null);
    showToast(`${LOG_SHEETS[logSheet]?.title || "Activity"} saved`);
  };

  const ActiveLogSheet = logSheet ? LOG_SHEETS[logSheet].Component : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-150 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors" title="Back to listing">
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{fullName}</h1>
          </div>
          <StageBadge stage={contact.stage} />
          {contact.isWizShopUser && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              WizShop {contact.wizShopRole || "User"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="px-3.5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all duration-200"
          >
            Edit
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm transition-all duration-200">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48">
                  {!contact.isWizShopUser && (
                    <button
                      onClick={() => { setMenuOpen(false); setWizShopOpen(true); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Create WizShop User
                    </button>
                  )}
                  {contact.isWizShopUser && (
                    <button
                      onClick={() => { setMenuOpen(false); showToast("WizShop role updated"); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Change WizShop Role
                    </button>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); setArchiveOpen(true); }}
                    className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
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
        <PropertiesPanel groups={PROPERTY_GROUPS} values={contact} onChange={updateField} />
        <ContactCenterTabs
          contact={contact}
          onActivityAction={(type) => setLogSheet(type)}
          onDealClick={(d) => onDealClick?.(d.id)}
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
        title={logSheet ? LOG_SHEETS[logSheet].title : ""}
      >
        {ActiveLogSheet && (
          <ActiveLogSheet
            entity={entity}
            contacts={[contact]}
            onClose={() => setLogSheet(null)}
            onSave={handleLogSave}
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

      {/* ─── CREATE WIZSHOP USER SIDE SHEET ─── */}
      <SideSheet open={wizShopOpen} onClose={() => setWizShopOpen(false)} title="Create WizShop User">
        {wizShopOpen && (
          <CreateWizShopUserContent
            contact={contact}
            onClose={() => setWizShopOpen(false)}
            onDone={({ role }) => {
              setContact((c) => ({ ...c, isWizShopUser: true, wizShopRole: role, wizShopStatus: "Active" }));
              setWizShopOpen(false);
              showToast(`WizShop ${role} account created for ${fullName}`);
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
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
