import { Building2, Users, Star, DollarSign, Calendar, CheckSquare, Car, Activity, BarChart3, FileText } from "lucide-react";

// ─── STAGE COLORS (single source of truth) ───
export const stageColors = {
  // Company pipeline stages (PRD)
  "New Lead": "#3b82f6",
  Contacted: "#f59e0b",
  Qualified: "#8b5cf6",
  "Proposal Sent": "#6366f1",
  Negotiation: "#ec4899",
  Won: "#10b981",
  Lost: "#ef4444",
  // Deal stages (legacy — still used by deals sample data)
  Proposal: "#8b5cf6",
  "Closed - Won": "#10b981",
  "Closed - Lost": "#ef4444",
  // Deal pipeline stages (DealsPage bulk actions + Enterprise pipeline)
  Qualification: "#8b5cf6",
  "Contract Sent": "#6366f1",
  "Closed Won": "#10b981",
  "Closed Lost": "#ef4444",
  Discovery: "#3b82f6",
  "Technical Review": "#f59e0b",
  Pilot: "#8b5cf6",
  Procurement: "#6366f1",
  Contract: "#ec4899",
};

// Company kanban columns, in pipeline order.
export const kanbanStages = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];

// ─── CRM NAVIGATION ───
// Note: "Customers" is NOT a separate entity. It routes to the same
// CompaniesPage but pre-filters to is_customer=true (see App.jsx, which keys
// off `customerFilter`). All other keys map 1:1 to an entity/page.
export const crmNav = [
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "contacts", label: "Contacts", icon: Users },
  { key: "customers", label: "Customers", icon: Star }, // filtered Companies view (is_customer=true)
  { key: "deals", label: "Deals", icon: DollarSign },
  { key: "quotes", label: "Quotes", icon: FileText },
  { key: "meetings", label: "Meetings", icon: Calendar },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "visits", label: "Visits", icon: Car },
  { key: "activities", label: "Activities", icon: Activity },
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
];

