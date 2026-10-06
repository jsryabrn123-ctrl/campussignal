import type { RequestHandler } from "express";
import {
  createRemoteJWKSet,
  errors,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";
import { ApiError } from "../../utils/ApiError.js";

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: { id: string };
    }
  }
}

export function createSupabaseAuthMiddleware(
  supabaseUrl: string | undefined,
  getKey?: JWTVerifyGetKey,
): RequestHandler {
  let jwks: JWTVerifyGetKey | undefined = getKey;

  return async (request, _response, next) => {
    const authorization = request.get("authorization");
    const token = authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
    if (!token) {
      next(new ApiError(401, "Authentication is required."));
      return;
    }
    if (!supabaseUrl) {
      next(new ApiError(503, "Authentication is not configured."));
      return;
    }

    try {
      jwks ??= createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
      const { payload } = await jwtVerify(token, jwks, {
        issuer: `${supabaseUrl}/auth/v1`,
        audience: "authenticated",
        algorithms: ["ES256", "RS256"],
      });

      if (typeof payload.sub !== "string" || !payload.sub) {
        next(new ApiError(401, "The access token is invalid."));
        return;
      }

      request.authenticatedUser = { id: payload.sub };
      next();
    } catch (error) {
      if (error instanceof errors.JOSEError) {
        next(new ApiError(401, "The access token is invalid or expired."));
        return;
      }
      next(new ApiError(503, "Authentication service is unavailable."));
    }
  };
}
