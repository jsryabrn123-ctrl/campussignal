import type { AudienceTarget } from "../types";
import type { StudentAudienceProfile } from "../services/notificationTargeting";

export interface CampusStudent extends StudentAudienceProfile {
  name: string;
  pingsThisWeek: number;
}

const departments = ["Computer Science", "Design", "Mechanical Engineering", "Business", "Arts & Humanities", "Science"];
const interests = ["AI & ML", "Design", "Career", "Robotics", "Technology", "Entrepreneurship", "Research", "Creative", "Photography"];
const skills = ["Python", "React", "Figma", "Java", "C++", "ML"];
const first = ["Asha", "Rohan", "Meera", "Kabir", "Diya", "Arjun", "Sara", "Neil", "Isha", "Vikram", "Zara", "Anik"];
const last = ["Patel", "Iyer", "Khan", "Shah", "Nair", "Das", "Rao", "Sen", "Gill", "Bose"];

function pick<T>(list: T[], index: number) {
  return list[index % list.length];
}

export function buildCampusDirectory(): CampusStudent[] {
  return Array.from({ length: 120 }, (_, index) => {
    const department = pick(departments, index * 3);
    const interestA = pick(interests, index);
    const interestB = pick(interests, index + 4);
    return {
      id: `stu-${index + 1}`,
      name: `${pick(first, index)} ${pick(last, index * 2)}`,
      department,
      year: (index % 4) + 1,
      interests: interestA === interestB ? [interestA] : [interestA, interestB],
      skills: [pick(skills, index), pick(skills, index + 2)].filter((item, pos, list) => list.indexOf(item) === pos),
      participatedCategories: index % 3 === 0 ? ["Hackathon"] : index % 5 === 0 ? ["Career"] : [],
      pingsThisWeek: index % 7 === 0 ? 4 : index % 5 === 0 ? 3 : index % 3,
    };
  });
}

export const campusDirectory = buildCampusDirectory();

export function audienceFromChips(chips: string[]): AudienceTarget {
  return {
    departments: chips.filter((item) => departments.includes(item)),
    years: [2, 3].filter((year) => chips.includes(`${year}${year === 2 ? "nd" : "rd"} year`)),
    interests: chips.filter((item) => interests.includes(item)),
  };
}