// ─── SAMPLE DATA: COMPANIES ───
// Reps cycle through this roster; ~4 records are customers (isCustomer).
// Dates are ISO strings relative to mid-2026 (createdAt: last 90d, lastActivity: last 30d).
export const companies = [
  { id: 1, name: "Pinnacle Distributors", domain: "pinnacle.co", stage: "Contacted", isCustomer: false, rep: "John Carmichael", contactCount: 3, dealCount: 2, createdAt: "2026-05-30", lastActivity: "2026-06-19", industry: "Wholesale Distribution", employeeCount: 45, annualRevenue: "$2.4M", address: { street: "123 Commerce St", city: "New York", state: "NY", country: "USA" } },
  { id: 2, name: "ABC Corp", domain: "abccorp.com", stage: "Won", isCustomer: true, rep: "Tyler Jones", contactCount: 5, dealCount: 4, createdAt: "2026-04-02", lastActivity: "2026-06-20", industry: "Consumer Goods", employeeCount: 320, annualRevenue: "$58M", address: { street: "88 Market Ave", city: "Chicago", state: "IL", country: "USA" } },
  { id: 3, name: "Horizon Retail", domain: "horizonretail.co", stage: "New Lead", isCustomer: false, rep: "Jon Morales", contactCount: 1, dealCount: 0, createdAt: "2026-06-15", lastActivity: "2026-06-21", industry: "Retail", employeeCount: 120, annualRevenue: "$14M", address: { street: "12 High St", city: "Austin", state: "TX", country: "USA" } },
  { id: 4, name: "Metro Wholesale", domain: "metrowholesale.com", stage: "Qualified", isCustomer: false, rep: "Saul Cabrera", contactCount: 2, dealCount: 1, createdAt: "2026-05-08", lastActivity: "2026-06-18", industry: "Wholesale Distribution", employeeCount: 78, annualRevenue: "$9.1M", address: { street: "455 Industrial Pkwy", city: "Denver", state: "CO", country: "USA" } },
  { id: 5, name: "Delta Trading", domain: "deltatrading.io", stage: "Negotiation", isCustomer: false, rep: "Ryan Walsh", contactCount: 4, dealCount: 3, createdAt: "2026-04-21", lastActivity: "2026-06-16", industry: "Import / Export", employeeCount: 56, annualRevenue: "$11.7M", address: { street: "7 Dockside Rd", city: "Seattle", state: "WA", country: "USA" } },
  { id: 6, name: "Summit Foods", domain: "summitfoods.com", stage: "Won", isCustomer: true, rep: "John Carmichael", contactCount: 6, dealCount: 5, createdAt: "2026-03-28", lastActivity: "2026-06-20", industry: "Food & Beverage", employeeCount: 210, annualRevenue: "$42M", address: { street: "900 Orchard Ln", city: "Portland", state: "OR", country: "USA" } },
  { id: 7, name: "Greenfield Organics", domain: "greenfield.farm", stage: "Proposal Sent", isCustomer: false, rep: "Tyler Jones", contactCount: 2, dealCount: 2, createdAt: "2026-05-12", lastActivity: "2026-06-12", industry: "Agriculture", employeeCount: 34, annualRevenue: "$5.3M", address: { street: "21 Greenway", city: "Sacramento", state: "CA", country: "USA" } },
  { id: 8, name: "Apex Industrial", domain: "apexind.com", stage: "Contacted", isCustomer: false, rep: "Jon Morales", contactCount: 3, dealCount: 1, createdAt: "2026-05-25", lastActivity: "2026-06-10", industry: "Manufacturing", employeeCount: 540, annualRevenue: "$96M", address: { street: "1400 Forge Blvd", city: "Pittsburgh", state: "PA", country: "USA" } },
  { id: 9, name: "Coastal Imports", domain: "coastalimports.com", stage: "Qualified", isCustomer: false, rep: "Saul Cabrera", contactCount: 2, dealCount: 0, createdAt: "2026-04-30", lastActivity: "2026-06-05", industry: "Import / Export", employeeCount: 28, annualRevenue: "$3.8M", address: { street: "63 Harbor Dr", city: "Miami", state: "FL", country: "USA" } },
  { id: 10, name: "Nimbus Tech Supply", domain: "nimbussupply.io", stage: "New Lead", isCustomer: false, rep: "Ryan Walsh", contactCount: 1, dealCount: 0, createdAt: "2026-06-08", lastActivity: "2026-06-17", industry: "Technology", employeeCount: 90, annualRevenue: "$22M", address: { street: "300 Cloud Way", city: "San Jose", state: "CA", country: "USA" } },
  { id: 11, name: "Ironclad Hardware", domain: "ironcladhw.com", stage: "Lost", isCustomer: false, rep: "John Carmichael", contactCount: 2, dealCount: 1, createdAt: "2026-04-10", lastActivity: "2026-05-29", industry: "Hardware", employeeCount: 65, annualRevenue: "$8.0M", address: { street: "55 Anvil St", city: "Cleveland", state: "OH", country: "USA" } },
  { id: 12, name: "Verdant Living", domain: "verdantliving.co", stage: "Proposal Sent", isCustomer: false, rep: "Tyler Jones", contactCount: 5, dealCount: 2, createdAt: "2026-05-19", lastActivity: "2026-06-14", industry: "Home Goods", employeeCount: 140, annualRevenue: "$19M", address: { street: "8 Garden Ct", city: "Atlanta", state: "GA", country: "USA" } },
  { id: 13, name: "Bluewave Logistics", domain: "bluewave.com", stage: "Negotiation", isCustomer: false, rep: "Jon Morales", contactCount: 3, dealCount: 3, createdAt: "2026-04-25", lastActivity: "2026-06-19", industry: "Logistics", employeeCount: 410, annualRevenue: "$73M", address: { street: "120 Transit Loop", city: "Memphis", state: "TN", country: "USA" } },
  { id: 14, name: "Stonebridge Supply", domain: "stonebridge.co", stage: "Won", isCustomer: true, rep: "Saul Cabrera", contactCount: 7, dealCount: 4, createdAt: "2026-03-30", lastActivity: "2026-06-15", industry: "Construction", employeeCount: 260, annualRevenue: "$51M", address: { street: "44 Quarry Rd", city: "Phoenix", state: "AZ", country: "USA" } },
  { id: 15, name: "Lumen Electronics", domain: "lumenelec.com", stage: "Contacted", isCustomer: false, rep: "Ryan Walsh", contactCount: 4, dealCount: 1, createdAt: "2026-05-05", lastActivity: "2026-06-09", industry: "Electronics", employeeCount: 175, annualRevenue: "$31M", address: { street: "210 Circuit Ave", city: "San Diego", state: "CA", country: "USA" } },
  { id: 16, name: "Harvest Mills", domain: "harvestmills.com", stage: "Qualified", isCustomer: false, rep: "John Carmichael", contactCount: 2, dealCount: 1, createdAt: "2026-04-18", lastActivity: "2026-06-02", industry: "Food & Beverage", employeeCount: 88, annualRevenue: "$12.5M", address: { street: "5 Mill Pond Rd", city: "Minneapolis", state: "MN", country: "USA" } },
  { id: 17, name: "Crestline Brands", domain: "crestline.co", stage: "New Lead", isCustomer: false, rep: "Tyler Jones", contactCount: 1, dealCount: 0, createdAt: "2026-06-11", lastActivity: "2026-06-20", industry: "Consumer Goods", employeeCount: 52, annualRevenue: "$7.4M", address: { street: "77 Summit Way", city: "Salt Lake City", state: "UT", country: "USA" } },
  { id: 18, name: "Tradewind Partners", domain: "tradewind.com", stage: "Won", isCustomer: true, rep: "Jon Morales", contactCount: 8, dealCount: 5, createdAt: "2026-03-24", lastActivity: "2026-06-18", industry: "Distribution", employeeCount: 300, annualRevenue: "$64M", address: { street: "18 Galleria Blvd", city: "Dallas", state: "TX", country: "USA" } },
];

