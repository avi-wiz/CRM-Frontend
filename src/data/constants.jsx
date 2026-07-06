import { Building2, Users, Star, DollarSign, Calendar, CheckSquare, Car, Activity, FileText, Globe, Upload, UserPlus, ShoppingCart } from "lucide-react";

// ─── STAGE COLORS (single source of truth) ───
// Mapped to the WizCommerce "Molten" palette (tokens.css). StageBadge consumes
// these as hex + alpha suffix (color+"18"/"30"), so they stay hex literals.
// Semantic intent per stage: early=info, active=warning, mid=secondary,
// late=primary(-light), won=success, lost=error.
export const stageColors = {
  // Company pipeline stages (PRD)
  "New Lead": "#4bbed1",        // info (teal)
  Contacted: "#f5ba20",         // warning (amber)
  Qualified: "#8a2fc8",         // secondary (purple)
  "Proposal Sent": "#ff7e3d",   // primary-light
  Negotiation: "#fd691f",       // primary (molten orange)
  Won: "#0db873",               // success (green)
  Lost: "#f03d3d",              // error (red)
  // Deal stages (legacy — still used by deals sample data)
  Proposal: "#8a2fc8",          // secondary
  "Closed - Won": "#0db873",    // success
  "Closed - Lost": "#f03d3d",   // error
  // Deal pipeline stages (DealsPage bulk actions + Enterprise pipeline)
  Qualification: "#8a2fc8",     // secondary
  "Contract Sent": "#ff7e3d",   // primary-light
  "Closed Won": "#0db873",      // success
  "Closed Lost": "#f03d3d",     // error
  Discovery: "#4bbed1",         // info
  "Technical Review": "#f5ba20",// warning
  Pilot: "#8a2fc8",             // secondary
  Procurement: "#ff7e3d",       // primary-light
  Contract: "#fd691f",          // primary
};

// Company kanban columns, in pipeline order.
export const kanbanStages = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];

// Deal kanban columns, in pipeline order.
export const dealKanbanStages = ["Discovery", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

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
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "meetings", label: "Meetings", icon: Calendar },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "visits", label: "Visits", icon: Car },
  { key: "activities", label: "Activities", icon: Activity },
];

