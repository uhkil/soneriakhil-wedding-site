# Setting up the RSVP back end

The guest list and RSVPs live in a private Google Sheet. A small script inside
that Sheet (`Code.gs`) answers the website's questions: "does this name match a
guest?", "is this their passcode?", "save this RSVP." This takes about
15 minutes, once.

## 1. Create the Sheet

1. Go to [sheets.new](https://sheets.new) (signed in to the Google account that
   should own the guest list).
2. Name it something like **Wedding RSVPs**. Don't share it with anyone you
   wouldn't give the whole guest list to.

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**. A code editor opens in a new tab.
2. Delete everything in the editor (the sample `function myFunction() {}`).
3. Open `apps-script/Code.gs` from this project, copy **all** of it, and paste it
   into the editor.
4. Click the 💾 **Save** icon. Name the project **Wedding RSVP** if asked.

## 3. Run setup (creates the tabs)

1. At the top of the editor, find the dropdown next to **▶ Run** and **Debug**.
   Choose **setup**, then click **▶ Run**.
2. Google asks for permission the first time:
   **Review permissions → pick your account → Advanced → Go to Wedding RSVP
   (unsafe) → Allow.** ("Unsafe" just means Google hasn't reviewed this script,
   because it's your own private one. It only gets access to this Sheet.)
3. The log at the bottom should say **Setup done.** Switch back to the Sheet
   tab: you'll now have the tabs below, with **sample** guests in Guests.

## 4. Test it

1. Back in the editor, choose **tryItOut** in the dropdown and click **▶ Run**.
2. The log should show two "Priya Shah" matches, then **Shah family** with
   all four events, then **That passcode doesn't match** for a wrong code.

## 5. Publish it as a web app

1. Click **Deploy → New deployment**.
2. Click the ⚙️ gear next to "Select type" → **Web app**.
3. Set:
   - **Description:** RSVP v1
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, then copy the **Web app URL** (it ends in `/exec`).
5. Paste that URL somewhere and send it to me (Claude); the website needs it.
   Opening it in your browser should show `"RSVP service is running."`

**Passcodes: one per set of events.** The **Passcodes** tab (made by the
script) has a row for each different set of events in your Guests tab, e.g.
"all four events", "the last three", "Reception only", with a suggested word
in the `passcode` column. Type your own word over each. Everyone invited to
exactly those events uses that passcode; the `guests` column lists them, to
copy for your group text. Each must be different (a red cell means two match).

Each guest's passcode is also copied, in grey, into the `passcode` column at
the far right of the Guests tab. To give a household its own passcode (e.g. a
group chat of college friends), type over it there: it turns black and stays.
Clear it to go back to the automatic one. It can't be another group's passcode
(that would let them see other events), so the script puts the right one back.
Changing a household's passcode logs that household out.

"Anyone" means the website can reach the script, not that anyone can see your
Sheet. The script only hands out one party's details at a time, and only with
the right name and passcode. A passcode only opens invitations it was given to,
so a guest can look up someone else only if they were invited to the very same
events. Saved emails and phones are only sent back partly hidden
(p•••h@gmail.com, •••-•••-1234), and saved notes never are.

## The tabs

**You fill in:**

| Tab | One row per… | What goes in it |
|---|---|---|
| **Settings** | setting | Nothing needed now (the old `site_passcode` row isn't used any more; delete it). |
| **Passcodes** | set of events | Made by the script: one passcode per set of events (see above). Type your own words in `passcode`; leave `event_ids` alone. |
| **Guests** | person | See below. |
| **Events** | event | `event_id` (short, no spaces), `name`, `date` (like `April 10`), `time_of_day`. Their order is the order guests see. Times, places, and attire shown on the website come from `src/data/events.js`. |

**The Guests tab** (hover over a column title in the Sheet to see these too):

| Column | What goes in it |
|---|---|
| `first_name`, `last_name` | Their name, as they'd type it to find their invitation. |
| `household` | **Blank** if they're invited on their own. For a family or couple, give everyone the **exact same** household name (like `Shah family`); they become one invitation, and any of them can RSVP for everyone. Guests only see this name if two guests share the same name (to pick the right invitation), so keep it friendly. If two people invited on their own share a name, give each a household name so they can tell them apart. |
| `side`, `group`, `sub-group` | **Private**, for you: e.g. `Bride` / `Groom`, `Mom's side`, `College friends`, and a smaller group within it. Never sent to the website. |
| one checkbox per event (`ceremony`, `sangeet`, `indian-wedding`, `reception`) | Check each event they're invited to. They'll only see and RSVP for those, and the dates at the top of the site match (e.g. just "April 10, 2027"). Typing `x` or `yes` works too. |
| `plus_one` | Check if they may bring a guest: their RSVP gets a "Your guest" spot. |
| `guest_id` | Filled in automatically (G0001, G0002, …). Don't change it. |
| `soneri_bubble`, `akhil_bubble` | Optional: what Soneri and Akhil say in the speech bubbles on the Home page to whoever logs in with this row. Two short lines, about 20 characters each; `/` picks the line break. Blank = the usual words. Hover over the title for tips. |
| `passcode` | Far right. Filled in automatically (grey) from the Passcodes tab. Type over it to give this household its own passcode (black). |

Any column you add yourself (address, table number, "save the date sent", …)
is private too: the script only sends names and events to the website.

Pasting from another spreadsheet: paste the names (and household, side,
group) into their columns, then check the event boxes. IDs fill themselves in.

**The script fills in** (don't edit these by hand; they're rebuilt about a
minute after each RSVP, or right away via **Wedding RSVP → Refresh Summary and
All Guests**):

| Tab | What's in it |
|---|---|
| **Summary** | Headcount per event (invited / yes / no / waiting); **copy-ready lists** of all emails, all phone numbers, and the emails and phones of guests who are coming (one cell each, comma-separated, each only once); and which invitations haven't answered yet. |
| **All Guests** | One row per guest (and per plus-one spot), including those who haven't answered: household, side, group, sub-group, `yes` / `no` / `waiting` per event (`—` = not invited), dietary restrictions, email, phone, mailing address (all in one cell, e.g. `123 Main St, Apt 4, Dallas, TX 75201`), note. Use **Data → Create a filter** (already on) to show e.g. only the bride's side; the filter stays when the tab refreshes. |
| **RSVPs** | The saved answers, one row per guest, including the invitation's mailing address: in one cell (`address`) and in parts (`address_street`, `address_apt`, `address_city`, `address_state`, `address_zip`, `address_country`), handy for printing address labels. |
| **Party Responses** | When each invitation last saved. |
| **Change Log** | Every submission, timestamped, so changed answers are never lost. |

## Moving from the old guest list (one time)

Older versions of this Sheet had a Parties tab and party ids. After pasting
the new script, reload the Sheet and use **Wedding RSVP → Switch to the new
guest list (one time)**. Your old Guests, Parties, RSVPs, and Party Responses
tabs are renamed "Old …" (nothing is deleted), and a new Guests tab with
sample guests is created. The events stay as they are.

## Changing the script later

Edits to `Code.gs` don't go live until you publish a new version:
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**
The web app URL stays the same.

## Speed-ups (one time)

Use **Wedding RSVP → Turn on speed-ups (one time)** in the Sheet (reload the
Sheet first if the menu item isn't there). Google asks for permission the
first time: allow it as in step 3. This turns on two things:

- **Every 10 minutes**, the script reads the guest list fresh and keeps it in
  memory, so the website answers quickly even after a quiet spell.
- **Adding or deleting rows or columns** in the Sheet shows up on the website
  right away (ordinary edits already do).

To check it's on: in the script editor, the ⏰ **Triggers** page (left side)
lists `keepWarm` and `onSheetChange`. Running it again is safe.

## Importing guests from your original guest list

**Wedding RSVP → Guest import** copies guests in from the **Wedding Guests Master** tab
of your original guest list. It asks for that sheet's link each time (leave it blank to
reuse the last one). The titles row is the one with "Invite Status" in column G.

| Original list | → Guests tab |
|---|---|
| A | side |
| B | group |
| C | sub-group |
| E (full name) | first_name + last_name: the **last word** is the last name, everything before it the first name |
| F | household |
| G (Invite Status) | invite_status |
| N (a 1) | grah-shanti **and** mehendi |
| O, P, Q, R, S (a 1) | haldi, ceremony, sangeet, indian-wedding, reception |
| T (titled **Guest ID**) | ← each guest's id is written back here (the import stops if T has another title) |
| "Passcode" column | ← each guest's passcode, copied from Guests by Guest ID (added once, between "Check this" and "Contacted"; blank = can't log in yet; updated by every Update and by 4. Refresh, so don't type in it) |
| "Check this" column | ← the script's notes on each row, so whoever owns a guest can fix it (added after your last column the first time; rewritten on every import, so don't type in it) |

under_age, drinks_alcohol and hotel_id aren't imported: fill them in in the Guests tab.

- **1. Preview (changes nothing):** fills the *Import Preview* tab and flags rows to check.
- **2. Fresh start (first time only):** saves "Backup …" copies of Guests, RSVPs, Party
  Responses, Change Log and Planner Event Answers, replaces everyone in Guests, clears saved
  RSVPs, starts ids over at G0001 and logs everyone out of the website. **Don't run it again**
  unless you mean to wipe every RSVP.
- **3. Update from guest list (every time after):** matches each guest by Guest ID, shows what
  will change, and on OK copies over every mapped field (names, side, group, sub-group,
  household, status, events). New rows get the next id; guests removed from the master become
  **XX: Not Invited**. Ids and RSVPs are kept.
- **4. Refresh "Check this" notes and passcodes:** rewrites only the notes and passcodes in the master (Update does this too). Use it after changing a passcode in the Passcodes or Guests tab.

**Add and remove guests only in the master**, then run Update: a guest typed straight into
Guests isn't in the master, so Update would set them to Not Invited. Don't rename column
titles in either sheet: the script finds columns by their titles.

### Who can log in, and what a family sees

Only guests invited to at least one website event (Civil Ceremony, Welcome Night / Sangeet,
Indian Wedding, Reception) are on the website. One login opens the whole household: the
schedule and dates show every event anyone in the family is invited to, and each RSVP card
lists only the people invited to that event.

| Person in a family | Can they log in? | Does the family see them after logging in? |
|---|---|---|
| On the Backup List (X) or Not Invited (XX) | No. Their name can't be found. | No, they're hidden completely. |
| Invited to different events than the rest of the family | Yes, with the family passcode. | Yes, but only on the RSVP cards for their own events. |
| Status A or B, but no events ticked | No. Their name can't be found. | No, they're hidden completely. |
| Only planner events (Grah Shanti, Mehendi, Haldi) | No. Their name can't be found. | No, they're hidden completely. |

Hidden guests get no passcode and don't change the family's passcode. They're still in All
Guests (and the planner-event ones in Summary). Status **O: Invited, Won't Attend** and a
blank status count as invited, so they can log in.

Invite status: **X: Backup List** and **XX: Not Invited** rows turn light grey, show "—" in
All Guests, and aren't counted in Summary. Change the status in the master to A or B and run
Update to invite them. **Wedding RSVP → Update dropdowns and colors** refreshes the side /
group / sub-group dropdowns after you add a new value.

**Contacted** (has someone from the wedding party reached out?): a column titled
"Contacted" in your guest list, added by the first Update after your last column, with a
dropdown: **No** (grey), **Contacted** (yellow), **Followed up** (red), **RSVP'd** (green).
The parents pick from it there; blank counts as No. Each Update copies it into the Guests
tab's `contacted` column and the All Guests tab, and Summary counts each value, overall and by side.
Anyone who has RSVP'd on the website is set to **RSVP'd** on its own, in both sheets, and
that's never undone. It's private: never sent to the website. It's found by its title, so
the column can be moved.

Guests and All Guests are kept in the same order: invited first (backup list, then not
invited, at the bottom), then Soneri's side, then Akhil's, then household. **Wedding RSVP →
Sort guests and refresh Summary and All Guests** re-sorts; filters keep working.

Planning columns (private, never sent to the website; added on their own after
plus_one when the Sheet opens): **under_age** (checkbox), **drinks_alcohol** (Yes / No),
**hotel_id** (your own room label: give everyone sharing a room the same one, even across
households), **check_this** (the import's notes). All Guests shows them.

Planner-only events (**Grah Shanti, Mehendi, Haldi**): rows at the top of the Events tab with
**planner_only = yes** (added once, on their own). Each gets an invited checkbox in Guests
and a column in All Guests where you pick yes / no; those answers are kept in the
*Planner Event Answers* tab so a refresh never loses them. They never reach the website
and don't change the passcodes. Summary counts every event, overall and by side, with
how many of the yeses are under age or drink.

**Trial run first:** make copies of both sheets (File → Make a copy), paste the new code
into the copy's script, and import there. For a login test, deploy the copy as its own
web app and put its address in a `.env.local` file
(`VITE_TEST_RSVP_API_URL=https://…/exec`); `npm run dev` then uses it, while the live
site never does.

**After pasting new code:** if it changes what the website gets (logins, invitations), also
**Deploy → Manage deployments → ✏️ → New version**. Menu items use the saved code right away.

## Before going live

- Replace the sample guests in the Guests tab with your real guest list.
- Delete any test answers from RSVPs, Party Responses, and Change Log, then use
  **Wedding RSVP → Refresh Summary and All Guests**.
- Delete the "Old …" tabs once you don't need them.
