import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();
const allowedOrigins = new Set(env.corsOrigins);

app.use(requestLogger);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new ApiError(403, "Origin is not allowed."));
  },
}));
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
