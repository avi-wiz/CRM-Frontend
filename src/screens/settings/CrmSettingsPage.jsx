import { useState } from "react";
import { Mail } from "lucide-react";
import EmailConnectPanel from "./EmailConnectPanel";

const SECTIONS = [
  { key: "email", label: "Email", icon: Mail, Component: EmailConnectPanel },
];

export default function CrmSettingsPage() {
  const [active, setActive] = useState("email");
  const activeSection = SECTIONS.find((s) => s.key === active) || SECTIONS[0];
  const ActivePanel = activeSection.Component;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-56 border-r border-divider bg-surface flex-shrink-0 py-4 px-3">
        <h2 className="text-[11px] font-bold text-disabled uppercase tracking-widest px-2 mb-3">CRM Settings</h2>
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active === s.key ? "bg-action-hover text-primary" : "text-muted hover:bg-action-hover hover:text-ink"
              }`}
            >
              <s.icon size={15} className={active === s.key ? "text-primary" : "text-disabled"} />
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <ActivePanel />
      </div>
    </div>
  );
}
