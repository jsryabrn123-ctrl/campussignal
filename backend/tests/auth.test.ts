import express from "express";
import { exportJWK, generateKeyPair, SignJWT, createLocalJWKSet } from "jose";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../src/middleware/errorHandler.js";
import { authRouter } from "../src/modules/auth/auth.routes.js";
import { createSupabaseAuthMiddleware } from "../src/modules/auth/auth.middleware.js";

const issuer = "https://campus.example";

function makeApp(router: express.Router) {
  const app = express();
  app.use("/api/auth", router);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("Supabase access-token authentication", () => {
  it("rejects requests without a bearer token", async () => {
    const response = await request(makeApp(authRouter)).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: { message: "Authentication is required." } });
  });

  it("returns a generic configuration error when Supabase is not configured", async () => {
    const router = express.Router();
    router.get("/me", createSupabaseAuthMiddleware(undefined), (request, response) => {
      response.json({ user: request.authenticatedUser });
    });

    const response = await request(makeApp(router))
      .get("/api/auth/me")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: { message: "Authentication is not configured." } });
  });

  it("rejects malformed bearer tokens without exposing verification details", async () => {
    const router = express.Router();
    router.get(
      "/me",
      createSupabaseAuthMiddleware(issuer, createLocalJWKSet({ keys: [] })),
      (request, response) => response.json({ user: request.authenticatedUser }),
    );

    const response = await request(makeApp(router))
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-jwt");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: { message: "The access token is invalid or expired." } });
  });

  it("accepts a verified Supabase token but does not use the claimed app role", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RS256");
    const publicJwk = await exportJWK(publicKey);
    const keySet = createLocalJWKSet({
      keys: [{ ...publicJwk, kid: "test-key", alg: "RS256", use: "sig" }],
    });
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setIssuer(`${issuer}/auth/v1`)
      .setAudience("authenticated")
      .setSubject("supabase-user-id")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);
    const router = express.Router();
    router.get("/me", createSupabaseAuthMiddleware(issuer, keySet), (request, response) => {
      response.json({ user: request.authenticatedUser });
    });

    const response = await request(makeApp(router))
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: { id: "supabase-user-id" } });
  });
});
