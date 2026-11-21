# Pet World Vet SaaS — Architecture & Build Rules (READ FIRST)

You are building ONE module of a multi-page veterinary clinic web app. Other modules are built by other Claude sessions. The app will later be rolled out to MANY clinics with MANY users, so consistency between modules is the top priority. Do NOT redesign anything.

## 1. Product context
- Product: Pet World Vet SaaS (multi-clinic, multi-branch vet clinic software). Pilot clinic: Pet World Veterinary Clinic, Ahlone, Yangon, Myanmar.
- Owner of the project is a veterinarian, not a software engineer. Explain decisions plainly; prefer safe, simple, boring technical choices.
- UI language: English only for the first launch (Myanmar text may appear in user-entered data; keep the font fallbacks that already exist in the shared CSS).
- Delivery: each module = ONE self-contained `.html` file (HTML + CSS + JS inline). No build tools, no frameworks, no npm. Only allowed external resources are the Google Font and Font Awesome links already in the starter file.

## 2. Modules, files, audience
Roles: `admin`, `doctor`, `staff` (clinic side) and `owner` (pet owner). Role is stored in `pwSession` (written by Settings). The shared sidebar already adapts to the role (see section 5).

| Module | File | Who uses it | Links to |
|---|---|---|---|
| Dashboard | `index.html` | Clinic roles | Reads Patients + Finance summaries |
| Patient Management (DONE, needs owner mode) | `patients.html` | Clinic roles: full. OWNER: Appointments + My Pets only, read-only, own pets only | Sends pending bills to Finance |
| Finance & Inventory (DONE) | `finance.html` | Clinic roles only | Reads patients; reads clinic/voucher/cashier settings |
| Services | `services.html` | Staff edit; OWNER views | Standalone. NOT linked to Stock / Finance / Patients |
| Communication | `communication.html` | Staff compose; OWNER reads | Standalone (owner-addressed items carry `ownerId`) |
| Report | `report.html` | Clinic roles | READ-ONLY from Patients + Finance data |
| SOP | `sop.html` | Clinic roles only (owner never sees it) | Standalone |
| Settings | `settings.html` | Admin: clinic-wide controls + roles/users. OWNER: own owner settings only | Controls ALL modules (owns clinic-wide keys, `pwSession`, `pwRolePerms`) |

File names are fixed — the shared sidebar navigates to them.

### What an OWNER may see (decided by the project owner)
1. **Appointments**: only appointments of their own pets.
2. **My Pets**: only their own pets, and for each pet ALL 8 record tabs, read-only: General Information, Medical Record History, Vaccination, Deworming, Heart-worm Prevention, Contraception, Lab Results, Imaging.
3. **Services** and **Communication**: all their sub-pages, view-only.
4. **Settings**: a separate owner-only settings screen (never the clinic settings).
5. Nothing else. No Dashboard, Finance, Report, SOP, Inpatients, other owners' data.
An owner is linked to pets through `ownerId` ('OD-0001') — see `03_DATA_CONTRACT.md`.

### Roles live in Settings
Role/user management is built ONLY in `settings.html`. Other modules never create roles; they only read `ROLE` / `SESSION` from the shared JS and hide or lock their UI accordingly. Owner-vs-staff rendering inside a module is done in two separate functions (`renderStaffView()` / `renderOwnerView()`) chosen by `ROLE==='owner'`.
IMPORTANT: this is a browser-only prototype, so role checks are interface rules, NOT real security. Say so plainly in your reply. Real protection needs a server.

## 3. The PW-SHARED blocks (most important rule)
`01_PW_SHARED_STARTER.html` contains two blocks copied verbatim from the finished Finance page:
- `/* ===== PW-SHARED:BEGIN css ... PW-SHARED:END css ===== */`
- `/* ===== PW-SHARED:BEGIN js ... PW-SHARED:END js ===== */`

Rules:
1. START every module from the starter file. Replace only the `__PLACEHOLDERS__`.
2. NEVER edit, reformat, minify or "improve" anything between the BEGIN/END markers. If you believe a shared change is needed, STOP and tell the project owner in your reply; do not patch it locally.
3. Page-specific CSS goes AFTER `PW-SHARED:END css`. Page-specific JS goes AFTER `PW-SHARED:END js`.
4. Reuse shared classes before inventing new ones. Any new class gets a module prefix (`.svc-`, `.com-`, `.rpt-`, `.set-`, `.dash-`, `.sopx-`) so modules never collide.
5. Do not add `<link rel="stylesheet" href="css/style.css">` or any other external local file. Each file must work on its own.

