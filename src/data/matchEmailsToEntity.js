import { contacts as allContacts } from "./constants";

// Identity matching for real synced Nylas emails (which carry only from/to
// addresses, no CRM association) — the "which Customer does this belong to?"
// question the POC docs flagged as the hardest open problem. Matches by
// contact email address: an email is visible on a Company/Customer's
// Activity tab if its from/to matches any contact under that company, and on
// a Contact's tab if it matches that contact's own email directly.

function addressesOf(email) {
  const list = [];
  if (email.from) list.push(email.from.toLowerCase());
  if (email.to) list.push(...email.to.split(",").map((a) => a.trim().toLowerCase()));
  return list;
}

// Real Nylas message row -> ActivityTimeline-shaped activity.
function emailToActivity(m) {
  return { ...m, id: `email-${m.id}`, type: "email", time: new Date(m.date).toISOString().slice(0, 16).replace("T", " ") };
}

export function matchEmailsForCompany(messages, companyId) {
  const companyContactEmails = new Set(
    allContacts.filter((c) => c.companyId === companyId).map((c) => c.email.toLowerCase())
  );
  if (companyContactEmails.size === 0) return [];
  return messages
    .filter((m) => addressesOf(m).some((addr) => companyContactEmails.has(addr)))
    .map(emailToActivity);
}

export function matchEmailsForContact(messages, contactId) {
  const contact = allContacts.find((c) => c.id === contactId);
  if (!contact?.email) return [];
  const address = contact.email.toLowerCase();
  return messages.filter((m) => addressesOf(m).includes(address)).map(emailToActivity);
}
