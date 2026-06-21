# CRM Prototype — Claude Code Extension Guide

## What This Is
A barebone React + Tailwind prototype for WizCommerce CRM. It establishes 7 reusable UI patterns that cover all 10 planned flows. Every new screen is assembled from these patterns — no new patterns needed.

## How To Run
```bash
npm install
npm run dev
```

## Folder Structure
```
src/
├── App.jsx                          # Router — add new pages here
├── data/
│   └── constants.js                 # Sample data, stage colors, nav config
├── layouts/
│   └── AppShell.jsx                 # Sidebar + CRM nav + content slot
├── components/
│   ├── shared/                      # Reusable primitives
│   │   ├── StageBadge.jsx           # Pipeline stage badge
│   │   ├── SideSheet.jsx            # Slide-over panel (right side)
│   │   ├── Modal.jsx                # Centered dialog
│   │   ├── BulkToolbar.jsx          # Selection toolbar for listings
│   │   └── RowActions.jsx           # Row-level action menu (⋯)
│   ├── listings/                    # Listing page patterns
│   │   ├── ListingPage.jsx          # Reusable SSRM table
│   │   └── KanbanBoard.jsx          # Kanban column + card view
│   ├── detail/                      # Detail page panels
│   │   ├── DetailPage.jsx           # 3-panel layout orchestrator
│   │   ├── PropertiesPanel.jsx      # Left panel — editable fields
│   │   ├── CenterTabs.jsx           # Center — tab bar + tab content
│   │   ├── ActivityTimeline.jsx     # Activities tab content
│   │   └── AssociationsPanel.jsx    # Right panel — association blocks
│   └── side-sheets/                 # Side sheet contents
│       ├── ConvertCustomer.jsx      # Company → Customer conversion form
│       ├── MergeConvert.jsx         # Search + KAI recommendations
│       ├── CreateTask.jsx           # Task creation with multi-assign
│       ├── LogNote.jsx              # Quick note entry
│       ├── LogMeeting.jsx           # Meeting with attendees + outcome
│       ├── LogEmail.jsx             # Email logging
│       ├── LogVisit.jsx             # Visit logging
│       └── GrantAccess.jsx          # Multi-contact WizShop access
└── pages/                           # Page-level compositions
    ├── CompaniesPage.jsx            # Companies listing + Kanban toggle
    ├── ContactsPage.jsx             # Contacts listing
    ├── DealsPage.jsx                # Deals listing
    └── PlaceholderPage.jsx          # Stub for unbuilt entity pages
```

## The 7 Patterns (never create new ones — compose from these)

### Pattern 1: AppShell (layouts/AppShell.jsx)
- Icon sidebar (collapsed) + CRM nav panel (expanded) + content area
- To add a new entity: add entry to `crmNav` array in `data/constants.js`
- Content area renders whatever page component is active

### Pattern 2: ListingPage (components/listings/ListingPage.jsx)
- Props: `entityType`, `data`, `columns`, `onRowClick`, `viewMode`, `onViewChange`
- Columns are config objects: `{ key, label, render? }`
- Built-in: search, filter button, create CTA, checkbox selection, bulk toolbar, row actions
- To add a new listing: create a page in `pages/`, pass entity-specific columns and data

### Pattern 3: KanbanBoard (components/listings/KanbanBoard.jsx)
- Props: `stages`, `data`, `stageField`, `onCardClick`
- Generic — works for any entity that has stages
- Card content is configurable via render prop

### Pattern 4: DetailPage (components/detail/DetailPage.jsx)
- Props: `entity`, `entityType`, `tabs`, `properties`, `associations`, `onBack`
- 3-panel layout: left (properties), center (tabs), right (associations)
- To add a new detail page: configure `tabs`, `properties`, `associations` arrays
- Each tab renders its own content component

### Pattern 5: SideSheet (components/shared/SideSheet.jsx)
- Props: `open`, `onClose`, `title`, `width`, `children`
- Content is passed as children — each side sheet has its own content component
- To add a new side sheet: create a component in `side-sheets/`, render inside SideSheet

### Pattern 6: Modal (components/shared/Modal.jsx)
- Props: `open`, `onClose`, `title`, `children`
- For confirmations, blocking prompts, contact movement choices

### Pattern 7: BulkToolbar (components/shared/BulkToolbar.jsx)
- Props: `count`, `actions`, `onClear`
- Actions array: `[{ label, onClick }]`
- Appears automatically when items are selected in any listing

## How To Extend (for Claude Code)

### Adding a new entity listing (e.g., Meetings page)
1. Add sample data to `data/constants.js`
2. Create `pages/MeetingsPage.jsx`:
   ```jsx
   import ListingPage from '../components/listings/ListingPage';
   import { meetings, meetingColumns } from '../data/constants';
   export default function MeetingsPage() {
     return <ListingPage entityType="Meetings" data={meetings} columns={meetingColumns} />;
   }
   ```
3. Add route in `App.jsx`: `case 'meetings': return <MeetingsPage />`

### Adding a new side sheet (e.g., Create Deal)
1. Create `components/side-sheets/CreateDeal.jsx` with the form fields
2. Import SideSheet wrapper + new content in the page that needs it
3. Add trigger CTA in the relevant listing or detail page

### Adding a new tab to the detail page
1. Add tab name to the `tabs` array in the relevant detail page config
2. Create the tab content component
3. Add case in `CenterTabs.jsx` switch

### Adding Org Settings pages
1. Create `pages/settings/` folder
2. Each settings page is a standalone form — no special pattern needed
3. Use the same SideSheet and Modal components for sub-flows

## Mapping: Prototype Flows → Files

| Flow | Primary Files |
|------|--------------|
| Flow 1: CRM Nav + Listings + Detail | AppShell, CompaniesPage, DetailPage, all panels |
| Flow 2: Merge/Convert | MergeConvert.jsx, SideSheet |
| Flow 3: Pipeline + Kanban | KanbanBoard, new: PipelineSettings page |
| Flow 4: Signup → Admin | CompaniesPage (listing actions), GrantAccess, MergeConvert |
| Flow 5: Contact Creation + Detail | ContactsPage, new: CreateContact side sheet |
| Flow 6: Deal Creation + Detail | DealsPage, new: CreateDeal side sheet |
| Flow 7: Activity Side Sheets | LogNote, LogMeeting, CreateTask, LogEmail, LogVisit |
| Flow 8: Form Builder | New: settings/FormBuilder page |
| Flow 9: Bulk Operations | BulkToolbar (already built, add action handlers) |
| Flow 10: Customer Gate | New: CustomerGateModal, ConvertCustomer |

## Styling Rules
- Tailwind only — no custom CSS files
- Color palette: indigo-600 (primary), emerald-600 (customer/success), gray-900 (sidebar)
- Stage colors defined in `data/constants.js` — single source of truth
- All text: text-sm (body), text-xs (labels, secondary), text-lg (page titles)
- Border: border-gray-100 (subtle), border-gray-200 (standard)
- Border radius: rounded-lg (containers), rounded-full (badges, pills)
