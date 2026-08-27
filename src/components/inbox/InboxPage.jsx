import { useState, useEffect, useMemo } from "react";
import { Plus, RefreshCw } from "lucide-react";
import SideSheet from "../shared/SideSheet";
import ComposeEmail from "../side-sheets/email/ComposeEmail";
import EmailCard from "../detail/EmailCard";
import EmailViewSideSheet from "../detail/EmailViewSideSheet";
import { useEmailMessages, useEmailActions } from "../../data/useEmailThread";
import { useEmailAccount } from "../../data/useEmailAccount";
import { groupEmailThreads } from "../../data/groupEmailThreads";

// Draft is a client-only local bucket — no backend persistence (out of POC
// scope). Failed combines two sources: sends that error synchronously (added
// locally below) and bounce-back messages detected server-side during sync
// (server/store.js normalizeMessage — Nylas has no send-time delivery-failure
// signal, so a bad recipient only shows up later as an inbound bounce email).
const TABS = [
  { key: "inbox", label: "Inbox" },
  { key: "sent", label: "Sent" },
  { key: "draft", label: "Draft" },
  { key: "failed", label: "Failed" },
];

export default function InboxPage() {
  const { status, connect } = useEmailAccount();
  const messages = useEmailMessages();
  const { load, sync } = useEmailActions();
  const [tab, setTab] = useState("inbox");
  const [composeOpen, setComposeOpen] = useState(false);
  const [openEmail, setOpenEmail] = useState(null);
  const [replyState, setReplyState] = useState(null); // { mode, original }
  const [syncing, setSyncing] = useState(false);
  const [failed, setFailed] = useState([]); // locally-tracked failed sends

  useEffect(() => {
    if (status === "connected") load().catch(() => {});
  }, [status, load]);

  const visibleMessages = useMemo(() => {
    if (tab === "sent") return messages.filter((m) => m.direction === "sent");
    if (tab === "inbox") return messages.filter((m) => m.direction === "received");
    if (tab === "draft") return [];
    if (tab === "failed") return [...failed, ...messages.filter((m) => m.direction === "failed")];
    return messages;
  }, [tab, messages, failed]);

  // Thread-group within the visible tab so a reply/forward round-trip
  // collapses into one row instead of showing as separate-looking cards.
  const threadGroups = useMemo(() => groupEmailThreads(visibleMessages), [visibleMessages]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await sync();
    } finally {
      setSyncing(false);
    }
  };

  const openReply = (email) => setReplyState({ mode: "reply", original: email });
  const openForward = (email) => setReplyState({ mode: "forward", original: email });

  if (status !== "connected") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm text-muted mb-3">Connect a mailbox to send and view email.</p>
          <button type="button" onClick={connect} className="wiz-btn wiz-btn--primary">
            Connect Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
        <div className="flex items-center gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                tab === t.key ? "bg-action-hover text-primary font-medium" : "text-muted hover:bg-action-hover"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="wiz-btn wiz-btn--sm inline-flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync now"}
          </button>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="wiz-btn wiz-btn--primary wiz-btn--sm inline-flex items-center gap-1.5"
          >
            <Plus size={13} /> Compose
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
        {threadGroups.length === 0 && (
          <div className="text-center py-10 text-disabled text-sm">No messages</div>
        )}
        {threadGroups.map((g) => (
          <div key={g.threadId} className="flex gap-3 p-3.5 rounded-xl border border-border bg-surface shadow-1 hover:shadow-2 transition-all">
            <EmailCard
              email={g.latest}
              threadCount={g.messages.length}
              onOpen={() => setOpenEmail(g)}
              onReply={openReply}
              onForward={openForward}
            />
          </div>
        ))}
      </div>

      <SideSheet open={composeOpen} onClose={() => setComposeOpen(false)} title="Compose">
        <ComposeEmail mode="new" onClose={() => setComposeOpen(false)} onSent={() => setComposeOpen(false)} />
      </SideSheet>

      {replyState && (
        <SideSheet
          open={!!replyState}
          onClose={() => setReplyState(null)}
          title={replyState.mode === "reply" ? "Reply" : "Forward"}
        >
          <ComposeEmail
            mode={replyState.mode}
            original={replyState.original}
            onClose={() => setReplyState(null)}
            onSent={() => setReplyState(null)}
          />
        </SideSheet>
      )}

      {openEmail && <EmailViewSideSheet thread={openEmail.messages} onClose={() => setOpenEmail(null)} />}
    </div>
  );
}
