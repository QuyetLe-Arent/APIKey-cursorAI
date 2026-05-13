This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API key manager (local setup)

1. Copy `.env.example` to `.env.local` and fill in values (do not commit `.env.local`).
2. **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — run the SQL in `supabase/migrations/` on your project, then add keys from **Project Settings → API Keys**.
3. **Auth (Google):** `AUTH_SECRET`, `AUTH_URL` (e.g. `http://localhost:3000`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — OAuth redirect URI must include `http://localhost:3000/api/auth/callback/google`.
4. Sign in, open **`/keys`** to create and manage keys.

**Rate limiting:** `POST/GET /api/keys` and `PATCH/DELETE /api/keys/[id]` use an **in-memory** fixed window per user (fine for dev/small deploys). For production at scale, prefer **Upstash Redis** (or similar) shared across instances.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