// ─── SAMPLE DATA: CONTACTS ───
export const contacts = [
  // ABC Corp (companyId 2) — 4 contacts, some WizShop users
  { id: 1, firstName: "Sneha", lastName: "Iyer", email: "sneha@abccorp.com", phone: "+1-312-555-0101", companyId: 2, companyName: "ABC Corp", isWizShopUser: true, wizShopRole: "Admin", stage: "In Progress", jobTitle: "VP Procurement", department: "Procurement", createdAt: "2026-04-03", lastActivity: "2026-06-20" },
  { id: 2, firstName: "Marcus", lastName: "Bell", email: "marcus@abccorp.com", phone: "+1-312-555-0102", companyId: 2, companyName: "ABC Corp", isWizShopUser: true, wizShopRole: "Buyer", stage: "Qualified", jobTitle: "Purchasing Manager", department: "Finance", createdAt: "2026-04-03", lastActivity: "2026-06-18" },
  { id: 3, firstName: "Dana", lastName: "Cole", email: "dana@abccorp.com", phone: "+1-312-555-0103", companyId: 2, companyName: "ABC Corp", isWizShopUser: false, wizShopRole: null, stage: "Open", jobTitle: "Logistics Coordinator", department: "Operations", createdAt: "2026-04-10", lastActivity: "2026-06-14" },
  { id: 4, firstName: "Priya", lastName: "Raman", email: "priya@abccorp.com", phone: "+1-312-555-0104", companyId: 2, companyName: "ABC Corp", isWizShopUser: true, wizShopRole: "Viewer", stage: "Qualified", jobTitle: "Finance Director", department: "Finance", createdAt: "2026-04-10", lastActivity: "2026-06-12" },
  // Pinnacle Distributors (companyId 1) — 3 contacts
  { id: 5, firstName: "Rahul", lastName: "Mehta", email: "rahul@pinnacle.co", phone: "+1-212-555-0201", companyId: 1, companyName: "Pinnacle Distributors", isWizShopUser: true, wizShopRole: "Buyer", stage: "In Progress", jobTitle: "Head of Sourcing", department: "Procurement", createdAt: "2026-05-31", lastActivity: "2026-06-19" },
  { id: 6, firstName: "Lisa", lastName: "Park", email: "lisa@pinnacle.co", phone: "+1-212-555-0202", companyId: 1, companyName: "Pinnacle Distributors", isWizShopUser: false, wizShopRole: null, stage: "New", jobTitle: "Account Executive", department: "Sales", createdAt: "2026-06-01", lastActivity: "2026-06-15" },
  { id: 7, firstName: "Tom", lastName: "Ferrara", email: "tferrara@pinnacle.co", phone: "+1-212-555-0203", companyId: 1, companyName: "Pinnacle Distributors", isWizShopUser: false, wizShopRole: null, stage: "Open", jobTitle: "COO", department: "Executive", createdAt: "2026-05-31", lastActivity: "2026-06-10" },
  // Delta Trading (companyId 5) — 3 contacts
  { id: 8, firstName: "James", lastName: "Okafor", email: "james@deltatrading.io", phone: "+1-206-555-0301", companyId: 5, companyName: "Delta Trading", isWizShopUser: true, wizShopRole: "Admin", stage: "Qualified", jobTitle: "CEO", department: "Executive", createdAt: "2026-04-22", lastActivity: "2026-06-16" },
  { id: 9, firstName: "Claire", lastName: "Hudson", email: "claire@deltatrading.io", phone: "+1-206-555-0302", companyId: 5, companyName: "Delta Trading", isWizShopUser: false, wizShopRole: null, stage: "Open", jobTitle: "Import Analyst", department: "Operations", createdAt: "2026-04-22", lastActivity: "2026-06-08" },
  { id: 10, firstName: "Kevin", lastName: "Tran", email: "kevin@deltatrading.io", phone: "+1-206-555-0303", companyId: 5, companyName: "Delta Trading", isWizShopUser: false, wizShopRole: null, stage: "Unqualified", jobTitle: "Sales Rep", department: "Sales", createdAt: "2026-05-03", lastActivity: "2026-05-29" },
  // Summit Foods (companyId 6)
  { id: 11, firstName: "Maria", lastName: "Dos Santos", email: "maria@summitfoods.com", phone: "+1-503-555-0401", companyId: 6, companyName: "Summit Foods", isWizShopUser: true, wizShopRole: "Buyer", stage: "In Progress", jobTitle: "Category Manager", department: "Procurement", createdAt: "2026-03-29", lastActivity: "2026-06-20" },
  { id: 12, firstName: "Derek", lastName: "Chang", email: "derek@summitfoods.com", phone: "+1-503-555-0402", companyId: 6, companyName: "Summit Foods", isWizShopUser: false, wizShopRole: null, stage: "Qualified", jobTitle: "Supply Chain Lead", department: "Operations", createdAt: "2026-03-30", lastActivity: "2026-06-11" },
  // Bluewave Logistics (companyId 13)
  { id: 13, firstName: "Sandra", lastName: "Reyes", email: "sandra@bluewave.com", phone: "+1-901-555-0501", companyId: 13, companyName: "Bluewave Logistics", isWizShopUser: false, wizShopRole: null, stage: "New", jobTitle: "Procurement Director", department: "Procurement", createdAt: "2026-04-26", lastActivity: "2026-06-19" },
  { id: 14, firstName: "Aaron", lastName: "Kim", email: "aaron@bluewave.com", phone: "+1-901-555-0502", companyId: 13, companyName: "Bluewave Logistics", isWizShopUser: true, wizShopRole: "Viewer", stage: "Open", jobTitle: "Operations Manager", department: "Operations", createdAt: "2026-04-26", lastActivity: "2026-06-13" },
  // Horizon Retail (companyId 3)
  { id: 15, firstName: "Amit", lastName: "Joshi", email: "amit@horizonretail.co", phone: "+1-512-555-0601", companyId: 3, companyName: "Horizon Retail", isWizShopUser: false, wizShopRole: null, stage: "New", jobTitle: "Merchandising Head", department: "Merchandising", createdAt: "2026-06-15", lastActivity: "2026-06-21" },
  // Stonebridge Supply (companyId 14)
  { id: 16, firstName: "Rachel", lastName: "Nguyen", email: "rnguyen@stonebridge.co", phone: "+1-602-555-0701", companyId: 14, companyName: "Stonebridge Supply", isWizShopUser: true, wizShopRole: "Buyer", stage: "Qualified", jobTitle: "Purchasing Coordinator", department: "Procurement", createdAt: "2026-04-01", lastActivity: "2026-06-15" },
  // Lumen Electronics (companyId 15)
  { id: 17, firstName: "Brian", lastName: "Walsh", email: "brian@lumenelec.com", phone: "+1-619-555-0801", companyId: 15, companyName: "Lumen Electronics", isWizShopUser: false, wizShopRole: null, stage: "Unqualified", jobTitle: "Technical Sales", department: "Sales", createdAt: "2026-05-06", lastActivity: "2026-06-09" },
  // Verdant Living (companyId 12)
  { id: 18, firstName: "Olivia", lastName: "Stern", email: "olivia@verdantliving.co", phone: "+1-404-555-0901", companyId: 12, companyName: "Verdant Living", isWizShopUser: false, wizShopRole: null, stage: "In Progress", jobTitle: "Buyer", department: "Merchandising", createdAt: "2026-05-20", lastActivity: "2026-06-14" },
];

