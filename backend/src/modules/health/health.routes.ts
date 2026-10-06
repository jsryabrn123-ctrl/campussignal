import { Router } from "express";
import { checkDatabaseConnection } from "../../db/pool.js";
import { ApiError } from "../../utils/ApiError.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({ status: "ok" });
});

healthRouter.get("/ready", async (_request, _response, next) => {
  try {
    await checkDatabaseConnection();
    _response.json({ status: "ok", database: "connected" });
  } catch {
    next(new ApiError(503, "Database is unavailable."));
  }
});
