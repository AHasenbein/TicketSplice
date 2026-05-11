# Ticket Splice

Ticket Splice marketplace platform scaffold with modular API architecture.

## Quick start

1. Install dependencies:
   - `npm install`
2. Set env file for API:
   - `cp apps/api/.env.example apps/api/.env`
   - set a strong `JWT_SECRET`
3. Run API:
   - `npm run dev:api`
4. Run web app:
   - `npm run dev:web`

## Validation

- Run API linting:
  - `npm run -w @ticket-splice/api lint`
- Run auth smoke test (register + verify email + login + me):
  - `JWT_SECRET=your_long_local_secret npm run -w @ticket-splice/api test`
- Run web lint/build:
  - `npm run -w web lint`
  - `npm run -w web build`

## Frontend API configuration

- Set `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` if your API is not at `http://localhost:4000`.

## Auth configuration

- Email verification:
  - Configure SMTP settings in `apps/api/.env` for real email delivery.
  - Without SMTP, verification links are logged to the API console in development.
- Google OAuth (optional):
  - Configure `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REDIRECT_URI`.
  - Set redirect URI to `http://localhost:4000/api/v1/auth/oauth/google/callback` for local dev.

## Current status

- Modular TypeScript Express API bootstrapped in `apps/api`.
- Account system supports password confirmation, password policy checks, email verification links, and login session checks.
- OAuth login is wired and can be enabled with Google credentials.
- API expansion blueprint is documented in `docs/api-blueprint.md`.
