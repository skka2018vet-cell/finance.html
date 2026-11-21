# Communication: patches and contracts (revision 4)

## 0. Status of this revision (what was actually changed, in `project/`)
| File | State |
|---|---|
| `communication.html` | Modified. Embeds the v3 shared block. Strict link validation, strict callbacks, Sent-only owner views |
| `01_PW_SHARED_STARTER.html` | Modified: v2 block replaced by v3 (menu lines + marker only) |
| `finance_4.html` | Modified: its older v1 block replaced by v3 (hash identical to the starter) |
| `patients_6.html` | Modified, two small changes: Communication menu line, and appointments now store exact `petId`/`ownerId` when the patient was picked from the list. It has no PW-SHARED markers, so it does not carry the full v3 block |
| `00_README.md`, `02_ARCHITECTURE_AND_RULES.md`, `03_DATA_CONTRACT.md` | Modified (v3, five menu keys, channels, new keys, link fields) |
| `05_SHARED_JS_v3_BLOCK.js` | The v3 block (v2 + 2 menu lines + marker) |
| **Dashboard** | **NOT modified. The Dashboard HTML was never provided, so it is blocked.** Section 2 is the ready patch |
| **Patients link UI** (`fulfils`, `followOf`, `apptId`) | **NOT implemented** (see section 3) |
| GitHub | Not accessed: no repository URL or credentials were provided, and nothing was pushed |

Patient Management is read-only for Communication.

## 1. Shared navigation: approved shared-block version `js v3`

The Communication menu lives inside the protected PW-SHARED js block, so this is a **shared-block version change**, not a local edit.

**v2 to v3 differences (nothing else changes):**
1. Marker text `PW-SHARED:BEGIN js v2` becomes `PW-SHARED:BEGIN js v3`.
2. In `MENU_ALL` and in `MENU_OWNER`, replace this exact line:
```
 {g:'Communication',f:'communication.html',items:[['Reminders','reminders','🔔'],['Messaging','messaging','✉️'],['Campaigns','campaigns','📣'],['Notes for Owner','ownernotes','📝'],['Q & A','qa','❓']]},
```
with:
```
 {g:'Communication',f:'communication.html',items:[['Reminders','reminders','🔔'],['Messaging','messaging','✉️'],['Announcements','announcements','📣'],['Q&A / FAQ','qa','❓'],['Communication History','history','🕘']]},
```
The complete v3 block is in `05_SHARED_JS_v3_BLOCK.js`. Paste it between (and including) the BEGIN/END markers in every file. The CSS block does not change.

**Files that must carry the identical v3 block**
| File | Action |
|---|---|
| `01_PW_SHARED_STARTER.html` | Replace the v2 block (Campaigns lines 748 and 758) |
| `finance_4.html` | Has an older single `var MENU=[` (line 869). Replace its whole PW-SHARED js block with v3 |
| `patients_6.html` | Has no PW-SHARED markers (Campaigns line 7096). Add the v3 block through the Patients owner-mode job |
| `index.html`, `services.html`, `report.html`, `sop.html`, `settings.html` | Not provided to me. Replace block with v3 (search each for `Campaigns`) |
| `communication.html` | Currently the v2 block plus a module-level menu override. After approval, replace the block with v3. The override can stay (harmless) |

**Verification (must print the same hash for every file):**
```
awk '/PW-SHARED:BEGIN js/,/PW-SHARED:END js/' FILE.html | sha256sum
```
Expected: `ed11f77cc8ae56e6ed77b973642eb0683d9f7e59b23d80ad1cbccb96b0eb819e`. Verified identical in `01_PW_SHARED_STARTER.html`, `finance_4.html`, `communication.html` and the v3 block file. Still to do: `index.html` (Dashboard), `services.html`, `report.html`, `sop.html`, `settings.html`, and the Patients owner-mode job (not provided). The same check on the CSS block (`PW-SHARED:BEGIN css` to `PW-SHARED:END css`) must also match across files.
Also update `02_ARCHITECTURE_AND_RULES.md` section 5 keys to: `reminders`, `messaging`, `announcements`, `qa`, `history`.

## 2. Dashboard patch (Dashboard HTML was not provided; place the card inside the existing stat-card grid)

