import { describe, expect, it } from "vitest";
import { seedEvents } from "../data/events";
import { recommendEvents, recommendationScore } from "./recommendations";

describe("recommendation scoring", () => {
  const student = { interests: ["AI & ML"], department: "Computer Science", year: 2 };

  it("scores interest, department, trend, and a closing deadline independently", () => {
    const target = { ...seedEvents.find((item) => item.id === "ai-lab")!, deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() };
    const points = recommendationScore(target, student, new Date());
    expect(points).toBeGreaterThanOrEqual(11);
  });

  it("sorts relevant events first and excludes already registered events", () => {
    const results = recommendEvents(seedEvents, student, ["ai-lab"]);
    expect(results.some((item) => item.id === "ai-lab")).toBe(false);
    expect(recommendEvents(seedEvents, student)[0].id).toBe("ai-lab");
  });

  it("excludes cancelled and completed events", () => {
    const [event] = seedEvents;
    expect(recommendEvents([{ ...event, status: "Cancelled" }], student)).toHaveLength(0);
  });

  it("does not show draft events in recommendations", () => {
    const draft = { ...seedEvents.find((item) => item.id === "ai-lab")!, status: "Draft" as const };
    expect(recommendEvents([draft], student)).toHaveLength(0);
  });
});
