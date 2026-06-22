import { useSyncExternalStore, useMemo } from "react";
import { useTasks } from "./tasksStore";
import { useMeetings } from "./meetingsStore";
import { useVisits } from "./visitsStore";

// ─── Unified activities store ───
// Single source of truth for the activity timeline. Every activity carries an
// explicit `associations` object: it is visible ONLY on the detail pages of the
// entities listed there — no inference from "same company" relationships.
//
//   associations: { companyIds:[], contactIds:[], dealIds:[], meetingIds:[] }
//
// This store directly owns NOTE / EMAIL / SYSTEM activities (the ones with no
// dedicated store). MEETING / TASK / VISIT activities are derived live from
// their own stores (meetingsStore / tasksStore / visitsStore) so they stay in
// sync — see useEntityActivities below.

// Demo trio that the rich sample data describes: ABC Corp (company 2),
// Sneha Iyer (contact 1), Bulk Reorder Q3 (deal 2).
const DEMO = { companyId: 2, contactId: 1, dealId: 2 };

function assoc({ companyIds = [], contactIds = [], dealIds = [], meetingIds = [] } = {}) {
  return { companyIds, contactIds, dealIds, meetingIds };
}

// Seeded note/email/system activities for the demo trio. Each is associated
// with exactly the entities it pertains to (deduped — a single record can be
// associated with the company AND the contact AND the deal).
const SEED = [
  // Company + Deal — pricing / contract thread
  { id: "a1", type: "system", text: "Stage changed from Negotiation to Won", time: "2026-06-20 14:02", associations: assoc({ companyIds: [2] }) },
  { id: "a2", type: "note", author: "Tyler Jones", body: "Closed the annual reorder. They want to revisit private-label terms in Q4.", time: "2026-06-20 13:50", associations: assoc({ companyIds: [2], dealIds: [2] }) },
  { id: "a3", type: "email", subject: "Signed agreement attached", direction: "received", from: "Sneha Iyer", to: "Tyler Jones", snippet: "Hi Tyler — countersigned copy attached. Looking forward to Q3.", time: "2026-06-19 16:20", associations: assoc({ companyIds: [2], contactIds: [1], dealIds: [2] }) },
  { id: "a4", type: "note", author: "Tyler Jones", body: "Buyer asked for an 8% volume discount on orders over 500 units. Hold for now.", time: "2026-06-18 12:00", associations: assoc({ companyIds: [2], dealIds: [2] }) },
  { id: "a5", type: "email", subject: "Re: Pricing for bulk reorder", direction: "sent", from: "Tyler Jones", to: "Sneha Iyer", snippet: "Attaching the revised tiered pricing sheet for volumes over 500 units.", time: "2026-06-16 10:05", associations: assoc({ companyIds: [2], contactIds: [1], dealIds: [2] }) },
  { id: "a6", type: "note", author: "John Carmichael", body: "Buyer mentioned a competing quote; we should hold on the 8% discount.", time: "2026-06-15 15:40", associations: assoc({ companyIds: [2], dealIds: [2] }) },
  { id: "a7", type: "email", subject: "Bulk reorder proposal", direction: "received", from: "Rahul Mehta", to: "Tyler Jones", snippet: "Hi Tyler — interested in a Q3 reorder. Can you send updated pricing?", time: "2026-06-10 09:30", associations: assoc({ companyIds: [2], dealIds: [2] }) },

  // Contact-specific — Sneha
  { id: "a8", type: "system", text: "Contact stage changed to In Progress", time: "2026-06-20 13:55", associations: assoc({ contactIds: [1] }) },
  { id: "a9", type: "note", author: "Tyler Jones", body: "Sneha is the economic buyer — loop her in on all pricing changes.", time: "2026-06-18 11:20", associations: assoc({ contactIds: [1], companyIds: [2] }) },
  { id: "a10", type: "email", subject: "Re: Pricing for bulk reorder", direction: "received", from: "Sneha Iyer", to: "Tyler Jones", snippet: "Looks good — let's proceed with the tiered pricing.", time: "2026-06-16 14:05", associations: assoc({ contactIds: [1], companyIds: [2], dealIds: [2] }) },
  { id: "a11", type: "system", text: "WizShop access granted (Admin)", time: "2026-06-05 09:00", associations: assoc({ contactIds: [1] }) },
  { id: "a12", type: "system", text: "Contact created", time: "2026-04-03 08:00", associations: assoc({ contactIds: [1] }) },

  // Company lifecycle / onboarding
  { id: "a13", type: "email", subject: "Welcome to WizShop", direction: "sent", from: "Tyler Jones", to: "Sneha Iyer", snippet: "Your buyer portal access is live. Here's how to place your first order.", time: "2026-06-05 09:00", associations: assoc({ companyIds: [2], contactIds: [1] }) },
  { id: "a14", type: "note", author: "Tyler Jones", body: "Initial discovery: 4 regional warehouses, looking to consolidate ordering.", time: "2026-06-03 14:25", associations: assoc({ companyIds: [2] }) },
  { id: "a15", type: "system", text: "Rep assigned: Tyler Jones", time: "2026-06-08 08:15", associations: assoc({ companyIds: [2] }) },
  { id: "a16", type: "system", text: "Stage changed from New Lead to Contacted", time: "2026-06-01 10:30", associations: assoc({ companyIds: [2] }) },
  { id: "a17", type: "system", text: "Company created", time: "2026-04-02 08:00", associations: assoc({ companyIds: [2] }) },

  // Deal lifecycle
  { id: "a18", type: "system", text: "Stage moved to Negotiation", time: "2026-06-19 09:00", associations: assoc({ dealIds: [2] }) },
  { id: "a19", type: "system", text: "Deal created", time: "2026-04-15 08:00", associations: assoc({ dealIds: [2] }) },
];

