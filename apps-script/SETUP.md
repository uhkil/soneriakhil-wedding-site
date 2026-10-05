# Setting up the RSVP back end

The guest list and RSVPs live in a private Google Sheet. A small script inside
that Sheet (`Code.gs`) answers the website's questions: "does this name match a
guest?", "is this invitation code right?", "save this RSVP." This takes about
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
   tab: you'll now have five tabs filled with **sample** guests.

## 4. Test it

1. Back in the editor, choose **tryItOut** in the dropdown and click **▶ Run**.
2. The log should show two "Priya Shah" matches, then **The Shah Family** with
   all four events, then **That code doesn't match** for a wrong code.

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

"Anyone" means the website can reach the script, not that anyone can see your
Sheet. The script only ever hands out one party's details, and only after the
right invitation code.

## The tabs

**You fill in** (all plain text):

| Tab | One row per… | Columns |
|---|---|---|
| **Parties** | invitation / household | `party_id` (e.g. P001), `party_name` (shown to guests, e.g. "The Shah Family"), `invite_code` (printed on their invitation; case, spaces, and dashes are ignored), `invited_events` (event ids separated by commas), `notes` (just for you) |
| **Guests** | person | `guest_id` (e.g. G001), `party_id` (which invitation they're on), `first_name`, `last_name`, `invited_events` (leave blank to use the party's; fill in only if this person is invited to fewer events, e.g. kids) |
| **Events** | event | `event_id` (short, no spaces; must match the ids used above), `name`, `date`, `time_of_day`, `time`, `location`, `address`, `attire`, `description` |

**The script fills in** (don't edit these by hand while guests are RSVPing):

| Tab | One row per… | What's in it |
|---|---|---|
| **RSVPs** | guest who has responded | dietary notes, then a column per event with `yes` / `no` (blank = not invited) |
| **Party Responses** | party that has responded | email, phone, note / song request |

Tip: to count who's coming to an event, use a formula like
`=COUNTIF(RSVPs!H:H, "yes")` (pointing at that event's column).

## Changing the script later

Edits to `Code.gs` don't go live until you publish a new version:
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**
The web app URL stays the same.

## Before going live

- Delete the sample rows (the ones marked `sample`) and add your real guests.
- Make sure every `party_id` in Guests exists in Parties, and every event id in
  `invited_events` exists in Events.
