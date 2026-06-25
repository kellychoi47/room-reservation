# ReserveFlow — Room Reservation System

ReserveFlow is a production-oriented internal room reservation application for schools, churches, community organizations, or offices. It has role-aware navigation, atomic double-booking protection, email notifications, a responsive React interface, and a safe public portfolio demo mode.

## Public demo

- Production site: https://reserveroom.netlify.app/
- Public demo route: https://reserveroom.netlify.app/demo
- Sign-in route for the live authenticated app: https://reserveroom.netlify.app/login

Portfolio visitors can click **Explore Demo** from the login screen or visit `/demo` directly. Demo mode uses seeded browser-side data and localStorage only. Demo-created reservations are labeled as simulated and never call the Express API, send email, create users, access administrator data, or write to Supabase.

## Architecture

- `client/` — React 18 + Vite single-page application
- `client/src/demo/` — isolated seeded demo data and localStorage-backed demo state
- `server/` — Express API that validates requests, verifies Supabase access tokens, sends email, and uses a service-role connection only on the server
- `supabase/migrations/` — PostgreSQL schema, row-level security, indexes, seed rooms, and database-level overlap constraint

The application has two separate experiences:

- Authenticated production workspace routes (`/`, `/rooms`, `/calendar`, `/map`, `/admin`) use Supabase Auth and the Express API.
- Public portfolio routes (`/demo/*`) use only local browser state and cannot access or mutate live production records.

## Local setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).
3. Create at least one user in **Authentication → Users**. Its profile is created automatically. Promote an administrator with:

   ```sql
   update public.profiles set role = 'admin' where email = 'admin@yourdomain.org';
   ```

4. Copy environment templates and add values:

   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

5. Install and run:

   ```bash
   npm install
   npm run install:all
   npm run dev
   ```

   The web client runs at `http://localhost:5173`; the API runs at `http://localhost:4000`.

## Email

Email delivery is optional in local development. Add a verified sender and `RESEND_API_KEY` to the server environment to enable confirmations and cancellations. If the key is absent, reservations still work and delivery is skipped.

## Security model

- Supabase Auth manages identity; the browser only gets the anonymous key.
- Express validates the bearer token server-side and looks up the profile role.
- The Supabase service role key is never exposed to the client.
- PostgreSQL uses an exclusion constraint on `(room_id, time range)` for confirmed bookings. This is the final authority that prevents race-condition double bookings.
- RLS protects direct database reads; API routes enforce owner/admin actions.

## Deployment

The production client is configured for Netlify in [`netlify.toml`](netlify.toml):

```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The same SPA fallback also exists in `client/public/_redirects`, so refreshing React routes such as `/demo/rooms` or `/calendar` serves `index.html`.

Deploy `client` to Netlify using:

- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `dist`

Deploy `server` to a persistent public host such as Render or Railway using `npm start`. Netlify only hosts the static Vite app; it does not run the Express API.

Set these production values:

- Netlify client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL=https://your-api-host.example.com/api`
- Backend host: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_ORIGIN=https://reserveroom.netlify.app`, optional `RESEND_API_KEY`, and optional `EMAIL_FROM`

Add `https://reserveroom.netlify.app` to Supabase Auth Site URL / redirect URLs, and configure CORS with the exact deployed client origin. Server-only secrets, especially the Supabase service-role key and email provider keys, must remain only on the backend host.

The API exposes health checks at:

- `/health`
- `/api/health`

Use one of those URLs to confirm the backend is awake before testing authenticated production routes.

## Loading and production troubleshooting

The authenticated app needs all of the following in production:

- Netlify has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Netlify has `VITE_API_URL` pointing to the deployed Express API and ending with `/api`.
- The Express API is deployed to a persistent public host.
- Backend `CLIENT_ORIGIN` exactly matches `https://reserveroom.netlify.app`.
- Supabase Auth redirect URLs include `https://reserveroom.netlify.app`.
- Supabase RLS policies allow authenticated users to read their own profile row.

If Supabase or the API cannot be reached, the UI now times out and shows a clear workspace loading error with a Retry button instead of staying on “Loading workspace...” forever.

## Operational notes

The included seed data provides representative spaces. The public demo is intentionally simulated; real account creation, administrator changes, email notifications, and database writes remain available only through authenticated production flows.