// ─── SAMPLE DATA: DEALS ───
export const deals = [
  { id: 1, name: "Spring Collection 2027", amount: "$45,000", stage: "Proposal", company: "Pinnacle Distributors", contact: "Rahul Mehta", owner: "Sneha I.", closeDate: "Jul 15" },
  { id: 2, name: "Bulk Reorder Q3", amount: "$120,000", stage: "Negotiation", company: "ABC Corp", contact: "Sneha Iyer", owner: "Rahul M.", closeDate: "Jun 30" },
];

// ─── SAMPLE DATA: ACTIVITIES ───
export const activities = [
  { type: "system", text: "Stage changed: New → Lead", entity: "Pinnacle Distributors", time: "2h ago" },
  { type: "meeting", text: "Q3 Planning Call — 45 min, Completed", entity: "ABC Corp", time: "Yesterday" },
  { type: "note", text: "Discussed pricing for Fall collection. Follow-up needed on volume discounts.", entity: "Pinnacle Distributors", time: "Jun 16" },
  { type: "task", text: "Send revised proposal — Due Jun 22", entity: "Delta Trading", time: "Jun 15" },
  { type: "system", text: "Company converted to Customer", entity: "ABC Corp", time: "Jun 14" },
  { type: "email", text: "Re: Partnership Agreement — Sent to rahul@pinnacle.co", entity: "Pinnacle Distributors", time: "Jun 13" },
];

// ─── SAMPLE DATA: REPS ───
export const reps = [
  { id: 1, name: "Rahul M." },
  { id: 2, name: "Sneha I." },
  { id: 3, name: "Priya S." },
  { id: 4, name: "Amit J." },
];

// Account-owner roster used across the companies pipeline (matches companies[].rep).
export const repNames = ["John Carmichael", "Tyler Jones", "Jon Morales", "Saul Cabrera", "Ryan Walsh"];

// ─── PROPERTY OPTION LISTS ───
export const industries = ["Technology", "Manufacturing", "Retail", "Healthcare", "Finance", "Food & Beverage", "Other"];
export const leadSources = ["Inbound", "Outbound", "Referral", "WizShop", "Trade Show", "Other"];
export const wizShopRoles = ["Admin", "Buyer", "Viewer"];

// ─── MANDATORY FIELDS ON STAGE MOVEMENT (Kanban gate, Flow 10) ───
// Stage name → fields that must be filled before a record can enter that stage.
// When a card is dropped on one of these stages and any listed field is
// empty/null on the record, the Kanban opens a "Complete Required Fields" sheet.
export const stageMandatoryFields = {
  Qualified: ["industry", "employeeCount"],
  "Proposal Sent": ["annualRevenue", "leadSource"],
  Won: ["isCustomer"], // triggers the Customer gate
};

// Field metadata used to render the missing-field form in the Kanban gate sheet.
// `type` mirrors PropertiesPanel field types: text | number | currency | select | boolean.
export const companyFieldMeta = {
  industry: { label: "Industry", type: "select", options: industries },
  employeeCount: { label: "Employee Count", type: "number" },
  annualRevenue: { label: "Annual Revenue", type: "currency" },
  leadSource: { label: "Lead Source", type: "select", options: leadSources },
  isCustomer: { label: "Is Customer", type: "boolean" },
};

// ─── KAI MERGE-MATCH RECOMMENDATIONS (sample) ───
// Keyed by source company id → ranked merge candidates surfaced by "KAI".
// `targetId` references a companies[] row; `reasons` are shown as match rationale.
export const kaiMergeMatches = {
  1: [
    { targetId: 4, match: 87, reasons: ["Similar name", "Shared contacts", "Same industry"] },
    { targetId: 8, match: 64, reasons: ["Overlapping rep", "Adjacent region"] },
  ],
  3: [
    { targetId: 12, match: 91, reasons: ["Same domain root", "Shared contacts"] },
    { targetId: 17, match: 58, reasons: ["Similar name"] },
  ],
  10: [
    { targetId: 15, match: 82, reasons: ["Same industry", "Similar name"] },
  ],
  // Fallback used for any source without curated matches.
  default: [
    { targetId: 2, match: 76, reasons: ["Shared contacts", "Similar domain"] },
    { targetId: 6, match: 61, reasons: ["Same industry"] },
  ],
};

