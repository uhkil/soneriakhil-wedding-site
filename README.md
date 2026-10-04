# Soneri & Akhil Wedding Site

A React website for our wedding. Currently at **Milestone 1**: a wireframe-level static site.

## Running it locally

You need [Node.js](https://nodejs.org) installed.

```bash
npm install     # first time only: downloads the packages the site needs
npm run dev     # starts the site at http://localhost:5173
```

Edits to files in `src/` show up in the browser automatically. Press `Ctrl+C` in the terminal to stop.

## How the code is organized

```
index.html              The single HTML page React draws into
src/
  main.jsx              Starting point: loads App into the page
  App.jsx               Nav bar + all sections, top to bottom
  index.css             Styles (colors & fonts are defined at the top)
  components/           Reusable pieces
    NavBar.jsx            Pinned nav: row of links on big screens, ☰ menu on phones
    Section.jsx           Shared wrapper: full-screen height + background for each section
    ImagePlaceholder.jsx  Gray box standing in for a photo
    EventBlock.jsx        One event's details, in its own box
  sections/             One file per section of the page, in order
    HomeSection.jsx       #home
    OurStorySection.jsx   #story     (text + photos per moment)
    MemoriesSection.jsx   #memories  (film strip / camera toggle)
    EventsSection.jsx     #events    (timeline; can show only a guest's events)
    TravelSection.jsx     #travel
    RegistrySection.jsx   #registry
    FaqSection.jsx        #faq       (click a question to open its answer)
    RsvpSection.jsx       #rsvp      (placeholder until Milestone 2)
  data/
    events.js           The 4 events: edit names, times, locations here
```

## Milestones

1. **Wireframe static site** (current)
2. **Guest-specific RSVP**: guests look up their name, then RSVP only to the events they're invited to
