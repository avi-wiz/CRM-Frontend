import { useState } from "react";
import { ArrowLeft, MoreHorizontal, Activity, CalendarCheck, FileText, CheckSquare, Mail, CreditCard } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import SideSheet from "../shared/SideSheet";
import Modal from "../shared/Modal";
import { contacts, deals, activities, kanbanStages, stageColors } from "../../data/constants";
import {
  ConvertCustomerContent, MergeConvertContent, CreateTaskContent,
  LogNoteContent, LogMeetingContent, LogEmailContent, LogVisitContent, GrantAccessContent,
} from "../side-sheets/index";

const activityIcons = {
  system: Activity, meeting: CalendarCheck, note: FileText, task: CheckSquare, email: Mail,
};
const activityFilters = ["All", "Tasks", "Meetings", "Notes", "Emails", "Stage Changes"];

export default function DetailPage({ entity, entityType = "Company", onBack }) {
  const [activeTab, setActiveTab] = useState("Activities");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sideSheet, setSideSheet] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Configure tabs based on entity type
  const tabConfig = {
    Company: ["Sales", "Deals", "Visits", "Meetings", "Tasks", "WizShop Activity", "Activities", "Quotes", "Wishlists"],
    Contact: ["Sales", "Deals", "Visits", "Meetings", "Tasks", "WizShop Activity", "Activities"],
    Deal: ["Meetings", "Tasks", "Activities"],
  };
  const tabs = tabConfig[entityType] || tabConfig.Company;

  const entityContacts = contacts.filter((c) => c.company === entity.name);
  const entityDeals = deals.filter((d) => d.company === entity.name);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-action-hover text-muted hover:text-ink transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-disabled uppercase tracking-widest">{entityType}</span>
              {entity.isCustomer && (
                <span className="text-xs font-medium bg-success-bg text-success-dark border border-success px-1.5 py-0.5 rounded-full">✓ Customer</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-ink tracking-tight">{entity.name}</h1>
          </div>
          <StageBadge stage={entity.stage} />
        </div>
        <div className="flex items-center gap-2">
          {!entity.isCustomer && entityType === "Company" && (
            <button onClick={() => setSideSheet("convert")} className="wiz-btn bg-success text-white hover:bg-success-dark border-success">
              Convert to Customer
            </button>
          )}
          <button onClick={() => setSideSheet("merge")} className="wiz-btn wiz-btn--secondary">
            Merge / Convert
          </button>
          <button onClick={() => setSideSheet("task")} className="wiz-btn wiz-btn--secondary">
            Create Task
          </button>
          <button className="wiz-btn wiz-btn--secondary">Log Activity</button>
          <button className="p-2 border border-border rounded-xl text-muted hover:bg-action-hover hover:text-ink shadow-1 transition-all duration-200"><MoreHorizontal size={16} /></button>
        </div>
      </div>

      {/* ─── 3-PANEL LAYOUT ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Properties */}
        <div className="w-72 border-r border-border overflow-y-auto bg-surface p-5">
          <h3 className="text-[10px] font-bold text-disabled uppercase tracking-widest mb-3">Properties</h3>
          {getPropertiesForEntity(entity, entityType).map((f) => (
            <div key={f.label} className="mb-3">
              <label className="text-xs font-medium text-muted block mb-1">{f.label}</label>
              <div className="text-sm text-ink bg-surface border border-border rounded-xl px-3 py-2 hover:border-primary hover:bg-action-hover transition-all duration-200">{f.value}</div>
            </div>
          ))}
        </div>

        {/* CENTER: Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-border bg-surface px-4">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "Activities" ? (
              <div>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setSideSheet("note")} className="px-2.5 py-1 text-xs font-medium border border-border rounded-lg hover:bg-action-hover">+ Log Note</button>
                  <button onClick={() => setSideSheet("meeting")} className="px-2.5 py-1 text-xs font-medium border border-border rounded-lg hover:bg-action-hover">+ Log Meeting</button>
                  <button onClick={() => setSideSheet("task")} className="px-2.5 py-1 text-xs font-medium border border-border rounded-lg hover:bg-action-hover">+ Create Task</button>
                  <button onClick={() => setSideSheet("email")} className="px-2.5 py-1 text-xs font-medium border border-border rounded-lg hover:bg-action-hover">+ Log Email</button>
                </div>
                <div className="flex gap-1.5 mb-4">
                  {activityFilters.map((f) => (
                    <button key={f} onClick={() => setActiveFilter(f)}
                      className={`px-2.5 py-1 text-xs rounded-full ${activeFilter === f ? "bg-action-selected text-primary-dark font-medium" : "bg-tonal text-muted hover:bg-action-hover"}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {activities.map((a, i) => {
                    const Icon = activityIcons[a.type] || Activity;
                    return (
                      <div key={i} className={`flex gap-3 p-3 rounded-lg border ${a.type === "system" ? "bg-default border-border" : "bg-surface border-border"}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === "system" ? "bg-tonal" : "bg-action-selected"}`}>
                          <Icon size={13} className={a.type === "system" ? "text-muted" : "text-primary"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-ink">{a.text}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-disabled">{a.time}</span>
                            <span className="text-xs text-disabled">·</span>
                            <span className="text-xs text-primary">{a.entity}</span>
                            {a.type !== "system" && <button className="text-xs text-disabled hover:text-primary ml-auto">Show History</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : activeTab === "Deals" ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted">{entityDeals.length} deals</span>
                  <button className="wiz-btn wiz-btn--primary wiz-btn--sm">+ Create Deal</button>
                </div>
                {entityDeals.length === 0 ? (
                  <div className="text-center py-12 text-disabled text-sm">No deals yet</div>
                ) : entityDeals.map((d) => (
                  <div key={d.id} className="border border-border rounded-lg p-3 mb-2 hover:shadow-1">
                    <div className="flex justify-between"><span className="font-medium text-sm">{d.name}</span><span className="text-sm font-semibold">{d.amount}</span></div>
                    <div className="flex items-center gap-2 mt-1"><StageBadge stage={d.stage} small /><span className="text-xs text-disabled">Close: {d.closeDate}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-disabled">
                <div className="text-sm font-medium mb-1">{activeTab}</div>
                <div className="text-xs">Extend: add SSRM or card view for this tab</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Associations */}
        <div className="w-64 border-l border-border overflow-y-auto bg-surface p-4">
          {/* Contacts */}
          <AssocBlock title="Contacts" addLabel="+ Add">
            {entityContacts.map((c) => (
              <div key={c.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-action-hover cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-action-selected flex items-center justify-center text-xs font-medium text-primary-dark">{c.name[0]}</div>
                <div><div className="text-sm text-ink leading-tight">{c.name}</div><div className="text-xs text-disabled">{c.email}</div></div>
              </div>
            ))}
            {entityContacts.length === 0 && <div className="text-xs text-disabled py-2">No contacts</div>}
          </AssocBlock>
          {/* Deals */}
          <AssocBlock title="Deals" addLabel="+ Create">
            {entityDeals.map((d) => (
              <div key={d.id} className="py-1.5 px-2 rounded hover:bg-action-hover cursor-pointer">
                <div className="text-sm text-ink">{d.name}</div>
                <div className="flex items-center gap-2"><StageBadge stage={d.stage} small /><span className="text-xs text-muted">{d.amount}</span></div>
              </div>
            ))}
          </AssocBlock>
          {/* Pipeline */}
          <AssocBlock title="Pipeline">
            <div className="flex gap-1">
              {kanbanStages.map((s) => (
                <div key={s} className="flex-1 h-1.5 rounded-full"
                  style={{ backgroundColor: kanbanStages.indexOf(s) <= kanbanStages.indexOf(entity.stage) ? (stageColors[entity.stage] || "#e5e7eb") : "#e5e7eb" }} />
              ))}
            </div>
            <div className="text-xs text-muted mt-1">{entity.stage}</div>
          </AssocBlock>
          {/* Addresses */}
          <AssocBlock title="Addresses" addLabel="+ Add">
            {entity.isCustomer ? (
              <div className="text-xs text-muted bg-default rounded p-2">123 Commerce St, NYC 10001</div>
            ) : <div className="text-xs text-disabled py-2">No addresses</div>}
          </AssocBlock>
          {/* WizShop Users */}
          <AssocBlock title="WizShop Users" addLabel="+ Grant Access" onAdd={() => setSideSheet("access")}>
            {entityContacts.filter((c) => c.wizshop).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-action-hover">
                <span className="text-xs text-muted">{c.name}</span>
                <span className="text-xs bg-success-bg text-success-dark px-1.5 py-0.5 rounded">Active</span>
              </div>
            ))}
          </AssocBlock>
          {/* Payment */}
          {entity.isCustomer && (
            <AssocBlock title="Payment">
              <div className="text-xs text-muted bg-default rounded p-2 flex items-center gap-1">
                <CreditCard size={12} />Net 30 · Visa ••4242
              </div>
            </AssocBlock>
          )}
        </div>
      </div>

      {/* ─── SIDE SHEETS ─── */}
      <SideSheet open={sideSheet === "convert"} onClose={() => setSideSheet(null)} title="Convert to Customer" width="max-w-lg">
        <ConvertCustomerContent entity={entity} onDone={() => { setSideSheet(null); setModalOpen(true); }} />
      </SideSheet>
      <SideSheet open={sideSheet === "merge"} onClose={() => setSideSheet(null)} title="Merge / Convert" width="max-w-lg">
        <MergeConvertContent />
      </SideSheet>
      <SideSheet open={sideSheet === "task"} onClose={() => setSideSheet(null)} title="Create Task">
        <CreateTaskContent />
      </SideSheet>
      <SideSheet open={sideSheet === "note"} onClose={() => setSideSheet(null)} title="Log Note">
        <LogNoteContent />
      </SideSheet>
      <SideSheet open={sideSheet === "meeting"} onClose={() => setSideSheet(null)} title="Log Meeting">
        <LogMeetingContent />
      </SideSheet>
      <SideSheet open={sideSheet === "email"} onClose={() => setSideSheet(null)} title="Log Email">
        <LogEmailContent />
      </SideSheet>
      <SideSheet open={sideSheet === "access"} onClose={() => setSideSheet(null)} title="Grant Web Access">
        <GrantAccessContent companyName={entity.name} />
      </SideSheet>

      {/* ─── CONTACT MOVEMENT MODAL ─── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Move Contacts">
        <p className="text-sm text-muted mb-4">Company has been converted to Customer. How should associated contacts be handled?</p>
        <div className="space-y-2 mb-4">
          {["Move all contacts to Customer stage", "Select specific contacts to move", "Leave contacts where they are"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 p-2 border border-border rounded-lg hover:bg-action-hover cursor-pointer">
              <input type="radio" name="contactMove" defaultChecked={i === 0} className="text-primary" />
              <span className="text-sm text-muted">{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setModalOpen(false)} className="wiz-btn wiz-btn--secondary wiz-btn--sm">Cancel</button>
          <button onClick={() => setModalOpen(false)} className="wiz-btn wiz-btn--primary wiz-btn--sm">Confirm</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── HELPERS ───
function AssocBlock({ title, addLabel, onAdd, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-disabled uppercase tracking-wider">{title}</h4>
        {addLabel && (
          <button onClick={onAdd} className="text-xs text-primary hover:text-primary-dark">{addLabel}</button>
        )}
      </div>
      {children}
    </div>
  );
}

function getPropertiesForEntity(entity, entityType) {
  if (entityType === "Deal") {
    return [
      { label: "Deal Name", value: entity.name },
      { label: "Amount", value: entity.amount || "$0" },
      { label: "Close Date", value: entity.closeDate || "—" },
      { label: "Owner", value: entity.owner || entity.rep || "—" },
      { label: "Source", value: "Website" },
    ];
  }
  return [
    { label: "Company Name", value: entity.name },
    { label: "Domain", value: entity.name.toLowerCase().replace(/\s/g, "") + ".com" },
    { label: "Industry", value: "Wholesale Distribution" },
    { label: "Annual Revenue", value: "$2.4M" },
    { label: "Employee Count", value: "45" },
    { label: "Region", value: "North America" },
    { label: "Tax ID", value: entity.isCustomer ? "GST-2847561" : "—" },
    { label: "Payment Terms", value: entity.isCustomer ? "Net 30" : "—" },
    { label: "Price List", value: entity.isCustomer ? "B2B Standard" : "Default" },
  ];
}
