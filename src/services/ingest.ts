export interface ExtractedEventDraft {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  deadline: string;
  category: string;
  confidence: number;
  fieldsFound: string[];
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTH_SHORT = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const CATEGORY_HINTS: Record<string, string[]> = {
  Hackathon: ["hackathon", "makeathon", "hack"],
  "AI & ML": ["ai", "machine learning", "ml "],
  Robotics: ["robot", "drone"],
  Design: ["design", "figma", "type"],
  Career: ["resume", "career", "internship"],
  Competition: ["competition", "challenge", "ctf"],
  Technology: ["coding", "web app", "cyber"],
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseClock(raw: string): string | undefined {
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return undefined;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const meridian = match[3]?.toLowerCase();
  if (meridian === "pm" && hour < 12) hour += 12;
  if (meridian === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return undefined;
  return `${pad(hour)}:${pad(minute)}`;
}

function parseDay(raw: string, now: Date): string | undefined {
  const cleaned = raw.replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const named = cleaned.match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{2,4}))?$/);
  if (named) {
    const monthName = named[2].toLowerCase();
    const month = MONTHS.findIndex((item) => item.startsWith(monthName)) >= 0
      ? MONTHS.findIndex((item) => item.startsWith(monthName))
      : MONTH_SHORT.findIndex((item) => item === monthName.slice(0, 3));
    if (month < 0) return undefined;
    const year = named[3] ? Number(named[3].length === 2 ? `20${named[3]}` : named[3]) : now.getFullYear();
    const date = new Date(year, month, Number(named[1]));
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate()) && !named[3]) date.setFullYear(year + 1);
    return toDateInput(date);
  }
  const numeric = cleaned.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  if (numeric) {
    const year = numeric[3] ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]) : now.getFullYear();
    const date = new Date(year, Number(numeric[2]) - 1, Number(numeric[1]));
    return toDateInput(date);
  }
  return undefined;
}

function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function guessCategory(text: string) {
  const lower = text.toLowerCase();
  return Object.entries(CATEGORY_HINTS).find(([, hints]) => hints.some((hint) => lower.includes(hint)))?.[0] ?? "Technology";
}

function cleanLine(line: string) {
  return line
    .replace(/^(fwd:|forwarded|broadcast)\s*/i, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[📢✨🔥➡️•*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const SAMPLE_WHATSAPP_BLAST = `Fwd: 📢 MAKEATHON — build for better campus

Innovation Cell

A friendly 24-hour team sprint. Bring a sketch, leave with a prototype.

📅 11 Oct | 9:00 AM – 6:00 PM
📍 Main Innovation Hub
Last date to register: 10 Oct

Open to all students. Need a frontend or ML teammate? Come anyway.`;

export function extractEventFromMessage(source: string, now = new Date()): ExtractedEventDraft {
  const text = source.replace(/\r/g, "").trim();
  const rawLines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const lines = rawLines.map(cleanLine).filter(Boolean);
  const found = new Set<string>();
  let date = "";
  let startTime = "";
  let endTime = "";
  let venue = "";
  let deadline = "";
  let title = "";
  let description = "";

  for (const raw of rawLines) {
    const line = cleanLine(raw);
    const dateMatch = raw.match(/(\d{1,2}\s+[A-Za-z]+(?:\s+\d{2,4})?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/);
    if (!date && dateMatch && !/last date|deadline|register by/i.test(raw)) {
      const parsed = parseDay(dateMatch[1], now);
      if (parsed) { date = parsed; found.add("date"); }
    }
    const timeMatch = raw.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))(?:\s*[–\-to]+\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)))?/i) ?? raw.match(/(\d{1,2}:\d{2})(?:\s*[–\-to]+\s*(\d{1,2}:\d{2}))/);
    if (!startTime && timeMatch) {
      const parsedStart = parseClock(timeMatch[1]);
      const parsedEnd = timeMatch[2] ? parseClock(timeMatch[2]) : undefined;
      if (parsedStart) { startTime = parsedStart; found.add("startTime"); }
      if (parsedEnd) { endTime = parsedEnd; found.add("endTime"); }
    }
    const venueMatch = raw.match(/(?:📍|venue[:\s]+|location[:\s]+)\s*(.+)/i);
    if (!venue && venueMatch) {
      venue = cleanLine(venueMatch[1]).replace(/^[:\-]\s*/, "").trim();
      found.add("venue");
    }
    const deadlineMatch = raw.match(/(?:last date(?: to register)?|register by|deadline)[:\s]+(.+)/i);
    if (!deadline && deadlineMatch) {
      const parsed = parseDay(cleanLine(deadlineMatch[1]), now);
      if (parsed) { deadline = parsed; found.add("deadline"); }
    }
    void line;
  }

  const skipPattern = /innovation cell|computer science club|open to all|need a |last date|register by|📅|📍/;
  const candidateLines = lines.filter((line) => {
    if (line.length < 8 || /^(fwd|broadcast)/i.test(line)) return false;
    if (/makeathon|hackathon|workshop|lab|clinic|walk|sprint|build/i.test(line)) return true;
    return !skipPattern.test(line.toLowerCase()) && !/\d{1,2}\s+[A-Za-z]+/.test(line);
  });
  title = candidateLines.find((line) => /makeathon|hackathon|workshop|build|clinic/i.test(line)) ?? candidateLines[0] ?? "";
  if (title) found.add("title");
  description = lines.find((line) => line.length > 40 && line !== title) ?? "";
  if (description) found.add("description");

  if (!date) {
    date = toDateInput(addDays(now, 7));
  }
  if (!startTime) startTime = "14:00";
  if (!endTime) endTime = "16:00";
  if (!deadline) deadline = toDateInput(addDays(new Date(`${date}T12:00:00`), -1));
  if (!venue) venue = "";
  if (!title) title = lines[0]?.slice(0, 80) ?? "";

  const confidence = Math.round((found.size / 6) * 100);
  return {
    title: title.slice(0, 80),
    description: (description || title).slice(0, 180),
    date,
    startTime,
    endTime,
    venue,
    deadline,
    category: guessCategory(text),
    confidence,
    fieldsFound: [...found],
  };
}
