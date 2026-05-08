# NFC Dashboard

A Next.js dashboard for tracking nuclear fuel cycle sites, facilities, and documentation. Data is served from a Supabase backend.

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- npm v10 or later (should be installed with Node.js)
- Access to the project Supabase instance (URL + anon key)
- To check whether npm downloaded properly, run npm -v in your terminal. It will return a version number if it is installed properly.

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd "nfc_dash"
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install app dependencies

```bash
cd dash
npm install
cd ..
```

### 4. Configure environment variables

Create `dash/.env.local` with the following:

```env
# Required — Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Optional — MapTiler API key for production map tiles
# Without this the app falls back to public demo tiles
NEXT_PUBLIC_MAPTILER_KEY=<your-maptiler-key>
```

Get the Supabase URL and anon key from the project dashboard:
**Project Settings → API → Project URL / anon public**

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Windows note:** The dev script sets `NODE_OPTIONS=--max-old-space-size=4096` and `TOKIO_WORKER_THREADS=2` to work around Turbopack memory limits on Windows. If you see out-of-memory crashes, increase your system paging file size (Control Panel → System → Advanced → Performance → Virtual Memory).

## Project structure

```
NFC Site/
├── package.json          # Workspace root scripts (run npm run dev from here)
├── supabase/             # Supabase project config and migrations (root-level)
└── dash/             # Next.js app
    ├── src/
    │   ├── app/          # Next.js App Router pages
    │   ├── components/   # UI components
    │   └── lib/          # Supabase client, types, query functions
    └── supabase/
        ├── migrations/   # SQL schema migrations
        └── seeds/        # Seed data
```

## Database

The app uses Supabase (Postgres). To apply migrations and seed data to a duplicate project (do not run in native project):

```bash
# From dash/
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --include-seed
```

## Available scripts

All scripts should be run from the **workspace root** (`NFC Site/`):

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
