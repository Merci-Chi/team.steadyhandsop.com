# Confirmed requirements

The optional ideas in the supplied list were not added. This checklist separates implemented frontend behavior from services that require a backend.

| Area | Included frontend behavior |
| --- | --- |
| Design | Admin navy/blue style and layout; supplied logo; no original admin tools or CRM links; free Lucide icons |
| Navigation | Requested order; Tasks first; remembered collapse/expand; independent desktop scroll areas; mobile drawer |
| Tasks | Create/edit/delete, active-account assignees, deadlines, three statuses, three priorities, All/My/Completed views, search, overdue labels, counts |
| Task details | Description, discussion comments, direct attachments, comment attachments, downloads, local edit/delete permission checks |
| Follow-ups | Add/edit, client name/phone, assigned caller, next date, reason, all five statuses, search, date sorting, overdue labels, click-to-call, count |
| Call history | Dated notes, note attachments, status/date-change history, completed-call archive |
| Announcements | Manager publish/edit/delete, title/message/author/date, acknowledgments, manager acknowledgment roster, local notifications, Tasks unread notice |
| Chat | General and new channels, all-active-account visibility, sender/timestamp, file sharing, exact @email mentions, 15-second local refresh |
| Notifications | Assignments, mentions, announcements, recipient filtering, unread count/dot, relevant links, mark all read |
| Calendar | Monthly grid, previous/next/Today, event title/description/date/time, task deadlines and call dates, entry links, event create/edit/delete |
| Accounts | Local setup/sign-in/sign-out, member/manager workflow, manager create/role-change/activation controls, operation-level local checks, profile menu |
| Resources | Greyed sidebar entry and under-construction page only |
| Timesheet | One greyed tab and placeholder; all clocking/hours/requests/submission/approval/export integration deferred |
| Team Directory | Greyed sidebar entry and under-construction page only |
| Training / Demo | Exact external sites, new tabs, Demo directly below Training |
| Starting data | Empty workspace; General channel only; no CRM/client import or connection |
| Packaging | Complete static frontend ZIP, relative asset links, no build or application backend required |

## Backend-dependent requirements

| Requirement | Status in this frontend-only delivery |
| --- | --- |
| Shared database across devices | Not included. IndexedDB/local storage is confined to a browser and origin. |
| Secure sign-in and enforced access control | Not included. Local sign-in and role checks demonstrate flows and can be bypassed through browser tools. |
| Private team attachment storage | Not included. Files are stored locally, with signed-in UI access; browser owners can inspect them. |
| Real team group chat / cross-device refresh | Not included. Channels/messages and 15-second refresh operate only on locally saved browser data. |
| Shared team calendar | Calendar workflows are complete locally; sharing requires a backend. |
| Notifications delivered to other devices | Not included. Notifications are local records viewed under each demo account. |
| Invitations or password recovery | No email/invitation/recovery service was requested or configured. |

Connect `data.js` to an authenticated backend and private file store to make these team services real. The frontend UI does not claim that they are already connected.
