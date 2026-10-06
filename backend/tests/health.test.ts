import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("returns an API liveness response without requiring a database", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns the standard error shape for unknown routes", async () => {
    const response = await request(app).get("/api/not-found");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { message: "Route not found." } });
  });
});