// ─── SAMPLE DATA: COMPANIES ───
// Reps cycle through this roster; ~4 records are customers (isCustomer).
// Dates are ISO strings relative to mid-2026 (createdAt: last 90d, lastActivity: last 30d).
export const companies = [
  { id: 1, name: "Pinnacle Distributors", domain: "pinnacle.co", stage: "Contacted", isCustomer: false, rep: "John Carmichael", source: "Manual", contactCount: 3, dealCount: 2, createdAt: "2026-05-30", lastActivity: "2026-06-19", industry: "Wholesale Distribution", employeeCount: 45, annualRevenue: "$2.4M", address: { street: "123 Commerce St", city: "New York", state: "NY", country: "USA" } },
  { id: 2, name: "ABC Corp", domain: "abccorp.com", stage: "Won", isCustomer: true, rep: "Tyler Jones", source: "Manual", contactCount: 5, dealCount: 4, createdAt: "2026-04-02", lastActivity: "2026-06-20", industry: "Consumer Goods", employeeCount: 320, annualRevenue: "$58M", address: { street: "88 Market Ave", city: "Chicago", state: "IL", country: "USA" } },
  // WizShop signup-form lead: minimal fields, no rep assigned yet, first pipeline stage.
  { id: 3, name: "Horizon Retail", domain: "horizonretail.co", stage: "New Lead", isCustomer: false, rep: null, source: "WizShop — New Customer Form", contactCount: 1, dealCount: 0, createdAt: "2026-06-15", lastActivity: "2026-06-21", industry: "Retail", employeeCount: 120, annualRevenue: "$14M", address: { street: "12 High St", city: "Austin", state: "TX", country: "USA" } },
  { id: 4, name: "Metro Wholesale", domain: "metrowholesale.com", stage: "Qualified", isCustomer: false, rep: "Saul Cabrera", source: "Manual", contactCount: 2, dealCount: 1, createdAt: "2026-05-08", lastActivity: "2026-06-18", industry: "Wholesale Distribution", employeeCount: 78, annualRevenue: "$9.1M", address: { street: "455 Industrial Pkwy", city: "Denver", state: "CO", country: "USA" } },
  { id: 5, name: "Delta Trading", domain: "deltatrading.io", stage: "Negotiation", isCustomer: false, rep: "Ryan Walsh", source: "Manual", contactCount: 4, dealCount: 3, createdAt: "2026-04-21", lastActivity: "2026-06-16", industry: "Import / Export", employeeCount: 56, annualRevenue: "$11.7M", address: { street: "7 Dockside Rd", city: "Seattle", state: "WA", country: "USA" } },
  { id: 6, name: "Summit Foods", domain: "summitfoods.com", stage: "Won", isCustomer: true, rep: "John Carmichael", source: "Manual", contactCount: 6, dealCount: 5, createdAt: "2026-03-28", lastActivity: "2026-06-20", industry: "Food & Beverage", employeeCount: 210, annualRevenue: "$42M", address: { street: "900 Orchard Ln", city: "Portland", state: "OR", country: "USA" } },
  { id: 7, name: "Greenfield Organics", domain: "greenfield.farm", stage: "Proposal Sent", isCustomer: false, rep: "Tyler Jones", source: "Referral", contactCount: 2, dealCount: 2, createdAt: "2026-05-12", lastActivity: "2026-06-12", industry: "Agriculture", employeeCount: 34, annualRevenue: "$5.3M", address: { street: "21 Greenway", city: "Sacramento", state: "CA", country: "USA" } },
  { id: 8, name: "Apex Industrial", domain: "apexind.com", stage: "Contacted", isCustomer: false, rep: "Jon Morales", source: "Manual", contactCount: 3, dealCount: 1, createdAt: "2026-05-25", lastActivity: "2026-06-10", industry: "Manufacturing", employeeCount: 540, annualRevenue: "$96M", address: { street: "1400 Forge Blvd", city: "Pittsburgh", state: "PA", country: "USA" } },
  { id: 9, name: "Coastal Imports", domain: "coastalimports.com", stage: "Qualified", isCustomer: false, rep: "Saul Cabrera", source: "Import — CSV", contactCount: 2, dealCount: 0, createdAt: "2026-04-30", lastActivity: "2026-06-05", industry: "Import / Export", employeeCount: 28, annualRevenue: "$3.8M", address: { street: "63 Harbor Dr", city: "Miami", state: "FL", country: "USA" } },
  // WizShop signup-form lead: minimal fields, no rep assigned yet, first pipeline stage.
  { id: 10, name: "Nimbus Tech Supply", domain: "nimbussupply.io", stage: "New Lead", isCustomer: false, rep: null, source: "WizShop — New Customer Form", contactCount: 1, dealCount: 0, createdAt: "2026-06-08", lastActivity: "2026-06-17", industry: "Technology", employeeCount: 90, annualRevenue: "$22M", address: { street: "300 Cloud Way", city: "San Jose", state: "CA", country: "USA" } },
  { id: 11, name: "Ironclad Hardware", domain: "ironcladhw.com", stage: "Lost", isCustomer: false, rep: "John Carmichael", source: "Manual", contactCount: 2, dealCount: 1, createdAt: "2026-04-10", lastActivity: "2026-05-29", industry: "Hardware", employeeCount: 65, annualRevenue: "$8.0M", address: { street: "55 Anvil St", city: "Cleveland", state: "OH", country: "USA" } },
  { id: 12, name: "Verdant Living", domain: "verdantliving.co", stage: "Proposal Sent", isCustomer: false, rep: "Tyler Jones", source: "Manual", contactCount: 5, dealCount: 2, createdAt: "2026-05-19", lastActivity: "2026-06-14", industry: "Home Goods", employeeCount: 140, annualRevenue: "$19M", address: { street: "8 Garden Ct", city: "Atlanta", state: "GA", country: "USA" } },
  { id: 13, name: "Bluewave Logistics", domain: "bluewave.com", stage: "Negotiation", isCustomer: false, rep: "Jon Morales", source: "Manual", contactCount: 3, dealCount: 3, createdAt: "2026-04-25", lastActivity: "2026-06-19", industry: "Logistics", employeeCount: 410, annualRevenue: "$73M", address: { street: "120 Transit Loop", city: "Memphis", state: "TN", country: "USA" } },
  { id: 14, name: "Stonebridge Supply", domain: "stonebridge.co", stage: "Won", isCustomer: true, rep: "Saul Cabrera", source: "Manual", contactCount: 7, dealCount: 4, createdAt: "2026-03-30", lastActivity: "2026-06-15", industry: "Construction", employeeCount: 260, annualRevenue: "$51M", address: { street: "44 Quarry Rd", city: "Phoenix", state: "AZ", country: "USA" } },
  { id: 15, name: "Lumen Electronics", domain: "lumenelec.com", stage: "Contacted", isCustomer: false, rep: "Ryan Walsh", source: "Manual", contactCount: 4, dealCount: 1, createdAt: "2026-05-05", lastActivity: "2026-06-09", industry: "Electronics", employeeCount: 175, annualRevenue: "$31M", address: { street: "210 Circuit Ave", city: "San Diego", state: "CA", country: "USA" } },
  { id: 16, name: "Harvest Mills", domain: "harvestmills.com", stage: "Qualified", isCustomer: false, rep: "John Carmichael", source: "Import — CSV", contactCount: 2, dealCount: 1, createdAt: "2026-04-18", lastActivity: "2026-06-02", industry: "Food & Beverage", employeeCount: 88, annualRevenue: "$12.5M", address: { street: "5 Mill Pond Rd", city: "Minneapolis", state: "MN", country: "USA" } },
  // WizShop signup-form lead: minimal fields, no rep assigned yet, first pipeline stage.
  { id: 17, name: "Crestline Brands", domain: "crestline.co", stage: "New Lead", isCustomer: false, rep: null, source: "WizShop — New Customer Form", contactCount: 1, dealCount: 0, createdAt: "2026-06-11", lastActivity: "2026-06-20", industry: "Consumer Goods", employeeCount: 52, annualRevenue: "$7.4M", address: { street: "77 Summit Way", city: "Salt Lake City", state: "UT", country: "USA" } },
  { id: 18, name: "Tradewind Partners", domain: "tradewind.com", stage: "Won", isCustomer: true, rep: "Jon Morales", source: "Manual", contactCount: 8, dealCount: 5, createdAt: "2026-03-24", lastActivity: "2026-06-18", industry: "Distribution", employeeCount: 300, annualRevenue: "$64M", address: { street: "18 Galleria Blvd", city: "Dallas", state: "TX", country: "USA" } },
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
// amountRaw is the numeric value used for Kanban column totals.
// isCustomerCompany flags whether the associated company is already a Customer (green dot on card).
export const deals = [
  { id: 1, name: "Spring Collection 2027", amountRaw: 45000, amount: "$45,000", stage: "Proposal", company: "Pinnacle Distributors", isCustomerCompany: false, contact: "Rahul Mehta", owner: "John Carmichael", closeDate: "Jul 15", source: "Inbound", daysInStage: 8 },
  { id: 2, name: "Bulk Reorder Q3", amountRaw: 120000, amount: "$120,000", stage: "Negotiation", company: "ABC Corp", isCustomerCompany: true, contact: "Sneha Iyer", owner: "Tyler Jones", closeDate: "Jun 30", source: "Referral", daysInStage: 14 },
  { id: 3, name: "Enterprise Catalog Access", amountRaw: 88000, amount: "$88,000", stage: "Discovery", company: "Bluewave Logistics", isCustomerCompany: false, contact: "Sandra Reyes", owner: "Jon Morales", closeDate: "Aug 10", source: "Outbound", daysInStage: 3 },
  { id: 4, name: "Fall Apparel Bundle", amountRaw: 34500, amount: "$34,500", stage: "Qualification", company: "Metro Wholesale", isCustomerCompany: false, contact: "—", owner: "Saul Cabrera", closeDate: "Jul 28", source: "Trade Show", daysInStage: 6 },
  { id: 5, name: "Private Label Launch", amountRaw: 210000, amount: "$210,000", stage: "Proposal", company: "Summit Foods", isCustomerCompany: true, contact: "Maria Dos Santos", owner: "John Carmichael", closeDate: "Sep 5", source: "Referral", daysInStage: 11 },
  { id: 6, name: "Distribution Agreement 2027", amountRaw: 175000, amount: "$175,000", stage: "Negotiation", company: "Stonebridge Supply", isCustomerCompany: true, contact: "Rachel Nguyen", owner: "Saul Cabrera", closeDate: "Jun 25", source: "Inbound", daysInStage: 22 },
  { id: 7, name: "Seasonal Promotions Pack", amountRaw: 52000, amount: "$52,000", stage: "Closed Won", company: "Tradewind Partners", isCustomerCompany: true, contact: "—", owner: "Jon Morales", closeDate: "Jun 10", source: "Outbound", daysInStage: 45 },
  { id: 8, name: "Tech Refresh Pilot", amountRaw: 27000, amount: "$27,000", stage: "Closed Lost", company: "Ironclad Hardware", isCustomerCompany: false, contact: "—", owner: "Ryan Walsh", closeDate: "May 30", source: "Manual", daysInStage: 30 },
  { id: 9, name: "Home Goods Expansion", amountRaw: 63000, amount: "$63,000", stage: "Discovery", company: "Verdant Living", isCustomerCompany: false, contact: "Olivia Stern", owner: "Tyler Jones", closeDate: "Aug 20", source: "Inbound", daysInStage: 5 },
  { id: 10, name: "Electronics Supply Deal", amountRaw: 41000, amount: "$41,000", stage: "Qualification", company: "Lumen Electronics", isCustomerCompany: false, contact: "Brian Walsh", owner: "Ryan Walsh", closeDate: "Jul 18", source: "Manual", daysInStage: 9 },
  { id: 11, name: "Organic Range Contract", amountRaw: 95000, amount: "$95,000", stage: "Proposal", company: "Greenfield Organics", isCustomerCompany: false, contact: "—", owner: "Tyler Jones", closeDate: "Aug 1", source: "Referral", daysInStage: 4 },
  { id: 12, name: "Import Clearance Bundle", amountRaw: 58000, amount: "$58,000", stage: "Closed Won", company: "Coastal Imports", isCustomerCompany: false, contact: "—", owner: "Saul Cabrera", closeDate: "Jun 5", source: "Manual", daysInStage: 38 },
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

// Contact pipeline stages (used by the conversion "default contact stage" setting).
export const contactStages = ["New", "Open", "In Progress", "Qualified", "Unqualified"];

// A contact's stage mirrors its associated company's pipeline stage 1:1 — it is
// always derived, never stored independently. Falls back to the first pipeline
// stage when the company can't be resolved.
export function getContactStage(contact) {
  if (!contact) return kanbanStages[0];
  const company =
    companies.find((c) => c.id === contact.companyId) ||
    companies.find((c) => c.name === (contact.companyName || contact.company?.name));
  return company?.stage || kanbanStages[0];
}

// ─── ORG-LEVEL SETTINGS ───
// Mirrors the "Customer Conversion Settings" panel in org-settings-admin.
// `contactMovement` drives how the individual + bulk conversion flows behave.
export const orgSettings = {
  customerConversion: {
    contactMovement: "auto_move_all", // "auto_move_all" | "prompt" | "do_not_move"
    defaultContactStage: null, // null = keep current, or a stage name
    autoCreateWizShopUsers: false,
    defaultWizShopRole: "Buyer",
    sendInviteOnConversion: true,
  },
};

// Account-owner roster used across the companies pipeline (matches companies[].rep).
export const repNames = ["John Carmichael", "Tyler Jones", "Jon Morales", "Saul Cabrera", "Ryan Walsh"];

// ─── PROPERTY OPTION LISTS ───
export const industries = ["Technology", "Manufacturing", "Retail", "Healthcare", "Finance", "Food & Beverage", "Other"];
export const leadSources = ["Inbound", "Outbound", "Referral", "WizShop", "Trade Show", "Other"];
export const wizShopRoles = ["Admin", "Buyer", "Viewer"];
// Reasons captured when a company/deal is moved to a Lost stage.
export const lostReasons = ["Price", "Lost to Competitor", "No Budget", "No Decision", "Timing", "Lost Contact", "Other"];

// ─── MANDATORY FIELDS ON STAGE MOVEMENT (Kanban gate, Flow 10) ───
// Stage name → fields that must be filled before a record can enter that stage.
// When a card is dropped on one of these stages and any listed field is
// empty/null on the record, the Kanban opens a "Complete Required Fields" sheet.
// Each progression stage demands the data a rep would realistically capture
// before a lead can advance. Cumulative by design — later stages also assume
// (but don't re-list) earlier requirements, since a record that skipped ahead
// will still be caught for whatever it's missing.
export const stageMandatoryFields = {
  Contacted: ["leadSource", "phone"],
  Qualified: ["industry", "employeeCount", "rep"],
  "Proposal Sent": ["annualRevenue", "decisionMaker"],
  Negotiation: ["budgetConfirmed", "expectedCloseDate"],
  Won: ["isCustomer"], // also triggers the Customer gate
  Lost: ["lostReason"],
};

// Field metadata used to render the missing-field form in the Kanban gate sheet.
// `type` mirrors PropertiesPanel field types: text | number | currency | select | boolean.
export const companyFieldMeta = {
  name: { label: "Company Name", type: "text" },
  domain: { label: "Domain", type: "text" },
  industry: { label: "Industry", type: "select", options: industries },
  employeeCount: { label: "Employee Count", type: "number" },
  annualRevenue: { label: "Annual Revenue", type: "currency" },
  leadSource: { label: "Lead Source", type: "select", options: leadSources },
  source: { label: "Source", type: "text" },
  isCustomer: { label: "Is Customer", type: "boolean" },
  rep: { label: "Account Owner", type: "select", options: repNames },
  phone: { label: "Phone", type: "text" },
  decisionMaker: { label: "Decision Maker", type: "text" },
  budgetConfirmed: { label: "Budget Confirmed", type: "boolean" },
  expectedCloseDate: { label: "Expected Close Date", type: "text" },
  lostReason: { label: "Lost Reason", type: "select", options: lostReasons },
};

// Record keys that are system/internal — never shown as editable gate fields.
export const companyGateExcludedKeys = ["id", "stage", "contactCount", "dealCount", "createdAt", "lastActivity", "address", "contacts", "deals", "activities", "orders", "quotes", "meetings", "tasks", "visits"];

// ─── MANDATORY FIELDS ON DEAL STAGE MOVEMENT (Deal Kanban gate) ───
export const dealStageMandatoryFields = {
  Qualification: ["owner", "source"],
  Proposal: ["amountRaw", "closeDate", "contact"],
  Negotiation: ["amountRaw", "closeDate", "source", "nextStep"],
  "Closed Won": ["amountRaw", "closeDate", "poNumber"],
  "Closed Lost": ["lostReason", "competitor"],
};

export const dealFieldMeta = {
  name: { label: "Deal Name", type: "text" },
  amountRaw: { label: "Amount", type: "currency" },
  closeDate: { label: "Close Date", type: "text" },
  source: { label: "Source", type: "select", options: leadSources },
  owner: { label: "Deal Owner", type: "select", options: repNames },
  company: { label: "Company", type: "text" },
  contact: { label: "Primary Contact", type: "text" },
  nextStep: { label: "Next Step", type: "text" },
  poNumber: { label: "PO Number", type: "text" },
  lostReason: { label: "Lost Reason", type: "select", options: lostReasons },
  competitor: { label: "Lost To (Competitor)", type: "text" },
};

// Record keys that are system/internal — never shown as editable gate fields.
export const dealGateExcludedKeys = ["id", "stage", "amount", "isCustomerCompany", "daysInStage", "pipeline", "createdAt", "lastActivity", "activities", "contacts"];

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
    {
      id: 1, name: "Sneha Iyer", email: "sneha@abccorp.com", role: "Decision Maker", wizshop: true, wizshopStatus: "Active",
      // Cross-entity activities surfaced in the company timeline when "Show History" is on.
      activities: [
        { id: 1, type: "meeting", title: "Procurement sync", attendees: "Sneha Iyer, Tyler Jones", outcome: "Completed", time: "2026-06-19 10:15", sourceEntity: { type: "contact", id: 1, name: "Sneha Iyer" } },
        { id: 2, type: "email", subject: "Q4 private-label terms", direction: "received", snippet: "Let's lock the volume tiers before the next cycle.", time: "2026-06-17 09:05", sourceEntity: { type: "contact", id: 1, name: "Sneha Iyer" } },
      ],
    },
    {
      id: 2, name: "Marcus Bell", email: "marcus@abccorp.com", role: "Billing", wizshop: true, wizshopStatus: "Active",
      activities: [
        { id: 1, type: "email", subject: "Updated billing contact", direction: "sent", snippet: "Please route all invoices to AP going forward.", time: "2026-06-14 13:40", sourceEntity: { type: "contact", id: 2, name: "Marcus Bell" } },
        { id: 2, type: "meeting", title: "Payment terms review", attendees: "Marcus Bell, John Carmichael", outcome: "Completed", time: "2026-06-11 15:00", sourceEntity: { type: "contact", id: 2, name: "Marcus Bell" } },
      ],
    },
    { id: 3, name: "Dana Cole", email: "dana@abccorp.com", role: "User", wizshop: false, wizshopStatus: "Inactive" },
    { id: 4, name: "Priya Raman", email: "priya@abccorp.com", role: "User", wizshop: true, wizshopStatus: "Inactive" },
  ],
  deals: [
    {
      id: 2, name: "Bulk Reorder Q3", amount: "$120,000", stage: "Negotiation", owner: "Tyler Jones", closeDate: "2026-06-30",
      activities: [
        { id: 1, type: "system", text: "Stage changed from Qualified to Negotiation", time: "2026-06-18 16:10", sourceEntity: { type: "deal", id: 2, name: "Bulk Reorder Q3" } },
        { id: 2, type: "note", author: "Tyler Jones", body: "Buyer pushing for 90-day terms on this reorder — escalating to finance.", time: "2026-06-16 11:25", sourceEntity: { type: "deal", id: 2, name: "Bulk Reorder Q3" } },
      ],
    },
    {
      id: 5, name: "Private Label Launch", amount: "$210,000", stage: "Proposal", owner: "John Carmichael", closeDate: "2026-09-05",
      activities: [
        { id: 1, type: "system", text: "Stage changed from Qualification to Proposal", time: "2026-06-13 09:50", sourceEntity: { type: "deal", id: 5, name: "Private Label Launch" } },
      ],
    },
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
  // Look up real deals for this company from the global deals array so that
  // deal ids match and clicking a deal card navigates to the correct deal.
  const companyDeals = deals.filter((d) => d.company === base.name).map((d) => ({
    id: d.id, name: d.name, amount: d.amount, stage: d.stage,
    owner: d.owner, closeDate: d.closeDate,
  }));
  return {
    ...companyDetail, // nested orders/activities/contacts/etc. as sample content
    ...base, // real row fields (name, stage, rep, etc.) win
    accountOwner: base.rep,
    billingAddress: { ...base.address, zip: companyDetail.billingAddress.zip },
    shippingAddress: { ...base.address, zip: companyDetail.shippingAddress.zip },
    leadSource: companyDetail.leadSource,
    deals: companyDeals.length > 0 ? companyDeals : companyDetail.deals,
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
// One rich deal record (id:2, "Bulk Reorder Q3") with all nested data for DealDetailPage.
// getDealDetail(id) merges this onto the deals[] row, falling back for other ids.
export const dealDetail = {
  id: 2,
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

  // Resolve the company object from the companies array using the deal's company name.
  function resolveCompany(companyName) {
    if (!companyName || typeof companyName !== "string") return null;
    const c = companies.find((co) => co.name === companyName);
    if (!c) return null;
    return { id: c.id, name: c.name, domain: c.domain, isCustomer: c.isCustomer, industry: c.industry, stage: c.stage };
  }

  if (id === dealDetail.id) {
    return { ...base, ...dealDetail };
  }
  if (!base) return dealDetail;
  // For other ids: overlay real row fields, but build a proper company object
  // (base.company is a plain string like "ABC Corp", not a nested object).
  return {
    ...dealDetail,
    ...base,
    company: resolveCompany(base.company),
    pipeline: dealDetail.pipeline,
    forecastCategory: dealDetail.forecastCategory,
    createdBy: dealDetail.createdBy,
    createdAt: dealDetail.createdAt,
  };
}

// ─── SOURCE BADGE ───
// Renders the acquisition source as an icon badge (WizShop / Import / Referral)
// or plain muted text for "Manual". `title` shows the full source on hover.
export function SourceBadge({ source }) {
  if (!source || source === "Manual") {
    return <span className="text-xs text-disabled">Manual</span>;
  }
  if (source.startsWith("WizShop")) {
    return (
      <span
        title={source}
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-warning-bg text-warning-dark border border-warning"
      >
        <Globe size={11} /> WizShop
      </span>
    );
  }
  if (source.startsWith("Import")) {
    return (
      <span
        title={source}
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-info-bg text-info-dark"
      >
        <Upload size={11} /> Import
      </span>
    );
  }
  if (source === "Referral") {
    return (
      <span
        title={source}
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary-bg text-secondary-dark"
      >
        <UserPlus size={11} /> Referral
      </span>
    );
  }
  // Unknown source → show the raw label.
  return <span className="text-xs text-gray-500">{source}</span>;
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
        <span className="text-xs px-2 py-0.5 rounded-full bg-success-bg text-success-dark">Customer</span>
      ) : (
        <span className="text-xs px-2 py-0.5 rounded-full bg-default text-muted">Company</span>
      ),
  },
  { key: "rep", label: "Rep" },
  { key: "source", label: "Source", render: (v) => <SourceBadge source={v} /> },
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
      <span className="text-sm text-primary hover:underline cursor-pointer">{v}</span>
    ),
  },
  {
    key: "isWizShopUser",
    label: "WizShop",
    render: (v, row) =>
      v ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-success-bg text-success-dark">
          Active · {row.wizShopRole}
        </span>
      ) : (
        <span className="text-xs text-disabled">—</span>
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

// ─── SAMPLE DATA: PRODUCTS ───
// Minimal catalog used by the Create Quote line-item search.
export const products = [
  { id: "p1", sku: "WC-1001", name: "Classic Oxford Shirt", category: "Apparel", unitPrice: 45.0 },
  { id: "p2", sku: "WC-1002", name: "Merino Wool Sweater", category: "Apparel", unitPrice: 89.0 },
  { id: "p3", sku: "WC-1003", name: "Tailored Chino Pants", category: "Apparel", unitPrice: 62.0 },
  { id: "p4", sku: "WC-2001", name: "Leather Belt", category: "Accessories", unitPrice: 34.0 },
  { id: "p5", sku: "WC-2002", name: "Canvas Tote Bag", category: "Accessories", unitPrice: 28.0 },
  { id: "p6", sku: "WC-2003", name: "Wool Scarf", category: "Accessories", unitPrice: 22.5 },
  { id: "p7", sku: "WC-3001", name: "Suede Chelsea Boots", category: "Footwear", unitPrice: 148.0 },
  { id: "p8", sku: "WC-3002", name: "Canvas Sneakers", category: "Footwear", unitPrice: 72.0 },
  { id: "p9", sku: "WC-3003", name: "Leather Loafers", category: "Footwear", unitPrice: 115.0 },
  { id: "p10", sku: "WC-4001", name: "Ceramic Dinnerware Set", category: "Home Goods", unitPrice: 96.0 },
  { id: "p11", sku: "WC-4002", name: "Linen Throw Blanket", category: "Home Goods", unitPrice: 54.0 },
  { id: "p12", sku: "WC-4003", name: "Scented Soy Candle", category: "Home Goods", unitPrice: 18.0 },
];

// ─── SAMPLE DATA: MEETINGS ───
// Meetings are a first-class activity type. Mix of past (Completed / Cancelled /
// No-Show) and upcoming (Scheduled). References real companies / contacts / deals.
export const meetings = [
  // ── Past — Completed ──
  {
    id: 1,
    title: "Q3 Planning Review",
    date: "2026-06-04", startTime: "10:00 AM", duration: 60, location: "Zoom",
    attendees: [{ contactId: 1, contactName: "Sneha Iyer", email: "sneha@abccorp.com" }, { contactId: 2, contactName: "Marcus Bell", email: "marcus@abccorp.com" }],
    internalAttendees: [{ repName: "Tyler Jones" }, { repName: "Jon Morales" }],
    outcome: "Completed",
    notes: "Walked through Q3 reorder volumes and the proposed bulk pricing tiers. ABC Corp confirmed they want to lock in the Q3 reorder before end of month. Strong intent to expand into the new apparel line.",
    companyId: 2, companyName: "ABC Corp",
    dealId: 2, dealName: "Bulk Reorder Q3",
    createdBy: "Tyler Jones", createdAt: "2026-05-28",
  },
  {
    id: 2,
    title: "Product Demo — Summer Collection",
    date: "2026-06-09", startTime: "2:30 PM", duration: 45, location: "Google Meet",
    attendees: [{ contactId: 5, contactName: "Rahul Mehta", email: "rahul@pinnacle.co" }],
    internalAttendees: [{ repName: "John Carmichael" }],
    outcome: "Completed",
    notes: "Demoed the Spring/Summer catalog inside WizShop. Rahul was impressed by the bulk-order flow. Follow-up: send the proposal for the Spring Collection deal.",
    companyId: 1, companyName: "Pinnacle Distributors",
    dealId: 1, dealName: "Spring Collection 2027",
    createdBy: "John Carmichael", createdAt: "2026-06-02",
  },
  {
    id: 3,
    title: "Contract Terms Discussion",
    date: "2026-06-11", startTime: "11:00 AM", duration: 90, location: "Office — Room 4B",
    attendees: [{ contactId: 16, contactName: "Rachel Nguyen", email: "rnguyen@stonebridge.co" }],
    internalAttendees: [{ repName: "Saul Cabrera" }],
    outcome: "Completed",
    notes: "Reviewed the distribution agreement redlines. Legal wants a 30-day termination clause. Agreed in principle on volume commitments.",
    companyId: 14, companyName: "Stonebridge Supply",
    dealId: 6, dealName: "Distribution Agreement 2027",
    createdBy: "Saul Cabrera", createdAt: "2026-06-05",
  },
  {
    id: 4,
    title: "Onboarding Kickoff",
    date: "2026-06-13", startTime: "9:00 AM", duration: 30, location: "Zoom",
    attendees: [{ contactId: 11, contactName: "Maria Dos Santos", email: "maria@summitfoods.com" }, { contactId: 12, contactName: "Derek Chang", email: "derek@summitfoods.com" }],
    internalAttendees: [{ repName: "John Carmichael" }],
    outcome: "Completed",
    notes: "Kicked off the Private Label Launch onboarding. Set up shared catalog access and aligned on first shipment timeline.",
    companyId: 6, companyName: "Summit Foods",
    dealId: 5, dealName: "Private Label Launch",
    createdBy: "John Carmichael", createdAt: "2026-06-07",
  },
  {
    id: 5,
    title: "Quarterly Business Review",
    date: "2026-06-16", startTime: "3:00 PM", duration: 60, location: "Client Office",
    attendees: [{ contactId: 8, contactName: "James Okafor", email: "james@deltatrading.io" }],
    internalAttendees: [{ repName: "Ryan Walsh" }, { repName: "Tyler Jones" }],
    outcome: "Completed",
    notes: "Reviewed YTD performance with Delta Trading. They're happy with fulfillment SLAs. Opportunity to upsell the enterprise catalog tier next quarter.",
    companyId: 5, companyName: "Delta Trading",
    dealId: null, dealName: null,
    createdBy: "Ryan Walsh", createdAt: "2026-06-10",
  },

  // ── Past — Cancelled / No-Show ──
  {
    id: 6,
    title: "Pricing Negotiation Follow-up",
    date: "2026-06-12", startTime: "1:00 PM", duration: 45, location: "Zoom",
    attendees: [{ contactId: 13, contactName: "Sandra Reyes", email: "sandra@bluewave.com" }],
    internalAttendees: [{ repName: "Jon Morales" }],
    outcome: "Cancelled",
    notes: "Sandra rescheduled last minute — procurement budget review pushed internal timelines. Re-book for next week.",
    companyId: 13, companyName: "Bluewave Logistics",
    dealId: 3, dealName: "Enterprise Catalog Access",
    createdBy: "Jon Morales", createdAt: "2026-06-06",
  },
  {
    id: 7,
    title: "Intro Call — Lumen Electronics",
    date: "2026-06-08", startTime: "10:30 AM", duration: 30, location: "Google Meet",
    attendees: [{ contactId: 17, contactName: "Brian Walsh", email: "brian@lumenelec.com" }],
    internalAttendees: [{ repName: "Ryan Walsh" }],
    outcome: "No-Show",
    notes: "Prospect did not join the call and has not responded to follow-up email. Will try one more outreach before marking cold.",
    companyId: 15, companyName: "Lumen Electronics",
    dealId: 10, dealName: "Electronics Supply Deal",
    createdBy: "Ryan Walsh", createdAt: "2026-06-03",
  },
  {
    id: 8,
    title: "Renewal Discussion",
    date: "2026-06-15", startTime: "4:00 PM", duration: 30, location: "Office — Room 2A",
    attendees: [{ contactId: 18, contactName: "Olivia Stern", email: "olivia@verdantliving.co" }],
    internalAttendees: [{ repName: "Tyler Jones" }],
    outcome: "Cancelled",
    notes: "Cancelled — key stakeholder out sick. Olivia will propose new dates.",
    companyId: 12, companyName: "Verdant Living",
    dealId: 9, dealName: "Home Goods Expansion",
    createdBy: "Tyler Jones", createdAt: "2026-06-09",
  },

  // ── Upcoming — Scheduled ──
  {
    id: 9,
    title: "Proposal Walkthrough",
    date: "2026-06-24", startTime: "11:00 AM", duration: 45, location: "Zoom",
    attendees: [{ contactId: 1, contactName: "Sneha Iyer", email: "sneha@abccorp.com" }, { contactId: 4, contactName: "Priya Raman", email: "priya@abccorp.com" }],
    internalAttendees: [{ repName: "Tyler Jones" }],
    outcome: "Scheduled",
    notes: "Present the finalized Bulk Reorder Q3 proposal. Priya from finance joining to review payment terms.",
    companyId: 2, companyName: "ABC Corp",
    dealId: 2, dealName: "Bulk Reorder Q3",
    createdBy: "Tyler Jones", createdAt: "2026-06-18",
  },
  {
    id: 10,
    title: "Discovery — Greenfield Organics",
    date: "2026-06-25", startTime: "9:30 AM", duration: 30, location: "Google Meet",
    attendees: [],
    internalAttendees: [{ repName: "Tyler Jones" }],
    outcome: "Scheduled",
    notes: "Initial discovery for the Organic Range Contract. Identify decision makers and timeline.",
    companyId: 7, companyName: "Greenfield Organics",
    dealId: 11, dealName: "Organic Range Contract",
    createdBy: "Tyler Jones", createdAt: "2026-06-19",
  },
  {
    id: 11,
    title: "Negotiation — Spring Collection",
    date: "2026-06-26", startTime: "2:00 PM", duration: 60, location: "Client Office",
    attendees: [{ contactId: 5, contactName: "Rahul Mehta", email: "rahul@pinnacle.co" }, { contactId: 7, contactName: "Tom Ferrara", email: "tferrara@pinnacle.co" }],
    internalAttendees: [{ repName: "John Carmichael" }, { repName: "Saul Cabrera" }],
    outcome: "Scheduled",
    notes: "Final pricing negotiation with Pinnacle. COO Tom Ferrara joining — close target is mid-July.",
    companyId: 1, companyName: "Pinnacle Distributors",
    dealId: 1, dealName: "Spring Collection 2027",
    createdBy: "John Carmichael", createdAt: "2026-06-20",
  },
  {
    id: 12,
    title: "Catalog Demo — Metro Wholesale",
    date: "2026-06-29", startTime: "10:00 AM", duration: 45, location: "Zoom",
    attendees: [],
    internalAttendees: [{ repName: "Saul Cabrera" }],
    outcome: "Scheduled",
    notes: "Walk through the Fall Apparel Bundle catalog and answer fulfillment questions.",
    companyId: 4, companyName: "Metro Wholesale",
    dealId: 4, dealName: "Fall Apparel Bundle",
    createdBy: "Saul Cabrera", createdAt: "2026-06-21",
  },
  {
    id: 13,
    title: "Executive Sync — Tradewind",
    date: "2026-07-02", startTime: "1:30 PM", duration: 30, location: "Office — Room 4B",
    attendees: [],
    internalAttendees: [{ repName: "Jon Morales" }],
    outcome: "Scheduled",
    notes: "Quarterly executive check-in to explore the next phase of the partnership.",
    companyId: 18, companyName: "Tradewind Partners",
    dealId: null, dealName: null,
    createdBy: "Jon Morales", createdAt: "2026-06-20",
  },
  {
    id: 14,
    title: "Implementation Planning",
    date: "2026-07-03", startTime: "11:00 AM", duration: 90, location: "Google Meet",
    attendees: [{ contactId: 11, contactName: "Maria Dos Santos", email: "maria@summitfoods.com" }],
    internalAttendees: [{ repName: "John Carmichael" }, { repName: "Tyler Jones" }],
    outcome: "Scheduled",
    notes: "Plan rollout of the Private Label Launch across Summit Foods' distribution centers.",
    companyId: 6, companyName: "Summit Foods",
    dealId: 5, dealName: "Private Label Launch",
    createdBy: "John Carmichael", createdAt: "2026-06-21",
  },
];

// Outcome badge color map for meetings.
export const meetingOutcomeStyles = {
  Scheduled: "bg-info-bg text-info-dark",
  Completed: "bg-success-bg text-success-dark",
  Cancelled: "bg-default text-muted",
  "No-Show": "bg-danger-bg text-danger-dark",
};

export const meetingOutcomes = ["Scheduled", "Completed", "Cancelled", "No-Show"];

// Format a duration in minutes → "30 min", "1 hr", "1.5 hrs".
export function formatDuration(min) {
  if (!min) return "—";
  if (min < 60) return `${min} min`;
  const hrs = min / 60;
  if (Number.isInteger(hrs)) return `${hrs} hr${hrs === 1 ? "" : "s"}`;
  return `${hrs} hrs`;
}

export function isPastDate(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export function getMeetingCompany(meeting) {
  return companies.find((c) => c.id === meeting.companyId) || null;
}

// ─── SAMPLE DATA: TASKS ───
// Tasks are core CRM activities. One rep owns each task (REP → TASK is 1:M),
// but a task can associate with many contacts/companies/deals and at most one
// originating meeting (TASK → MEETING is M:1). Mix of statuses + due dates
// relative to "today" (2026-06-22).
export const tasks = [
  // ── Open (2 overdue) ──
  {
    id: 1,
    title: "Send revised proposal to ABC Corp",
    description: "Incorporate the new bulk pricing tiers agreed in the Q3 Planning Review and send the updated proposal PDF.",
    dueDate: "2026-06-18", priority: "High", status: "Open",
    assignee: { repName: "Tyler Jones" },
    createdBy: "Tyler Jones", createdAt: "2026-06-12", completedAt: null,
    associations: {
      companyId: 2, companyName: "ABC Corp",
      contactIds: [{ contactId: 1, contactName: "Sneha Iyer" }],
      dealId: 2, dealName: "Bulk Reorder Q3",
      meetingId: 1, meetingTitle: "Q3 Planning Review",
    },
  },
  {
    id: 2,
    title: "Follow up on pricing discussion",
    description: "Bluewave rescheduled the pricing negotiation — re-book and confirm the enterprise catalog tier terms.",
    dueDate: "2026-06-19", priority: "Urgent", status: "Open",
    assignee: { repName: "Jon Morales" },
    createdBy: "Jon Morales", createdAt: "2026-06-12", completedAt: null,
    associations: {
      companyId: 13, companyName: "Bluewave Logistics",
      contactIds: [{ contactId: 13, contactName: "Sandra Reyes" }],
      dealId: 3, dealName: "Enterprise Catalog Access",
      meetingId: 6, meetingTitle: "Pricing Negotiation Follow-up",
    },
  },
  {
    id: 3,
    title: "Prepare demo materials for Summer Collection",
    description: "Assemble the catalog deck and sample line sheets ahead of the Pinnacle negotiation.",
    dueDate: "2026-06-24", priority: "Medium", status: "Open",
    assignee: { repName: "John Carmichael" },
    createdBy: "John Carmichael", createdAt: "2026-06-15", completedAt: null,
    associations: {
      companyId: 1, companyName: "Pinnacle Distributors",
      contactIds: [{ contactId: 5, contactName: "Rahul Mehta" }],
      dealId: 1, dealName: "Spring Collection 2027",
      meetingId: null, meetingTitle: null,
    },
  },
  {
    id: 4,
    title: "Schedule QBR with Delta Trading",
    description: "Coordinate calendars for the next quarterly business review and circulate an agenda.",
    dueDate: "2026-06-26", priority: "Low", status: "Open",
    assignee: { repName: "Ryan Walsh" },
    createdBy: "Ryan Walsh", createdAt: "2026-06-17", completedAt: null,
    associations: {
      companyId: 5, companyName: "Delta Trading",
      contactIds: [{ contactId: 8, contactName: "James Okafor" }],
      dealId: null, dealName: null,
      meetingId: 5, meetingTitle: "Quarterly Business Review",
    },
  },
  {
    id: 5,
    title: "Draft distribution agreement redlines",
    description: "Apply the 30-day termination clause requested by Stonebridge legal and route for internal review.",
    dueDate: "2026-06-30", priority: "High", status: "Open",
    assignee: { repName: "Saul Cabrera" },
    createdBy: "Saul Cabrera", createdAt: "2026-06-16", completedAt: null,
    associations: {
      companyId: 14, companyName: "Stonebridge Supply",
      contactIds: [{ contactId: 16, contactName: "Rachel Nguyen" }],
      dealId: 6, dealName: "Distribution Agreement 2027",
      meetingId: 3, meetingTitle: "Contract Terms Discussion",
    },
  },
  {
    id: 6,
    title: "Qualify Greenfield Organics lead",
    description: "Run discovery questions and identify decision makers before the catalog walkthrough.",
    dueDate: "2026-07-03", priority: "Medium", status: "Open",
    assignee: { repName: "Tyler Jones" },
    createdBy: "Tyler Jones", createdAt: "2026-06-19", completedAt: null,
    associations: {
      companyId: 7, companyName: "Greenfield Organics",
      contactIds: [],
      dealId: 11, dealName: "Organic Range Contract",
      meetingId: 10, meetingTitle: "Discovery — Greenfield Organics",
    },
  },

  // ── In Progress ──
  {
    id: 7,
    title: "Build private label rollout plan",
    description: "Map the Private Label Launch across Summit Foods distribution centers and confirm first shipment timeline.",
    dueDate: "2026-06-25", priority: "High", status: "In Progress",
    assignee: { repName: "John Carmichael" },
    createdBy: "John Carmichael", createdAt: "2026-06-13", completedAt: null,
    associations: {
      companyId: 6, companyName: "Summit Foods",
      contactIds: [{ contactId: 11, contactName: "Maria Dos Santos" }, { contactId: 12, contactName: "Derek Chang" }],
      dealId: 5, dealName: "Private Label Launch",
      meetingId: 4, meetingTitle: "Onboarding Kickoff",
    },
  },
  {
    id: 8,
    title: "Collect W-9 and payment terms from ABC Corp",
    description: "Finance needs the signed W-9 and confirmed Net-30 terms before order conversion.",
    dueDate: "2026-06-23", priority: "Medium", status: "In Progress",
    assignee: { repName: "Tyler Jones" },
    createdBy: "Tyler Jones", createdAt: "2026-06-14", completedAt: null,
    associations: {
      companyId: 2, companyName: "ABC Corp",
      contactIds: [{ contactId: 4, contactName: "Priya Raman" }],
      dealId: 2, dealName: "Bulk Reorder Q3",
      meetingId: null, meetingTitle: null,
    },
  },
  {
    id: 9,
    title: "Configure WizShop catalog for Metro Wholesale",
    description: "Set up the Fall Apparel Bundle catalog and pricing visibility ahead of the demo.",
    dueDate: "2026-06-28", priority: "Low", status: "In Progress",
    assignee: { repName: "Saul Cabrera" },
    createdBy: "Saul Cabrera", createdAt: "2026-06-18", completedAt: null,
    associations: {
      companyId: 4, companyName: "Metro Wholesale",
      contactIds: [],
      dealId: 4, dealName: "Fall Apparel Bundle",
      meetingId: 12, meetingTitle: "Catalog Demo — Metro Wholesale",
    },
  },
  {
    id: 10,
    title: "Re-engage Lumen Electronics after no-show",
    description: "Send a fresh outreach sequence after the missed intro call; mark cold if no response.",
    dueDate: "2026-06-24", priority: "Low", status: "In Progress",
    assignee: { repName: "Ryan Walsh" },
    createdBy: "Ryan Walsh", createdAt: "2026-06-10", completedAt: null,
    associations: {
      companyId: 15, companyName: "Lumen Electronics",
      contactIds: [{ contactId: 17, contactName: "Brian Walsh" }],
      dealId: 10, dealName: "Electronics Supply Deal",
      meetingId: 7, meetingTitle: "Intro Call — Lumen Electronics",
    },
  },

  // ── Completed ──
  {
    id: 11,
    title: "Send Spring Collection proposal to Pinnacle",
    description: "Follow-up from the product demo — proposal delivered with bulk-order pricing.",
    dueDate: "2026-06-11", priority: "High", status: "Completed",
    assignee: { repName: "John Carmichael" },
    createdBy: "John Carmichael", createdAt: "2026-06-02", completedAt: "2026-06-10",
    associations: {
      companyId: 1, companyName: "Pinnacle Distributors",
      contactIds: [{ contactId: 5, contactName: "Rahul Mehta" }],
      dealId: 1, dealName: "Spring Collection 2027",
      meetingId: 2, meetingTitle: "Product Demo — Summer Collection",
    },
  },
  {
    id: 12,
    title: "Set up shared catalog access for Summit Foods",
    description: "Provisioned WizShop access for the onboarding kickoff.",
    dueDate: "2026-06-12", priority: "Medium", status: "Completed",
    assignee: { repName: "John Carmichael" },
    createdBy: "John Carmichael", createdAt: "2026-06-07", completedAt: "2026-06-11",
    associations: {
      companyId: 6, companyName: "Summit Foods",
      contactIds: [{ contactId: 11, contactName: "Maria Dos Santos" }],
      dealId: 5, dealName: "Private Label Launch",
      meetingId: 4, meetingTitle: "Onboarding Kickoff",
    },
  },
  {
    id: 13,
    title: "Confirm fulfillment SLAs with Delta Trading",
    description: "Reviewed YTD SLA performance during the QBR — all green.",
    dueDate: "2026-06-16", priority: "Low", status: "Completed",
    assignee: { repName: "Ryan Walsh" },
    createdBy: "Ryan Walsh", createdAt: "2026-06-10", completedAt: "2026-06-16",
    associations: {
      companyId: 5, companyName: "Delta Trading",
      contactIds: [{ contactId: 8, contactName: "James Okafor" }],
      dealId: null, dealName: null,
      meetingId: 5, meetingTitle: "Quarterly Business Review",
    },
  },
  {
    id: 14,
    title: "Prepare contract terms summary for Stonebridge",
    description: "Summarized volume commitments and termination clause for legal review.",
    dueDate: "2026-06-10", priority: "High", status: "Completed",
    assignee: { repName: "Saul Cabrera" },
    createdBy: "Saul Cabrera", createdAt: "2026-06-05", completedAt: "2026-06-09",
    associations: {
      companyId: 14, companyName: "Stonebridge Supply",
      contactIds: [{ contactId: 16, contactName: "Rachel Nguyen" }],
      dealId: 6, dealName: "Distribution Agreement 2027",
      meetingId: 3, meetingTitle: "Contract Terms Discussion",
    },
  },
  {
    id: 15,
    title: "Log Tradewind executive sync notes",
    description: "Captured key takeaways from the quarterly executive check-in.",
    dueDate: "2026-06-09", priority: "Low", status: "Completed",
    assignee: { repName: "Jon Morales" },
    createdBy: "Jon Morales", createdAt: "2026-06-04", completedAt: "2026-06-08",
    associations: {
      companyId: 18, companyName: "Tradewind Partners",
      contactIds: [],
      dealId: null, dealName: null,
      meetingId: null, meetingTitle: null,
    },
  },

  // ── Cancelled ──
  {
    id: 16,
    title: "Send renewal quote to Verdant Living",
    description: "Cancelled — renewal discussion postponed after the meeting was called off.",
    dueDate: "2026-06-17", priority: "Medium", status: "Cancelled",
    assignee: { repName: "Tyler Jones" },
    createdBy: "Tyler Jones", createdAt: "2026-06-09", completedAt: null,
    associations: {
      companyId: 12, companyName: "Verdant Living",
      contactIds: [{ contactId: 18, contactName: "Olivia Stern" }],
      dealId: 9, dealName: "Home Goods Expansion",
      meetingId: 8, meetingTitle: "Renewal Discussion",
    },
  },
  {
    id: 17,
    title: "Follow up with Ironclad Hardware",
    description: "Cancelled — deal closed lost, no further outreach planned.",
    dueDate: "2026-06-05", priority: "Low", status: "Cancelled",
    assignee: { repName: "Ryan Walsh" },
    createdBy: "Ryan Walsh", createdAt: "2026-05-30", completedAt: null,
    associations: {
      companyId: 11, companyName: "Ironclad Hardware",
      contactIds: [],
      dealId: 8, dealName: "Tech Refresh Pilot",
      meetingId: null, meetingTitle: null,
    },
  },
];

// Status + priority style maps for tasks.
export const taskStatusStyles = {
  Open: "bg-info-bg text-info-dark",
  "In Progress": "bg-warning-bg text-warning-dark",
  Completed: "bg-success-bg text-success-dark",
  Cancelled: "bg-default text-muted",
};

export const taskStatuses = ["Open", "In Progress", "Completed", "Cancelled"];

// Priority → { color, icon } where icon is a lucide-react component name handled
// in the UI. Kept as plain config so it can drive both listing + detail.
export const taskPriorities = [
  { value: "Low", color: "#9ca3af", icon: "ArrowDown" },
  { value: "Medium", color: "#3b82f6", icon: "Minus" },
  { value: "High", color: "#f59e0b", icon: "ArrowUp" },
  { value: "Urgent", color: "#ef4444", icon: "ChevronsUp" },
];

export const taskPriorityStyles = {
  Low: "bg-default text-muted",
  Medium: "bg-info-bg text-info-dark",
  High: "bg-warning-bg text-warning-dark",
  Urgent: "bg-danger-bg text-danger-dark",
};

// True when the due date is strictly before today (date-only comparison).
export function isTaskOverdue(task) {
  if (!task || task.status === "Completed" || task.status === "Cancelled") return false;
  return isPastDate(task.dueDate) && !isToday(task.dueDate);
}

export function isToday(iso) {
  if (!iso) return false;
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export function getTaskCompany(task) {
  return companies.find((c) => c.id === task?.associations?.companyId) || null;
}

// ─── SAMPLE DATA: VISITS ───
// Rep visits logged against companies/contacts. Mix of purposes, outcomes, and
// follow-up states across the last ~60 days relative to "today" (2026-06-22).
export const visits = [
  {
    id: 1,
    visitDate: "2026-06-19", rep: { repName: "Tyler Jones" },
    companyId: 2, companyName: "ABC Corp",
    contactIds: [{ contactId: 1, contactName: "Sneha Iyer" }, { contactId: 2, contactName: "Marcus Bell" }],
    purpose: "Relationship", outcome: "Positive",
    notes: "Stopped by ABC Corp HQ to check in on the Q3 reorder. Sneha is enthusiastic about expanding into the new apparel line and wants pricing locked before month end. Marcus confirmed budget approval is in motion.",
    followUpNeeded: true, followUpDate: "2026-06-26", followUpNotes: "Send finalized bulk pricing sheet and confirm Net-30 terms.",
    duration: 60, location: "Client Office", createdAt: "2026-06-19",
  },
  {
    id: 2,
    visitDate: "2026-06-16", rep: { repName: "John Carmichael" },
    companyId: 1, companyName: "Pinnacle Distributors",
    contactIds: [{ contactId: 5, contactName: "Rahul Mehta" }],
    purpose: "Product Demo", outcome: "Positive",
    notes: "On-site demo of the Spring/Summer catalog at Pinnacle's showroom. Rahul walked the team through the bulk-order flow and was impressed by the WizShop experience.",
    followUpNeeded: true, followUpDate: "2026-06-23", followUpNotes: "Deliver the Spring Collection proposal with negotiated pricing.",
    duration: 90, location: "Showroom", createdAt: "2026-06-16",
  },
  {
    id: 3,
    visitDate: "2026-06-13", rep: { repName: "John Carmichael" },
    companyId: 6, companyName: "Summit Foods",
    contactIds: [{ contactId: 11, contactName: "Maria Dos Santos" }, { contactId: 12, contactName: "Derek Chang" }],
    purpose: "Onboarding", outcome: "Positive",
    notes: "Kicked off the Private Label Launch onboarding at Summit Foods. Set up shared catalog access and aligned on the first shipment timeline. Both stakeholders engaged.",
    followUpNeeded: false, followUpDate: null, followUpNotes: null,
    duration: 120, location: "Client Office", createdAt: "2026-06-13",
  },
  {
    id: 4,
    visitDate: "2026-06-11", rep: { repName: "Saul Cabrera" },
    companyId: 14, companyName: "Stonebridge Supply",
    contactIds: [{ contactId: 16, contactName: "Rachel Nguyen" }],
    purpose: "Sales Call", outcome: "Follow-up Required",
    notes: "Reviewed the distribution agreement at Stonebridge's office. Legal wants a 30-day termination clause added. Agreed in principle on volume commitments but contract not yet signed.",
    followUpNeeded: true, followUpDate: "2026-06-20", followUpNotes: "Route redlined agreement back to their legal team.",
    duration: 90, location: "Client Office", createdAt: "2026-06-11",
  },
  {
    id: 5,
    visitDate: "2026-06-09", rep: { repName: "Ryan Walsh" },
    companyId: 5, companyName: "Delta Trading",
    contactIds: [{ contactId: 8, contactName: "James Okafor" }],
    purpose: "Relationship", outcome: "Positive",
    notes: "Quarterly relationship visit with Delta Trading. James is happy with fulfillment SLAs. Flagged interest in the enterprise catalog tier for next quarter.",
    followUpNeeded: false, followUpDate: null, followUpNotes: null,
    duration: 60, location: "Client Office", createdAt: "2026-06-09",
  },
  {
    id: 6,
    visitDate: "2026-06-05", rep: { repName: "Saul Cabrera" },
    companyId: 4, companyName: "Metro Wholesale",
    contactIds: [],
    purpose: "Sales Call", outcome: "Neutral",
    notes: "Cold visit to Metro Wholesale to gauge interest in the Fall Apparel Bundle. Reception was lukewarm — budget cycle hasn't opened yet. Worth re-engaging in July.",
    followUpNeeded: true, followUpDate: "2026-07-08", followUpNotes: "Re-engage once their Q3 budget opens.",
    duration: 45, location: "Client Office", createdAt: "2026-06-05",
  },
  {
    id: 7,
    visitDate: "2026-05-30", rep: { repName: "Tyler Jones" },
    companyId: 12, companyName: "Verdant Living",
    contactIds: [{ contactId: 18, contactName: "Olivia Stern" }],
    purpose: "Collection Follow-up", outcome: "Follow-up Required",
    notes: "Followed up on the Home Goods Expansion at Verdant Living's showroom. Olivia needs internal sign-off before committing. Renewal discussion postponed.",
    followUpNeeded: true, followUpDate: "2026-06-18", followUpNotes: "Check on internal approval status.",
    duration: 45, location: "Showroom", createdAt: "2026-05-30",
  },
  {
    id: 8,
    visitDate: "2026-05-27", rep: { repName: "Jon Morales" },
    companyId: 13, companyName: "Bluewave Logistics",
    contactIds: [{ contactId: 13, contactName: "Sandra Reyes" }, { contactId: 14, contactName: "Aaron Kim" }],
    purpose: "Product Demo", outcome: "Positive",
    notes: "Demoed the enterprise catalog access at Bluewave's facility. Sandra and Aaron both engaged; operations team sees clear value in self-serve ordering.",
    followUpNeeded: true, followUpDate: "2026-06-24", followUpNotes: "Send pricing for the enterprise catalog tier.",
    duration: 90, location: "Factory", createdAt: "2026-05-27",
  },
  {
    id: 9,
    visitDate: "2026-05-22", rep: { repName: "Ryan Walsh" },
    companyId: 15, companyName: "Lumen Electronics",
    contactIds: [{ contactId: 17, contactName: "Brian Walsh" }],
    purpose: "Sales Call", outcome: "Negative",
    notes: "Visited Lumen Electronics to pitch the supply deal. Brian was non-committal and indicated they're evaluating a competitor. Low probability of progress.",
    followUpNeeded: false, followUpDate: null, followUpNotes: null,
    duration: 30, location: "Client Office", createdAt: "2026-05-22",
  },
  {
    id: 10,
    visitDate: "2026-05-18", rep: { repName: "Jon Morales" },
    companyId: 18, companyName: "Tradewind Partners",
    contactIds: [],
    purpose: "Relationship", outcome: "Positive",
    notes: "Annual partnership visit at Tradewind. Strong relationship — they want to explore the next phase of the agreement. No immediate action needed.",
    followUpNeeded: false, followUpDate: null, followUpNotes: null,
    duration: 60, location: "Client Office", createdAt: "2026-05-18",
  },
  {
    id: 11,
    visitDate: "2026-05-12", rep: { repName: "Saul Cabrera" },
    companyId: 9, companyName: "Coastal Imports",
    contactIds: [],
    purpose: "Support", outcome: "Neutral",
    notes: "Support visit at Coastal Imports to resolve a catalog sync issue. Walked their ops lead through the fix. No outstanding blockers.",
    followUpNeeded: false, followUpDate: null, followUpNotes: null,
    duration: 45, location: "Client Office", createdAt: "2026-05-12",
  },
  {
    id: 12,
    visitDate: "2026-04-29", rep: { repName: "Tyler Jones" },
    companyId: 7, companyName: "Greenfield Organics",
    contactIds: [],
    purpose: "Sales Call", outcome: "Follow-up Required",
    notes: "Intro visit at Greenfield's farm to discuss the Organic Range Contract. Promising fit but they need to identify a procurement decision maker.",
    followUpNeeded: true, followUpDate: "2026-06-25", followUpNotes: "Confirm decision maker and schedule discovery.",
    duration: 60, location: "Trade Show Booth", createdAt: "2026-04-29",
  },
];

export const visitPurposes = ["Sales Call", "Support", "Onboarding", "Relationship", "Product Demo", "Collection Follow-up", "Other"];

export const visitPurposeStyles = {
  "Sales Call": "bg-tonal text-primary-dark",
  Support: "bg-warning-bg text-warning-dark",
  Onboarding: "bg-info-bg text-info-dark",
  Relationship: "bg-secondary-bg text-secondary-dark",
  "Product Demo": "bg-success-bg text-success-dark",
  "Collection Follow-up": "bg-orange-50 text-orange-700",
  Other: "bg-default text-muted",
};

export const visitOutcomes = ["Positive", "Neutral", "Negative", "Follow-up Required"];

export const visitOutcomeStyles = {
  Positive: "bg-success-bg text-success-dark",
  Neutral: "bg-default text-muted",
  Negative: "bg-danger-bg text-danger-dark",
  "Follow-up Required": "bg-warning-bg text-warning-dark",
};

export function getVisitCompany(visit) {
  return companies.find((c) => c.id === visit?.companyId) || null;
}

// ─── SAMPLE DATA: ACTIVITIES AGGREGATE ───
// Unified, de-duplicated feed of the LATEST state of every activity across all
// entities, for the top-level Activities page (PRD 7.4). Each entry carries its
// full change `history` (opened via the "Show History" modal) and the list of
// `associatedEntities` it is cross-visible on. Timestamps relative to today
// (2026-06-22).
export const activitiesAggregate = [
  {
    id: 1, type: "meeting",
    summary: "Meeting with ABC Corp — Q3 Planning Review completed",
    latestUpdate: { timestamp: "2026-06-22T11:35:00Z", action: "Outcome Set", by: "Tyler Jones" },
    entity: { type: "company", id: 2, name: "ABC Corp" },
    associatedEntities: [
      { type: "company", id: 2, name: "ABC Corp" },
      { type: "contact", id: 1, name: "Sneha Iyer" },
      { type: "deal", id: 2, name: "Bulk Reorder Q3" },
    ],
    history: [
      { timestamp: "2026-06-20T14:00:00Z", action: "Created", by: "Tyler Jones", detail: "Meeting scheduled for June 22 with Sneha Iyer and Marcus Bell" },
      { timestamp: "2026-06-22T11:30:00Z", action: "Notes Added", by: "Tyler Jones", detail: "Added meeting summary covering Q3 reorder volumes and pricing tiers" },
      { timestamp: "2026-06-22T11:35:00Z", action: "Outcome Set", by: "Tyler Jones", detail: "Marked as Completed" },
      { timestamp: "2026-06-22T11:40:00Z", action: "Task Created", by: "Tyler Jones", detail: "Follow-up task: Send revised proposal to ABC Corp" },
    ],
  },
  {
    id: 2, type: "task",
    summary: "Task: Send revised proposal to ABC Corp — in progress",
    latestUpdate: { timestamp: "2026-06-21T16:10:00Z", action: "Updated", by: "Tyler Jones" },
    entity: { type: "company", id: 2, name: "ABC Corp" },
    associatedEntities: [
      { type: "company", id: 2, name: "ABC Corp" },
      { type: "contact", id: 1, name: "Sneha Iyer" },
      { type: "deal", id: 2, name: "Bulk Reorder Q3" },
    ],
    history: [
      { timestamp: "2026-06-20T11:42:00Z", action: "Created", by: "Tyler Jones", detail: "Follow-up from Q3 Planning Review, due June 18" },
      { timestamp: "2026-06-21T16:10:00Z", action: "Updated", by: "Tyler Jones", detail: "Priority raised to High" },
    ],
  },
  {
    id: 3, type: "stage_change",
    summary: "Stage changed: Negotiation → Won — ABC Corp",
    latestUpdate: { timestamp: "2026-06-20T14:02:00Z", action: "Stage Changed", by: "System" },
    entity: { type: "company", id: 2, name: "ABC Corp" },
    associatedEntities: [{ type: "company", id: 2, name: "ABC Corp" }],
    history: [
      { timestamp: "2026-06-18T16:10:00Z", action: "Stage Changed", by: "Tyler Jones", detail: "Qualified → Negotiation" },
      { timestamp: "2026-06-20T14:02:00Z", action: "Stage Changed", by: "System", detail: "Negotiation → Won (all deal criteria met)" },
    ],
  },
  {
    id: 4, type: "visit",
    summary: "Visit to ABC Corp — Relationship check-in, follow-up required",
    latestUpdate: { timestamp: "2026-06-19T15:00:00Z", action: "Created", by: "Tyler Jones" },
    entity: { type: "company", id: 2, name: "ABC Corp" },
    associatedEntities: [
      { type: "company", id: 2, name: "ABC Corp" },
      { type: "contact", id: 1, name: "Sneha Iyer" },
      { type: "contact", id: 2, name: "Marcus Bell" },
    ],
    history: [
      { timestamp: "2026-06-19T15:00:00Z", action: "Created", by: "Tyler Jones", detail: "On-site relationship visit, 60 min" },
      { timestamp: "2026-06-19T15:30:00Z", action: "Note Added", by: "Tyler Jones", detail: "Sneha keen to expand into new apparel line" },
      { timestamp: "2026-06-19T15:32:00Z", action: "Follow-up Set", by: "Tyler Jones", detail: "Follow-up scheduled for June 26" },
    ],
  },
  {
    id: 5, type: "email",
    summary: "Email received: Signed agreement attached — Sneha Iyer",
    latestUpdate: { timestamp: "2026-06-19T16:20:00Z", action: "Created", by: "System" },
    entity: { type: "contact", id: 1, name: "Sneha Iyer" },
    associatedEntities: [
      { type: "contact", id: 1, name: "Sneha Iyer" },
      { type: "company", id: 2, name: "ABC Corp" },
      { type: "deal", id: 2, name: "Bulk Reorder Q3" },
    ],
    history: [
      { timestamp: "2026-06-19T16:20:00Z", action: "Created", by: "System", detail: "Inbound email logged from sneha@abccorp.com" },
    ],
  },
  {
    id: 6, type: "meeting",
    summary: "Meeting with Pinnacle Distributors — Product Demo completed",
    latestUpdate: { timestamp: "2026-06-16T15:15:00Z", action: "Outcome Set", by: "John Carmichael" },
    entity: { type: "company", id: 1, name: "Pinnacle Distributors" },
    associatedEntities: [
      { type: "company", id: 1, name: "Pinnacle Distributors" },
      { type: "contact", id: 5, name: "Rahul Mehta" },
      { type: "deal", id: 1, name: "Spring Collection 2027" },
    ],
    history: [
      { timestamp: "2026-06-09T13:00:00Z", action: "Created", by: "John Carmichael", detail: "Demo scheduled at Pinnacle showroom" },
      { timestamp: "2026-06-16T15:00:00Z", action: "Notes Added", by: "John Carmichael", detail: "Rahul impressed by the bulk-order flow" },
      { timestamp: "2026-06-16T15:15:00Z", action: "Outcome Set", by: "John Carmichael", detail: "Marked as Completed" },
    ],
  },
  {
    id: 7, type: "quote",
    summary: "Quote QT-2026-0003 sent to Pinnacle Distributors",
    latestUpdate: { timestamp: "2026-06-17T10:00:00Z", action: "Updated", by: "John Carmichael" },
    entity: { type: "company", id: 1, name: "Pinnacle Distributors" },
    associatedEntities: [
      { type: "company", id: 1, name: "Pinnacle Distributors" },
      { type: "deal", id: 1, name: "Spring Collection 2027" },
    ],
    history: [
      { timestamp: "2026-06-15T09:30:00Z", action: "Created", by: "John Carmichael", detail: "Draft created for Spring Collection" },
      { timestamp: "2026-06-17T10:00:00Z", action: "Updated", by: "John Carmichael", detail: "Status changed Draft → Sent" },
    ],
  },
  {
    id: 8, type: "task",
    summary: "Task: Follow up on pricing discussion — overdue",
    latestUpdate: { timestamp: "2026-06-12T09:00:00Z", action: "Created", by: "Jon Morales" },
    entity: { type: "company", id: 13, name: "Bluewave Logistics" },
    associatedEntities: [
      { type: "company", id: 13, name: "Bluewave Logistics" },
      { type: "contact", id: 13, name: "Sandra Reyes" },
      { type: "deal", id: 3, name: "Enterprise Catalog Access" },
    ],
    history: [
      { timestamp: "2026-06-12T09:00:00Z", action: "Created", by: "Jon Morales", detail: "Re-book pricing negotiation, due June 19" },
    ],
  },
  {
    id: 9, type: "visit",
    summary: "Visit to Bluewave Logistics — Product Demo, positive",
    latestUpdate: { timestamp: "2026-05-27T14:30:00Z", action: "Note Added", by: "Jon Morales" },
    entity: { type: "company", id: 13, name: "Bluewave Logistics" },
    associatedEntities: [
      { type: "company", id: 13, name: "Bluewave Logistics" },
      { type: "contact", id: 13, name: "Sandra Reyes" },
      { type: "contact", id: 14, name: "Aaron Kim" },
    ],
    history: [
      { timestamp: "2026-05-27T13:00:00Z", action: "Created", by: "Jon Morales", detail: "On-site demo at facility" },
      { timestamp: "2026-05-27T14:30:00Z", action: "Note Added", by: "Jon Morales", detail: "Ops team sees value in self-serve ordering" },
    ],
  },
  {
    id: 10, type: "conversion",
    summary: "Lead converted to Customer — Summit Foods",
    latestUpdate: { timestamp: "2026-06-13T10:00:00Z", action: "Completed", by: "John Carmichael" },
    entity: { type: "company", id: 6, name: "Summit Foods" },
    associatedEntities: [
      { type: "company", id: 6, name: "Summit Foods" },
      { type: "deal", id: 5, name: "Private Label Launch" },
    ],
    history: [
      { timestamp: "2026-06-13T09:55:00Z", action: "Stage Changed", by: "John Carmichael", detail: "Proposal → Won" },
      { timestamp: "2026-06-13T10:00:00Z", action: "Completed", by: "John Carmichael", detail: "Company flagged as Customer (is_customer = true)" },
    ],
  },
  {
    id: 11, type: "meeting",
    summary: "Onboarding Kickoff with Summit Foods — completed",
    latestUpdate: { timestamp: "2026-06-13T09:30:00Z", action: "Outcome Set", by: "John Carmichael" },
    entity: { type: "company", id: 6, name: "Summit Foods" },
    associatedEntities: [
      { type: "company", id: 6, name: "Summit Foods" },
      { type: "contact", id: 11, name: "Maria Dos Santos" },
      { type: "deal", id: 5, name: "Private Label Launch" },
    ],
    history: [
      { timestamp: "2026-06-07T09:00:00Z", action: "Created", by: "John Carmichael", detail: "Kickoff scheduled" },
      { timestamp: "2026-06-13T09:30:00Z", action: "Outcome Set", by: "John Carmichael", detail: "Marked as Completed; catalog access provisioned" },
    ],
  },
  {
    id: 12, type: "note",
    summary: "Note on Delta Trading — happy with fulfillment SLAs",
    latestUpdate: { timestamp: "2026-06-09T16:05:00Z", action: "Note Added", by: "Ryan Walsh" },
    entity: { type: "company", id: 5, name: "Delta Trading" },
    associatedEntities: [
      { type: "company", id: 5, name: "Delta Trading" },
      { type: "contact", id: 8, name: "James Okafor" },
    ],
    history: [
      { timestamp: "2026-06-09T16:05:00Z", action: "Note Added", by: "Ryan Walsh", detail: "Opportunity to upsell enterprise catalog tier next quarter" },
    ],
  },
  {
    id: 13, type: "order",
    summary: "Order ORD-4821 placed by ABC Corp — $18,400",
    latestUpdate: { timestamp: "2026-06-12T09:31:00Z", action: "Created", by: "System" },
    entity: { type: "company", id: 2, name: "ABC Corp" },
    associatedEntities: [
      { type: "company", id: 2, name: "ABC Corp" },
      { type: "contact", id: 1, name: "Sneha Iyer" },
    ],
    history: [
      { timestamp: "2026-06-12T09:31:00Z", action: "Created", by: "System", detail: "Order placed via WizShop — 24 items, $18,400" },
    ],
  },
  {
    id: 14, type: "wizshop_event",
    summary: "WizShop access granted to Sneha Iyer (Admin)",
    latestUpdate: { timestamp: "2026-06-05T09:00:00Z", action: "Created", by: "Tyler Jones" },
    entity: { type: "contact", id: 1, name: "Sneha Iyer" },
    associatedEntities: [
      { type: "contact", id: 1, name: "Sneha Iyer" },
      { type: "company", id: 2, name: "ABC Corp" },
    ],
    history: [
      { timestamp: "2026-06-05T09:00:00Z", action: "Created", by: "Tyler Jones", detail: "Admin role granted; invite email sent" },
    ],
  },
  {
    id: 15, type: "task",
    summary: "Task: Draft distribution agreement redlines — open",
    latestUpdate: { timestamp: "2026-06-16T12:00:00Z", action: "Created", by: "Saul Cabrera" },
    entity: { type: "deal", id: 6, name: "Distribution Agreement 2027" },
    associatedEntities: [
      { type: "deal", id: 6, name: "Distribution Agreement 2027" },
      { type: "company", id: 14, name: "Stonebridge Supply" },
      { type: "contact", id: 16, name: "Rachel Nguyen" },
    ],
    history: [
      { timestamp: "2026-06-16T12:00:00Z", action: "Created", by: "Saul Cabrera", detail: "Apply 30-day termination clause requested by legal" },
    ],
  },
  {
    id: 16, type: "meeting",
    summary: "Contract Terms Discussion with Stonebridge Supply — completed",
    latestUpdate: { timestamp: "2026-06-11T12:30:00Z", action: "Outcome Set", by: "Saul Cabrera" },
    entity: { type: "company", id: 14, name: "Stonebridge Supply" },
    associatedEntities: [
      { type: "company", id: 14, name: "Stonebridge Supply" },
      { type: "contact", id: 16, name: "Rachel Nguyen" },
      { type: "deal", id: 6, name: "Distribution Agreement 2027" },
    ],
    history: [
      { timestamp: "2026-06-05T11:00:00Z", action: "Created", by: "Saul Cabrera", detail: "Scheduled at client office" },
      { timestamp: "2026-06-11T12:30:00Z", action: "Outcome Set", by: "Saul Cabrera", detail: "Marked Completed; legal wants 30-day termination clause" },
    ],
  },
  {
    id: 17, type: "email",
    summary: "Email sent: Revised tiered pricing sheet — to Sneha Iyer",
    latestUpdate: { timestamp: "2026-06-16T10:05:00Z", action: "Created", by: "Tyler Jones" },
    entity: { type: "deal", id: 2, name: "Bulk Reorder Q3" },
    associatedEntities: [
      { type: "deal", id: 2, name: "Bulk Reorder Q3" },
      { type: "company", id: 2, name: "ABC Corp" },
      { type: "contact", id: 1, name: "Sneha Iyer" },
    ],
    history: [
      { timestamp: "2026-06-16T10:05:00Z", action: "Created", by: "Tyler Jones", detail: "Outbound email with pricing for volumes over 500 units" },
    ],
  },
  {
    id: 18, type: "visit",
    summary: "Visit to Lumen Electronics — Sales Call, negative",
    latestUpdate: { timestamp: "2026-05-22T11:00:00Z", action: "Note Added", by: "Ryan Walsh" },
    entity: { type: "company", id: 15, name: "Lumen Electronics" },
    associatedEntities: [
      { type: "company", id: 15, name: "Lumen Electronics" },
      { type: "contact", id: 17, name: "Brian Walsh" },
    ],
    history: [
      { timestamp: "2026-05-22T10:30:00Z", action: "Created", by: "Ryan Walsh", detail: "Pitched supply deal" },
      { timestamp: "2026-05-22T11:00:00Z", action: "Note Added", by: "Ryan Walsh", detail: "Evaluating a competitor; low probability" },
    ],
  },
  {
    id: 19, type: "stage_change",
    summary: "Stage changed: Discovery → Proposal — Greenfield Organics",
    latestUpdate: { timestamp: "2026-06-19T10:00:00Z", action: "Stage Changed", by: "Tyler Jones" },
    entity: { type: "deal", id: 11, name: "Organic Range Contract" },
    associatedEntities: [
      { type: "deal", id: 11, name: "Organic Range Contract" },
      { type: "company", id: 7, name: "Greenfield Organics" },
    ],
    history: [
      { timestamp: "2026-06-19T10:00:00Z", action: "Stage Changed", by: "Tyler Jones", detail: "Discovery → Proposal" },
    ],
  },
  {
    id: 20, type: "merge",
    summary: "Duplicate contact merged — Coastal Imports",
    latestUpdate: { timestamp: "2026-05-12T14:00:00Z", action: "Completed", by: "Saul Cabrera" },
    entity: { type: "company", id: 9, name: "Coastal Imports" },
    associatedEntities: [{ type: "company", id: 9, name: "Coastal Imports" }],
    history: [
      { timestamp: "2026-05-12T14:00:00Z", action: "Completed", by: "Saul Cabrera", detail: "Merged duplicate contact records into primary" },
    ],
  },
  {
    id: 21, type: "task",
    summary: "Task: Build private label rollout plan — in progress",
    latestUpdate: { timestamp: "2026-06-13T11:00:00Z", action: "Updated", by: "John Carmichael" },
    entity: { type: "deal", id: 5, name: "Private Label Launch" },
    associatedEntities: [
      { type: "deal", id: 5, name: "Private Label Launch" },
      { type: "company", id: 6, name: "Summit Foods" },
      { type: "contact", id: 11, name: "Maria Dos Santos" },
    ],
    history: [
      { timestamp: "2026-06-13T11:00:00Z", action: "Created", by: "John Carmichael", detail: "Map rollout across distribution centers" },
    ],
  },
  {
    id: 22, type: "note",
    summary: "Note on Tradewind Partners — explore next partnership phase",
    latestUpdate: { timestamp: "2026-05-18T13:00:00Z", action: "Note Added", by: "Jon Morales" },
    entity: { type: "company", id: 18, name: "Tradewind Partners" },
    associatedEntities: [{ type: "company", id: 18, name: "Tradewind Partners" }],
    history: [
      { timestamp: "2026-05-18T13:00:00Z", action: "Note Added", by: "Jon Morales", detail: "Annual partnership visit — strong relationship" },
    ],
  },
  {
    id: 23, type: "quote",
    summary: "Quote QT-2026-0008 accepted — ABC Corp",
    latestUpdate: { timestamp: "2026-06-18T15:20:00Z", action: "Updated", by: "Tyler Jones" },
    entity: { type: "company", id: 2, name: "ABC Corp" },
    associatedEntities: [
      { type: "company", id: 2, name: "ABC Corp" },
      { type: "deal", id: 2, name: "Bulk Reorder Q3" },
    ],
    history: [
      { timestamp: "2026-06-14T11:00:00Z", action: "Created", by: "Tyler Jones", detail: "Quote drafted" },
      { timestamp: "2026-06-16T09:00:00Z", action: "Updated", by: "Tyler Jones", detail: "Status Draft → Sent" },
      { timestamp: "2026-06-18T15:20:00Z", action: "Updated", by: "Tyler Jones", detail: "Status Sent → Accepted" },
    ],
  },
  {
    id: 24, type: "wizshop_event",
    summary: "WizShop order surge — Summit Foods placed 3 orders this week",
    latestUpdate: { timestamp: "2026-06-20T08:00:00Z", action: "Created", by: "System" },
    entity: { type: "company", id: 6, name: "Summit Foods" },
    associatedEntities: [{ type: "company", id: 6, name: "Summit Foods" }],
    history: [
      { timestamp: "2026-06-20T08:00:00Z", action: "Created", by: "System", detail: "3 orders totaling $46,200 placed via WizShop" },
    ],
  },
  {
    id: 25, type: "email",
    summary: "Email received: Bulk reorder proposal request — Rahul Mehta",
    latestUpdate: { timestamp: "2026-06-10T09:30:00Z", action: "Created", by: "System" },
    entity: { type: "contact", id: 5, name: "Rahul Mehta" },
    associatedEntities: [
      { type: "contact", id: 5, name: "Rahul Mehta" },
      { type: "company", id: 1, name: "Pinnacle Distributors" },
      { type: "deal", id: 1, name: "Spring Collection 2027" },
    ],
    history: [
      { timestamp: "2026-06-10T09:30:00Z", action: "Created", by: "System", detail: "Inbound email requesting updated Q3 pricing" },
    ],
  },
];

// Filter-pill config + per-type styling for the Activities aggregate page.
export const activityTypeMeta = {
  note: { label: "Note", iconBg: "bg-info-bg", iconColor: "text-info-dark" },
  email: { label: "Email", iconBg: "bg-warning-bg", iconColor: "text-warning-dark" },
  meeting: { label: "Meeting", iconBg: "bg-secondary-bg", iconColor: "text-secondary-dark" },
  task: { label: "Task", iconBg: "bg-success-bg", iconColor: "text-success-dark" },
  visit: { label: "Visit", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  stage_change: { label: "Stage Change", iconBg: "bg-gray-200", iconColor: "text-gray-500" },
  conversion: { label: "Conversion", iconBg: "bg-gray-200", iconColor: "text-gray-500" },
  merge: { label: "Merge", iconBg: "bg-gray-200", iconColor: "text-gray-500" },
  quote: { label: "Quote", iconBg: "bg-tonal", iconColor: "text-primary-dark" },
  order: { label: "Order", iconBg: "bg-gray-200", iconColor: "text-gray-500" },
  wizshop_event: { label: "WizShop Event", iconBg: "bg-gray-200", iconColor: "text-gray-500" },
};

// Action badge colors for the Show History modal.
export const historyActionStyles = {
  Created: "bg-info-bg text-info-dark",
  Updated: "bg-warning-bg text-warning-dark",
  Completed: "bg-success-bg text-success-dark",
  Cancelled: "bg-default text-muted",
  "Stage Changed": "bg-secondary-bg text-secondary-dark",
  "Note Added": "bg-info-bg text-info-dark",
  "Notes Added": "bg-info-bg text-info-dark",
  "Outcome Set": "bg-success-bg text-success-dark",
  "Follow-up Set": "bg-orange-50 text-orange-700",
  "Task Created": "bg-success-bg text-success-dark",
};

// ─── SAMPLE DATA: QUOTES ───
// Demo data for the Quotes tab + Quote → Order conversion flow (Customer Gate).
// Quotes 1, 5, 8 are tied to ABC Corp (companyId 2) — the detailed company from Flow 1-C.
// Quote 3 (Pinnacle Distributors, companyId 1) is on a NON-customer company —
// that's the one that triggers the CustomerGateModal in Flow 10.
export const quotes = [
  {
    id: 1, quoteNumber: "QT-2026-0001", companyId: 2, companyName: "ABC Corp", isCustomerCompany: true,
    contactId: 1, contactName: "Sneha Iyer", dealId: 2, dealName: "Bulk Reorder Q3",
    items: [
      { sku: "WC-1001", productName: "Classic Oxford Shirt", quantity: 120, unitPrice: 45.0, total: 5400.0 },
      { sku: "WC-1002", productName: "Merino Wool Sweater", quantity: 80, unitPrice: 89.0, total: 7120.0 },
      { sku: "WC-2001", productName: "Leather Belt", quantity: 150, unitPrice: 34.0, total: 5100.0 },
    ],
    subtotal: 17620.0, tax: 1409.6, discount: 1000.0, grandTotal: 18029.6,
    status: "Accepted", validUntil: "2026-07-15", createdAt: "2026-06-12", createdBy: "Tyler Jones",
    notes: "Volume pricing applied for Q3 reorder.",
  },
  {
    id: 2, quoteNumber: "QT-2026-0002", companyId: 6, companyName: "Summit Foods", isCustomerCompany: true,
    contactId: 11, contactName: "Maria Dos Santos", dealId: 5, dealName: "Private Label Launch",
    items: [
      { sku: "WC-4001", productName: "Ceramic Dinnerware Set", quantity: 200, unitPrice: 96.0, total: 19200.0 },
      { sku: "WC-4002", productName: "Linen Throw Blanket", quantity: 300, unitPrice: 54.0, total: 16200.0 },
    ],
    subtotal: 35400.0, tax: 2832.0, discount: 2000.0, grandTotal: 36232.0,
    status: "Sent", validUntil: "2026-08-05", createdAt: "2026-06-15", createdBy: "John Carmichael",
    notes: "",
  },
  {
    id: 3, quoteNumber: "QT-2026-0003", companyId: 1, companyName: "Pinnacle Distributors", isCustomerCompany: false,
    contactId: 5, contactName: "Rahul Mehta", dealId: 1, dealName: "Spring Collection 2027",
    items: [
      { sku: "WC-1003", productName: "Tailored Chino Pants", quantity: 100, unitPrice: 62.0, total: 6200.0 },
      { sku: "WC-3002", productName: "Canvas Sneakers", quantity: 90, unitPrice: 72.0, total: 6480.0 },
    ],
    subtotal: 12680.0, tax: 1014.4, discount: 0, grandTotal: 13694.4,
    status: "Viewed", validUntil: "2026-07-28", createdAt: "2026-06-18", createdBy: "John Carmichael",
    notes: "Awaiting buyer feedback on sneaker sizing.",
  },
  {
    id: 4, quoteNumber: "QT-2026-0004", companyId: 14, companyName: "Stonebridge Supply", isCustomerCompany: true,
    contactId: 16, contactName: "Rachel Nguyen", dealId: 6, dealName: "Distribution Agreement 2027",
    items: [
      { sku: "WC-3001", productName: "Suede Chelsea Boots", quantity: 60, unitPrice: 148.0, total: 8880.0 },
      { sku: "WC-3003", productName: "Leather Loafers", quantity: 50, unitPrice: 115.0, total: 5750.0 },
      { sku: "WC-2003", productName: "Wool Scarf", quantity: 120, unitPrice: 22.5, total: 2700.0 },
    ],
    subtotal: 17330.0, tax: 1386.4, discount: 500.0, grandTotal: 18216.4,
    status: "Draft", validUntil: "2026-08-20", createdAt: "2026-06-20", createdBy: "Saul Cabrera",
    notes: "",
  },
  {
    id: 5, quoteNumber: "QT-2026-0005", companyId: 2, companyName: "ABC Corp", isCustomerCompany: true,
    contactId: 2, contactName: "Marcus Bell", dealId: null, dealName: null,
    items: [
      { sku: "WC-2002", productName: "Canvas Tote Bag", quantity: 500, unitPrice: 28.0, total: 14000.0 },
      { sku: "WC-4003", productName: "Scented Soy Candle", quantity: 400, unitPrice: 18.0, total: 7200.0 },
    ],
    subtotal: 21200.0, tax: 1696.0, discount: 1200.0, grandTotal: 21696.0,
    status: "Draft", validUntil: "2026-08-30", createdAt: "2026-06-19", createdBy: "Tyler Jones",
    notes: "Standalone promo quote — not tied to a deal.",
  },
  {
    id: 6, quoteNumber: "QT-2026-0006", companyId: 5, companyName: "Delta Trading", isCustomerCompany: false,
    contactId: 8, contactName: "James Okafor", dealId: null, dealName: null,
    items: [
      { sku: "WC-1001", productName: "Classic Oxford Shirt", quantity: 60, unitPrice: 45.0, total: 2700.0 },
      { sku: "WC-2001", productName: "Leather Belt", quantity: 60, unitPrice: 34.0, total: 2040.0 },
    ],
    subtotal: 4740.0, tax: 379.2, discount: 0, grandTotal: 5119.2,
    status: "Rejected", validUntil: "2026-05-30", createdAt: "2026-05-10", createdBy: "Ryan Walsh",
    notes: "Buyer went with a competing supplier.",
  },
  {
    id: 7, quoteNumber: "QT-2026-0007", companyId: 13, companyName: "Bluewave Logistics", isCustomerCompany: false,
    contactId: 13, contactName: "Sandra Reyes", dealId: 3, dealName: "Enterprise Catalog Access",
    items: [
      { sku: "WC-4001", productName: "Ceramic Dinnerware Set", quantity: 150, unitPrice: 96.0, total: 14400.0 },
      { sku: "WC-4002", productName: "Linen Throw Blanket", quantity: 100, unitPrice: 54.0, total: 5400.0 },
      { sku: "WC-4003", productName: "Scented Soy Candle", quantity: 200, unitPrice: 18.0, total: 3600.0 },
    ],
    subtotal: 23400.0, tax: 1872.0, discount: 1500.0, grandTotal: 23772.0,
    status: "Sent", validUntil: "2026-08-10", createdAt: "2026-06-16", createdBy: "Jon Morales",
    notes: "",
  },
  {
    id: 8, quoteNumber: "QT-2026-0008", companyId: 2, companyName: "ABC Corp", isCustomerCompany: true,
    contactId: 4, contactName: "Priya Raman", dealId: null, dealName: null,
    items: [
      { sku: "WC-1002", productName: "Merino Wool Sweater", quantity: 40, unitPrice: 89.0, total: 3560.0 },
      { sku: "WC-2003", productName: "Wool Scarf", quantity: 80, unitPrice: 22.5, total: 1800.0 },
    ],
    subtotal: 5360.0, tax: 428.8, discount: 0, grandTotal: 5788.8,
    status: "Expired", validUntil: "2026-05-15", createdAt: "2026-04-14", createdBy: "Tyler Jones",
    notes: "Quote lapsed; reissue if buyer re-engages.",
  },
  {
    id: 9, quoteNumber: "QT-2026-0009", companyId: 18, companyName: "Tradewind Partners", isCustomerCompany: true,
    contactId: null, contactName: null, dealId: 7, dealName: "Seasonal Promotions Pack",
    items: [
      { sku: "WC-3002", productName: "Canvas Sneakers", quantity: 200, unitPrice: 72.0, total: 14400.0 },
      { sku: "WC-3003", productName: "Leather Loafers", quantity: 80, unitPrice: 115.0, total: 9200.0 },
    ],
    subtotal: 23600.0, tax: 1888.0, discount: 1800.0, grandTotal: 23688.0,
    status: "Accepted", validUntil: "2026-07-01", createdAt: "2026-06-08", createdBy: "Jon Morales",
    notes: "",
  },
];

// Status → badge classes used across the Quotes UI.
export const quoteStatusStyles = {
  Draft: "bg-default text-muted",
  Sent: "bg-info-bg text-info-dark",
  Viewed: "bg-warning-bg text-warning-dark",
  Accepted: "bg-success-bg text-success-dark",
  Rejected: "bg-danger-bg text-danger-dark",
  Expired: "bg-default text-muted",
};

export const quoteStatuses = ["Draft", "Sent", "Viewed", "Accepted", "Rejected", "Expired"];

// Currency formatter for quote amounts (numeric → "$18,029.60").
export function formatCurrency(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// True if the quote's validUntil date is in the past (relative to now).
export function isQuoteExpired(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

// Resolve a quote's associated company (for the Customer Gate check).
export function getQuoteCompany(quote) {
  return companies.find((c) => c.id === quote.companyId) || null;
}

// All quotes for a given company id.
export function getCompanyQuotes(companyId) {
  return quotes.filter((q) => q.companyId === companyId);
}

// Contacts belonging to a company (for the Create Quote contact dropdown).
export function getCompanyContacts(companyId) {
  return contacts.filter((c) => c.companyId === companyId);
}

// Deals belonging to a company by name (deals[] store company as a string).
export function getCompanyDeals(companyName) {
  return deals.filter((d) => d.company === companyName);
}
