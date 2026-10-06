import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import type { CampusEvent } from "../types";
import { eventImageUrl } from "../components/UI";

const categories = ["Technology", "AI & ML", "Design", "Robotics", "Career", "Hackathon", "Competition", "Business", "Research", "Creative", "Culture"];
const defaultImage = "photo-1516321318423-f06f85e504b3";

function localDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function nextDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDate(date);
}

interface EventForm {
  title: string;
  description: string;
  category: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  mode: CampusEvent["mode"];
  organizer: string;
  deadline: string;
  registrationLink: string;
  capacity: string;
  eligibility: string;
  skills: string;
  contactInfo: string;
  audience: string[];
}

function blankForm(organizer: string): EventForm {
  return {
    title: "",
    description: "",
    category: "Technology",
    image: defaultImage,
    date: nextDate(7),
    startTime: "14:00",
    endTime: "16:00",
    venue: "",
    mode: "In person",
    organizer,
    deadline: "",
    registrationLink: "",
    capacity: "",
    eligibility: "Open to all students",
    skills: "",
    contactInfo: "",
    audience: [],
  };
}

function formFromEvent(event: CampusEvent): EventForm {
  return {
    title: event.title,
    description: event.shortDescription || event.description,
    category: event.category,
    image: event.image,
    date: localDate(new Date(event.date)),
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    mode: event.mode,
    organizer: event.organizer,
    deadline: event.deadline ? localDate(new Date(event.deadline)) : "",
    registrationLink: event.registrationLink ?? "",
    capacity: event.capacity ? String(event.capacity) : "",
    eligibility: event.eligibility,
    skills: event.skills.join(", "),
    contactInfo: event.contactInfo ?? "",
    audience: [
      ...(event.targetAudience?.departments ?? []),
      ...(event.targetAudience?.years ?? []).map((year) => `${year}${year === 2 ? "nd" : "rd"} year`),
      ...(event.targetAudience?.interests ?? []),
    ],
  };
}

