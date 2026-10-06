import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now();

  response.on("finish", () => {
    console.info(JSON.stringify({
      method: request.method,
      status: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    }));
  });

  next();
};