// Default lead source per company id (companies[] rows don't carry one).
// Used by the merge flow's field-resolution step.
const COMPANY_LEAD_SOURCE = {
  1: "Trade Show", 2: "Referral", 3: "Inbound", 4: "Outbound", 5: "Referral",
  6: "WizShop", 7: "Inbound", 8: "Trade Show", 9: "Outbound", 10: "Inbound",
};

// Flattens a companies[] row into the field set the merge flow resolves.
export function getMergeFields(company) {
  if (!company) return {};
  return {
    name: company.name,
    domain: company.domain,
    industry: company.industry || "",
    employeeCount: company.employeeCount ?? "",
    annualRevenue: company.annualRevenue || "",
    stage: company.stage,
    rep: company.rep || "",
    leadSource: COMPANY_LEAD_SOURCE[company.id] || "",
  };
}

// KAI matches for a source company, resolved to full target rows.
export function getKaiMatches(sourceId) {
  const raw = kaiMergeMatches[sourceId] || kaiMergeMatches.default;
  return raw
    .map((m) => {
      const target = companies.find((c) => c.id === m.targetId);
      return target && target.id !== sourceId ? { ...m, company: target } : null;
    })
    .filter(Boolean);
}

// ─── FULLY-FLESHED COMPANY DETAIL ───
// A complete record with all nested data so the Company Detail Page renders with
// real content. Keyed by company id; `getCompanyDetail(id)` merges this onto the
// matching companies[] row (falling back to a generated detail for other ids).
export const companyDetail = {
  id: 2,
  name: "ABC Corp",
  domain: "abccorp.com",
  industry: "Food & Beverage",
  employeeCount: 320,
  annualRevenue: "$58,000,000",
  stage: "Won",
  isCustomer: true,
  accountOwner: "Tyler Jones",
  leadSource: "Referral",
  billingAddress: { street: "88 Market Ave", city: "Chicago", state: "IL", country: "USA", zip: "60601" },
  shippingAddress: { street: "412 Warehouse Row", city: "Aurora", state: "IL", country: "USA", zip: "60504" },
  payment: { terms: "Net 30", creditLimit: "$250,000" },
  parent: null,
  children: [
    { id: 101, name: "ABC Foods West" },
    { id: 102, name: "ABC Logistics" },
  ],
  contacts: [
    { id: 1, name: "Sneha Iyer", email: "sneha@abccorp.com", role: "Decision Maker", wizshop: true, wizshopStatus: "Active" },
    { id: 2, name: "Marcus Bell", email: "marcus@abccorp.com", role: "Billing", wizshop: true, wizshopStatus: "Active" },
    { id: 3, name: "Dana Cole", email: "dana@abccorp.com", role: "User", wizshop: false, wizshopStatus: "Inactive" },
    { id: 4, name: "Priya Raman", email: "priya@abccorp.com", role: "User", wizshop: true, wizshopStatus: "Inactive" },
  ],
  deals: [
    { id: 1, name: "Bulk Reorder Q3", amount: "$120,000", stage: "Negotiation", owner: "Tyler Jones", closeDate: "2026-06-30" },
    { id: 2, name: "Holiday Catalog 2026", amount: "$78,500", stage: "Proposal Sent", owner: "John Carmichael", closeDate: "2026-08-15" },
    { id: 3, name: "Private Label Expansion", amount: "$210,000", stage: "Qualified", owner: "Tyler Jones", closeDate: "2026-09-30" },
  ],
  orders: [
    { id: "ORD-4821", date: "2026-06-12", amount: "$18,400", status: "Delivered", items: 24 },
    { id: "ORD-4790", date: "2026-05-29", amount: "$9,250", status: "Shipped", items: 12 },
    { id: "ORD-4765", date: "2026-05-14", amount: "$31,900", status: "Delivered", items: 47 },
    { id: "ORD-4733", date: "2026-04-30", amount: "$6,120", status: "Confirmed", items: 8 },
    { id: "ORD-4701", date: "2026-04-18", amount: "$22,750", status: "Delivered", items: 33 },
    { id: "ORD-4688", date: "2026-04-05", amount: "$4,300", status: "Pending", items: 5 },
    { id: "ORD-4650", date: "2026-03-22", amount: "$15,600", status: "Delivered", items: 19 },
  ],
  wizshop: { totalOrders: 142, totalRevenue: "$1,284,500", lastOrderDate: "2026-06-12", avgOrderValue: "$9,046" },
  wizshopActions: [
    { action: "Logged In", detail: "sneha@abccorp.com", time: "2026-06-12 09:14" },
    { action: "Viewed Product", detail: "Organic Trail Mix 12oz", time: "2026-06-12 09:18" },
    { action: "Added to Cart", detail: "24 × Organic Trail Mix 12oz", time: "2026-06-12 09:22" },
    { action: "Placed Order", detail: "ORD-4821 — $18,400", time: "2026-06-12 09:31" },
    { action: "Downloaded Invoice", detail: "INV-4821.pdf", time: "2026-06-12 09:33" },
    { action: "Logged Out", detail: "sneha@abccorp.com", time: "2026-06-12 09:40" },
  ],
  // Unified activity timeline — mixed types (see ActivityTimeline for rendering).
  activities: [
    { id: 1, type: "system", text: "Stage changed from Negotiation to Won", time: "2026-06-20 14:02" },
    { id: 2, type: "note", author: "Tyler Jones", body: "Closed the annual reorder. They want to revisit private-label terms in Q4.", time: "2026-06-20 13:50" },
    { id: 3, type: "email", subject: "Signed agreement attached", direction: "received", snippet: "Hi Tyler — countersigned copy attached. Looking forward to Q3.", time: "2026-06-19 16:20" },
    { id: 4, type: "meeting", title: "Contract review call", attendees: "Sneha Iyer, Marcus Bell, Tyler Jones", outcome: "Completed", time: "2026-06-18 11:00" },
    { id: 5, type: "task", title: "Send countersigned contract", assignee: "Tyler Jones", due: "2026-06-19", status: "Done", time: "2026-06-18 12:30" },
    { id: 6, type: "email", subject: "Re: Pricing for bulk reorder", direction: "sent", snippet: "Attaching the revised tiered pricing sheet for volumes over 500 units.", time: "2026-06-16 10:05" },
    { id: 7, type: "note", author: "John Carmichael", body: "Buyer mentioned a competing quote; we should hold on the 8% discount.", time: "2026-06-15 15:40" },
    { id: 8, type: "meeting", title: "Q3 Planning Call", attendees: "Sneha Iyer, Tyler Jones", outcome: "Completed", time: "2026-06-12 09:30" },
    { id: 9, type: "task", title: "Prepare Q3 forecast deck", assignee: "John Carmichael", due: "2026-06-12", status: "Done", time: "2026-06-10 09:00" },
    { id: 10, type: "system", text: "Rep assigned: Tyler Jones", time: "2026-06-08 08:15" },
    { id: 11, type: "email", subject: "Welcome to WizShop", direction: "sent", snippet: "Your buyer portal access is live. Here's how to place your first order.", time: "2026-06-05 09:00" },
    { id: 12, type: "note", author: "Tyler Jones", body: "Initial discovery: 4 regional warehouses, looking to consolidate ordering.", time: "2026-06-03 14:25" },
    { id: 13, type: "task", title: "Follow up on demo feedback", assignee: "Tyler Jones", due: "2026-06-04", status: "Done", time: "2026-06-02 16:00" },
    { id: 14, type: "system", text: "Stage changed from New Lead to Contacted", time: "2026-06-01 10:30" },
    { id: 15, type: "system", text: "Company created", time: "2026-04-02 08:00" },
  ],
};

