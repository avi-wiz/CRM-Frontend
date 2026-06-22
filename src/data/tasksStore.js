import { useSyncExternalStore } from "react";
import { tasks as seedTasks } from "./constants";

// ─── In-memory tasks store ───
// Seeded from static sample data, mutable for the session so tasks created
// anywhere (Tasks listing, Company/Meeting detail) appear everywhere and are
// openable by id. Components subscribe via useTasks()/useTask(id).

let tasks = [...seedTasks];
const listeners = new Set();

function emit() {
  tasks = [...tasks];
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return tasks;
}

function nextId() {
  return Math.max(0, ...tasks.map((t) => t.id || 0)) + 1;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Add a freshly-built task. Accepts either a fully-shaped record or the
// activity-shaped payload emitted by the CreateTask side sheet, which it
// normalizes. Returns the stored record.
export function addTask(input) {
  const record = {
    id: nextId(),
    title: input.title || "Untitled task",
    description: input.description || "",
    dueDate: input.dueDate || input.due || todayISO(),
    priority: input.priority || "Medium",
    status: input.status || "Open",
    assignee: input.assignee && input.assignee.repName
      ? input.assignee
      : { repName: typeof input.assignee === "string" ? input.assignee : "Unassigned" },
    createdBy: input.createdBy || "You",
    createdAt: input.createdAt || todayISO(),
    completedAt: input.completedAt || null,
    associations: input.associations && !Array.isArray(input.associations)
      ? input.associations
      : {
          companyId: input.companyId ?? null,
          companyName: input.companyName ?? "—",
          contactIds: input.contactIds ?? [],
          dealId: input.dealId ?? null,
          dealName: input.dealName ?? null,
          meetingId: input.meetingId ?? null,
          meetingTitle: input.meetingTitle ?? null,
        },
  };
  tasks = [record, ...tasks];
  emit();
  return record;
}

// Patch a task by id (status, priority, assignee, etc.). Returns the updated record.
export function updateTask(id, patch) {
  let updated = null;
  tasks = tasks.map((t) => {
    if (t.id !== id) return t;
    updated = { ...t, ...patch };
    return updated;
  });
  emit();
  return updated;
}

// Convenience: mark a task complete with a completedAt stamp.
export function completeTask(id) {
  return updateTask(id, { status: "Completed", completedAt: todayISO() });
}

// ─── Hooks ───
export function useTasks() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useTask(id) {
  const all = useTasks();
  return all.find((t) => t.id === id) || null;
}
