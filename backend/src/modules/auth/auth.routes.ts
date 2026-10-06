import { Router } from "express";
import { env } from "../../config/env.js";
import { createSupabaseAuthMiddleware } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.get("/me", createSupabaseAuthMiddleware(env.supabaseUrl), (request, response) => {
  response.json({
    user: {
      id: request.authenticatedUser!.id,
      provider: "supabase",
    },
  });
});
