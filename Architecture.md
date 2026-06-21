# CRM Prototype — Architecture

A React + Tailwind prototype for WizCommerce CRM. State-driven (no router library), built from a small set of reusable UI patterns. This document describes **what actually exists on disk**, and notes where it diverges from `README.md` (which is aspirational).

## Tech Stack
- React 18 (`StrictMode`), Vite, Tailwind CSS (utility classes only, no custom CSS beyond `index.css`)
- `lucide-react` for icons
- No router, no global state library, no backend — all data is static, all interactions are local component state.

---

## Actual File Structure (on disk)

```
src/
├── main.jsx                          # ReactDOM root → <App/>
├── index.css                         # Tailwind entry
├── App.jsx                           # Root: state-based "router" + render switch
├── data/
│   └── constants.jsx                 # Sample data, stage colors, nav config, column configs
├── layouts/
│   └── AppShell.jsx                  # Icon sidebar + CRM nav panel + content slot
└── components/
    ├── shared/
    │   ├── StageBadge.jsx            # Pipeline stage pill (color from stageColors)
    │   ├── SideSheet.jsx             # Right slide-over panel (wrapper)
    │   ├── Modal.jsx                 # Centered dialog
    │   ├── BulkToolbar.jsx           # Selection action bar
    │   └── RowActions.jsx            # Row ⋯ dropdown menu
    ├── listings/
    │   ├── ListingPage.jsx           # Reusable table (search/filter/select/bulk/rowactions)
    │   └── KanbanBoard.jsx           # Generic stage-column board
    ├── detail/
    │   └── DetailPage.jsx            # 3-panel detail view — ALL panels inlined here
    └── side-sheets/
        └── index.jsx                 # ALL side-sheet contents + form helpers (one file)
```

### ⚠️ README vs. Reality
`README.md` describes a more decomposed structure than what's built. Key divergences:

| README claims | Reality |
|---|---|
| `data/constants.js` | It's `constants.jsx` |
| `detail/PropertiesPanel.jsx`, `CenterTabs.jsx`, `ActivityTimeline.jsx`, `AssociationsPanel.jsx` | **Do not exist.** All inlined inside `DetailPage.jsx` (`getPropertiesForEntity()` helper, inline tab bar, inline activity list, inline `AssocBlock` helper). |
| `side-sheets/ConvertCustomer.jsx`, `MergeConvert.jsx`, `CreateTask.jsx`, `LogNote.jsx`, `LogMeeting.jsx`, `LogEmail.jsx`, `LogVisit.jsx`, `GrantAccess.jsx` (8 files) | **All consolidated** into a single `side-sheets/index.jsx` exporting named `*Content` components + shared `FormField`/`CheckboxList` helpers. |
| `pages/CompaniesPage.jsx`, `ContactsPage.jsx`, `DealsPage.jsx`, `PlaceholderPage.jsx` | **No `pages/` directory exists.** All page composition happens directly inside `App.jsx`'s `renderContent()` switch. |

So: there are effectively **6 real patterns**, and routing/page composition lives in `App.jsx`, not in separate page files.

---

## How Routing Works (`App.jsx`)

There is **no router library**. `App.jsx` holds three pieces of `useState`:

- `activeEntity` — current nav key (`"companies"`, `"contacts"`, `"deals"`, etc.), set by clicking the sidebar nav (`onEntityChange`).
- `detailView` — the currently-open record object, or `null`. Set when a row/card is clicked; cleared on back.
- `companyView` — `"table"` | `"kanban"` toggle (only used by companies/customers).

`renderContent()` decides what to show:
1. **Detail takes priority** — if `detailView` is set, render `<DetailPage>` for it regardless of entity. `entityType` is derived from `activeEntity` (`deals→Deal`, `contacts→Contact`, else `Company`).
2. Otherwise a `switch (activeEntity)`:
   - `"companies"` / `"customers"` → table `ListingPage` **or** `KanbanBoard` depending on `companyView`. Customers = `companies.filter(c => c.isCustomer)`.
   - `"contacts"` → `ListingPage` with `contactColumns`.
   - `"deals"` → `ListingPage` with `dealColumns`.
   - `default` → a placeholder "Extend: create a page component" empty state. This covers `meetings`, `tasks`, `visits`, `activities`, `dashboard` — they are **nav entries with no page built yet**.

Changing entity (`handleEntityChange`) also clears `detailView`. Everything is wrapped in `<AppShell>`.

---

## How the Patterns Compose

```
AppShell (sidebar + nav + content slot)
└── renderContent() in App.jsx
    ├── ListingPage  ─── rows ──▶ StageBadge (cell render="stage_badge")
    │     ├── BulkToolbar       (shown when rows selected)
    │     └── RowActions        (per-row ⋯ menu)
    │
    ├── KanbanBoard  ─── columns by stage, color from stageColors
    │
    └── DetailPage   (3-panel orchestrator — opened from row/card click)
          ├── LEFT   : Properties  (getPropertiesForEntity helper, inlined)
          ├── CENTER : Tab bar + tab content (Activities/Deals built, rest = empty state)
          ├── RIGHT  : AssociationsPanel via inline AssocBlock (Contacts, Deals,
          │            Pipeline bar, Addresses, WizShop Users, Payment)
          ├── SideSheet  (wrapper) ── renders one of side-sheets/index.jsx contents:
          │     Convert / Merge / Task / Note / Meeting / Email / GrantAccess
          └── Modal       (contact-movement choice after conversion)
```

