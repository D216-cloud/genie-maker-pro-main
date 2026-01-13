# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Google OAuth setup ✅

If you want to enable "Continue with Google" sign-in:

1. Create OAuth credentials in Google Cloud Console:
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`

2. In your Supabase project dashboard → Authentication → Settings → External OAuth Providers, paste the Google Client ID and Client Secret.

3. Create a local `.env` from `.env.example` and fill in real values (do NOT commit secrets):
   - Copy the example: `cp .env.example .env` (on Windows: `copy .env.example .env`)
   - Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `CLIENT_URL` (e.g., `http://localhost:8080`)
   - Optionally `VITE_GOOGLE_CLIENT_ID` for client-side use.
   - **Security note:** If a secret was ever committed, rotate it immediately (Supabase service keys, Instagram tokens) and remove it from repository history using tools like the BFG Repo-Cleaner or `git filter-repo`. Do not push the rotated secret to a public repo.

- **Secret scanning:** This repository runs an automated secret-scan (Gitleaks) on pushes and pull requests to catch accidental secrets before merging.

## Supabase Edge Function: Instagram auth (setup)

If you use the included `instagram-auth` edge function (used during Instagram OAuth):

1. Add required secrets to your Supabase project (do NOT commit them to git):

```sh
supabase secrets set INSTAGRAM_APP_ID=your_app_id
supabase secrets set INSTAGRAM_APP_SECRET=your_app_secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Deploy the function and (if you want it public to allow browser calls) disable JWT enforcement when deploying:

```sh
supabase functions deploy instagram-auth --no-verify-jwt
```

3. Alternatively, call the function from a server using the service role key header `x-service-role-key: <SERVICE_ROLE_KEY>` for server-to-server requests.

4. Test the function from your browser or curl with either an Authorization header (logged-in user) or the `x-service-role-key` header:

```sh
curl -v -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_JWT>" \
  -d '{"action":"exchange-token","code":"<CODE>","redirectUri":"https://your.app/callback"}' \
  https://<your-project>.supabase.co/functions/v1/instagram-auth

# Or server-to-server
curl -v -X POST \
  -H "Content-Type: application/json" \
  -H "x-service-role-key: <SERVICE_ROLE_KEY>" \
  -d '{"action":"exchange-token","code":"<CODE>","redirectUri":"https://your.app/callback"}' \
  https://<your-project>.supabase.co/functions/v1/instagram-auth
```

If you previously committed secrets, rotate them immediately and purge history (BFG or `git filter-repo`).

4. Restart the dev server and open `http://localhost:5173` → Sign In → "Continue with Google".

> Note: Supabase handles the OAuth redirect. If you see an error, confirm the redirect URI in Google Cloud Console matches the Supabase callback URL.
