import { useState } from "react";
import { Building2 } from "lucide-react";
import { crmNav } from "../data/constants";

export default function AppShell({ activeEntity, onEntityChange, children }) {
  const [crmOpen, setCrmOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-700 font-sans">
      {/* Icon Sidebar */}
      <div className="w-14 bg-gray-900 flex flex-col items-center py-3 gap-1 flex-shrink-0">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold mb-4">
          W
        </div>
        <button
          onClick={() => setCrmOpen(!crmOpen)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${crmOpen ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}
          title="CRM"
        >
          <Building2 size={20} />
        </button>
      </div>

      {/* CRM Navigation Panel */}
      {crmOpen && (
        <div className="w-48 bg-white border-r border-gray-200 flex flex-col py-3 flex-shrink-0">
          <div className="px-3 mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CRM</h2>
          </div>
          <nav className="flex-1 px-2 space-y-0.5">
            {crmNav.map((item) => (
              <button
                key={item.key}
                onClick={() => onEntityChange(item.key)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  activeEntity === item.key
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}
