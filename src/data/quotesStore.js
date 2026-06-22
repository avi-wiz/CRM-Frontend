import { useSyncExternalStore } from "react";
import { quotes as seedQuotes } from "./constants";

// ─── In-memory quotes store ───
// Seeded from the static sample data, but mutable for the session so quotes
// created anywhere (Company detail tab, Quotes listing) appear everywhere and
// are openable by id. Components subscribe via useQuotes()/useQuote(id).

let quotes = [...seedQuotes];
const listeners = new Set();

function emit() {
  quotes = [...quotes]; // new array reference so getSnapshot returns a fresh value
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return quotes;
}

// Next sequential id + zero-padded quote number.
function nextQuote() {
  const id = Math.max(0, ...quotes.map((q) => q.id || 0)) + 1;
  return { id, quoteNumber: `QT-2026-${String(id).padStart(4, "0")}` };
}

// Add a freshly-built quote (without id/quoteNumber). Returns the stored quote.
export function addQuote(quote) {
  const { id, quoteNumber } = nextQuote();
  const record = { id, quoteNumber, createdBy: "You", createdAt: todayISO(), ...quote };
  quotes = [record, ...quotes];
  emit();
  return record;
}

// Duplicate an existing quote by id. The copy resets to Draft, gets a fresh
// number/date/owner, and is prepended. Returns the new quote (or null).
export function duplicateQuote(id) {
  const src = quotes.find((q) => q.id === id);
  if (!src) return null;
  const { id: _id, quoteNumber: _qn, status, createdAt, createdBy, ...rest } = src;
  return addQuote({
    ...rest,
    items: (src.items || []).map((it) => ({ ...it })),
    status: "Draft",
  });
}

// Patch an existing quote by id (e.g. status change). Returns the updated quote.
export function updateQuote(id, patch) {
  let updated = null;
  quotes = quotes.map((q) => {
    if (q.id !== id) return q;
    updated = { ...q, ...patch };
    return updated;
  });
  emit();
  return updated;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Hooks ───
export function useQuotes() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useCompanyQuotes(companyId) {
  const all = useQuotes();
  return all.filter((q) => q.companyId === companyId);
}

export function useQuote(id) {
  const all = useQuotes();
  return all.find((q) => q.id === id) || null;
}
