import { useState, useEffect, useCallback } from "react";
import { getAccount as fetchAccount, getAuthUrl, disconnectAccount } from "../utils/api/emailApi";

// Connect state for the single mailbox this prototype supports.
// { status: "loading" | "connected" | "disconnected" | "error", email }
export function useEmailAccount() {
  const [state, setState] = useState({ status: "loading", email: null });

  const refresh = useCallback(async () => {
    try {
      const { connected, email } = await fetchAccount();
      setState({ status: connected ? "connected" : "disconnected", email: email || null });
    } catch {
      setState({ status: "error", email: null });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    const { url } = await getAuthUrl();
    window.location.href = url;
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectAccount();
    setState({ status: "disconnected", email: null });
  }, []);

  return { ...state, connect, disconnect, refresh };
}
