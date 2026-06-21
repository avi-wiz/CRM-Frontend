import { Users, DollarSign, GitBranch, MapPin, Globe, CreditCard, Network } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import { stageColors } from "../../data/constants";

const ROLE_COLOR = {
  "Decision Maker": "bg-indigo-50 text-indigo-700",
  Billing: "bg-amber-50 text-amber-700",
  User: "bg-gray-100 text-gray-600",
};

// Right panel — association blocks for the Company detail page.
export default function AssociationsPanel({ company, stages, stage, onStageChange, onContactClick, onDealClick, onAction }) {
  const wizshopUsers = (company.contacts || []).filter((c) => c.wizshop);

  return (
    <div className="w-64 border-l border-gray-100 overflow-y-auto bg-white p-4 flex-shrink-0">
      {/* Contacts */}
      <Block title="Contacts" icon={Users} action={{ label: "+ Add Contact", onClick: () => onAction?.("addContact") }}>
        {(company.contacts || []).map((c) => (
          <div key={c.id} onClick={() => onContactClick?.(c)} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700 flex-shrink-0">
              {initials(c.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-800 leading-tight truncate">{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${ROLE_COLOR[c.role] || "bg-gray-100 text-gray-600"}`}>{c.role}</span>
              </div>
              <div className="text-xs text-gray-400 truncate">{c.email}</div>
            </div>
          </div>
        ))}
      </Block>

      {/* Deals */}
      <Block title="Deals" icon={DollarSign} action={{ label: "+ Add Deal", onClick: () => onAction?.("addDeal") }}>
        {(company.deals || []).map((d) => (
          <div key={d.id} onClick={() => onDealClick?.(d)} className="py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer">
            <div className="text-sm text-gray-800">{d.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <StageBadge stage={d.stage} small />
              <span className="text-xs text-gray-500">{d.amount}</span>
            </div>
          </div>
        ))}
      </Block>

      {/* Pipeline (interactive mover) */}
      <Block title="Pipeline" icon={GitBranch}>
        <MiniPipeline stages={stages} current={stage} />
        <label className="text-xs text-gray-500 block mt-2 mb-1">Move to Stage</label>
        <select
          value={stage}
          onChange={(e) => onStageChange?.(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
        >
          {stages.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Block>

      {/* Addresses */}
      <Block title="Addresses" icon={MapPin}>
        <AddressLine label="Billing" addr={company.billingAddress} onEdit={() => onAction?.("editBilling")} />
        <AddressLine label="Shipping" addr={company.shippingAddress} onEdit={() => onAction?.("editShipping")} />
      </Block>

      {/* WizShop Users */}
      <Block title="WizShop Users" icon={Globe} action={{ label: "+ Grant Access", onClick: () => onAction?.("grantAccess") }}>
        {wizshopUsers.length === 0 && <div className="text-xs text-gray-400 py-1">No WizShop users</div>}
        {wizshopUsers.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50">
            <span className="text-xs text-gray-700 truncate">{c.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${c.wizshopStatus === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
              {c.wizshopStatus}
            </span>
          </div>
        ))}
      </Block>

      {/* Payment */}
      <Block title="Payment" icon={CreditCard} action={{ label: "Edit", onClick: () => onAction?.("editPayment") }}>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between"><span className="text-gray-400">Terms</span><span className="text-gray-800">{company.payment?.terms || "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Credit Limit</span><span className="text-gray-800">{company.payment?.creditLimit || "—"}</span></div>
        </div>
      </Block>

      {/* Parent / Child */}
      <Block title="Parent / Child" icon={Network} action={{ label: "+ Link Company", onClick: () => onAction?.("linkCompany") }}>
        <div className="text-xs text-gray-500 mb-1">
          Parent: <span className="text-gray-800">{company.parent?.name || "No parent company"}</span>
        </div>
        {(company.children || []).length > 0 ? (
          <div className="space-y-0.5">
            {company.children.map((c) => (
              <div key={c.id} className="text-xs text-gray-700 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">↳ {c.name}</div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400">No child companies</div>
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

function AddressLine({ label, addr, onEdit }) {
  const text = addr?.street
    ? `${addr.street}, ${[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}`
    : "—";
  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-gray-400">{label}</div>
        <div className="text-xs text-gray-700 truncate">{text}</div>
      </div>
      <button onClick={onEdit} className="text-xs text-indigo-500 hover:text-indigo-700 flex-shrink-0">Edit</button>
    </div>
  );
}

function Block({ title, icon: Icon, action, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={13} className="text-gray-400" />}
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h4>
        </div>
        {action && (
          <button onClick={action.onClick} className="text-xs text-indigo-500 hover:text-indigo-700">{action.label}</button>
        )}
      </div>
      {children}
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
