import { createApp } from "../dist/app.js";

const app = createApp();

const server = app.listen(0, async () => {
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const email = "smoke-test@example.com";
    const password = "password123";

    const registerResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        displayName: "Smoke Tester",
        password
      })
    });

    if (!registerResponse.ok) {
      throw new Error(`Register failed with status ${registerResponse.status}.`);
    }

    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed with status ${loginResponse.status}.`);
    }

    const loginBody = await loginResponse.json();
    const meResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: {
        authorization: `Bearer ${loginBody.token}`
      }
    });

    if (!meResponse.ok) {
      throw new Error(`Get current user failed with status ${meResponse.status}.`);
    }

    const providersResponse = await fetch(`${baseUrl}/api/v1/auth/oauth/providers`);
    if (!providersResponse.ok) {
      throw new Error(`OAuth provider list failed with status ${providersResponse.status}.`);
    }

    const meBody = await meResponse.json();
    const providersBody = await providersResponse.json();

    console.log("Auth smoke test passed.");
    console.log(`Current user email: ${meBody.user.email}`);
    console.log(`OAuth providers: ${JSON.stringify(providersBody.providers)}`);
    server.close(() => process.exit(0));
  } catch (error) {
    console.error(error);
    server.close(() => process.exit(1));
  }
});
