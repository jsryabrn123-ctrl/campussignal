import { describe, expect, it } from "vitest";
import { matchScore } from "./teams";

describe("team finder matching", () => {
  it("scores a frontend request higher when the student has React", () => {
    const post = { id: "1", eventId: "campus-hack", eventTitle: "Hack", author: "A", lookingFor: "Need a frontend dev", skills: ["React", "Design"], note: "", created: "now" };
    expect(matchScore(post, ["React", "Python"])).toBe(50);
    expect(matchScore(post, ["Python"])).toBe(0);
  });
});
