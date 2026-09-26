# Watt Wise

A thin React client over the [Inverter Power Project](https://github.com/JoseSholly/Inverter_power_project)
API (django-bolt, hosted on Render). You pick appliances, and it sends them to the API and shows
the inverter, battery bank, solar array and charge controller sizing that comes back. None of the
sizing maths lives here.

- API: https://watt-wise-2cfq.onrender.com (docs at `/api/docs`)
- App: https://wattwise-rho.vercel.app

## Pages

There is no landing page. `/` redirects to `/v1`.

| Route | Endpoint | Inputs |
|---|---|---|
| `/v1` | `POST /api/v1/power_calculator/calculate/` | One backup time (1–24 h) for every appliance. Standard sizes only: 12/24/48 V, 150/200/220/250 Ah batteries, 300/350/400/450 W panels. Whole watts. |
| `/v2` | `POST /api/v2/power_calculator/calculate/` | A backup time for each appliance. Any system voltage that is a multiple of 12 (up to 240 V), batteries 1–5,000 Ah, panels 1–1,000 W. |

Appliances are sent by ID. The picker is filled from
`GET /api/v2/power_calculator/appliances/`, and v1 and v2 serve the same list. That request
fires when a page loads, so it also wakes the Render instance before you submit.

Both versions use the same sizing model. The only difference is how daily energy is worked out:
v1 uses `total load × backup time`, and v2 uses `Σ watts × qty × hours`. With the same hours for
every appliance, v1 and v2 give the same results.

## Setup

```bash
npm install
npm run dev
```

`VITE_API_BASE_URL` sets the API base URL, with no trailing slash. It defaults to the Render URL
when unset, so no `.env` is needed. For a local API, set it in `.env.local`.

The API has to allow the site's origin through CORS. On Render, `CORS_ALLOWED_ORIGINS` must
include `https://wattwise-rho.vercel.app`, and `http://localhost:5173` for local development.

## Scripts

- `npm run dev`: dev server
- `npm run build`: typecheck (`tsc -b`), then production build
- `npm run lint`: oxlint
- `npm run preview`: serve the production build

`vercel.json` rewrites every path to `index.html`, so `/v1` and `/v2` work when loaded directly.

## Layout

```
src/
  main.tsx                    QueryClient + router (/v1, /v2, everything else → /v1)
  api/
    client.ts                 fetch wrapper, ApiError (status, message, 422 issues)
    types.ts                  request/response types mirroring the API's msgspec schemas
    appliances.ts             useAppliances() — cached for the session
    calculate.ts              calculateV1 / calculateV2
  lib/
    schemas.ts                zod schemas with the same limits as the API
    serverErrors.ts           maps a 422 `loc` to a form field path
    useCalculation.ts         mutation + puts API errors on the matching fields
  pages/
    V1Page.tsx, V2Page.tsx
  components/
    Layout.tsx                header + version tabs
    CalculatorLayout.tsx      form / results two-column shell
    ItemsTable.tsx            appliance rows (useFieldArray); hours column for v2
    Results.tsx               sizing summary + per-appliance energy table
    Field.tsx                 labelled input / select with error wiring
    states.tsx                empty, loading (elapsed seconds, cold-start note), error
```

## Errors

The form checks input against the same limits as the API before sending anything. If the API
still returns a 422, each issue's `loc` (for example `["body","items","1","id"]`) is mapped onto
the field it names. Issues that can't be placed on a field, and non-422 errors, appear in the
results panel.