// Merge the rich detail onto a companies[] row. For companies other than the
// flagged one, fall back to companyDetail's nested blocks so any row renders.
export function getCompanyDetail(id) {
  const base = companies.find((c) => c.id === id);
  if (id === companyDetail.id) return { ...base, ...companyDetail };
  if (!base) return companyDetail;
  return {
    ...companyDetail, // nested orders/activities/contacts/etc. as sample content
    ...base, // real row fields (name, stage, rep, etc.) win
    accountOwner: base.rep,
    billingAddress: { ...base.address, zip: companyDetail.billingAddress.zip },
    shippingAddress: { ...base.address, zip: companyDetail.shippingAddress.zip },
    leadSource: companyDetail.leadSource,
  };
}

// ─── FULLY-FLESHED CONTACT DETAIL ───
// A complete contact record (Sneha Iyer @ ABC Corp, contact id 1) with nested
// meetings, tasks, activities, deals, and inherited company sales — so the
// Contact Detail Page renders with real content. getContactDetail(id) merges
// this onto the matching contacts[] row, falling back for other ids.
export const contactDetail = {
  id: 1,
  contactOwner: "Tyler Jones",
  leadSource: "Referral",
  wizShopStatus: "Active",
  company: { id: 2, name: "ABC Corp", industry: "Food & Beverage", stage: "Won" },
  // Orders inherited from the associated company (shown under "Via ABC Corp").
  companyOrders: [
    { id: "ORD-4821", date: "2026-06-12", amount: "$18,400", status: "Delivered", items: 24 },
    { id: "ORD-4790", date: "2026-05-29", amount: "$9,250", status: "Shipped", items: 12 },
    { id: "ORD-4765", date: "2026-05-14", amount: "$31,900", status: "Delivered", items: 47 },
    { id: "ORD-4701", date: "2026-04-18", amount: "$22,750", status: "Delivered", items: 33 },
  ],
  deals: [
    { id: 1, name: "Bulk Reorder Q3", amount: "$120,000", stage: "Negotiation", owner: "Tyler Jones", closeDate: "2026-06-30" },
    { id: 3, name: "Private Label Expansion", amount: "$210,000", stage: "Qualified", owner: "Tyler Jones", closeDate: "2026-09-30" },
  ],
  meetings: [
    { id: 1, title: "Q3 Planning Call", date: "2026-06-12", duration: "45 min", outcome: "Completed" },
    { id: 2, title: "Contract review call", date: "2026-06-18", duration: "30 min", outcome: "Completed" },
    { id: 3, title: "Private label kickoff", date: "2026-07-02", duration: "60 min", outcome: "Scheduled" },
  ],
  tasks: [
    { id: 1, title: "Send countersigned contract", due: "2026-06-19", assignee: "Tyler Jones", priority: "High", status: "Done" },
    { id: 2, title: "Share Q3 forecast deck", due: "2026-06-25", assignee: "John Carmichael", priority: "Medium", status: "Open" },
    { id: 3, title: "Follow up on private-label terms", due: "2026-07-05", assignee: "Tyler Jones", priority: "Low", status: "Open" },
  ],
  wizShopActions: [
    { action: "Logged In", detail: "sneha@abccorp.com", time: "2026-06-12 09:14" },
    { action: "Viewed Product", detail: "Organic Trail Mix 12oz", time: "2026-06-12 09:18" },
    { action: "Added to Cart", detail: "24 × Organic Trail Mix 12oz", time: "2026-06-12 09:22" },
    { action: "Placed Order", detail: "ORD-4821 — $18,400", time: "2026-06-12 09:31" },
    { action: "Downloaded Invoice", detail: "INV-4821.pdf", time: "2026-06-12 09:33" },
  ],
  activities: [
    { id: 1, type: "system", text: "Contact stage changed to In Progress", time: "2026-06-20 13:55" },
    { id: 2, type: "note", author: "Tyler Jones", body: "Sneha is the economic buyer — loop her in on all pricing changes.", time: "2026-06-18 11:20" },
    { id: 3, type: "meeting", title: "Contract review call", attendees: "Sneha Iyer, Tyler Jones", outcome: "Completed", time: "2026-06-18 11:00" },
    { id: 4, type: "email", subject: "Re: Pricing for bulk reorder", direction: "received", snippet: "Looks good — let's proceed with the tiered pricing.", time: "2026-06-16 14:05" },
    { id: 5, type: "task", title: "Send countersigned contract", assignee: "Tyler Jones", due: "2026-06-19", status: "Done", time: "2026-06-18 12:30" },
    { id: 6, type: "system", text: "WizShop access granted (Admin)", time: "2026-06-05 09:00" },
    { id: 7, type: "system", text: "Contact created", time: "2026-04-03 08:00" },
  ],
};

