import { describe, expect, it } from "vitest";
import { matchesAudience } from "./notificationTargeting";

describe("notification audience targeting", () => {
  const student = { id: "s1", department: "Computer Science", year: 2, interests: ["AI & ML"], skills: ["Python"], participatedCategories: ["Hackathon"] };

  it("matches when every selected targeting dimension is met", () => {
    expect(matchesAudience(student, { departments: ["Computer Science"], years: [2, 3], interests: ["AI & ML"] })).toBe(true);
  });

  it("excludes a student when any required dimension does not match", () => {
    expect(matchesAudience(student, { departments: ["Design"], interests: ["AI & ML"] })).toBe(false);
  });

  it("treats unselected dimensions as unrestricted", () => {
    expect(matchesAudience(student, {})).toBe(true);
  });
});
