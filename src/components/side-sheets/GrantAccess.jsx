import { useState } from "react";
import { wizShopRoles } from "../../data/constants";

// Normalizes either contact shape into what GrantAccessContent expects.
// Detail-page nested contacts: { id, name, email, wizshop }
// Global contacts array:       { id, firstName, lastName, email, isWizShopUser }
export function normalizeContacts(list = []) {
  return list.map((c) => ({
    id: c.id,
    name: c.name || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
    email: c.email,
    isWizShopUser: c.isWizShopUser ?? c.wizshop ?? false,
  }));
}

// Grant WizShop Access side sheet. `contacts` is the company's contacts
// (already normalized). `onClose`/`onDone` are owned by the host SideSheet.
/**
 * FORM SOURCE: Org Settings → Forms → WizShop User
 * Only renders if wizshop_enabled feature flag is true.
 * Default role from WizShop User form settings.
 * "Auto-send invite email" default from WizShop User form settings.
 */
export default function GrantAccessContent({ contacts = [], onClose, onDone }) {
  // Selection: seed with already-active users (locked on). Non-users start off.
  const [selected, setSelected] = useState(() =>
    Object.fromEntries(contacts.map((c) => [c.id, c.isWizShopUser]))
  );
  // Per-contact config for newly-selected (non-existing) users.
  const [config, setConfig] = useState(() =>
    Object.fromEntries(contacts.map((c) => [c.id, { role: "Buyer", invite: true }]))
  );

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const setCfg = (id, patch) => setConfig((c) => ({ ...c, [id]: { ...c[id], ...patch } }));

  // New users = selected AND not already active.
  const newUsers = contacts.filter((c) => selected[c.id] && !c.isWizShopUser);

  const handleSubmit = () => {
    console.log("Grant WizShop access", newUsers.map((c) => ({
      id: c.id, name: c.name, email: c.email, ...config[c.id],
    })));
    onDone?.(newUsers.length);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Select Contacts */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Contacts</h3>
          {contacts.length === 0 && (
            <div className="text-sm text-gray-400 py-4 text-center">This company has no contacts.</div>
          )}
          <div className="space-y-2">
            {contacts.map((c) => {
              const active = c.isWizShopUser;
              const checked = !!selected[c.id];
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-3 p-2.5 border rounded-lg ${
                    active
                      ? "border-gray-100 bg-gray-50 opacity-70 cursor-default"
                      : checked
                        ? "border-indigo-200 bg-indigo-50/40 cursor-pointer"
                        : "border-gray-200 hover:border-indigo-200 cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active || checked}
                    disabled={active}
                    onChange={() => toggle(c.id)}
                    className="rounded accent-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{c.name}</div>
                    <div className="text-xs text-gray-400 truncate">{c.email}</div>
                  </div>
                  {active && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                      Already active
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </section>

        {/* User Configuration — scoped to newly-selected contacts */}
        {newUsers.length > 0 && (
          <section className="mb-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">User Configuration</h3>
            <div className="space-y-2.5">
              {newUsers.map((c) => {
                const cfg = config[c.id];
                return (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-400 mb-2.5">{c.email}</div>
                    <div className="flex items-center gap-3">
                      <select
                        value={cfg.role}
                        onChange={(e) => setCfg(c.id, { role: e.target.value })}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      >
                        {wizShopRoles.map((r) => <option key={r}>{r}</option>)}
                      </select>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cfg.invite}
                          onChange={(e) => setCfg(c.id, { invite: e.target.checked })}
                          className="rounded accent-indigo-600"
                        />
                        <span className="text-xs text-gray-600">Send invite email</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={newUsers.length === 0}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            newUsers.length > 0
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Create {newUsers.length} User{newUsers.length === 1 ? "" : "s"}
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </div>
  );
}
