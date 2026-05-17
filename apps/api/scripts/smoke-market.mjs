import { createApp } from "../dist/app.js";

async function registerAndVerify(baseUrl, email, password, displayName) {
  const registerResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      displayName,
      password,
      confirmPassword: password
    })
  });
  if (!registerResponse.ok) {
    throw new Error(`Register failed for ${email} with status ${registerResponse.status}.`);
  }

  const registerBody = await registerResponse.json();
  const previewUrl = registerBody.verificationPreviewUrl;
  const verificationToken = previewUrl ? new URL(previewUrl).searchParams.get("token") : null;
  if (!verificationToken) {
    throw new Error(`Verification token missing for ${email}.`);
  }

  const verifyResponse = await fetch(`${baseUrl}/api/v1/auth/verify-email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: verificationToken })
  });
  if (!verifyResponse.ok) {
    throw new Error(`Verify failed for ${email} with status ${verifyResponse.status}.`);
  }

  const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!loginResponse.ok) {
    throw new Error(`Login failed for ${email} with status ${loginResponse.status}.`);
  }

  const loginBody = await loginResponse.json();
  return loginBody.token;
}

const app = createApp();
const server = app.listen(0, async () => {
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const runId = Date.now();
    const sellerEmail = `seller-${runId}@example.com`;
    const buyerEmail = `buyer-${runId}@example.com`;
    const password = "password123";

    const sellerToken = await registerAndVerify(
      baseUrl,
      sellerEmail,
      password,
      "Smoke Seller"
    );
    const buyerToken = await registerAndVerify(baseUrl, buyerEmail, password, "Smoke Buyer");

    const smokeEventTitle = `Smoke Market Event ${runId}`;
    const createListingResponse = await fetch(`${baseUrl}/api/v1/listings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        eventTitle: smokeEventTitle,
        eventCity: "Chicago",
        seatType: "GA",
        priceCents: 6500,
        quantity: 2
      })
    });
    if (!createListingResponse.ok) {
      throw new Error(`Create listing failed with status ${createListingResponse.status}.`);
    }
    const listingBody = await createListingResponse.json();
    const listingId = listingBody.listing.id;
    const eventId = listingBody.listing.eventId;

    const browseEventsResponse = await fetch(`${baseUrl}/api/v1/events`);
    if (!browseEventsResponse.ok) {
      throw new Error(`Browse events failed with status ${browseEventsResponse.status}.`);
    }
    const browseEventsBody = await browseEventsResponse.json();
    if (!browseEventsBody.events.some((event) => event.id === eventId)) {
      throw new Error("Created listing event was not returned by browse events.");
    }

    const purchaseResponse = await fetch(`${baseUrl}/api/v1/listings/${listingId}/purchase`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ quantity: 1 })
    });
    if (!purchaseResponse.ok) {
      throw new Error(`Purchase failed with status ${purchaseResponse.status}.`);
    }

    const wishlistResponse = await fetch(`${baseUrl}/api/v1/auth/account/wishlist`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ eventId })
    });
    if (!wishlistResponse.ok) {
      throw new Error(`Wishlist add failed with status ${wishlistResponse.status}.`);
    }

    const accountOverviewResponse = await fetch(`${baseUrl}/api/v1/auth/account/overview`, {
      headers: {
        authorization: `Bearer ${buyerToken}`
      }
    });
    if (!accountOverviewResponse.ok) {
      throw new Error(`Account overview failed with status ${accountOverviewResponse.status}.`);
    }
    const accountBody = await accountOverviewResponse.json();
    if (!accountBody.boughtEvents.length || !accountBody.wishlistedEvents.length) {
      throw new Error("Account sections were not populated after purchase/wishlist flow.");
    }

    console.log("Marketplace smoke test passed.");
    server.close(() => process.exit(0));
  } catch (error) {
    console.error(error);
    server.close(() => process.exit(1));
  }
});
