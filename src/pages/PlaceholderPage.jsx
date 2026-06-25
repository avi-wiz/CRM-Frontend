// Stub page for entities whose UI isn't built yet (Meetings, Tasks, Visits,
// Activities, Dashboard). Displays "<Entity> — Coming Soon" using the passed
// entity name so a single component serves every unbuilt nav item.
export default function PlaceholderPage({ entity = "This page" }) {
  return (
    <div className="flex-1 flex items-center justify-center text-disabled">
      <div className="text-center">
        <div className="text-lg font-medium text-ink mb-1">{entity} — Coming Soon</div>
        <div className="text-sm">This area isn't built yet. Extend: create a page component for {entity}.</div>
      </div>
    </div>
  );
}
