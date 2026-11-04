# Setting up the RSVP back end

The guest list and RSVPs live in a private Google Sheet. A small script inside
that Sheet (`Code.gs`) answers the website's questions: "does this name match a
guest?", "is this the wedding passcode?", "save this RSVP." This takes about
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

**Set your own passcode** in the Settings tab (the sample is CELEBRATE). Every
guest uses the same passcode, printed on the invitations.

"Anyone" means the website can reach the script, not that anyone can see your
Sheet. The script only hands out one party's details at a time, and only with
the right name and passcode. Anyone with the passcode can look up any guest
by name (like Zola). Saved emails and phones are only sent back partly hidden
(p•••h@gmail.com, •••-•••-1234), and saved notes never are.

## The tabs

**You fill in:**

| Tab | One row per… | What goes in it |
|---|---|---|
| **Settings** | setting | `site_passcode`: the wedding passcode guests type. Changing it logs everyone out. |
| **Guests** | person | See below. |
| **Events** | event | `event_id` (short, no spaces), `name`, `date` (like `April 10`), `time_of_day`. Their order is the order guests see. Times, places, and attire shown on the website come from `src/data/events.js`. |

**The Guests tab** (hover over a column title in the Sheet to see these too):

| Column | What goes in it |
|---|---|
| `first_name`, `last_name` | Their name, as they'd type it to find their invitation. |
| `household` | **Blank** if they're invited on their own. For a family or couple, give everyone the **exact same** household name (like `Shah family`); they become one invitation, and any of them can RSVP for everyone. Guests only see this name if two guests share the same name (to pick the right invitation), so keep it friendly. If two people invited on their own share a name, give each a household name so they can tell them apart. |
| `side`, `group` | **Private**, for you: e.g. `Bride` / `Groom`, `Mom's side`, `College friends`. Never sent to the website. |
| one checkbox per event (`ceremony`, `sangeet`, `indian-wedding`, `reception`) | Check each event they're invited to. They'll only see and RSVP for those, and the dates at the top of the site match (e.g. just "April 10, 2027"). Typing `x` or `yes` works too. |
| `plus_one` | Check if they may bring a guest: their RSVP gets a "Your guest" spot. |
| `guest_id` | Filled in automatically (G001, G002, …). Don't change it. |

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
| **All Guests** | One row per guest (and per plus-one spot), including those who haven't answered: household, side, group, `yes` / `no` / `waiting` per event (`—` = not invited), dietary needs, email, phone, mailing address (all in one cell, e.g. `123 Main St, Apt 4, Dallas, TX 75201`), note. Use **Data → Create a filter** (already on) to show e.g. only the bride's side; the filter stays when the tab refreshes. |
| **RSVPs** | The saved answers, one row per guest, including the invitation's mailing address: in one cell (`address`) and in parts (`address_street`, `address_apt`, `address_city`, `address_state`, `address_zip`, `address_country`), handy for printing address labels. |
| **Party Responses** | When each invitation last saved. |
| **Change Log** | Every submission, timestamped, so changed answers are never lost. |

## Moving from the old guest list (one time)

Older versions of this Sheet had a Parties tab and party ids. After pasting
the new script, reload the Sheet and use **Wedding RSVP → Switch to the new
guest list (one time)**. Your old Guests, Parties, RSVPs, and Party Responses
tabs are renamed "Old …" (nothing is deleted), and a new Guests tab with
sample guests is created. The passcode and events stay as they are.

## Changing the script later

Edits to `Code.gs` don't go live until you publish a new version:
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**
The web app URL stays the same.

## Before going live

- Replace the sample guests in the Guests tab with your real guest list.
- Delete any test answers from RSVPs, Party Responses, and Change Log, then use
  **Wedding RSVP → Refresh Summary and All Guests**.
- Delete the "Old …" tabs once you don't need them.