Card:
```html
<div class="sc o" id="dashComRem" onclick="navTo('communication.html','reminders')">
  <div class="sc-lbl">OWNER REMINDERS</div>
  <div class="sc-val" id="dcrVal">—</div>
  <div class="sc-sub" id="dcrSub">Open Communication to refresh</div>
</div>
```
Page JS (after the shared block; `LS` is shared):
```js
var DCR_STALE_MIN=10;   /* summary older than this is NOT shown as current */
function dashComReminders(){
  var s=LS.get('pwComSummary',null),now=new Date(),p=function(n){return('0'+n).slice(-2)};
  var today=now.getFullYear()+'-'+p(now.getMonth()+1)+'-'+p(now.getDate());
  var at=s&&s.at?new Date(s.at):null,age=at&&!isNaN(at)?(now-at)/60000:NaN;
  var shape=!!s&&s.v===1&&typeof s.upcoming==='number'&&typeof s.dueToday==='number'&&typeof s.overdue==='number';
  var state=!shape||isNaN(age)?'missing':s.asOf!==today?'stale-day':age<-2?'bad-clock':age>DCR_STALE_MIN?'stale-age':'fresh';
  var v=document.getElementById('dcrVal'),u=document.getElementById('dcrSub');
  if(state==='fresh'){
    v.textContent=s.overdue+s.dueToday;
    u.textContent=s.overdue+' overdue · '+s.dueToday+' due today · '+s.upcoming+' upcoming (updated '+p(at.getHours())+':'+p(at.getMinutes())+')';
  }else{
    v.textContent='—';
    u.textContent=state==='missing'?'No summary yet. Open Communication to refresh'
      :'Not refreshed'+(at&&!isNaN(at)?' since '+p(at.getDate())+'/'+p(at.getMonth()+1)+' '+p(at.getHours())+':'+p(at.getMinutes()):'')+'. Open Communication to refresh';
  }
  return state;
}
dashComReminders();setInterval(dashComReminders,60000);
window.addEventListener('storage',function(e){if(e.key==='pwComSummary')dashComReminders()});
```
**Freshness rule:** current only when `v===1`, `asOf` equals the Dashboard's local today, and `at` is at most **10 minutes** old (and not more than 2 minutes in the future). Otherwise the Dashboard shows "—" and "Not refreshed". The 60-second interval makes a card turn stale by itself.

**`pwComSummary` (unchanged structure):** `{ v:1, at:'ISO timestamp', asOf:'YYYY-MM-DD', upcoming:Number, dueToday:Number, overdue:Number }`.
Written only by staff sessions of `communication.html` (on load, focus, `petworld.records.v1` / `pwAppts` changes from another tab, every 60 s, day change). It counts only pending reminders (not Completed, not Dismissed). Unlinked appointments are not counted (they appear in Communication under "Needs review"). While Communication is closed nobody refreshes it. In production a server job must own these counts.

## 3. Patient Management changes REQUIRED before any reminder can complete

Communication never guesses completion. It completes a reminder only through these explicit links. **Patients (patients.html) does not write them today, so until it does every reminder stays pending.** Communication cannot add them (read-only).
| Where | New field | Meaning |
|---|---|---|
| `pet.vax[]`, `pet.dw[]`, `pet.hw[]`, `pet.co[]` rows | `fulfils: '<source row id>'` | This performed record fulfils the earlier row that set the Next Due Date |
| `pet.visits[]` | `followOf: '<source visit id>'` | This visit is the follow-up of that visit |
| `pet.visits[]` | `apptId: <appointment id>` | This visit is the actual service for that appointment |
| `pwAppts.a[]` | `petId: 'PD-0001'` (exact), optional `ownerId` | Required for Communication to use an appointment |

Rules the module applies (all must hold): same pet and same list; linking record has an ID different from the source; the source has a date and the linking record is dated **strictly after** it and not in the future; **vaccination: both records carry the same vaccine name (`against`)**; follow-up: `followOf` names the source visit and is dated strictly after it; appointment: `apptId` names the appointment and the visit is dated on/after the appointment date.

**Why the Patients UI is not done:** the four service forms are dense generated tables (`gfRow` grid) and the visit form is large. Adding link selectors means changing table columns and row builders in a 548 KB file I can only exercise in a simulated DOM, not see rendered. I did not want to risk the clinical forms blindly. Required work: a "Fulfils" selector per row in the Vaccination/Deworming/Heartworm/Contraception forms (options: earlier rows of the same list with a Next Date and no fulfilling record), a "Follow-up of" selector and an "Appointment" selector in the visit form, each written as `fulfils` / `followOf` / `apptId`. Legacy records without these fields keep working: they simply stay pending. A wrong or missing link leaves the reminder pending. Appointment `status:'Done'` alone never completes anything: such an appointment is shown pending, flagged "Marked Done but no linked clinical record", listed under Needs review, and gets no owner notice.