// Merge the rich detail onto a contacts[] row. Any contact id renders fully;
// non-flagged ids reuse the sample nested blocks with their own row fields.
export function getContactDetail(id) {
  const base = contacts.find((c) => c.id === id);
  if (!base) return { ...contactDetail, ...contacts[0] };
  const company = companies.find((c) => c.id === base.companyId);
  return {
    ...contactDetail, // nested meetings/tasks/activities/etc. as sample content
    ...base, // real row fields (name, email, stage, isWizShopUser, etc.) win
    contactOwner: contactDetail.contactOwner,
    leadSource: contactDetail.leadSource,
    wizShopStatus: base.isWizShopUser ? "Active" : "Inactive",
    company: company
      ? { id: company.id, name: company.name, industry: company.industry, stage: company.stage }
      : contactDetail.company,
  };
}

// ─── DATE HELPERS ───
// "MMM DD, YYYY" — e.g. "May 30, 2026"
export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// Relative time — e.g. "2 days ago", "1 week ago". Computed against now.
export function formatRelativeTime(iso) {
  if (!iso) return "—";
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const diffMs = Date.now() - then.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (days < 30) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

// ─── FULLY-FLESHED DEAL DETAIL ───
// One rich deal record (id:1) with all nested data for DealDetailPage.
// getDealDetail(id) merges this onto the deals[] row, falling back for other ids.
export const dealDetail = {
  id: 1,
  name: "Bulk Reorder Q3",
  pipeline: "Default Sales Pipeline",
  stage: "Negotiation",
  amount: "$120,000",
  closeDate: "2026-06-30",
  forecastCategory: "Best Case",
  owner: "Tyler Jones",
  createdBy: "Rahul Mehta",
  createdAt: "2026-04-15",
  company: { id: 2, name: "ABC Corp", domain: "abccorp.com", isCustomer: true, industry: "Food & Beverage", stage: "Won" },
  contacts: [
    { id: 1, firstName: "Sneha", lastName: "Iyer", email: "sneha@abccorp.com", role: "Decision Maker", isWizShopUser: true },
    { id: 2, firstName: "Marcus", lastName: "Bell", email: "marcus@abccorp.com", role: "Influencer", isWizShopUser: true },
    { id: 4, firstName: "Priya", lastName: "Raman", email: "priya@abccorp.com", role: "Evaluator", isWizShopUser: false },
  ],
  meetings: [
    { id: 1, title: "Q3 Planning Call", date: "2026-06-12", duration: "45 min", outcome: "Completed" },
    { id: 2, title: "Contract review call", date: "2026-06-18", duration: "30 min", outcome: "Completed" },
    { id: 3, title: "Final terms walkthrough", date: "2026-06-25", duration: "60 min", outcome: "Scheduled" },
  ],
  tasks: [
    { id: 1, title: "Send countersigned contract", due: "2026-06-19", assignee: "Tyler Jones", priority: "High", status: "Done" },
    { id: 2, title: "Confirm volume discount tiers", due: "2026-06-24", assignee: "John Carmichael", priority: "High", status: "Open" },
    { id: 3, title: "Prepare Q3 forecast deck", due: "2026-06-26", assignee: "Tyler Jones", priority: "Medium", status: "Open" },
  ],
  activities: [
    { id: 1, type: "system", text: "Stage moved to Negotiation", time: "2026-06-19 09:00" },
    { id: 2, type: "note", author: "Tyler Jones", body: "Buyer asked for an 8% volume discount on orders over 500 units. Hold for now.", time: "2026-06-18 12:00" },
    { id: 3, type: "meeting", title: "Contract review call", attendees: "Sneha Iyer, Marcus Bell, Tyler Jones", outcome: "Completed", time: "2026-06-18 11:00" },
    { id: 4, type: "email", subject: "Re: Pricing for bulk reorder", direction: "sent", snippet: "Attaching the revised tiered pricing sheet for volumes over 500 units.", time: "2026-06-16 10:05" },
    { id: 5, type: "task", title: "Send countersigned contract", assignee: "Tyler Jones", due: "2026-06-19", status: "Done", time: "2026-06-15 14:00" },
    { id: 6, type: "email", subject: "Bulk reorder proposal", direction: "received", snippet: "Hi Tyler — interested in a Q3 reorder. Can you send updated pricing?", time: "2026-06-10 09:30" },
    { id: 7, type: "meeting", title: "Q3 Planning Call", attendees: "Sneha Iyer, Tyler Jones", outcome: "Completed", time: "2026-06-12 09:30" },
    { id: 8, type: "system", text: "Deal created", time: "2026-04-15 08:00" },
  ],
};

export function getDealDetail(id) {
  const base = deals.find((d) => d.id === id);
  if (id === dealDetail.id) return { ...base, ...dealDetail };
  if (!base) return dealDetail;
  // For other ids, overlay real row fields on top of the rich sample.
  return {
    ...dealDetail,
    ...base,
    pipeline: dealDetail.pipeline,
    forecastCategory: dealDetail.forecastCategory,
    createdBy: dealDetail.createdBy,
    createdAt: dealDetail.createdAt,
  };
}

// ─── COLUMN CONFIGS ───
export const companyColumns = [
  {
    key: "name",
    label: "Name",
    // Clickable name cell — row click opens detail; this just styles it as a link.
    render: (v) => (
      <span className="text-sm font-medium text-gray-900 hover:underline cursor-pointer">{v}</span>
    ),
  },
  { key: "stage", label: "Stage", render: "stage_badge" },
  {
    key: "isCustomer",
    label: "Customer",
    render: (v) =>
      v ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Customer</span>
      ) : (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Company</span>
      ),
  },
  { key: "rep", label: "Rep" },
  { key: "contactCount", label: "Contacts" },
  { key: "dealCount", label: "Deals" },
  { key: "createdAt", label: "Created", render: (v) => formatDate(v) },
  { key: "lastActivity", label: "Last Activity", render: (v) => formatRelativeTime(v) },
];

