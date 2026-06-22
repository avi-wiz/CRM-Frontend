import { useSyncExternalStore } from "react";
import { visits as seedVisits } from "./constants";

// ─── In-memory visits store ───
// Seeded from static sample data, mutable for the session so visits logged
// anywhere (Visits listing, Company/Contact detail) appear everywhere and are
// openable by id. Components subscribe via useVisits()/useVisit(id).

let visits = [...seedVisits];
const listeners = new Set();

function emit() {
  visits = [...visits];
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return visits;
}

function nextId() {
  return Math.max(0, ...visits.map((v) => v.id || 0)) + 1;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Add a freshly-built visit. Returns the stored record.
export function addVisit(visit) {
  const record = {
    id: nextId(),
    createdAt: todayISO(),
    rep: { repName: "You" },
    contactIds: [],
    followUpNeeded: false,
    followUpDate: null,
    followUpNotes: null,
    ...visit,
  };
  visits = [record, ...visits];
  emit();
  return record;
}

// Patch a visit by id (e.g. outcome change). Returns the updated record.
export function updateVisit(id, patch) {
  let updated = null;
  visits = visits.map((v) => {
    if (v.id !== id) return v;
    updated = { ...v, ...patch };
    return updated;
  });
  emit();
  return updated;
}

// ─── Hooks ───
export function useVisits() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useVisit(id) {
  const all = useVisits();
  return all.find((v) => v.id === id) || null;
}

// Note: timeline rendering of visits now lives in activitiesStore
// (useEntityActivities derives visit activities, filtered by association).
