# Steady Hands Team — Complete Frontend

This is a static, frontend-only team workspace. It retains the supplied admin template’s navy-and-blue stylesheet and layout, your supplied logo, separate sidebar/main scrolling, mobile drawer, and remembered collapsed sidebar. It contains no Python server, original admin access code, CRM connection, or imported client records.

## Open it

1. Extract the **entire** ZIP, keeping its folders together.
2. Open `index.html` in a modern browser, or upload the entire folder to a static HTTPS host.
3. Create the first **local workspace manager** using a name, email, and password of at least 12 characters.
4. Use **Profile → Team access** (the person button at the bottom of the sidebar) to add browser-local manager/member accounts.
5. Start with the setup actions on Tasks: add team members, create a task, and add client follow-up calls.

For reliable storage across pages, static HTTPS hosting is recommended. No application server, build step, package installation, or database account is needed to use the frontend. If a browser blocks file-based storage or cryptography, use a static HTTPS host instead. Icons load from the free Lucide CDN and require internet access.

## Frontend boundary — read this first

All records, demo accounts, passwords, read acknowledgments, notifications, and attachments are saved **only in the current browser and origin**. This is a functional local workspace, not a live multi-device team service. Same-origin tabs can see saved changes when they refresh; the UI polls every 15 seconds when it is safe to refresh.

The sign-in and permission flows demonstrate member/manager behavior. Passwords are hashed locally, but these controls are **not a security boundary**: anyone with access to the browser’s storage or developer tools can inspect or alter local data. Use demonstration credentials, not an existing account password.

Secure sign-in, actual team access control, synchronized cross-device chat/records/notifications, shared database storage, and private attachment storage require a backend. Those services are not included or represented as complete. See `FEATURE-CHECKLIST.md` for the exact mapping.

The workspace intentionally starts empty, with no sample clients or imported CRM records. The General chat channel is available immediately. Previously downloaded simplified versions used a different local format and are not automatically imported.

## Included pages and behavior

### Tasks — first page

Create/edit/delete tasks with assignees selected from active local accounts, deadlines, To do/In progress/Done statuses, and Low/Normal/High priorities. All tasks, My tasks, and Completed views, task search, overdue labels, open-task counts, and due-today counts are included.

Open a task to read its details, add discussion comments, attach files directly or to comments, and download them later. Assignment notifications are created for the selected recipient. Mention a teammate using their exact `@email` in a comment to create a local mention notification.

Members can edit tasks they created or are assigned; creators and managers can delete tasks. Deleting a task also removes its comments and files.

### Client follow-up calls — on Tasks

Add/edit a client name, phone number, assigned caller, next follow-up date, reason, and call status: Awaiting call, No answer, Left voicemail, Rescheduled, or Completed. Active calls are sorted by date. Search, overdue labels, phone links, and an awaiting-call count are included.

Open a follow-up to add dated call notes with attachments. Changing status or the next follow-up date creates a history entry. Completed calls remain accessible under the completed-call section. Follow-up assignments and note mentions create local notifications.

### Announcements

Managers create and publish announcements with title, message, author, and date. Members acknowledge them using **I’ve read this**. Managers can see each local account’s acknowledgment status. New or edited announcements create notifications, and Tasks displays an unread announcement notice. Editing an announcement resets acknowledgments so everyone can read the revised text.

### Chat

General channel plus creation of additional channels. All active local accounts can see every channel. Messages show sender names and timestamps and support file sharing. Exact `@email` mentions create recipient-specific notifications. Saved data is polled every 15 seconds; this synchronizes browser-local state only, not different devices.

### Notifications

The sidebar bell shows the unread count, including a dot in compact mode. The notification center includes task/follow-up assignments, mentions, announcements, linked destinations, and **Mark all as read**. Notifications are filtered to the signed-in local account.

### Calendar

A real monthly grid with previous, next, and Today controls. Create/edit/delete events with title, description, date, and time. Task deadlines and follow-up dates appear with distinct colors. Open an entry to view/edit its event or open the task/follow-up details. Dates/times use the browser’s local timezone; timezone conversion and recurrence remain deferred.

### Deferred pages

Resources, Timesheet, and Team Directory have greyed sidebar entries and useful under-construction placeholders only. There are no working clocking, time-entry, submission, approval, or export controls. Training and Demo open their specified external URLs in new tabs, with Demo immediately below Training.

### Accounts, navigation, and layout

Local sign-in/sign-out, first-manager setup, team-member/workspace-manager roles, and manager controls to create accounts, change another account’s role, or activate/deactivate access. The service rechecks account status and permissions for each local operation. Managers cannot deactivate or change their own role.

Desktop navigation can collapse to a compact icon rail; page names remain in tooltips. The choice persists across pages and reloads. The sidebar and main content scroll separately. Mobile has a separately scrolling navigation drawer. Labels, keyboard focus indicators, dialog close controls, and Escape-to-close navigation are included.

## Storage and attachments

`data.js` uses IndexedDB for records and attachments, with serialized read/write transactions. File downloads are generated locally; nothing is uploaded to a server. The attachment limit is 10 MB per file, subject to browser storage limits.

If IndexedDB cannot initialize, the site falls back to local storage. That fallback has a much smaller browser quota, so large files may fail with a clear error. It is selected only at initialization; a failed IndexedDB write never silently switches to a different workspace. Clearing site data, changing browser/origin, or using private browsing may remove or isolate the workspace. No cloud backup or encryption is provided.

Refresh pauses while a dialog is open or the user is writing/selecting a chat file to avoid losing unsaved work.

## Files

- `index.html`, `announcements.html`, `chat.html`, `calendar.html`
- `resources.html`, `timesheet.html`, `directory.html`
- `styles.css`: supplied admin stylesheet plus the earlier scoped shell/scroll/sidebar fixes
- `team-ui.css`: task, chat, calendar, account, and dialog components
- `js.js`: all shared page rendering and interactions
- `data.js`: isolated frontend persistence and workflow adapter
- `images/team-logo.png`: your supplied logo, unchanged
- `FEATURE-CHECKLIST.md`: implementation mapping and backend boundary
- `tests/` and `tests.cjs`: automated verification, optional for users

There is no `.jss` file.

## Validation

Optional, for developers with Node installed:

```
node tests.cjs
```

The tests exercise setup/login/logout, both roles, assignments, edit/delete checks, announcements/acknowledgments, follow-up history, file storage/download, channel visibility, mentions, notification links/read state, event editing, account deactivation, data persistence, deletion cleanup, and page rendering for both roles.

All seven pages also passed structural checks preserving the direct-body app layout that prevents sidebar overlap. Browser-based visual verification was unavailable; no claim of interactive Safari/mobile visual testing is made.

Free icons: Lucide 0.468.0, ISC license, https://lucide.dev.
