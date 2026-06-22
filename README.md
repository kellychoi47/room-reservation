# ReserveFlow — Room Reservation System

ReserveFlow is a production-oriented internal room reservation application for schools, churches, community organizations, or offices. It has role-aware navigation, atomic double-booking protection, email notifications, and a responsive React interface.

## Architecture

- `client/` — React 18 + Vite single-page application
- `server/` — Express API that validates requests, verifies Supabase access tokens, sends email, and uses a service-role connection only on the server
- `supabase/migrations/` — PostgreSQL schema, row-level security, indexes, seed rooms, and database-level overlap constraint

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

Deploy `client` to Vercel, Netlify, or Cloudflare Pages using `npm run build` (publish directory: `dist`). Deploy `server` to Render, Railway, Fly.io, or a container host using `npm start`.

Set these production values:

- Client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL=https://api.yourdomain.org/api`
- Server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_ORIGIN=https://app.yourdomain.org`, `RESEND_API_KEY`, and `EMAIL_FROM`

Add the deployed client URL to Supabase Auth redirect URLs, and configure CORS with the exact deployed client origin. Database migrations should be run through the Supabase CLI or SQL Editor as part of release setup.

## Operational notes

The included seed data provides four representative spaces. Room management endpoints/UI can be extended behind the existing administrator role; the current administration view focuses on the high-risk daily workflow: visibility and cancellation of upcoming bookings.