export const contactColumns = [
  {
    key: "_name",
    label: "Name",
    // Row click (owned by the page) handles navigation — just style as a link.
    render: (_, row) => (
      <span className="text-sm font-medium text-gray-900 hover:underline cursor-pointer">
        {row.firstName} {row.lastName}
      </span>
    ),
  },
  { key: "email", label: "Email", render: (v) => <span className="text-sm text-gray-600">{v}</span> },
  { key: "phone", label: "Phone", render: (v) => <span className="text-sm text-gray-600">{v}</span> },
  {
    key: "companyName",
    label: "Company",
    render: (v) => (
      <span className="text-sm text-indigo-600 hover:underline cursor-pointer">{v}</span>
    ),
  },
  {
    key: "isWizShopUser",
    label: "WizShop",
    render: (v, row) =>
      v ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
          Active · {row.wizShopRole}
        </span>
      ) : (
        <span className="text-xs text-gray-400">—</span>
      ),
  },
  { key: "stage", label: "Stage", render: "stage_badge" },
  { key: "jobTitle", label: "Title", render: (v) => <span className="text-sm text-gray-600">{v}</span> },
  { key: "createdAt", label: "Created", render: (v) => formatDate(v) },
  { key: "lastActivity", label: "Last Activity", render: (v) => formatRelativeTime(v) },
];

export const dealColumns = [
  { key: "name", label: "Deal", render: (v) => <span className="font-medium text-gray-900">{v}</span> },
  { key: "amount", label: "Amount", render: (v) => <span className="font-semibold">{v}</span> },
  { key: "stage", label: "Stage", render: "stage_badge" },
  { key: "company", label: "Company" },
  { key: "contact", label: "Contact" },
  { key: "owner", label: "Owner" },
  { key: "closeDate", label: "Close Date" },
];

// ─── SAMPLE DATA: QUOTES ───
// Demo data for the Quote → Order conversion flow (Customer Gate).
// Only QT-2024-0851 (Pinnacle Distributors, companyId 1) is tied to a
// non-customer company — that's the one that triggers the CustomerGateModal.
// The rest map to customer companies (ABC Corp, Summit Foods, Stonebridge).
export const quotes = [
  { id: 1, quoteNumber: "QT-2024-0847", companyId: 2, companyName: "ABC Corp", amount: "$24,500", status: "Approved", createdAt: "2026-06-12" },
  { id: 2, quoteNumber: "QT-2024-0849", companyId: 6, companyName: "Summit Foods", amount: "$58,200", status: "Sent", createdAt: "2026-06-15" },
  { id: 3, quoteNumber: "QT-2024-0851", companyId: 1, companyName: "Pinnacle Distributors", amount: "$12,800", status: "Approved", createdAt: "2026-06-18" },
  { id: 4, quoteNumber: "QT-2024-0853", companyId: 14, companyName: "Stonebridge Supply", amount: "$41,000", status: "Draft", createdAt: "2026-06-20" },
];

export const quoteColumns = [
  { key: "quoteNumber", label: "Quote #", render: (v) => <span className="font-medium text-gray-900">{v}</span> },
  { key: "companyName", label: "Company" },
  { key: "amount", label: "Amount", render: (v) => <span className="font-semibold">{v}</span> },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" },
];

// Resolve a quote's associated company (for the Customer Gate check).
export function getQuoteCompany(quote) {
  return companies.find((c) => c.id === quote.companyId) || null;
}
