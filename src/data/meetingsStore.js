import { useSyncExternalStore } from "react";
import { meetings as seedMeetings } from "./constants";

// ─── In-memory meetings store ───
// Seeded from the static sample data, mutable for the session so meetings
// logged anywhere (Meetings listing, Company detail) appear everywhere and are
// openable by id. Components subscribe via useMeetings()/useMeeting(id).

let meetings = [...seedMeetings];
const listeners = new Set();

function emit() {
  meetings = [...meetings];
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return meetings;
}

function nextId() {
  return Math.max(0, ...meetings.map((m) => m.id || 0)) + 1;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Add a freshly-built meeting (without id). Returns the stored record.
export function addMeeting(meeting) {
  const record = {
    id: nextId(),
    createdBy: "You",
    createdAt: todayISO(),
    outcome: "Scheduled",
    attendees: [],
    internalAttendees: [],
    ...meeting,
  };
  meetings = [record, ...meetings];
  emit();
  return record;
}

// Patch an existing meeting by id (e.g. outcome change). Returns the updated record.
export function updateMeeting(id, patch) {
  let updated = null;
  meetings = meetings.map((m) => {
    if (m.id !== id) return m;
    updated = { ...m, ...patch };
    return updated;
  });
  emit();
  return updated;
}

// ─── Hooks ───
export function useMeetings() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useMeeting(id) {
  const all = useMeetings();
  return all.find((m) => m.id === id) || null;
}
