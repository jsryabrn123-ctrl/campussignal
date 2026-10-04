import type { CampusEvent } from "../types";

export interface StudentPreferences {
  interests: string[];
  department: string;
  year: number;
  interactedCategories?: string[];
}

export function recommendationScore(event: CampusEvent, student: StudentPreferences, now = new Date()): number {
  let score = 0;
  const interests = new Set(student.interests.map((item) => item.toLowerCase()));
  if (event.tags.some((tag) => interests.has(tag.toLowerCase())) || interests.has(event.category.toLowerCase())) score += 5;
  if (event.department.toLowerCase() === student.department.toLowerCase()) score += 3;
  if (student.year >= 1 && student.year <= 4 && event.eligibility.includes(`${student.year}`)) score += 2;
  if (student.interactedCategories?.some((category) => category.toLowerCase() === event.category.toLowerCase())) score += 2;
  if (event.trending >= 80) score += 1;
  const hoursUntilDeadline = (new Date(event.deadline).getTime() - now.getTime()) / 3_600_000;
  if (hoursUntilDeadline >= 0 && hoursUntilDeadline <= 72) score += 2;
  return score;
}

export function recommendEvents(
  events: CampusEvent[],
  student: StudentPreferences,
  excludedIds: string[] = [],
  now = new Date(),
): CampusEvent[] {
  const excluded = new Set(excludedIds);
  return events
    .filter((item) => !excluded.has(item.id) && item.status !== "Cancelled" && item.status !== "Completed")
    .map((item, index) => ({ item, score: recommendationScore(item, student, now), index }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ item }) => item);
}
