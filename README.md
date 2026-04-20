# Gantt Studio

A modern, editable Gantt chart web app — inspired by the release schedule on
[ubuntu.com/desktop/developers](https://ubuntu.com/desktop/developers). Built with
React + Vite. All data is persisted to `localStorage` in your browser.

## Features

- **Flexible columns** — labels can be months, sprints, phases, or anything else.
- **Flexible rows** — a row is just a label with a start column, end column,
  color, and optional note.
- **Modal input** — add / edit rows and columns through a focused modal UI.
- **Live auto-save** — writes to `localStorage` as you type, with a
  "Saving… / Saved" indicator in the top bar.
- **Ubuntu-inspired design** — Ubuntu orange accent, Ubuntu font, soft shadows,
  zebra rows, diagonal-stripe empty cells.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Storage

Data lives at the `ubuntu-gantt-v1` key in `localStorage`. Click **Reset** in the
top bar to restore the example Ubuntu release timeline.
