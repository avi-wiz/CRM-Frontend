import { Building2, DollarSign, GitBranch, Globe } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import { kanbanStages, stageColors } from "../../data/constants";

// A contact's stage mirrors its company's pipeline stage 1:1.

// Right panel — association blocks for the Contact detail page.
export default function ContactAssociations({ contact, onCompanyClick, onDealClick }) {
  const company = contact.company;

  return (
    <div className="w-64 border-l border-border overflow-y-auto bg-surface p-4 flex-shrink-0">
      {/* Company */}
      <Block title="Company" icon={Building2}>
        {company ? (
          <div
            onClick={() => onCompanyClick?.(company)}
            className="p-2.5 rounded-lg border border-border hover:border-primary cursor-pointer"
          >
            <div className="text-sm font-medium text-ink truncate">{company.name}</div>
            <div className="text-xs text-disabled mb-1.5">{company.industry}</div>
            <StageBadge stage={company.stage} small />
          </div>
        ) : (
          <div className="text-xs text-disabled">No associated company</div>
        )}
      </Block>

      {/* Deals */}
      <Block title="Deals" icon={DollarSign}>
        {(contact.deals || []).length === 0 && <div className="text-xs text-disabled">No deals</div>}
        {(contact.deals || []).map((d) => (
          <div key={d.id} onClick={() => onDealClick?.(d)} className="py-1.5 px-2 rounded hover:bg-action-hover cursor-pointer">
            <div className="text-sm text-ink truncate">{d.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <StageBadge stage={d.stage} small />
              <span className="text-xs text-muted">{d.amount}</span>
            </div>
          </div>
        ))}
      </Block>

      {/* Pipeline — mirrors the company's stage */}
      <Block title="Pipeline" icon={GitBranch}>
        <MiniPipeline stages={kanbanStages} current={contact.stage} />
        <div className="text-xs text-muted mt-2">
          Current stage: <span className="text-ink font-medium">{contact.stage}</span>
        </div>
        <div className="text-[10px] text-disabled mt-1">Inherited from {company?.name || "company"}</div>
      </Block>

      {/* WizShop User */}
      <Block title="WizShop User" icon={Globe}>
        {contact.isWizShopUser ? (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-disabled">Status</span>
              <span className={`px-1.5 py-0.5 rounded-full ${contact.wizShopStatus === "Active" ? "bg-success-bg text-success-dark" : "bg-tonal text-muted"}`}>
                {contact.wizShopStatus || "Active"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-disabled">Role</span>
              <span className="text-ink">{contact.wizShopRole || "—"}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-disabled">Not a WizShop user</div>
        )}
      </Block>
    </div>
  );
}

function MiniPipeline({ stages, current }) {
  const idx = stages.indexOf(current);
  return (
    <div className="flex items-center">
      {stages.map((s, i) => {
        const reached = i <= idx;
        const isCurrent = i === idx;
        const color = stageColors[s] || "#9ca3af";
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none" title={s}>
            <div
              className={`rounded-full flex-shrink-0 ${isCurrent ? "w-3 h-3" : "w-2 h-2"}`}
              style={{ backgroundColor: reached ? color : "#e5e7eb", ...(isCurrent ? { boxShadow: `0 0 0 2px #fff, 0 0 0 3.5px ${color}` } : {}) }}
            />
            {i < stages.length - 1 && (
              <div className="flex-1 h-0.5 mx-0.5" style={{ backgroundColor: i < idx ? color : "#e5e7eb" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Block({ title, icon: Icon, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon size={13} className="text-disabled" />}
        <h4 className="text-xs font-semibold text-disabled uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}
