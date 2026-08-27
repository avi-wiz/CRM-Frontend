import { useState } from "react";
import { Reply, Forward, Paperclip, Download } from "lucide-react";
import SideSheet from "../shared/SideSheet";
import ComposeEmail from "../side-sheets/email/ComposeEmail";
import { attachmentDownloadUrl } from "../../utils/api/emailApi";

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Full thread view. `thread` is oldest-first; `email` (single message) is
// accepted as a convenience for callers with just one message. Reply/Forward
// switch this same sheet into ComposeEmail, acting on the thread's latest
// message — "Back" returns to the read view.
export default function EmailViewSideSheet({ thread, email, onClose }) {
  const [composeMode, setComposeMode] = useState(null); // null | "reply" | "forward"

  const messages = thread || (email ? [email] : []);
  if (messages.length === 0) return null;
  const latest = messages[messages.length - 1];

  if (composeMode) {
    return (
      <SideSheet
        open
        onClose={onClose}
        onHeaderBack={() => setComposeMode(null)}
        title={composeMode === "reply" ? "Reply" : "Forward"}
      >
        <ComposeEmail
          mode={composeMode}
          original={latest}
          onClose={() => setComposeMode(null)}
          onSent={onClose}
        />
      </SideSheet>
    );
  }

  const isFailed = latest.direction === "failed";

  return (
    <SideSheet open onClose={onClose} title={latest.subject}>
      <div className="space-y-4">
        {isFailed ? (
          <div className="text-sm text-danger bg-danger-bg border border-danger rounded-lg px-3 py-2">
            Delivery failed{latest.originalTo ? ` to ${latest.originalTo}` : ""}.
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setComposeMode("reply")}
              className="wiz-btn wiz-btn--primary wiz-btn--sm inline-flex items-center gap-1.5"
            >
              <Reply size={13} /> Reply
            </button>
            <button
              type="button"
              onClick={() => setComposeMode("forward")}
              className="wiz-btn wiz-btn--secondary wiz-btn--sm inline-flex items-center gap-1.5"
            >
              <Forward size={13} /> Forward
            </button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => (
            <ThreadMessage key={m.id} message={m} defaultOpen={i === messages.length - 1} />
          ))}
        </div>
      </div>
    </SideSheet>
  );
}

function ThreadMessage({ message, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-default text-left"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-ink truncate">{message.fromName || message.from}</div>
          {!open && <div className="text-xs text-muted truncate mt-0.5">{message.snippet}</div>}
        </div>
        <div className="text-xs text-disabled flex-shrink-0 ml-3">{new Date(message.date).toLocaleString()}</div>
      </button>

      {open && (
        <div className="px-3 py-3 border-t border-divider space-y-3">
          <div className="space-y-1 text-sm">
            <div><span className="text-muted">From:</span> <span className="text-ink">{message.fromName || message.from}</span></div>
            <div><span className="text-muted">To:</span> <span className="text-ink">{message.to}</span></div>
            {message.cc && <div><span className="text-muted">Cc:</span> <span className="text-ink">{message.cc}</span></div>}
            {message.direction === "sent" && message.bcc && (
              <div><span className="text-muted">Bcc:</span> <span className="text-ink">{message.bcc}</span></div>
            )}
          </div>

          {message.attachments?.length > 0 && (
            <div className="space-y-1.5">
              {message.attachments.map((a) => (
                <a
                  key={a.id}
                  href={attachmentDownloadUrl(message.id, a.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-1.5 bg-default border border-border rounded-lg text-sm hover:border-primary transition-colors"
                >
                  <span className="flex items-center gap-1.5 text-ink truncate">
                    <Paperclip size={13} className="text-disabled flex-shrink-0" /> {a.filename}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-disabled flex-shrink-0">
                    {formatBytes(a.size)} <Download size={12} />
                  </span>
                </a>
              ))}
            </div>
          )}

          <EmailBody html={message.body} text={message.snippet} />
        </div>
      )}
    </div>
  );
}

// Nylas bodies are HTML. Render in a sandboxed iframe — no scripts, no same-
// origin access — so untrusted inbound HTML can't touch the app. Falls back
// to plain text for outbound sends we composed ourselves (no HTML markup).
function EmailBody({ html, text }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(html || "");

  if (!isHtml) {
    return <div className="text-sm text-ink whitespace-pre-wrap">{html || text || "—"}</div>;
  }

  return (
    <iframe
      title="Email body"
      srcDoc={html}
      sandbox=""
      className="w-full border-0"
      style={{ minHeight: 240 }}
      onLoad={(e) => {
        try {
          const doc = e.target.contentDocument;
          if (doc) e.target.style.height = `${doc.documentElement.scrollHeight + 16}px`;
        } catch {
          // sandboxed cross-doc access can throw in some browsers; ignore
        }
      }}
    />
  );
}
