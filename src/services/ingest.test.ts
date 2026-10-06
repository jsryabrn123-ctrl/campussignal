import { describe, expect, it } from "vitest";
import { SAMPLE_WHATSAPP_BLAST, extractEventFromMessage } from "./ingest";

describe("poster and WhatsApp ingest", () => {
  const now = new Date("2026-10-04T10:00:00");

  it("extracts title, date, venue and deadline from a WhatsApp blast", () => {
    const draft = extractEventFromMessage(SAMPLE_WHATSAPP_BLAST, now);
    expect(draft.title.toLowerCase()).toContain("makeathon");
    expect(draft.date).toBe("2026-10-11");
    expect(draft.startTime).toBe("09:00");
    expect(draft.endTime).toBe("18:00");
    expect(draft.venue).toBe("Main Innovation Hub");
    expect(draft.deadline).toBe("2026-10-10");
    expect(draft.category).toBe("Hackathon");
    expect(draft.fieldsFound).toEqual(expect.arrayContaining(["title", "date", "venue", "deadline", "startTime"]));
  });

  it("still returns a usable draft when only a title is pasted", () => {
    const draft = extractEventFromMessage("Resume clinic this Friday in Career Studio", now);
    expect(draft.title).toBeTruthy();
    expect(draft.date).toBeTruthy();
    expect(draft.confidence).toBeLessThan(draft.fieldsFound.includes("venue") ? 100 : 80);
  });
});
