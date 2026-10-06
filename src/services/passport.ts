import type { CampusEvent, PassportStamp } from "../types";

export function buildPassport(events: CampusEvent[], attendedIds: string[], registeredIds: string[]): PassportStamp[] {
  const stamps = events
    .filter((event) => attendedIds.includes(event.id) || registeredIds.includes(event.id))
    .map((event) => ({
      eventId: event.id,
      title: event.title,
      organizer: event.organizer,
      date: event.date,
      category: event.category,
      skills: event.skills,
      verified: attendedIds.includes(event.id),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
  return stamps;
}

export function passportSkills(stamps: PassportStamp[]) {
  const counts = new Map<string, number>();
  stamps.filter((stamp) => stamp.verified).forEach((stamp) => stamp.skills.forEach((skill) => counts.set(skill, (counts.get(skill) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([skill, count]) => ({ skill, count }));
}

export function exportPassportText(name: string, stamps: PassportStamp[]) {
  const skills = passportSkills(stamps).map((item) => `${item.skill} (${item.count})`).join(", ") || "None yet";
  const lines = [
    `Campus Signal passport — ${name}`,
    `Verified activity: ${stamps.filter((stamp) => stamp.verified).length} events`,
    `Skills: ${skills}`,
    "",
    ...stamps.map((stamp) => `${stamp.verified ? "[attended]" : "[registered]"} ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(stamp.date))} — ${stamp.title} (${stamp.organizer}) · ${stamp.verified ? stamp.skills.join(", ") : "Skills pending attendance"}`),
  ];
  return lines.join("\n");
}
