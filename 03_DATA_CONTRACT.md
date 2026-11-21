# Pet World — Shared Data Contract v1 (localStorage prototype layer)

All data currently lives in the browser's localStorage via `LS.get/LS.set`. This is a prototype layer: later it will move to a server database. So: only use keys listed here, keep shapes exactly as shown, and never write to a key owned by another module.

Legend: **Owner** = the only module allowed to write. **Read** = modules that may read.

## A. Shared
| Key | Owner | Shape | Notes |
|---|---|---|---|
| `pwTheme` | shared JS | `'dark'` or `'light'` | Set by `toggleTheme()` |
| `pwSession` | settings.html | `{role:'admin'|'doctor'|'staff'|'owner', name, ownerId?}` | Who is using the app now. `ownerId` ('OD-0001') is REQUIRED when role is `owner`. Prototype only (no real login). Default when missing: admin. Read via shared `SESSION` / `ROLE`. |
| `pwRolePerms` | settings.html | `{doctor:['index.html','patients.html',…], staff:[…]}` | Optional list of files each clinic role may open. Missing = all files allowed. Owner menu is fixed in shared JS and ignores this key. |

## B. Patient Management (owner: patients.html — DONE)
| Key | Shape |
|---|---|
| `petworld.records.v1` | `{pets:[Pet], seq:Number, owners:[Owner], oseq:Number}` |
| `pwAppts` | `{a:[Appt], c:nextId}` |
| `pwIp` | `{a:[Inpatient], c:nextId}` |
| `petworld.dropdowns.v1`, `petworld.ddextra.v1` | Dropdown configuration objects for the patient record form (vet names, routes, frequencies, custom fields). Edited inside Patients today. |
| `pwPendingBills` | `[{src:'inpatient', pet, owner, reg, item, amount, at}]` — WRITTEN by Patients, CONSUMED (and removed) by Finance billing |

**Pet** (main fields): `id` ('PD-0001'), `name`, `species`, `breed`, `sex`, `repro`, `color`, `weight`, `dob`, `ageNum`, `ageUnit`, `chip`, `owner` (name), `ownerId` ('OD-0001'), `phone`, `telegram`, `email`, `address`, `pstatus` ('Active'…), `alerts:[]`, `photo?`, `labs?`, `imaging?`, `referrals?`, `visits:[Visit]`.
**Visit**: `{id, f:{date, cc, dx, follow, remSent, sent, notes}, sel:{doctor:{v}}, exam:[{k, v|t, s}], tx:[{type:'inj'|'oral', drug, ml|dose, unit, freq, times, route…}]}`
**Owner**: `{id:'OD-0001', name, phone, telegram, email, address}`
**Appt**: `{id, pet, owner, date, time, type, doctor, status, phone}`
**Inpatient**: `{id, reg, pet, owner, emoji, doctor, cage, reason, admitAt, dailyFee, status:'Admitted'|'Discharged', notes:[], dischargeAt, dischargeNote}`

Read by: Dashboard, Report (read-only); Owner view of Patients (own pets only, read-only). Communication reads Owner/Pet contact fields ONLY when the project owner approves it. Services must not read any of it.

## C. Finance & Inventory (owner: finance.html — DONE)
| Key | Shape |
|---|---|
| `pwInventory` | `{a:[Item], c:nextId}` — Item: `{id,name,cat,sold,price,cost,sku,barcode,track,qty,min,unit,batches:[{no,exp,qty,cost}],demo?,fav,color,shape,note}` |
| `pwTx` | `[Receipt]` newest first — Receipt: `{id,date,time,receiptNo,patient,pname,pid,species,dx,treatment,items,itemsFull:[{name,price,qty,cat,inv,bt}],payment,payments:[{m,amt}],owner,cogs,cashier,note,subtotal,discount,total,month,refunded,isRefund?}` |
| `pwExpenses` | `{a:[Expense], c}` — Expense: `{id,ref:'EX-0001',date,cat,desc,vendor,amount,pm,paidBy,payments:[{date,amt,pm,note}],status:'Paid'|'Partial'|'Unpaid',…}` |
| `pwGoodsReceipts` | `{a:[GR], c}` — GR: `{id,no,date,purchaseDate,supplier,invoice,lines,subtotal,discount,delivery,total,paid,payMethod,payments:[…],status,…}` |
| `pwStockLedger` | `[{at,type,item,itemId,batch,inQ,outQ,bal,ref,note}]` |
| `pwAuditLog` | `[…]` append-only audit entries |
| `pwFinanceSettings` | `{pay, pm:[[id,label]…], cats, sup, cashier, vs, showPat, showDx, showDisc, split, fav, …}` — Finance's own working settings |
| `pwInventoryBackup`, `pwBatchMigBackup`, `pwRestoreMsg`, `pwAtt:<id>` (+ IndexedDB) | Internal backups / attachments. Nobody else touches these. |

