import type { CampusEvent } from "../types";

export type RegistrationDecision = "register" | "waitlist" | "already-registered" | "already-waitlisted" | "closed";

export function getRegistrationDecision(event: CampusEvent, registeredIds: string[], waitlistedIds: string[]): RegistrationDecision {
  if (registeredIds.includes(event.id)) return "already-registered";
  if (event.status === "Draft" || event.status === "Cancelled" || event.status === "Registration closed" || event.status === "Completed") return "closed";
  if (waitlistedIds.includes(event.id)) return "already-waitlisted";
  return event.registered >= event.capacity ? "waitlist" : "register";
}
