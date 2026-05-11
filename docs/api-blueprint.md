# Ticket Splice API Blueprint (MVP)

This document defines the modular API surface for the first build phase.

## Implemented now

### Auth and account
- `POST /api/v1/auth/register` - create account with email/password.
- `POST /api/v1/auth/login` - log in and receive JWT token.
- `GET /api/v1/auth/me` - get currently authenticated user from Bearer token.
- `GET /api/v1/auth/oauth/providers` - OAuth readiness endpoint (`google`, `apple`) with current enablement status.

## Next APIs to add (MVP order)

### Events
- `GET /api/v1/events` - browse events with city/date/category filters.
- `GET /api/v1/events/:eventId` - event details and aggregate listing count.
- `POST /api/v1/events` - admin/creator event creation.

### Listings
- `POST /api/v1/listings` - create a ticket listing.
- `GET /api/v1/listings` - search and filter listings.
- `GET /api/v1/listings/:listingId` - listing detail.
- `PATCH /api/v1/listings/:listingId` - edit listing owned by seller.
- `DELETE /api/v1/listings/:listingId` - remove listing.

### Ticket proof
- `POST /api/v1/listings/:listingId/proof` - upload ticket proof metadata/file reference.
- `GET /api/v1/listings/:listingId/proof-status` - read proof state for UI badges.

### Buyer and seller coordination
- `POST /api/v1/transactions` - create meetup/coordination thread for a listing.
- `PATCH /api/v1/transactions/:transactionId` - update status (`open`, `pending_meetup`, `completed`, `cancelled`).
- `POST /api/v1/transactions/:transactionId/messages` - direct buyer/seller message.

### Social
- `GET /api/v1/events/:eventId/comments` - load event discussion.
- `POST /api/v1/events/:eventId/comments` - add discussion comment.
- `GET /api/v1/events/:eventId/chat` - get event group chat history.
- `POST /api/v1/events/:eventId/chat/messages` - post group message.

### Seller dashboard
- `GET /api/v1/seller/dashboard` - views, chats, active listings.

### Monetization hooks
- `POST /api/v1/listings/:listingId/promote` - mark listing for paid promotion.
- `GET /api/v1/ads/slots` - ad unit payloads per placement.

## Modular architecture notes

- Keep each domain in `modules/<domain>` with:
  - `presentation` (HTTP routes/controllers, request parsing)
  - `application` (use-cases/services)
  - `domain` (entities/interfaces)
  - `infrastructure` (database/external adapters)
- Introduce OAuth by adding provider adapters that satisfy a shared auth-provider contract; no route contract changes required.
