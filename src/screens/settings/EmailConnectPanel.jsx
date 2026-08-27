import { useState, useEffect } from "react";
import { Mail, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useEmailAccount } from "../../data/useEmailAccount";
import { useEmailActions } from "../../data/useEmailThread";

// Reads ?email_connect=success|failed left by the backend's OAuth callback
// redirect, then falls back to the live account state from the backend.
function useConnectResultFromUrl() {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("email_connect");
    if (value) {
      setResult(value);
      params.delete("email_connect");
      const rest = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));
    }
  }, []);
  return result;
}

export default function EmailConnectPanel() {
  const { status, email, connect, refresh } = useEmailAccount();
  const { sync } = useEmailActions();
  const connectResult = useConnectResultFromUrl();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    if (connectResult) refresh();
  }, [connectResult, refresh]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      await sync();
    } catch (err) {
      setSyncError(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const showFailed = connectResult === "failed" && status !== "connected";

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Mail size={18} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">Email</h3>
          <p className="text-xs text-muted">Connect a mailbox to send and sync email from the CRM.</p>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-xl border border-border bg-surface">
        {status === "loading" && <div className="text-sm text-muted">Checking connection…</div>}

        {status === "connected" && (
          <div>
            <div className="flex items-center gap-2 text-sm text-success-dark">
              <CheckCircle2 size={16} />
              Connected as <span className="font-medium text-ink">{email}</span>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="wiz-btn wiz-btn--sm mt-3 inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync now"}
            </button>
            {syncError && <div className="text-xs text-danger mt-2">{syncError}</div>}
          </div>
        )}

        {(status === "disconnected" || status === "error") && (
          <div>
            {showFailed && (
              <div className="flex items-center gap-2 text-sm text-danger mb-3">
                <XCircle size={16} /> Connection failed — try again
              </div>
            )}
            <button type="button" onClick={connect} className="wiz-btn wiz-btn--primary inline-flex items-center gap-1.5">
              <Mail size={14} /> Connect Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