Read by: Dashboard, Report (read-only). Report must compute from `pwTx`, `pwExpenses`, `pwGoodsReceipts`, `pwInventory`, `pwStockLedger`; refunds have `isRefund` / `refunded` — handle both.

## D. Clinic-wide settings (owner: settings.html — NOT BUILT YET)
Finance already READS these three keys but nothing writes them yet. Settings must create and own them, with exactly these field names:
| Key | Shape |
|---|---|
| `pwClinic` | `{name, address, phone, …}` — used on receipts, vouchers and reports (`c.name`, `c.address`, `c.phone`) |
| `pwVoucher` | `{tagline, thanks, footer, …}` — receipt/voucher text (`v.tagline`, `v.thanks`, `v.footer`) |
| `pwCashiers` | `['Name', …]` (strings; objects with `.name` are also tolerated) |
Until Settings exists, every module must work with these keys empty.

Settings may add more keys (users/roles, branches, backup/restore, module on/off). It must ask before changing anything Patients or Finance own: it may LINK to their screens or write values through the keys above, but must not rewrite their data shapes.

## D2. Owner access rules (apply to every module that renders an owner view)
- An owner may only read Pets whose `ownerId` equals `SESSION.ownerId`, and Appointments whose pet belongs to those pets (match by pet name + owner name until appointments get a `petId`; Patients module will add `petId`/`ownerId` to new appointments).
- Owner never gets write access to `petworld.records.v1`, `pwAppts`, `pwIp`, Finance keys.
- Owner-only settings live in new keys owned by Settings:
  | Key | Shape |
  |---|---|
  | `pwOwnerPrefs` | `{ 'OD-0001': {channel:'app'|'gmail', notify:{vaccine:true, followup:true, appointment:true}, lang:'en'} }` |
  | `pwOwnerRequests` | `{a:[{id, ownerId, type:'contact-change', data:{…}, at, status:'new'|'done'}], c}` — owner asks for contact changes; staff applies them in Patients |

## E. New modules — keys to create (prefix `pw`)
| Module | Suggested keys (document final names in your reply) |
|---|---|
| Services | `pwServices` `{a:[…], c}` (service name, category, fee, description, active). Owners read it; staff edit. |
| Communication | `pwComReminders`, `pwComMessages`, `pwComAnnouncements`, `pwComFaq`, `pwComQA`, `pwComHistory` (each `{a:[…], c}`), plus `pwComSettings` and `pwComSummary` (single objects). Items addressed to one owner carry `ownerId`; items for everyone have `ownerId:`. Owners see only their own + everyone's. |
| SOP | `pwSop` `{a:[…], c}` (category, title, steps, version, updated) |
| Report | none (read-only). Optional saved filters: `pwReportPrefs` |
| Settings | `pwClinic`, `pwVoucher`, `pwCashiers`, `pwSession`, `pwRolePerms`, `pwOwnerPrefs`, `pwOwnerRequests`, plus `pwUsers`, `pwBranches`, `pwSettings` |
| Dashboard | none (read-only). |

## F. Known inconsistencies in the finished files (do not "fix" in your module)
- Patients uses older key names (`petworld.*`) while everything else uses `pw*`. Leave as is; use the names exactly as written above.
- Patients and Finance both define their own storage helper copies; Patients currently has no PW-SHARED markers. The project owner will align that separately.


## Communication read-only access and Patients link fields (approved)
Communication reads, and never writes: `petworld.records.v1` (`pets`, `owners`), `pwAppts`, `pwSession`.
- Pet: `id, name, species, owner, ownerId, email, archived, vax, dw, hw, co, visits`. Owner: `id, name, email`.
- Service rows (`vax/dw/hw/co`): `id, date, next, fulfils`; `against` for vaccinations.
- Visits: `id, followOf, apptId, f.date, f.follow, f.cc`.
- Appointments (`pwAppts.a[]`): `id, petId, ownerId, date, status, type` (`pet`, `owner` names display-only).

Explicit link fields that Patients must write (Communication never guesses completion):
| Where | Field | Rule |
|---|---|---|
| service row (`vax/dw/hw/co`) | `fulfils: '<source row id>'` | Same pet, same list, dated strictly after the source row, not in the future. Vaccination: same `against` as the source |
| visit | `followOf: '<source visit id>'` | Same pet, dated strictly after the source visit |
| visit | `apptId: <appointment id>` | Same pet, dated on/after the appointment date |
| appointment | `petId`, optional `ownerId` | Exact Pet ID; names are never used for matching. `status:'Done'` alone never completes a reminder |
