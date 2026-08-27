import { useState } from "react";
import { Building2, ChevronsLeft, ChevronsRight } from "lucide-react";
import { crmNav, settingsNav } from "../data/constants";

export default function AppShell({ activeEntity, onEntityChange, children }) {
  const [crmOpen, setCrmOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-default text-muted font-sans">
      {/* Icon Sidebar */}
      <div className="w-16 bg-bold flex flex-col items-center py-4 gap-2 flex-shrink-0 border-r border-bold-hover shadow-lg">
        <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white text-sm font-extrabold mb-4 shadow-2 animate-pulse-glow">
          W
        </div>
        <button
          onClick={() => setCrmOpen(!crmOpen)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${crmOpen ? "bg-primary text-white shadow-2" : "text-disabled hover:text-white hover:bg-bold-hover"}`}
          title="CRM"
        >
          <Building2 size={20} />
        </button>

        <button
          onClick={() => onEntityChange(settingsNav.key)}
          className={`mt-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${activeEntity === settingsNav.key ? "bg-primary text-white shadow-2" : "text-disabled hover:text-white hover:bg-bold-hover"}`}
          title={settingsNav.label}
        >
          <settingsNav.icon size={18} />
        </button>
      </div>

      {/* CRM Navigation Panel */}
      {crmOpen && (
        <div className={`${collapsed ? "w-16" : "w-56"} bg-surface border-r border-divider flex flex-col py-4 flex-shrink-0 shadow-1 transition-[width] duration-300 ease-out`}>
          <div className={`mb-4 flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}>
            {collapsed ? (
              <span className="text-[9px] font-semibold bg-tonal text-primary-dark px-1.5 py-0.5 rounded-full uppercase tracking-wider">CRM</span>
            ) : (
              <>
                <h2 className="text-[11px] font-bold text-disabled uppercase tracking-widest">WizCommerce</h2>
                <span className="text-[9px] font-semibold bg-tonal text-primary-dark px-1.5 py-0.5 rounded-full uppercase tracking-wider">CRM</span>
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
                      ? "bg-action-hover text-primary shadow-1 border border-tonal"
                      : "text-muted hover:text-ink hover:bg-action-hover " + (collapsed ? "" : "hover:translate-x-1")
                  }`}
                >
                  <item.icon size={16} className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-primary" : "text-disabled group-hover:text-muted"}`} />
                  {!collapsed && item.label}

                  {/* Hover tooltip when collapsed */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-lg bg-bold px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Expand / Collapse toggle pinned at the bottom */}
          <div className={`mt-2 pt-2 border-t border-divider ${collapsed ? "px-2" : "px-3"}`}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand" : "Collapse"}
              className={`w-full flex items-center rounded-xl py-2.5 text-sm font-medium text-disabled hover:text-muted hover:bg-action-hover transition-all duration-200 ${
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
      <div className="flex-1 flex flex-col overflow-hidden bg-default">
        {children}
      </div>
    </div>
  );
}
