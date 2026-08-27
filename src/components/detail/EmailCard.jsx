import { Reply, Forward } from "lucide-react";

// Renders one email (or the latest message of a thread group, via
// `threadCount`) — used both in the Activity timeline (type "email") and the
// Inbox list. Clicking the body opens the full email/thread; Reply/Forward
// open ComposeEmail pre-filled per the reply/forward rules, acting on the
// passed `email` (the thread's latest message).
export default function EmailCard({ email, threadCount, onOpen, onReply, onForward }) {
  const isSent = email.direction === "sent";
  const isFailed = email.direction === "failed";
  const badge = isFailed ? "Failed" : isSent ? "Sent" : "Received";
  const badgeClass = isFailed ? "bg-danger-bg text-danger-dark" : isSent ? "bg-info-bg text-info-dark" : "bg-tonal text-muted";

  return (
    <div className="flex-1 min-w-0">
      <div
        onClick={() => onOpen?.(email)}
        className="cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink truncate">{email.subject}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${badgeClass}`}>
            {badge}
          </span>
          {threadCount > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 bg-tonal text-muted">
              {threadCount} messages
            </span>
          )}
        </div>
        <div className="text-xs text-muted mt-0.5">
          {isFailed
            ? `Could not deliver to: ${email.originalTo || "unknown recipient"}`
            : isSent
              ? `To: ${email.to}`
              : `From: ${email.fromName || email.from}`}
        </div>
        <div className="text-sm text-muted mt-0.5 truncate">
          {isFailed && email.originalSubject ? `Original subject: ${email.originalSubject}` : email.snippet}
        </div>
      </div>

      {!isFailed && (
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReply?.(email); }}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Reply size={12} /> Reply
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onForward?.(email); }}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Forward size={12} /> Forward
          </button>
        </div>
      )}
    </div>
  );
}
