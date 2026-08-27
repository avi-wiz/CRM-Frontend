import { useSyncExternalStore, useCallback } from "react";
import { listMessages, syncMessages, sendMessage as apiSendMessage } from "../utils/api/emailApi";

// Local cache of messages fetched from the backend (server/store.js is the
// real source of truth; this just holds the last fetch for the UI).
let messages = [];
const listeners = new Set();

function emit() {
  messages = [...messages];
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return messages;
}

export function useEmailMessages() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useEmailActions() {
  const load = useCallback(async () => {
    const { messages: list } = await listMessages();
    messages = list;
    emit();
    return messages;
  }, []);

  const sync = useCallback(async () => {
    const { messages: list } = await syncMessages();
    messages = list;
    emit();
    return messages;
  }, []);

  const send = useCallback(async (payload) => {
    const { message } = await apiSendMessage(payload);
    messages = [message, ...messages];
    emit();
    return message;
  }, []);

  return { load, sync, send };
}

export function findMessageById(id) {
  return messages.find((m) => m.id === id) || null;
}
