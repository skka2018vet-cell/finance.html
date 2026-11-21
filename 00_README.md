# Pet World Vet SaaS — Module Handoff Package

## Files
| File | Purpose |
|---|---|
| `01_PW_SHARED_STARTER.html` | Starting template for every new module (shared CSS + JS copied verbatim from finished Finance page, page shell, modal/toast pattern, hash routing). |
| `02_ARCHITECTURE_AND_RULES.md` | Modules, audiences, file names, UI rules, navigation contract, coding standards. |
| `03_DATA_CONTRACT.md` | Every storage key, who owns it, exact shapes, who may read it. |
| `04_MODULE_PROMPTS.md` | Ready-to-paste prompts: 6 new modules + 1 job to add Owner mode to the finished Patients page. |
| `05_SHARED_JS_v3_BLOCK.js` | Updated shared JS v3 (roles + owner menu + approved 5-page Communication menu). Already inside file 01. Must also be pasted into finished `finance.html` and `patients.html`. |

## How to use (per new Claude account)
1. Open a new chat in the new account.
2. Attach files 01, 02, 03 (and the two finished HTML pages only for Dashboard / Report / Settings).
3. Paste that module's prompt from file 04.
4. Save the returned file with the exact file name from the table in file 02.
5. Put all 8 files in the same folder; the sidebar links work between them.

## Check each returned file (2 minutes)
- Both `PW-SHARED` blocks present and unchanged (search for `PW-SHARED:BEGIN`).
- `<body data-file="...">` matches the file name.
- Opens on its own, sidebar shows the same menu, dark/light toggle works, usable on a phone.
- Only uses keys from the data contract.

## IMPORTANT: finished pages need the v3 shared JS
Role-aware menu is new. Replace the shared JS block in `finance_4.html` (lines between `PW-SHARED:BEGIN js` and `PW-SHARED:END js`) with `05_SHARED_JS_v3_BLOCK.js`. For `patients_5.html`, use prompt 7 in file 04 (it also adds the owner mode). Until then those two pages show the old menu.

## Order I suggest
1. Settings first (it creates `pwSession`, `pwClinic`, `pwVoucher`, `pwCashiers`).
2. Patients owner mode (prompt 7).
3. Services, Communication, SOP.
4. Report, Dashboard last (they read everything).

## Decided so far
- Owner sees: own Appointments, own pets with 8 tabs (read-only), Services, Communication, owner-only Settings.
- Roles are managed only in Settings.
- Browser-only prototype: roles are not real security yet.

## Still open
1. DECIDED: Communication may read owner `name`/`email` (and pet/record fields listed in 03 section "Communication read-only access") from Patients. Phone/Telegram are never used. Channels are App Notifications and Gmail only.
2. What each clinic role (doctor, staff) may open: Settings builds the table, default is everything.
3. Browser storage (localStorage) is per device and not shared between users or clinics. Fine for pilot testing; a server database is needed before real multi-user, multi-clinic use, and before owners can use their own phones against the clinic's data.
