import { campusDirectory, type CampusStudent } from "../data/campus";
import { matchesAudience } from "./notificationTargeting";
import type { AudienceTarget } from "../types";

export const ORGANIZER_WEEKLY_REACH = 400;
export const STUDENT_WEEKLY_PING_CAP = 4;
export const PING_COST_PER_STUDENT = 1;

export interface AudiencePreview {
  reached: number;
  relevantPercent: number;
  cost: number;
  excludedByCap: number;
  campusSize: number;
}

export function previewAudience(target: AudienceTarget, directory: CampusStudent[] = campusDirectory): AudiencePreview {
  const matching = directory.filter((student) => matchesAudience(student, target));
  const pingable = matching.filter((student) => student.pingsThisWeek < STUDENT_WEEKLY_PING_CAP);
  const relevant = pingable.filter((student) => (target.interests?.length ? student.interests.some((interest) => target.interests!.includes(interest)) : student.interests.length > 0));
  const reached = pingable.length;
  return {
    reached,
    relevantPercent: reached ? Math.round((relevant.length / reached) * 100) : 0,
    cost: reached * PING_COST_PER_STUDENT,
    excludedByCap: matching.length - pingable.length,
    campusSize: directory.length,
  };
}

export function remainingReach(used: number) {
  return Math.max(0, ORGANIZER_WEEKLY_REACH - used);
}

export function canAffordPing(used: number, cost: number) {
  return remainingReach(used) >= cost && cost > 0;
}

export function isoWeekId(now = new Date()) {
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
