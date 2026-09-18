# Elastic M-26-14 Reference Architecture (viewer)

React + Vite static site. `npm install`, `npm run dev` to work locally, `npm run build` to produce `dist/`.
Vercel builds from `main` with the default command; `vercel.json` rewrites every path to `index.html`.

## Build flags

| Variable | Effect |
|---|---|
| `VITE_ENABLEMENT=on` | Mounts the internal field-enablement pages (`/enablement`, `/enablement/sales`, `/enablement/sa`) and turns the header logo into their entry point. Off by default, so the deployed customer build ships no route to them (design call DC-8, LRA change review). Set it for an internal deploy or a local `npm run dev`; never in the Vercel production environment. |

Vite inlines the value at build time; the pages are absent from the bundle's route table, not hidden behind a redirect.