export default function CreateEvent({
  role,
  event,
  onClose,
  onSaveDraft,
  onPublish,
  onSaveChanges,
}: {
  role: "organizer" | "admin";
  event?: CampusEvent;
  onClose: () => void;
  onSaveDraft: (event: CampusEvent) => void;
  onPublish: (event: CampusEvent) => void;
  onSaveChanges: (event: CampusEvent) => void;
}) {
  const [form, setForm] = useState<EventForm>(() => {
    if (event) return formFromEvent(event);
    try {
      const saved = localStorage.getItem("campus-signal-draft");
      return saved ? { ...blankForm(role === "admin" ? "Campus Administration" : "Computer Science Club"), ...JSON.parse(saved) as Partial<EventForm> } : blankForm(role === "admin" ? "Campus Administration" : "Computer Science Club");
    } catch (error) {
      console.warn("Saved event draft could not be restored.", error);
      return blankForm(role === "admin" ? "Campus Administration" : "Computer Science Club");
    }
  });
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!event) localStorage.setItem("campus-signal-draft", JSON.stringify(form));
  }, [event, form]);

  const set = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const validate = (publishing: boolean) => {
    if (![form.title, form.description, form.category, form.date, form.startTime, form.endTime, form.venue, form.organizer].every((value) => value.trim())) {
      return "Complete the required event details before continuing.";
    }
    if (form.endTime <= form.startTime) return "End time must be after start time.";
    if (publishing && new Date(`${form.date}T${form.startTime}`) < new Date()) return "The event date cannot be in the past.";
    if (form.deadline && new Date(form.deadline) > new Date(form.date)) return "The registration deadline cannot be after the event date.";
    if (form.registrationLink) {
      try {
        const url = new URL(form.registrationLink);
        if (!["http:", "https:"].includes(url.protocol)) return "Enter a valid http or https registration link.";
      } catch {
        return "Enter a valid registration link, including https://.";
      }
    }
    return "";
  };

  const buildEvent = (status: CampusEvent["status"]): CampusEvent => {
    const skills = form.skills.split(",").map((skill) => skill.trim()).filter(Boolean);
    const previous = event;
    const date = form.date || nextDate(7);
    const startTime = form.startTime || "14:00";
    const endTime = form.endTime || "16:00";
    const organizer = form.organizer.trim() || (role === "admin" ? "Campus Administration" : "Computer Science Club");
    const deadline = form.deadline ? new Date(`${form.deadline}T18:00`).toISOString() : new Date(`${date}T18:00`).toISOString();
    const initials = organizer.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    return {
      id: previous?.id ?? `event-${Date.now()}`,
      title: form.title.trim() || "Untitled draft",
      shortDescription: form.description.trim(),
      description: form.description.trim(),
      category: form.category,
      organizer,
      organizerInitials: initials,
      department: previous?.department ?? (role === "admin" ? "Campus" : "Computer Science"),
      date: new Date(`${date}T${startTime}`).toISOString(),
      startTime,
      endTime,
      venue: form.venue.trim(),
      mode: form.mode,
      deadline,
      capacity: Number(form.capacity) || 5000,
      registered: previous?.registered ?? 0,
      status,
      eligibility: form.eligibility.trim() || "Open to all students",
      skills,
      tags: skills,
      image: form.image.trim() || defaultImage,
      accent: previous?.accent ?? "#dbe4ff",
      trending: previous?.trending ?? 45,
      free: previous?.free ?? true,
      ownerId: previous
        ? previous.ownerId ?? (role === "organizer" ? "computer-science-club" : undefined)
        : role === "admin" ? "admin" : "computer-science-club",
      registrationLink: form.registrationLink.trim() || undefined,
      contactInfo: form.contactInfo.trim() || undefined,
      audience: form.audience.length ? form.audience.join(", ") : "All students",
      targetAudience: {
        departments: form.audience.filter((item) => ["Computer Science", "Design"].includes(item)),
        years: [2, 3].filter((year) => form.audience.includes(`${year}${year === 2 ? "nd" : "rd"} year`)),
        interests: form.audience.filter((item) => ["AI & ML", "Technology", "Robotics", "Career"].includes(item)),
      },
    };
  };

  const submit = (action: "draft" | "publish" | "edit") => {
    const message = action === "draft" ? "" : validate(action === "publish");
    if (message) {
      setError(message);
      return;
    }
    const result = buildEvent(action === "draft" ? "Draft" : action === "edit" && event ? event.status : "Registration open");
    localStorage.removeItem("campus-signal-draft");
    if (action === "draft") onSaveDraft(result);
    else if (action === "edit") onSaveChanges(result);
    else onPublish(result);
  };

  return (
    <div className="modal-backdrop create-backdrop" role="presentation" onMouseDown={(mouse) => { if (mouse.target === mouse.currentTarget) onClose(); }}>
      <section className="create-event-modal event-form-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <header className="create-modal-header"><button className="icon-button" onClick={onClose} aria-label="Close event form"><ArrowLeft size={19} /></button><div><span className="create-overline">{role === "admin" ? "Admin workspace" : "Club workspace"}</span><h2 id="create-title">{event ? "Edit event" : "Create an event"}</h2></div></header>
        <form onSubmit={(formEvent) => { formEvent.preventDefault(); submit(event && event.status !== "Draft" ? "edit" : "publish"); }}>
          <div className="create-form-content event-form-content">
            <section className="event-form-section">
              <h3>Basic Details</h3>
              <label className="form-label">Event title *<input required maxLength={100} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Give your event a clear name" /></label>
              <label className="form-label">Description *<textarea required maxLength={500} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What will students do or learn?" /></label>
              <div className="form-two-col"><label className="form-label">Category *<select required value={form.category} onChange={(e) => set("category", e.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="form-label">Organizer *<input required maxLength={80} value={form.organizer} onChange={(e) => set("organizer", e.target.value)} /></label></div>
              <label className="form-label">Banner image URL or Unsplash photo ID<input value={form.image} onChange={(e) => { set("image", e.target.value); setImageError(false); }} placeholder="Optional image URL or photo-…" /></label>
              <div className="event-banner-preview">{imageError ? <ImagePlus size={22} /> : <img src={eventImageUrl(form.image, 1000, 80)} alt="Event banner preview" onError={() => setImageError(true)} />}</div>
            </section>
            <section className="event-form-section">
              <h3>Date &amp; Location</h3>
              <div className="form-two-col"><label className="form-label">Date *<input required type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></label><label className="form-label">Mode *<select value={form.mode} onChange={(e) => set("mode", e.target.value as CampusEvent["mode"])}><option value="In person">Offline / in person</option><option>Online</option><option>Hybrid</option></select></label><label className="form-label">Start time *<input required type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} /></label><label className="form-label">End time *<input required type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} /></label></div>
              <label className="form-label">Venue *<input required maxLength={120} value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Building, room or meeting link" /></label>
            </section>
            <section className="event-form-section">
              <h3>Registration</h3>
              <div className="form-two-col"><label className="form-label">Registration deadline<input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} /></label><label className="form-label">Participant limit<input type="number" min="1" max="5000" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="No limit" /></label></div>
              <label className="form-label">Registration link<input type="url" value={form.registrationLink} onChange={(e) => set("registrationLink", e.target.value)} placeholder="https://…" /></label>
            </section>
            <section className="event-form-section">
              <h3>Additional</h3>
              <label className="form-label">Eligibility<input value={form.eligibility} onChange={(e) => set("eligibility", e.target.value)} placeholder="Open to all students" /></label>
              <label className="form-label">Skills or tags<input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, design, Python" /></label>
              <label className="form-label">Contact information<input value={form.contactInfo} onChange={(e) => set("contactInfo", e.target.value)} placeholder="Email or club contact" /></label>
              <div className="form-label"><span>Announcement audience</span><div className="form-choice-grid">{["Computer Science", "Design", "2nd year", "3rd year", "AI & ML"].map((item) => <button type="button" key={item} className={`filter-chip ${form.audience.includes(item) ? "selected" : ""}`} aria-pressed={form.audience.includes(item)} onClick={() => set("audience", form.audience.includes(item) ? form.audience.filter((value) => value !== item) : [...form.audience, item])}>{item}</button>)}</div><small className="form-footnote">{form.audience.length ? `Targeting ${form.audience.join(", ")}` : "No filters selected — visible to everyone."}</small></div>
            </section>
            {error && <p className="form-error" role="alert">{error}</p>}
          </div>
          <footer className="create-modal-footer event-form-footer">
            <button type="button" className="button button-subtle" onClick={() => submit("draft")}>Save Draft</button>
            {event && event.status !== "Draft" && <button type="button" className="button button-subtle" onClick={() => submit("edit")}>Save changes</button>}
            <button type="button" className="button button-primary" onClick={() => submit("publish")}>Publish Event</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
