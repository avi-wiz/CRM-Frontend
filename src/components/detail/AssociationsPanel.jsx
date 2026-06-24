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
    <div className="w-64 border-l border-gray-150 overflow-y-auto bg-white p-5 flex-shrink-0">
      {/* Contacts */}
      <Block title="Contacts" icon={Users} action={{ label: "+ Add Contact", onClick: () => onAction?.("addContact") }}>
        {(company.contacts || []).map((c) => (
          <div key={c.id} onClick={() => onContactClick?.(c)} className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-indigo-50/40 cursor-pointer transition-colors duration-150">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0 shadow-sm">
              {initials(c.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800 leading-tight truncate">{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${ROLE_COLOR[c.role] || "bg-gray-100 text-gray-600"}`}>{c.role}</span>
              </div>
              <div className="text-xs text-gray-400 truncate">{c.email}</div>
            </div>
          </div>
        ))}
      </Block>

      {/* Deals */}
      <Block title="Deals" icon={DollarSign} action={{ label: "+ Create Deal", onClick: () => onAction?.("addDeal") }}>
        {(company.deals || []).map((d) => (
          <div key={d.id} onClick={() => onDealClick?.(d)} className="py-2 px-2.5 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/40 cursor-pointer transition-all duration-150">
            <div className="text-sm font-medium text-gray-800">{d.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <StageBadge stage={d.stage} small />
              <span className="text-xs font-semibold text-gray-600">{d.amount}</span>
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
        <div className="space-y-1.5">
          {(company.payment?.cards || DEFAULT_CARDS).map((card, i) => (
            <CardRow key={i} card={card} />
          ))}
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
    <div className="mb-6 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={13} className="text-gray-400" />}
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</h4>
        </div>
        {action && (
          <button onClick={action.onClick} className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">{action.label}</button>
        )}
      </div>
      {children}
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// Sample cards on file (prototype) — overridden by company.payment.cards if present.
const DEFAULT_CARDS = [
  { brand: "Visa", last4: "4242" },
  { brand: "Mastercard", last4: "8319" },
];

// A masked card on file: all digits shown as "X" except the last 4.
function CardRow({ card }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-150 bg-gray-50/50">
      <CreditCard size={13} className="text-gray-400 flex-shrink-0" />
      <span className="text-xs text-gray-700 font-mono tracking-tight">
        XXXX XXXX XXXX {card.last4}
      </span>
      {card.brand && <span className="text-[10px] text-gray-400 ml-auto">{card.brand}</span>}
    </div>
  );
}
