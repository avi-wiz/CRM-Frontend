import { Building2, Users, DollarSign, CalendarDays } from "lucide-react";
import { companies, contacts, deals, meetings } from "./constants";

// ─── ASSOCIATION REGISTRY ───
// HubSpot-style two-level association: pick an OBJECT TYPE, then pick a RECORD
// within that type. Every associable object is declared here once; the UI
// (AssociationsSection / AssociationPicker) is generic and renders whatever this
// exports. Adding a new associable object = one entry here, no component edits.
//
// Each entry supplies a `search(query)` that scans the WHOLE object — not a
// subset pre-scoped to the selected company. That is the key difference from
// the old CreateDeal, where contacts were filtered to `companyId`.
//
// `labels` is the association-label vocabulary for that object type: the edge
// itself is typed ("Decision Maker"), not just a bare link. Mirrors the roles
// already present in dealDetail.contacts (Decision Maker / Influencer / Evaluator).

const LIMIT = 8;

function match(haystacks, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return haystacks.some((h) => String(h ?? "").toLowerCase().includes(needle));
}

export const CONTACT_LABELS = ["Decision Maker", "Influencer", "Evaluator", "Billing", "Champion"];
export const COMPANY_LABELS = ["Primary", "Parent Company", "Subsidiary", "Partner"];
export const DEAL_LABELS = ["Related", "Upsell", "Renewal", "Replaces"];
export const MEETING_LABELS = ["Discovery", "Demo", "Negotiation", "Follow-up", "Kickoff"];

export const ASSOCIATION_OBJECTS = {
  company: {
    type: "company",
    label: "Companies",
    labelSingular: "Company",
    icon: Building2,
    // A record belongs to exactly one company — picking replaces.
    multiple: false,
    searchPlaceholder: "Search companies…",
    labels: COMPANY_LABELS,
    search: (q) =>
      companies
        .filter((c) => match([c.name, c.domain, c.industry], q))
        .slice(0, LIMIT)
        .map((c) => ({
          id: c.id,
          primary: c.name,
          secondary: c.domain,
          badge: c.isCustomer ? "Customer" : null,
          meta: [
            ["Industry", c.industry],
            ["Stage", c.stage],
            ["Employees", c.employeeCount],
            ["Owner", c.rep],
          ],
          raw: c,
        })),
  },

  contact: {
    type: "contact",
    label: "Contacts",
    labelSingular: "Contact",
    icon: Users,
    multiple: true,
    searchPlaceholder: "Search all contacts…",
    labels: CONTACT_LABELS,
    // Searches every contact, across all companies.
    search: (q) =>
      contacts
        .filter((c) => match([`${c.firstName} ${c.lastName}`, c.email, c.jobTitle, c.companyName], q))
        .slice(0, LIMIT)
        .map((c) => ({
          id: c.id,
          primary: `${c.firstName} ${c.lastName}`,
          secondary: c.companyName,
          badge: c.isWizShopUser ? "WizShop" : null,
          meta: [
            ["Email", c.email],
            ["Phone", c.phone],
            ["Title", c.jobTitle],
            ["Company", c.companyName],
          ],
          raw: c,
        })),
  },

  deal: {
    type: "deal",
    label: "Deals",
    labelSingular: "Deal",
    icon: DollarSign,
    multiple: true,
    searchPlaceholder: "Search deals…",
    labels: DEAL_LABELS,
    search: (q) =>
      deals
        .filter((d) => match([d.name, d.company, d.owner, d.stage], q))
        .slice(0, LIMIT)
        .map((d) => ({
          id: d.id,
          primary: d.name,
          secondary: `${d.company} · ${d.amount}`,
          badge: d.stage,
          meta: [
            ["Amount", d.amount],
            ["Stage", d.stage],
            ["Owner", d.owner],
            ["Close date", d.closeDate],
          ],
          raw: d,
        })),
  },

  meeting: {
    type: "meeting",
    label: "Meetings",
    labelSingular: "Meeting",
    icon: CalendarDays,
    multiple: true,
    searchPlaceholder: "Search meetings…",
    labels: MEETING_LABELS,
    search: (q) =>
      meetings
        .filter((m) => match([m.title, m.companyName, m.dealName, m.location, m.outcome], q))
        .slice(0, LIMIT)
        .map((m) => ({
          id: m.id,
          primary: m.title,
          secondary: [m.date, m.companyName].filter(Boolean).join(" · "),
          badge: m.outcome,
          meta: [
            ["Date", m.date],
            ["Time", m.startTime],
            ["Location", m.location],
            ["Outcome", m.outcome],
          ],
          raw: m,
        })),
  },
};

// Which object types each host record can associate to. A host never lists
// itself — a deal associates to other deals only via the Deals card on a
// meeting, not on itself.
export const DEAL_ASSOCIATION_ORDER = ["company", "contact", "meeting"];
export const MEETING_ASSOCIATION_ORDER = ["company", "contact", "deal"];

// Types the host requires at least one of. Kept per-host rather than on the
// object, since "a company is required" is true of a deal, not of a meeting.
export const REQUIRED_BY_HOST = {
  deal: ["company"],
  meeting: [],
};

export function getAssociationObject(type) {
  return ASSOCIATION_OBJECTS[type];
}

// Suggest contacts belonging to a company — used to prefill the Contacts card
// when a company is chosen. This is a CONVENIENCE default, not a constraint:
// the picker still searches all contacts.
export function suggestedContactsFor(companyId) {
  if (!companyId) return [];
  return contacts
    .filter((c) => c.companyId === companyId)
    .map((c) => ({
      id: c.id,
      primary: `${c.firstName} ${c.lastName}`,
      secondary: c.companyName,
      badge: c.isWizShopUser ? "WizShop" : null,
      meta: [
        ["Email", c.email],
        ["Phone", c.phone],
        ["Title", c.jobTitle],
        ["Company", c.companyName],
      ],
      raw: c,
    }));
}