- **`StageBadge`** is the single source for stage coloring, pulling from `stageColors` in constants. Used by listings, kanban, and detail.
- **`ListingPage`** is fully config-driven via `columns` (`{key, label, render}` where `render` can be `"stage_badge"`, a function, or omitted). Self-manages selection state and bulk toolbar.
- **`KanbanBoard`** is generic over any entity with a stage field; supports a `renderCard` render prop (default card shows name/rep/lastActivity/contacts/deals).
- **`DetailPage`** is the heaviest component — it owns tab state, filter state, which side sheet is open, and the post-convert modal. Tab set varies by `entityType` (Company/Contact/Deal configs).
- **`SideSheet`/`Modal`** are pure presentational wrappers; content is passed as children.

---

## Sample Data (`data/constants.jsx`)

Exports everything as named consts:

- **`stageColors`** — map of stage name → hex. Single source of truth: `New, Lead, Qualified, Negotiation, Customer, Rejected, Proposal, Closed - Won, Closed - Lost`.
- **`kanbanStages`** — `["New", "Lead", "Qualified", "Negotiation", "Customer"]` (the board's columns).
- **`crmNav`** — 9 nav items with `lucide` icons: Companies, Contacts, Customers, Deals, Meetings, Tasks, Visits, Activities, Dashboard.
- **`companies`** — 6 records (id, name, stage, isCustomer, rep, contacts, deals, created, lastActivity). 2 are customers (ABC Corp, Summit Foods).
- **`contacts`** — 3 records (name, email, phone, company, wizshop bool, stage).
- **`deals`** — 2 records (name, amount, stage, company, contact, owner, closeDate).
- **`activities`** — 6 timeline items (type: system/meeting/note/task/email, text, entity, time).
- **`reps`** — 4 sales reps (used to populate assign/attendee checkbox lists).
- **Column configs** — `companyColumns`, `contactColumns`, `dealColumns` (each an array of `{key, label, render?}`).

Associations in `DetailPage` are derived by name-matching against this data (e.g. `contacts.filter(c => c.company === entity.name)`). Most detail-panel field values (Domain, Industry, Revenue, Tax ID, etc.) are **hardcoded/derived in `getPropertiesForEntity()`**, not in the data file.

---

## Built vs. Placeholder

| Area | Status |
|---|---|
| Companies listing (table) | ✅ Built |
| Companies / Customers Kanban | ✅ Built (toggle in header) |
| Customers listing | ✅ Built (filtered view of companies) |
| Contacts listing | ✅ Built |
| Deals listing | ✅ Built |
| Detail page (Company/Contact/Deal) | ✅ Built — 3 panels |
| Detail → Activities tab | ✅ Built (with filter chips + log buttons; filters are non-functional UI) |
| Detail → Deals tab | ✅ Built |
| Detail → all other tabs (Sales, Visits, Meetings, Tasks, WizShop Activity, Quotes, Wishlists) | ⚠️ Placeholder ("Extend: add SSRM or card view") |
| Side sheets: Convert, Merge, Task, Note, Meeting, Email, GrantAccess | ✅ Built (UI only — no submit logic) |
| Side sheet: LogVisit | ✅ Content exists in `index.jsx` but **not wired** into any trigger |
| Contact-movement Modal | ✅ Built (opens after Convert) |
| Meetings, Tasks, Visits, Activities, Dashboard pages | ❌ Placeholder empty state (nav exists, no page) |
| `pages/` directory & per-page files | ❌ Not created — composition lives in `App.jsx` |
| Search, Filters, Bulk actions, RowActions | ⚠️ Rendered but non-functional (no handlers) |

### Prototype caveats
This is a **UI prototype**: nearly all interactivity beyond navigation and tab/view switching is cosmetic. Forms don't submit, search/filter inputs don't filter, bulk and row actions have empty handlers. The value is the pattern library and visual composition, not behavior.

---

## How To Extend (matching the real codebase)

- **New entity listing**: add data + column config to `constants.jsx`, then add a `case` in `App.jsx`'s `renderContent()` switch rendering `<ListingPage>`. (The README's `pages/` approach is not how it's currently done.)
- **New side sheet**: add a `*Content` export to `side-sheets/index.jsx`, then add a `<SideSheet>` instance + trigger in `DetailPage.jsx` (gated on the `sideSheet` state string).
- **New detail tab**: add the tab name to the relevant `tabConfig` array in `DetailPage.jsx` and add a branch in the center-panel conditional (currently `Activities` / `Deals` / else-placeholder).
- **New nav item**: add to `crmNav` in `constants.jsx` (renders automatically in `AppShell`); build the page by adding a switch case in `App.jsx`.

## Styling Conventions
- Tailwind only. Primary `indigo-600`; success/customer `emerald-600`; sidebar `gray-900`.
- Stage colors come exclusively from `stageColors` (inline `style` for dynamic hex; one spot in `DetailPage` pipeline bar duplicates the map inline — a small DRY violation).
- Text: `text-sm` body, `text-xs` labels, `text-lg` page titles. Borders `gray-100`/`gray-200`. Radius `rounded-lg` containers, `rounded-full` pills.
