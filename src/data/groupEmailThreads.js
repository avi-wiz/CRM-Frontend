// Groups a flat message list into threads by threadId (falling back to the
// message's own id for messages with no threadId, e.g. malformed rows).
// Each group is sorted oldest-first (conversation order); groups themselves
// are ordered by their most recent message, newest-first — matching how the
// flat list was already sorted.
export function groupEmailThreads(messages) {
  const byThread = new Map();

  for (const m of messages) {
    const key = m.threadId || m.id;
    if (!byThread.has(key)) byThread.set(key, []);
    byThread.get(key).push(m);
  }

  const groups = [...byThread.values()].map((msgs) => {
    const sorted = [...msgs].sort((a, b) => a.date - b.date);
    return { threadId: sorted[0].threadId || sorted[0].id, messages: sorted, latest: sorted[sorted.length - 1] };
  });

  return groups.sort((a, b) => b.latest.date - a.latest.date);
}