## 4. Patient Management fields actually read by communication.html (all read-only)
| Source | Fields read |
|---|---|
| `petworld.records.v1` | `pets`, `owners` |
| Pet | `id`, `name`, `species`, `owner` (name fallback only), `ownerId`, `email`, `archived`, `vax`, `dw`, `hw`, `co`, `visits` |
| Owner | `id`, `name`, `email` |
| Service row (`vax/dw/hw/co`) | `id`, `date`, `next`, `fulfils`; `against` (vaccine name, shown only as detail) |
| Visit | `id`, `followOf`, `apptId`, `f.date`, `f.follow`, `f.cc` (shown as detail) |
| `pwAppts` `a[]` | `id`, `petId`, `ownerId` (optional check), `date`, `status`, `type`; `pet` and `owner` names are display-only in the Needs-review table, never used for matching |
| `pwSession` (shared) | `role`, `name`, `ownerId` |

Not read any more: `f.dx`, `phone`, `telegram`, `pstatus`, `address`.

## 5. Communication keys (owned by communication.html; `{a,c}` = `{a:[...], c:nextId}`)
| Key | Exact shape |
|---|---|
| `pwComReminders` | `{a:[{id, key:'<petId>\|<type>\|<due>\|<list>:<sourceId>', petId, ownerId, type, due, src:'<list>:<sourceId>', notifs:[{ch:'app'\|'gmail', off, idem:'<key>\|<ch>\|<off>', attempt, origin:'Auto'\|'Manual', at, status:'Queued'\|'Sent'\|'Failed'\|'Skipped', note, deliveredAt?, retriedAt?, requeuedAt?}], dismissed:{at,by}\|null}], c}` |
| `pwComMessages` | `{a:[{id, ownerId, petId, ch, subject, body, to, status:'Queued'\|'Sent'\|'Failed', attempt, at, by, deliveredAt?, retriedAt?}], c}` |
| `pwComAnnouncements` | `{a:[{id, title, body, ownerId:''\|'OD-0001', status:'Draft'\|'Published'\|'Archived', upd, pubAt?}], c}` |
| `pwComFaq` | `{a:[{id, q, a, status:'Draft'\|'Published', upd}], c}` |
| `pwComQA` | `{a:[{id, ownerId, petId, q, status:'Open'\|'Answered'\|'Closed', at, reply, repAt, repBy}], c}` |
| `pwComHistory` | `{a:[{id, at, by, type, channel, ownerId, petId, on, pn, title, status, ref?:{kind:'reminder'\|'message', id, src?}}], c}` append-only |
| `pwComSettings` | `{offsets:[7,3,0], app:true, gmail:true, auto:false}` |
| `pwComSummary` | see section 2 |

The reminder key changed from the previous build (`petId|type|due`) to include the source record. Old stored reminders migrate automatically in a staff session.

**Data Contract (03) updates:** (1) section E: replace `pwComCampaigns` / `pwComNotes` with the keys above; (2) section B: approve the read-only fields in section 4; (3) section B: add the Patients link fields in section 3; (4) section D2: `pwOwnerPrefs` must use `app|gmail` and drop `campaign`; (5) README open item 1 is decided (owner email may be read).

## 6. Retry rules and backend contract
- **Skipped** (no valid owner email): re-attempted automatically on the next manual or auto queue run once a valid email is on file (same idempotencyKey, never sent before).
- **Failed**: staff press Retry on the reminder (or message). Same `idempotencyKey`, `attempt` + 1, state back to Queued. **Sent** and **Queued** are never retried or duplicated.
- `comApplyDelivery(kind,id,ch,status,ts,idem,attempt)` is **strict**: `id`, `ch`, `idem` and an integer `attempt >= 1` are all required and must equal the stored item (message idempotency key is `'msg|<id>'`); status must be `Sent` or `Failed`; the item must still be `Queued`. Anything else returns `false` and changes nothing.
- Owners see only items whose status is `Sent` (messages, notification chips, history); Queued, Failed, Skipped and Dismissed are staff-only.
- Backend must: enforce server-side idempotency per `idempotencyKey` (refuse a retry if a Sent result exists, accept one only after Failed); Gmail through the server-side Gmail API (OAuth), never credentials in the browser; per-owner App Notification inbox authorized by Owner ID; scheduler job and delivery-result endpoints; server-side role and Owner ID authorization; server-owned `pwComSummary` counts; a real database instead of localStorage.