## 4. Layout and look
- Shell: fixed left sidebar (`#sb`, built by `buildSidebar()`), sticky topbar (page title + subtitle + theme button), `.content` area. Mobile: hamburger + overlay (already handled by shared code).
- Dark theme default, light theme via `body.light`; all colours come from CSS variables (`--bg --card --card2 --teal --blue --text --text2 --text3 --border`). Never hard-code colours that break in light mode; if you must, add a `body.light` override.
- Font: Plus Jakarta Sans (+ Myanmar fallbacks from shared CSS).
- Icons: emoji in the menu (as in MENU) and in headings, same style as Finance/Patients.
- Typical page anatomy: `.ftabs` (sub-page tabs) → `.sg` stat cards (`.sc g|c|p|o|r|b`) → `.toolbar` (search `.sb-box` + `.btn btn-teal` actions + `.sel` filters) → `.cd` card containing `.tbl-wrap > table.tbl`.
- Buttons: `.btn .btn-teal` (primary), `.btn-ghost`, `.btn-red`, `.btn-sm`. Badges: `.badge .b-done|b-pending|b-critical|b-confirmed|b-low|b-ok|b-expired|b-cancelled`. Forms: `.form-g`, `.form-row .fr2/.fr3`. Modals: `.modal-ov > .modal > .m-hdr/.m-body/.m-foot` opened with `openModal(id)` / `closeModal(id)`. Feedback: `showToast(msg, emoji)`.
- Responsive breakpoints already defined in shared CSS (1200 / 900 / 600 px). Every screen must be usable on a phone.

## 5. Navigation contract
- The sidebar menu comes from the shared JS (`MENU_ALL` for clinic roles, `MENU_OWNER` for owners; `MENU` is the one chosen for the current role; a role with no access to the current file is redirected). Do not change it. Each module's `PAGES` object keys MUST equal the sub-item keys that MENU lists for that file:
  - `services.html`: `all`, `Consultation`, `Vaccination`, `Surgery`
  - `communication.html`: `reminders`, `messaging`, `announcements`, `qa`, `history`
  - `patients.html` (done): `appointments`, `patients`, `inpatients` (owners get `appointments` + `patients` only, labelled "My Pets")
  - `finance.html` (done): `billing`, `inventory`, `expenses`, `goodsreceipt`
  - `settings.html` for owners shows the owner settings screen; for clinic roles the clinic settings (same file, chosen by `ROLE`)
  - `index.html`, `report.html`, `sop.html`, `settings.html`: single items, no sub-keys in MENU (if the module needs internal tabs, use `.ftabs` with its own keys and tell the project owner so MENU can be extended once, centrally).
- Sub-pages are selected with the URL hash (`#billing`), using `showPage(k)` exactly as in the starter.
- Set `<body data-file="xxx.html">` correctly.

## 6. Coding standards (apply to every module)
1. Storage ONLY through `LS.get(key, default)` / `LS.set(key, value)` from the shared JS. Never call `localStorage` directly in new code. (Reason: the storage layer will later be swapped for a server database; one choke point makes that safe.)
2. Use ONLY the keys and shapes in `03_DATA_CONTRACT.md`. New keys must start with `pw` + module name (e.g. `pwServices`, `pwSop`) and be documented in your reply.
3. Never rename, delete or change the shape of a key owned by another module. Reading is allowed where the contract says so; writing only to keys you own.
4. Escape every user-entered string with `E()` before putting it in `innerHTML`. Many different clinics' staff and owners will type data; treat it as untrusted.
5. Wrap storage reads in defaults so an empty/corrupt value never crashes the page (see how `LS.get` is used).
6. No clinic-specific text hard-coded. Clinic name/address/phone come from `pwClinic` (fall back to "PET WORLD Vet Clinic" if empty). The sidebar logo text is the only existing exception.
7. Money: Myanmar Kyat, integers, shown as `Ks` with thousands separators (`n.toLocaleString()`).
8. Dates: store ISO `YYYY-MM-DD` (times `HH:MM`); display `DD/MM/YYYY`.
9. IDs: numeric counters stored as `{a:[...], c:nextId}` for new collections, same as `pwAppts`/`pwInventory`.
10. Destructive actions (delete/restore/clear) must ask for confirmation via a modal and, where money or stock is involved, write an entry to `pwAuditLog`.
11. Demo/sample data must be flagged (`demo:1`) and removable. Never ship fake patient or owner data as if real.
12. Accessibility basics: labels on inputs, buttons ≥ 36px tall on mobile, readable contrast in both themes.
13. Owner-facing screens: mobile-first, larger tap targets, plain words (no internal codes), read-only unless stated. Never expose another owner's data, cost prices, stock or finance numbers.
14. Do NOT touch other modules, and do not re-implement their features (e.g. no billing logic in Report; Report only reads).

## 7. How to reply
- Reply to the project owner in Burmese (simple words), UI text in English.
- First message: restate the module scope in 5–8 lines and list any questions. Ask at most one round of questions, then build.
- Deliver the complete single HTML file. After the file, list: (a) storage keys read/written, (b) any shared-code change you think is needed (do NOT apply it), (c) anything not finished.
