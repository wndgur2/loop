# Loop — Screen Designs (Demo)

Hi-fi screen designs for **Loop**, recreated from the Claude Design handoff
bundle (`Loop Screen Designs.html`). These are static, interactive-looking
mockups — a reference for what the real Expo app should look like, not the app
itself.

The design direction: **Wanted foundations, softened.** A single warm
clay/honey accent (no second color), a warm-tinted canvas, generous breathing
room, calmer rounded-stroke icons, and a subtle loop motif (the ring = your
internalization rate). English copy, a "warm mentor" voice. Importance shows as
quiet dots; an internalized loop gets a soft green check.

## What's here

11 screens across 4 sections, each with variations to compare side-by-side:

- **Feedback home** — A·Calm cards · B·Quiet list (crisp) · C·Warm hero
- **Chat with Loopi** — A·Warm bubbles + quick replies · B·Draft emerging with
  confirm-chips (the canonical template fills in live) · C·Quiet journal
- **Feedback detail** — open loop vs closed (internalized) loop: full template +
  takeaway checklist
- **Retrospective** — A·Stacked recommendation types · B·Single hero + chips ·
  C·Reflection-in-progress with the "confirm before commit" pattern

The **confirm-chip commit pattern** (no silent state changes) shows up in
chat-B and retro-C — that's the spec's sensitive-data rule made visible.

## Run it

The screens are compiled in the browser with Babel standalone, so the `.jsx`
files are fetched over XHR — open it through a local server, not `file://`:

```bash
# from the repo root
npx serve demo
# or
python3 -m http.server -d demo 8080
```

Then open the printed URL (e.g. http://localhost:8080).

## Files

| File | Role |
|------|------|
| `index.html` | Entry point — loads React + Babel + the screens + gallery |
| `gallery.jsx` | Clean sectioned gallery shell (replaces the design tool's pan/zoom canvas) |
| `app.jsx` | Assembles every screen into the gallery |
| `screens/loop-kit.jsx` | Shared kit — phone frame, status/tab bars, icons, sample data |
| `screens/home.jsx` · `chat.jsx` · `detail.jsx` · `retro.jsx` | The screens |
| `loop.css` | Loop's warm token layer on top of the Wanted system |
| `loop-icons.js` | Calm rounded-stroke icon set |
| `assets/colors_and_type.css` | Wanted Design System color & type foundations |

> The `screens/*` components and `loop.css` / `loop-icons.js` are the original
> design output, kept verbatim. Only the gallery shell (`gallery.jsx`,
> `app.jsx`, `index.html`) was written to present them as a clean demo. When the
> real screens are built in Expo/React Native, match this visual output.
