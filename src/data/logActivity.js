import { addActivity } from "./activitiesStore";
import { addMeeting } from "./meetingsStore";
import { addTask } from "./tasksStore";
import { addVisit } from "./visitsStore";

// Single entry point for the activity log side sheets on detail pages.
// `entity` is the page's active record ({ id, type, name }); `payload` is what
// the sheet emitted. Each activity is persisted with EXPLICIT associations to
// the active entity (plus anything the sheet itself associated), so it is
// visible only on those records' timelines.
//
// note / email / system → the unified activities store.
// meeting / task / visit → their own stores (the timeline derives them, filtered
//   by association), with the active entity merged into their associations.
export function logActivityFromEntity(entity, payload) {
  const type = payload.type;

  // Build base association arrays seeded with the active entity.
  const companyIds = [];
  const contactIds = [];
  const dealIds = [];
  if (entity) {
    if (entity.type === "company" || entity.type === "customer") companyIds.push(entity.id);
    else if (entity.type === "contact") contactIds.push(entity.id);
    else if (entity.type === "deal") dealIds.push(entity.id);
  }

  if (type === "meeting") {
    return addMeeting({
      title: payload.title,
      date: payload.date,
      startTime: payload.startTime || "—",
      duration: typeof payload.duration === "number" ? payload.duration : 60,
      location: payload.location || "—",
      notes: payload.notes || "",
      attendees: payload.attendees || [],
      internalAttendees: payload.internalAttendees || [],
      outcome: payload.outcome || "Completed",
      // Prefer the sheet's chosen company; fall back to the active entity.
      companyId: payload.companyId ?? (companyIds[0] ?? null),
      companyName: payload.companyName ?? entity?.name ?? "—",
      dealId: payload.dealId ?? (dealIds[0] ?? null),
      dealName: payload.dealName ?? null,
    });
  }

  if (type === "task") {
    const a = payload.associations;
    const assocObj = a && !Array.isArray(a) ? a : {};
    return addTask({
      title: payload.title,
      description: payload.description || "",
      dueDate: payload.dueDate || payload.due,
      priority: payload.priority,
      status: payload.status || "Open",
      assignee: payload.assignee,
      associations: {
        companyId: assocObj.companyId ?? (companyIds[0] ?? null),
        companyName: assocObj.companyName ?? entity?.name ?? "—",
        contactIds: assocObj.contactIds ?? contactIds.map((id) => ({ contactId: id })),
        dealId: assocObj.dealId ?? (dealIds[0] ?? null),
        dealName: assocObj.dealName ?? null,
        meetingId: assocObj.meetingId ?? null,
        meetingTitle: assocObj.meetingTitle ?? null,
      },
    });
  }

  if (type === "visit") {
    return addVisit({
      visitDate: payload.visitDate || payload.date,
      rep: payload.rep,
      purpose: payload.purpose,
      duration: payload.duration,
      location: payload.location,
      companyId: payload.companyId ?? (companyIds[0] ?? null),
      companyName: payload.companyName ?? entity?.name ?? "—",
      contactIds: payload.contactIds ?? contactIds.map((id) => ({ contactId: id })),
      notes: payload.notes || "",
      outcome: payload.outcome,
      followUpNeeded: payload.followUpNeeded,
      followUpDate: payload.followUpDate,
      followUpNotes: payload.followUpNotes,
    });
  }

  // note / email / system — strip the helper-only `type` stays, persist as-is.
  return addActivity(payload, { companyIds, contactIds, dealIds });
}
