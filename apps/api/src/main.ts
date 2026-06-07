import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.API_PORT, () => {
  console.log(`Miami Tix API listening on port ${env.API_PORT}`);
});
