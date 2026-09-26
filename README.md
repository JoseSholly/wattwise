# Watt Wise

A thin React client over the [Inverter Power Project](https://github.com/JoseSholly/Inverter_power_project)
Django API. It collects an appliance list, sends it to the API, and renders what
comes back. None of the sizing maths lives here.

## Status

UI scaffold only. The API layer is **not** written yet — `src/api/` does not
exist, and no endpoint has been called. Submitting the form currently fails with
an explicit "API client is not wired up yet" error, which is what the error state
renders.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS v3 · react-hook-form + zod ·
TanStack Query · lucide-react. npm only, one `package-lock.json`.

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL
npm run dev
```

`VITE_API_BASE_URL` is the base URL of the Django API, no trailing slash. There
are no hardcoded URLs in the source.

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck (`tsc -b`) then production build
- `npm run lint` — oxlint
- `npm run preview` — serve the production build

## Layout

```
src/
  App.tsx                     one page: form + results section
  main.tsx                    QueryClientProvider
  components/
    ApplianceForm.tsx         useFieldArray list, add/remove rows
    Field.tsx                 labelled input with error + aria wiring
    states.tsx                EmptyState, LoadingState, ErrorState
  lib/
    applianceSchema.ts        zod schema (form-local field names)
```

### Field names

`src/lib/applianceSchema.ts` uses form-local names (`name`, `watts`, `quantity`,
`hoursPerDay`). They are placeholders — they get renamed to match the DRF
serializers when `src/api/` is written. Nothing here was derived from the API.

### States

- **Empty** — before any submit.
- **Loading** — counts elapsed seconds and, after 5s, explains that the free host
  cold-starts and can take 30–60s. Deliberately not a bare spinner.
- **Error** — `ErrorState` takes a top-level `message` plus an optional
  `fieldErrors` record rendered verbatim, so DRF's own validation messages are
  shown rather than replaced.
#watt-wise
