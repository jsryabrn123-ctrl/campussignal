export interface StudentAudienceProfile {
  id: string;
  department: string;
  year: number;
  interests: string[];
  skills: string[];
  participatedCategories: string[];
}

import type { AudienceTarget } from "../types";

export function matchesAudience(student: StudentAudienceProfile, target: AudienceTarget): boolean {
  const includesAny = (values: string[] | undefined, targetValues: string[] | undefined) =>
    !targetValues?.length || values?.some((value) => targetValues.some((item) => item.toLowerCase() === value.toLowerCase())) === true;

  return (
    (!target.departments?.length || target.departments.includes(student.department)) &&
    (!target.years?.length || target.years.includes(student.year)) &&
    includesAny(student.interests, target.interests) &&
    includesAny(student.skills, target.skills) &&
    includesAny(student.participatedCategories, target.participatedCategories)
  );
}
