import type { TeamPost } from "../types";

export function matchScore(post: Pick<TeamPost, "skills">, skills: string[]) {
  if (!post.skills.length) return skills.length ? 40 : 0;
  const overlap = post.skills.filter((skill) => skills.some((item) => item.trim().toLowerCase() === skill.trim().toLowerCase())).length;
  return Math.round((overlap / post.skills.length) * 100);
}

export const seedTeamPosts: TeamPost[] = [
  {
    id: "team-1",
    eventId: "campus-hack",
    eventTitle: "Makeathon: build for better campus",
    teamName: "Campus Compass",
    author: "Meera Iyer",
    lookingFor: "Need a frontend dev",
    skills: ["React", "Design"],
    note: "We have a campus navigation idea and a Python backend. Looking for someone who can make the demo look real.",
    openSlots: 1,
    created: "2 hours ago",
  },
  {
    id: "team-2",
    eventId: "campus-hack",
    eventTitle: "Makeathon: build for better campus",
    teamName: "Find It Fast",
    author: "Kabir Shah",
    lookingFor: "Need an ML teammate",
    skills: ["Python", "ML"],
    note: "Building a lost-and-found matcher. Hardware is covered. Need someone who can train a tiny model tonight.",
    openSlots: 2,
    created: "Yesterday",
  },
  {
    id: "team-3",
    eventId: "code-relay",
    eventTitle: "Code Relay",
    teamName: "Test First",
    author: "Diya Nair",
    lookingFor: "Need a second coder",
    skills: ["Python", "Java"],
    note: "Chill pair, we write tests first. Prefer someone who likes explaining as they go.",
    openSlots: 1,
    created: "Yesterday",
  },
];
