# RoyalTune - Royalty-Free Music Licensing Platform

RoyalTune is a complete, production-ready, royalty-free music website designed for content creators, web publishers, and media agencies. It features a high-performance React frontend, an edge-optimized Cloudflare Workers API, secure storage via Cloudflare R2, relational database tracking via Cloudflare D1, and payment collections powered by Stripe.

## Features

- **20 Free Downloads System**: Every registered user receives 20 free download credits. Downloads are tracked securely in the database. When the limit is reached, users are directed to pricing packages.
- **Auto-Generating Waveforms & Durations**: Admin upload panel decodes audio client-side using Web Audio API to calculate duration, generate visual peaks data, and compile sliced preview streams automatically.
- **Premium Sync Licensing**: Generates a cryptographically tracked License ID Certificate (.txt) for every download showing licensee name, track parameters, and copyright release permissions.
- **Sticky Audio Player**: Persistent bottom-aligned player supporting seek ranges, play queue lists, loop toggles, shuffle, volume, mute, and visual canvas buffers.
- **Advanced Filters**: Seamless faceted navigation filter panels for Genre, Moods, Instruments, Vocals, Tempo (BPM), and licensing models.
- **Instant Search**: Autocomplete autocomplete input suggestions fetching tracks instantaneously.
- **Stripe Subscriptions**: Seamless Monthly and Yearly plan subscriptions, with built-in development simulation flows.
- **Responsive Dark/Light System**: Glassmorphism cards and premium radial glow backdrops styled with Tailwind CSS variables.

---

## Directory Structure

```
├── migrations/                # D1 Database SQL schemas & updates
│   └── 0001_init.sql          # Core tables setup
├── backend/                   # Cloudflare Workers API
│   ├── src/
│   │   ├── index.ts           # Main Hono entry points
│   │   ├── auth.ts            # JWT, password & Google OAuth logins
│   │   ├── tracks.ts          # Search, filters & admin uploads
│   │   ├── downloads.ts       # Allowance checks & license generation
│   │   ├── stripe.ts          # Payment sessions & webhooks
│   │   ├── crypto.ts          # WebCrypto password hashing
│   │   └── types.ts           # System interfaces
│   ├── wrangler.toml          # Worker configs & R2/D1/KV bindings
│   └── package.json
└── frontend/                  # React Vite Client
    ├── src/
    │   ├── context/           # Global Audio and Auth providers
    │   ├── components/        # Player, Navbar, Footer, Cards
    │   ├── pages/             # Home, Browse, Dashboard, Admin, pricing
    │   ├── App.tsx            # Routes configurations
    │   └── main.tsx
    ├── public/                # robots.txt, sitemaps
    ├── tailwind.config.ts     # Styling adjustments
    └── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-cli/)
- A Stripe Account (for payment APIs)

---

### Step 1: Database Initialization

1. Log into your Cloudflare account using Wrangler:
   ```bash
   npx wrangler login
   ```

2. Create your D1 Database:
   ```bash
   npx wrangler d1 create royaltune-db
   ```
   *Copy the database ID from the output and paste it inside `backend/wrangler.toml` under `database_id`.*

3. Apply the initial schema migrations to the local and production databases:
   ```bash
   # Local dev database
   npx wrangler d1 migrations apply royaltune-db --local

   # Production database
   npx wrangler d1 migrations apply royaltune-db --remote
   ```

---

### Step 2: Storage (R2) & Cache (KV) Creation

1. Create the R2 Storage Bucket:
   ```bash
   npx wrangler r2 bucket create royaltune-bucket
   ```

2. Create the KV Cache Namespace:
   ```bash
   npx wrangler kv:namespace create ROYALTUNE_KV
   ```
   *Update the namespace ID bindings inside `backend/wrangler.toml`.*

---

### Step 3: Run Backend API Locally

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start the local server:
   ```bash
   npm run dev
   ```
   *Your API will start running on `http://localhost:8787`.*

---

### Step 4: Run Frontend Client Locally

1. Install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

2. Start the Vite server:
   ```bash
   npm run dev
   ```
   *Your client will launch on `http://localhost:5173`. Any API calls to `/api/*` are proxied to the Cloudflare Worker running on `localhost:8787`.*

---

## Deployment

Deploy the entire monorepo to Cloudflare Pages and Workers:

### Deploy Workers Backend
```bash
cd backend
npm run deploy
```

### Deploy Frontend Pages
Build the production assets:
```bash
cd ../frontend
npm run build
```
Deploy the generated `dist/` folder using Cloudflare Pages:
```bash
npx wrangler pages deploy dist --project-name=royaltune
```

---

## Licensing & Security

- **Signed Streams**: Original high-quality audio files are stored in a private R2 bucket. Access is secured by temporary JWT download signatures expiring in 15 minutes, preventing file link sharing.
- **Password Hashes**: Hashed with standard PBKDF2/SHA-256 Web Crypto API, safeguarding records without bloating Workers bundle sizes.
- **Admin Control**: Dashboard endpoints require verification of administrative payloads signed inside cookies/auth headers.
