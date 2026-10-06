import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(new ApiError(404, "Route not found."));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof ApiError ? error.message : "Internal server error.";
  if (!(error instanceof ApiError)) {
    console.error("Unhandled API error.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
  }
  response.status(statusCode).json({ error: { message } });
};
