import { describe, expect, it } from "vitest";
import { assessEventFit, defaultTimetable, suggestFreeSlots } from "./clashes";
import type { CampusEvent } from "../types";

const event = (overrides: Partial<CampusEvent>): CampusEvent => ({
  id: "x",
  title: "Test",
  shortDescription: "",
  description: "",
  category: "Technology",
  organizer: "Club",
  organizerInitials: "CL",
  department: "Computer Science",
  date: "2026-10-07T14:00:00",
  startTime: "14:00",
  endTime: "16:00",
  venue: "Lab",
  mode: "In person",
  deadline: "2026-10-06T18:00:00",
  capacity: 40,
  registered: 10,
  status: "Registration open",
  eligibility: "Open",
  skills: [],
  tags: [],
  image: "",
  accent: "#ddd",
  trending: 1,
  free: true,
  ...overrides,
});

describe("clash-aware calendar", () => {
  it("labels a Wednesday afternoon event as clashing with Physics lab", () => {
    const result = assessEventFit(event({ date: "2026-10-07T14:00:00" }), defaultTimetable);
    expect(result.status).toBe("clash");
    expect(result.label).toContain("Physics lab");
  });

  it("labels a free afternoon as fitting the week", () => {
    const result = assessEventFit(event({ date: "2026-10-06T14:00:00", startTime: "14:00", endTime: "16:00" }), defaultTimetable, new Date("2026-10-04T09:00:00"));
    expect(result.status).toBe("fits");
  });

  it("suggests free slots around classes", () => {
    const slots = suggestFreeSlots(defaultTimetable, new Date("2026-10-05T08:00:00"), 2);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].startTime).toBeTruthy();
  });
});
