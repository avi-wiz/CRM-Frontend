import LogNote from "./LogNote";
import LogMeeting from "./LogMeeting";
import CreateTask from "./CreateTask";
import LogEmail from "./LogEmail";
import LogVisit from "./LogVisit";

export { LogNote, LogMeeting, CreateTask, LogEmail, LogVisit };

// action key (as emitted by ActivityTimeline's + buttons) → { title, Component }
export const LOG_SHEETS = {
  note: { title: "Log Note", Component: LogNote },
  meeting: { title: "Log Meeting", Component: LogMeeting },
  task: { title: "Create Task", Component: CreateTask },
  email: { title: "Log Email", Component: LogEmail },
  visit: { title: "Log Visit", Component: LogVisit },
};

// Builds the new activity's display time as a local ISO-ish string the
// timeline's formatRelativeTime can parse. (Date.now via new Date is fine in
// app runtime — this is not a workflow script.)
export function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}
