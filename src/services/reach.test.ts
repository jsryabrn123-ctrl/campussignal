import { describe, expect, it } from "vitest";
import { canAffordPing, previewAudience, remainingReach } from "./reach";
import type { CampusStudent } from "../data/campus";

const students: CampusStudent[] = [
  { id: "a", name: "A", department: "Computer Science", year: 2, interests: ["AI & ML"], skills: ["Python"], participatedCategories: [], pingsThisWeek: 1 },
  { id: "b", name: "B", department: "Design", year: 2, interests: ["Design"], skills: ["Figma"], participatedCategories: [], pingsThisWeek: 4 },
  { id: "c", name: "C", department: "Computer Science", year: 3, interests: ["AI & ML", "Career"], skills: ["React"], participatedCategories: [], pingsThisWeek: 0 },
];

describe("reach budget", () => {
  it("shows a live audience that excludes students over the weekly ping cap", () => {
    const preview = previewAudience({ departments: ["Computer Science"], interests: ["AI & ML"] }, students);
    expect(preview.reached).toBe(2);
    expect(preview.excludedByCap).toBe(0);
    expect(preview.relevantPercent).toBe(100);
    expect(preview.cost).toBe(2);
  });

  it("treats remaining weekly reach as an enforced limit", () => {
    expect(remainingReach(390)).toBe(10);
    expect(canAffordPing(390, 12)).toBe(false);
    expect(canAffordPing(390, 10)).toBe(true);
  });
});
