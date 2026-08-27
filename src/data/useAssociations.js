import { useState, useCallback, useMemo } from "react";
import { getAssociationObject, suggestedContactsFor } from "./associationRegistry";

// ─── useAssociations ───
// Owns the typed association edges for a form.
//
// Internal shape, keyed by object type:
//   { company: [{ record, label }], contact: [{ record, label }], ... }
//
// `toPayload()` flattens to the convention already used by activitiesStore:
//   { companyIds: [], contactIds: [], dealIds: [], meetingIds: [] }
// plus `associationLabels` keeping the typed part, which the flat id arrays
// cannot express on their own.

const EMPTY = {};

export function useAssociations(initial = EMPTY) {
  const [value, setValue] = useState(initial);

  const add = useCallback((type, record) => {
    const config = getAssociationObject(type);
    setValue((prev) => {
      const existing = prev[type] ?? [];
      // Single-cardinality types replace; multi types toggle off if re-picked.
      if (!config.multiple) {
        return { ...prev, [type]: [{ record, label: null }] };
      }
      if (existing.some((e) => e.record.id === record.id)) {
        return { ...prev, [type]: existing.filter((e) => e.record.id !== record.id) };
      }
      return { ...prev, [type]: [...existing, { record, label: null }] };
    });
  }, []);

  const remove = useCallback((type, id) => {
    setValue((prev) => ({
      ...prev,
      [type]: (prev[type] ?? []).filter((e) => e.record.id !== id),
    }));
  }, []);

  const setLabel = useCallback((type, id, label) => {
    setValue((prev) => ({
      ...prev,
      [type]: (prev[type] ?? []).map((e) => (e.record.id === id ? { ...e, label } : e)),
    }));
  }, []);

  // Replace one type wholesale — used to prefill contacts when a company is
  // picked. Kept separate from `add` so the prefill can't stack duplicates.
  const setType = useCallback((type, records) => {
    setValue((prev) => ({
      ...prev,
      [type]: records.map((record) => ({ record, label: null })),
    }));
  }, []);

  const toPayload = useCallback(() => {
    const payload = { companyIds: [], contactIds: [], dealIds: [], meetingIds: [] };
    const key = { company: "companyIds", contact: "contactIds", deal: "dealIds", meeting: "meetingIds" };
    const associationLabels = [];

    Object.entries(value).forEach(([type, entries]) => {
      (entries ?? []).forEach(({ record, label }) => {
        const k = key[type];
        if (k) payload[k].push(record.id);
        if (label) associationLabels.push({ objectType: type, recordId: record.id, label });
      });
    });

    return { ...payload, associationLabels };
  }, [value]);

  const company = useMemo(() => value.company?.[0]?.record ?? null, [value.company]);

  return { value, setValue, add, remove, setLabel, setType, toPayload, company };
}

// Convenience for the Create Deal flow: when a company is chosen, prefill its
// contacts. A default, not a constraint — the contact picker still searches all.
export function prefillContactsForCompany(setType, companyId) {
  setType("contact", suggestedContactsFor(companyId));
}
