import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.apiPort, () => {
  console.info(`Campus Signal API listening on port ${env.apiPort}.`);
});
