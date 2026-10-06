import { describe, expect, it } from "vitest";
import { buildPassport, exportPassportText, passportSkills } from "./passport";
import type { CampusEvent } from "../types";

const event = (id: string, skills: string[]): CampusEvent => ({
  id,
  title: id,
  shortDescription: "",
  description: "",
  category: "Career",
  organizer: "Cell",
  organizerInitials: "CE",
  department: "Business",
  date: "2026-09-20T15:00:00",
  startTime: "15:00",
  endTime: "17:00",
  venue: "Hall",
  mode: "In person",
  deadline: "2026-09-19T18:00:00",
  capacity: 40,
  registered: 20,
  status: "Completed",
  eligibility: "Open",
  skills,
  tags: skills,
  image: "",
  accent: "#ddd",
  trending: 1,
  free: true,
});

describe("participation passport", () => {
  it("builds verified stamps and a skill list students can export", () => {
    const stamps = buildPassport([event("pitch-gym", ["Career", "Public speaking"])], ["pitch-gym"], []);
    expect(stamps).toHaveLength(1);
    expect(stamps[0].verified).toBe(true);
    expect(passportSkills(stamps).map((item) => item.skill)).toContain("Career");
    expect(exportPassportText("JSR", stamps)).toContain("[attended]");
  });

  it("includes upcoming registrations without counting their skills as earned", () => {
    const stamps = buildPassport([event("ai-lab", ["Python", "AI & ML"])], [], ["ai-lab"]);
    expect(stamps).toHaveLength(1);
    expect(stamps[0].verified).toBe(false);
    expect(passportSkills(stamps)).toEqual([]);
    expect(exportPassportText("JSR", stamps)).toContain("Skills pending attendance");
  });
});
