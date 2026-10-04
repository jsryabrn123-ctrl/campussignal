import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, CircleCheck, MapPin, Sparkles, Users } from "lucide-react";
import type { CampusEvent } from "../types";

const steps = ["The basics", "When & where", "Who can join", "Registration", "Ready to share"];
const optionTags = ["AI & ML", "Technology", "Design", "Robotics", "Career", "Entrepreneurship", "Research", "Creative"];

interface Draft {
  title: string;
  category: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  mode: CampusEvent["mode"];
  eligibility: string;
  capacity: number;
  deadline: string;
  audience: string[];
  tags: string[];
}

function localDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const emptyDraft: Draft = {
  title: "",
  category: "Technology",
  description: "",
  date: localDateAfter(7),
  startTime: "14:00",
  endTime: "16:00",
  venue: "",
  mode: "In person",
  eligibility: "Open to all students",
  capacity: 80,
  deadline: localDateAfter(6),
  audience: [],
  tags: [],
};

export default function CreateEvent({ onClose, onPublish }: { onClose: () => void; onPublish: (event: CampusEvent) => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const stored = localStorage.getItem("campus-signal-draft");
      return stored ? { ...emptyDraft, ...JSON.parse(stored) as Partial<Draft> } : emptyDraft;
    } catch (error) {
      console.warn("Saved event draft could not be restored.", error);
      return emptyDraft;
    }
  });
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("campus-signal-draft", JSON.stringify(draft));
  }, [draft]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const validate = () => {
    if (step === 0 && (!draft.title.trim() || !draft.description.trim())) return "Add an event name and a short description to continue.";
    if (step === 1 && (!draft.date || !draft.venue.trim() || new Date(`${draft.date}T${draft.startTime}`) <= new Date())) return "Choose a future date, a start time and a location.";
    if (step === 1 && new Date(`${draft.date}T${draft.endTime}`) <= new Date(`${draft.date}T${draft.startTime}`)) return "The end time needs to be after the start time.";
    if (step === 3 && (draft.capacity < 1 || draft.capacity > 5000 || new Date(`${draft.deadline}T23:59`) > new Date(`${draft.date}T${draft.startTime}`))) return "Set a capacity up to 5,000 and a deadline before the event starts.";
    return "";
  };
  const next = () => {
    const message = validate();
    if (message) { setError(message); return; }
    setError("");
    setStep((current) => Math.min(steps.length - 1, current + 1));
  };
  const publish = () => {
    const message = validate();
    if (message) { setError(message); setStep(1); return; }
    const date = new Date(`${draft.date}T${draft.startTime}`);
    const deadline = new Date(`${draft.deadline}T18:00`);
    onPublish({
      id: `event-${Date.now()}`,
      title: draft.title.trim(),
      shortDescription: draft.description.trim(),
      description: `${draft.description.trim()} Join us for a welcoming session, practical takeaways, and time to meet other curious students.`,
      category: draft.category,
      organizer: "Computer Science Club",
      organizerInitials: "CS",
      department: "Computer Science",
      date: date.toISOString(),
      startTime: draft.startTime,
      endTime: draft.endTime,
      venue: draft.venue.trim(),
      mode: draft.mode,
      deadline: deadline.toISOString(),
      capacity: draft.capacity,
      registered: 0,
      status: "Registration open",
      eligibility: draft.eligibility,
      skills: draft.tags.slice(0, 2),
      tags: draft.tags,
      image: "photo-1516321318423-f06f85e504b3",
      accent: "#dbe4ff",
      trending: 45,
      free: true,
      audience: draft.audience.length ? draft.audience.join(", ") : "All students",
      targetAudience: {
        departments: draft.audience.filter((item) => ["Computer Science", "Design"].includes(item)),
        years: [2, 3].filter((year) => draft.audience.includes(`${year}${year === 2 ? "nd" : "rd"} year`)),
        interests: draft.audience.filter((item) => ["AI & ML", "Technology", "Robotics", "Career"].includes(item)),
      },
    });
    localStorage.removeItem("campus-signal-draft");
  };
  const toggle = (key: "audience" | "tags", item: string) => {
    const current = draft[key];
    update(key, current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  };

  return (
    <div className="modal-backdrop create-backdrop" role="presentation">
      <section className="create-event-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <header className="create-modal-header"><button className="icon-button" onClick={onClose} aria-label="Close event creator"><ArrowLeft size={19} /></button><div><span className="create-overline">Organizer workspace</span><h2 id="create-title">Put something good on.</h2></div><span className="draft-saved"><CircleCheck size={14} />Draft saved</span></header>
        <div className="step-progress" aria-label={`Step ${step + 1} of ${steps.length}`}>{steps.map((label, index) => <div key={label} className={`step-item ${step === index ? "current" : ""} ${step > index ? "complete" : ""}`}><span>{step > index ? <Check size={14} /> : index + 1}</span><small>{label}</small></div>)}</div>
        <div className="create-form-content">
          {step === 0 && <div className="form-step"><h3>Start with the good bit.</h3><p>Give people a clear reason to show up.</p><label className="form-label">Event name<input value={draft.title} maxLength={80} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Build with AI: a hands-on lab" /></label><label className="form-label">Category<select value={draft.category} onChange={(event) => update("category", event.target.value)}>{optionTags.map((tag) => <option key={tag}>{tag}</option>)}<option>Competition</option><option>Business</option><option>Culture</option></select></label><label className="form-label">Short description<textarea value={draft.description} maxLength={180} onChange={(event) => update("description", event.target.value)} placeholder="What will students get to do, learn or meet?" rows={3} /><small>{draft.description.length}/180</small></label><span className="form-hint">A good description is specific, friendly, and easy to scan.</span></div>}
          {step === 1 && <div className="form-step"><h3>Make it easy to find.</h3><p>Clear logistics make plans feel possible.</p><div className="form-two-col"><label className="form-label">Date<input type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} /></label><label className="form-label">Format<select value={draft.mode} onChange={(event) => update("mode", event.target.value as Draft["mode"])}><option>In person</option><option>Online</option><option>Hybrid</option></select></label><label className="form-label">Starts<input type="time" value={draft.startTime} onChange={(event) => update("startTime", event.target.value)} /></label><label className="form-label">Ends<input type="time" value={draft.endTime} onChange={(event) => update("endTime", event.target.value)} /></label></div><label className="form-label">Location<input value={draft.venue} onChange={(event) => update("venue", event.target.value)} placeholder="Room, building or meeting link" /><span className="input-icon"><MapPin size={15} /></span></label></div>}
          {step === 2 && <div className="form-step"><h3>Help the right people find it.</h3><p>Tell students what they need to join, and who should hear about it.</p><label className="form-label">Eligibility<select value={draft.eligibility} onChange={(event) => update("eligibility", event.target.value)}><option>Open to all students</option><option>All undergraduate students</option><option>Beginner friendly</option><option>Bring a team</option></select></label><div className="form-label"><span>Topics and skills</span><div className="form-choice-grid">{optionTags.map((tag) => <button type="button" key={tag} className={`filter-chip ${draft.tags.includes(tag) ? "selected" : ""}`} onClick={() => toggle("tags", tag)}>{tag}</button>)}</div></div><div className="targeting-note"><Sparkles size={17} /><span><strong>Thoughtful reach starts here.</strong><small>Students with matching interests will see this closer to the top of their feed.</small></span></div><div className="form-label"><span>Send an announcement to</span><div className="form-choice-grid">{["Computer Science", "Design", "2nd year", "3rd year", "AI & ML"].map((item) => <button type="button" key={item} className={`filter-chip ${draft.audience.includes(item) ? "selected" : ""}`} onClick={() => toggle("audience", item)}>{item}</button>)}</div><small className="form-footnote">{draft.audience.length ? `Targeting ${draft.audience.join(", ")}` : "No filters selected — visible to everyone."}</small></div></div>}
          {step === 3 && <div className="form-step"><h3>Save a place for everyone.</h3><p>Set a limit and give people a fair heads-up.</p><label className="form-label">Available places<input type="number" min="1" max="5000" value={draft.capacity} onChange={(event) => update("capacity", Number(event.target.value))} /><span className="input-icon"><Users size={15} /></span></label><label className="form-label">Registration closes<input type="date" value={draft.deadline} onChange={(event) => update("deadline", event.target.value)} /></label><div className="targeting-note"><Users size={17} /><span><strong>Waitlist is on by default.</strong><small>When all {draft.capacity || "your"} places are taken, students can join the waitlist.</small></span></div></div>}
          {step === 4 && <div className="form-step review-step"><h3>Ready for the campus?</h3><p>Take one last look. You can edit any detail after publishing.</p><article className="preview-event"><span className="preview-image"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80" alt="" /></span><div><span className="category-pill">{draft.category}</span><h4>{draft.title || "Your event name"}</h4><p>{draft.description || "Your short description will show here."}</p><span className="preview-meta"><MapPin size={14} />{draft.venue || "Add a location"} <span>{draft.date}</span></span></div></article><div className="targeting-note success-note"><CircleCheck size={17} /><span><strong>Looks good from here.</strong><small>{draft.audience.length ? `Your announcement is aimed at ${draft.audience.join(", ")}.` : "Your event will be visible to everyone on campus."}</small></span></div></div>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
        <footer className="create-modal-footer"><span>{step + 1} of {steps.length}</span>{step > 0 && <button className="button button-subtle" onClick={() => { setError(""); setStep((current) => current - 1); }}>Back</button>}{step < steps.length - 1 ? <button className="button button-primary" onClick={next}>Continue <ArrowRight size={16} /></button> : <button className="button button-primary" onClick={publish}><Sparkles size={16} />Publish event</button>}</footer>
        <span className="sr-only"><ChevronRight /></span>
      </section>
    </div>
  );
}
