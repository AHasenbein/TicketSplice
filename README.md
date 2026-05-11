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

## Current status

- Modular TypeScript Express API bootstrapped in `apps/api`.
- Account system implemented with register/login/me endpoints.
- OAuth-ready provider model is in place (`password` now; `google`/`apple` planned).
- API expansion blueprint is documented in `docs/api-blueprint.md`.
