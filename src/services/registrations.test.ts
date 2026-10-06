import { describe, expect, it } from "vitest";
import { seedEvents } from "../data/events";
import { getRegistrationDecision } from "./registrations";

describe("event registration", () => {
  const event = seedEvents.find((item) => item.id === "ai-lab")!;

  it("rejects duplicate registrations before checking capacity", () => {
    expect(getRegistrationDecision({ ...event, registered: event.capacity }, [event.id], [])).toBe("already-registered");
  });

  it("waitlists students when event capacity is full", () => {
    expect(getRegistrationDecision({ ...event, registered: event.capacity }, [], [])).toBe("waitlist");
  });

  it("prevents repeat waitlist entries and closes cancelled events", () => {
    expect(getRegistrationDecision(event, [], [event.id])).toBe("already-waitlisted");
    expect(getRegistrationDecision({ ...event, status: "Cancelled" }, [], [])).toBe("closed");
  });

  it("does not allow registration for a draft", () => {
    expect(getRegistrationDecision({ ...event, status: "Draft" }, [], [])).toBe("closed");
  });
});
