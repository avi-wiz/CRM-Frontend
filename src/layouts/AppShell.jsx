import { useState } from "react";
import { Building2, ChevronsLeft, ChevronsRight } from "lucide-react";
import { crmNav } from "../data/constants";

export default function AppShell({ activeEntity, onEntityChange, children }) {
  const [crmOpen, setCrmOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] text-gray-700 font-sans">
      {/* Icon Sidebar */}
      <div className="w-16 bg-slate-950 flex flex-col items-center py-4 gap-2 flex-shrink-0 border-r border-slate-900 shadow-lg">
        <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white text-sm font-extrabold mb-4 shadow-[0_0_15px_rgba(99,102,241,0.55)] animate-pulse-glow">
          W
        </div>
        <button
          onClick={() => setCrmOpen(!crmOpen)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${crmOpen ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
          title="CRM"
        >
          <Building2 size={20} />
        </button>
      </div>

      {/* CRM Navigation Panel */}
      {crmOpen && (
        <div className={`${collapsed ? "w-16" : "w-56"} bg-white border-r border-gray-150 flex flex-col py-4 flex-shrink-0 shadow-sm transition-[width] duration-300 ease-out`}>
          <div className={`mb-4 flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}>
            {collapsed ? (
              <span className="text-[9px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">CRM</span>
            ) : (
              <>
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">WizCommerce</h2>
                <span className="text-[9px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">CRM</span>
              </>
            )}
          </div>

          <nav className={`flex-1 space-y-1.5 ${collapsed ? "px-2" : "px-3"}`}>
            {crmNav.map((item) => {
              const isActive = activeEntity === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onEntityChange(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`group relative w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 transform ${
                    collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-indigo-50/70 text-indigo-600 shadow-sm border border-indigo-100/50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 " + (collapsed ? "" : "hover:translate-x-1")
                  }`}
                >
                  <item.icon size={16} className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  {!collapsed && item.label}

                  {/* Hover tooltip when collapsed */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Expand / Collapse toggle pinned at the bottom */}
          <div className={`mt-2 pt-2 border-t border-gray-100 ${collapsed ? "px-2" : "px-3"}`}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand" : "Collapse"}
              className={`w-full flex items-center rounded-xl py-2.5 text-sm font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50/80 transition-all duration-200 ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              }`}
            >
              {collapsed ? <ChevronsRight size={16} className="flex-shrink-0" /> : <ChevronsLeft size={16} className="flex-shrink-0" />}
              {!collapsed && "Collapse"}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
        {children}
      </div>
    </div>
  );
}
