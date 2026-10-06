import type { CampusEvent, TimetableBlock } from "../types";

export interface ClashResult {
  status: "fits" | "clash";
  label: string;
  blockTitle?: string;
}

function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function weekdayMondayFirst(date: Date) {
  return (date.getDay() + 6) % 7;
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return minutes(startA) < minutes(endB) && minutes(startB) < minutes(endA);
}

function sameCalendarDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export function assessEventFit(event: CampusEvent, timetable: TimetableBlock[], now = new Date()): ClashResult {
  const eventDay = new Date(event.date);
  for (const block of timetable) {
    if (block.kind === "exam" && block.date) {
      const examDay = new Date(block.date);
      if (sameCalendarDay(eventDay, examDay) && overlaps(event.startTime, event.endTime, block.startTime, block.endTime)) {
        return { status: "clash", label: `Clashes with ${block.title}`, blockTitle: block.title };
      }
      continue;
    }
    if (block.weekday === weekdayMondayFirst(eventDay) && overlaps(event.startTime, event.endTime, block.startTime, block.endTime)) {
      return { status: "clash", label: `Clashes with ${block.title}`, blockTitle: block.title };
    }
  }
  const soon = (eventDay.getTime() - now.getTime()) / 86400000 <= 7;
  return { status: "fits", label: soon ? "Fits your week" : "Fits your timetable" };
}

export function suggestFreeSlots(timetable: TimetableBlock[], now = new Date(), count = 3) {
  const suggestions: { day: string; startTime: string; endTime: string }[] = [];
  const formatter = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" });
  for (let offset = 0; offset < 7 && suggestions.length < count; offset += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    day.setHours(0, 0, 0, 0);
    const weekday = weekdayMondayFirst(day);
    const busy = timetable
      .filter((block) => (block.kind === "exam" && block.date && sameCalendarDay(new Date(block.date), day)) || (block.kind !== "exam" && block.weekday === weekday))
      .map((block) => [minutes(block.startTime), minutes(block.endTime)] as const)
      .sort((a, b) => a[0] - b[0]);
    let cursor = 9 * 60;
    const close = 18 * 60;
    for (const [start, end] of [...busy, [close, close] as const]) {
      if (start - cursor >= 90 && suggestions.length < count && cursor + 90 <= close) {
        const startHour = Math.floor(cursor / 60);
        suggestions.push({
          day: formatter.format(day),
          startTime: `${String(startHour).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`,
          endTime: `${String(Math.floor((cursor + 120) / 60)).padStart(2, "0")}:00`,
        });
      }
      cursor = Math.max(cursor, end);
    }
  }
  return suggestions;
}

export const defaultTimetable: TimetableBlock[] = [
  { id: "ds", title: "Data Structures", weekday: 0, startTime: "09:00", endTime: "11:00", kind: "class" },
  { id: "studio", title: "Design studio", weekday: 0, startTime: "14:00", endTime: "16:00", kind: "class" },
  { id: "math", title: "Discrete Math", weekday: 1, startTime: "10:00", endTime: "12:00", kind: "class" },
  { id: "physics-lab", title: "Physics lab", weekday: 2, startTime: "14:00", endTime: "16:00", kind: "lab" },
  { id: "algo", title: "Algorithms", weekday: 3, startTime: "09:00", endTime: "11:00", kind: "class" },
  { id: "prob", title: "Probability", weekday: 4, startTime: "11:00", endTime: "13:00", kind: "class" },
];