let activities = [...SEED];
const listeners = new Set();

function emit() {
  activities = [...activities];
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return activities;
}

let seq = 1000;
function nextId() {
  seq += 1;
  return `a${seq}`;
}

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

// Add a note/email/system activity. `associations` captures the entities this
// activity is visible on (the active entity + any chosen at creation time).
export function addActivity(activity, associations) {
  const record = {
    id: nextId(),
    time: nowStamp(),
    ...activity,
    associations: assoc(associations),
  };
  activities = [record, ...activities];
  emit();
  return record;
}

// ─── Derivation: map store records → timeline-shaped activities ───
function taskToActivity(t) {
  const a = t.associations || {};
  return {
    id: `task-${t.id}`,
    type: "task",
    time: t.createdAt,
    title: t.title,
    assignee: t.assignee?.repName,
    due: t.dueDate,
    status: t.status,
    taskId: t.id,
    associations: assoc({
      companyIds: a.companyId ? [a.companyId] : [],
      contactIds: (a.contactIds || []).map((c) => c.contactId),
      dealIds: a.dealId ? [a.dealId] : [],
      meetingIds: a.meetingId ? [a.meetingId] : [],
    }),
  };
}

function meetingToActivity(m) {
  return {
    id: `meeting-${m.id}`,
    type: "meeting",
    time: m.date,
    title: m.title,
    attendees: (m.attendees || []).map((x) => x.contactName).join(", ") || "—",
    outcome: m.outcome,
    meetingId: m.id,
    associations: assoc({
      companyIds: m.companyId ? [m.companyId] : [],
      contactIds: (m.attendees || []).map((x) => x.contactId),
      dealIds: m.dealId ? [m.dealId] : [],
      meetingIds: [m.id],
    }),
  };
}

function visitToActivity(v) {
  return {
    id: `visit-${v.id}`,
    type: "visit",
    time: v.visitDate,
    purpose: v.purpose,
    repName: v.rep?.repName || "—",
    notes: v.notes,
    outcome: v.outcome,
    followUp: !!v.followUpNeeded,
    visitId: v.id,
    associations: assoc({
      companyIds: v.companyId ? [v.companyId] : [],
      contactIds: (v.contactIds || []).map((c) => c.contactId),
    }),
  };
}

// Does an activity's associations include this entity?
function isVisibleOn(activity, type, id) {
  const a = activity.associations || {};
  if (type === "company" || type === "customer") return (a.companyIds || []).includes(id);
  if (type === "contact") return (a.contactIds || []).includes(id);
  if (type === "deal") return (a.dealIds || []).includes(id);
  return false;
}

// ─── Hooks ───
export function useActivitiesRaw() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

// All activities visible on a given entity, newest-first. Merges the store's
// note/email/system records with live-derived meeting/task/visit activities,
// then filters strictly by explicit association.
export function useEntityActivities(type, id) {
  const owned = useActivitiesRaw();
  const tasks = useTasks();
  const meetings = useMeetings();
  const visits = useVisits();

  return useMemo(() => {
    if (id == null) return [];
    const derived = [
      ...tasks.map(taskToActivity),
      ...meetings.map(meetingToActivity),
      ...visits.map(visitToActivity),
    ];
    const all = [...owned, ...derived];
    return all
      .filter((a) => isVisibleOn(a, type, id))
      .sort((a, b) => {
        const pin = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        if (pin !== 0) return pin;
        return String(b.time).localeCompare(String(a.time));
      });
  }, [owned, tasks, meetings, visits, type, id]);
}
