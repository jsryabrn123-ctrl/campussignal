import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, Bookmark, CalendarDays, Check, Clock3, ExternalLink, MapPin, MessageCircle, Share2, Users } from "lucide-react";
import type { CampusEvent } from "../types";
import { eventImageUrl } from "../components/UI";

const DEMO_WHATSAPP_NUMBER = "15550100123";

interface EventDetailDialogProps {
  event: CampusEvent;
  registered: boolean;
  saved: boolean;
  waitlisted: boolean;
  canRegister: boolean;
  relatedEvents: CampusEvent[];
  onClose: () => void;
  onRegister: () => void;
  onSave: () => void;
  onOpenRelated: (id: string) => void;
}

export default function EventDetailDialog({ event, registered, saved, waitlisted, canRegister, relatedEvents, onClose, onRegister, onSave, onOpenRelated }: EventDetailDialogProps) {
  useEffect(() => {
    const closeOnEscape = (key: KeyboardEvent) => { if (key.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  const spots = Math.max(0, event.capacity - event.registered);
  return (
    <div className="modal-backdrop detail-backdrop" role="presentation" onMouseDown={(mouse) => { if (mouse.target === mouse.currentTarget) onClose(); }}>
      <article className="event-detail-modal" role="dialog" aria-modal="true" aria-labelledby="event-detail-title">
        <button className="detail-close icon-button" onClick={onClose} aria-label="Close event details"><ArrowLeft size={19} /><span>Back</span></button>
        <div className="detail-hero"><img src={eventImageUrl(event.image, 1600, 88)} alt="" /><span className="detail-hero-shade" /><span className="category-pill">{event.category}</span></div>
        <div className="detail-layout">
          <div className="detail-main">
            <div className="detail-organizer"><span className="organizer-avatar">{event.organizerInitials}</span><span><strong>{event.organizer}</strong><small>{event.department} · campus organizer</small></span><button className="icon-button share-button" aria-label="Share event" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Share2 size={17} /></button></div>
            <h1 id="event-detail-title">{event.title}</h1>
            <p className="detail-description">{event.description}</p>
            <section className="detail-section"><h2>What’s happening</h2><p>{event.shortDescription} Whether you’re brand new or already curious, this is a good place to start, ask questions, and meet people who like making things happen.</p><ul><li>Try a practical, hands-on activity</li><li>Meet students and mentors from across campus</li><li>Leave with ideas you can keep working on</li></ul></section>
            <section className="detail-section"><h2>Good to know</h2><div className="detail-facts"><div><Users size={16} /><span><strong>{event.eligibility}</strong><small>Who can come</small></span></div><div><Clock3 size={16} /><span><strong>{event.deadline && new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(new Date(event.deadline))}</strong><small>Registration closes</small></span></div><div><Check size={16} /><span><strong>{event.skills.join(", ") || "No experience needed"}</strong><small>Useful interests</small></span></div></div>{event.contactInfo && <p className="event-contact-line">Contact: {event.contactInfo}</p>}</section>
            {relatedEvents.length > 0 && <section className="detail-section related-section"><h2>If this sounds like you</h2>{relatedEvents.slice(0, 2).map((related) => <button key={related.id} className="related-event" onClick={() => onOpenRelated(related.id)}><span className="related-image"><img src={eventImageUrl(related.image, 240, 70)} alt="" /></span><span><strong>{related.title}</strong><small>{related.category} · {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(related.date))}</small></span><ArrowUpRight size={16} /></button>)}</section>}
          </div>
          <aside className="detail-sidebar">
            <div className="detail-info-card"><div className="detail-date-large"><span>{new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(event.date))}</span><strong>{new Intl.DateTimeFormat("en", { day: "2-digit" }).format(new Date(event.date))}</strong><small>{new Intl.DateTimeFormat("en", { weekday: "long" }).format(new Date(event.date))}</small></div><div className="detail-info-line"><CalendarDays size={17} /><span><strong>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(new Date(event.date))}</strong><small>{event.startTime} – {event.endTime}</small></span></div><div className="detail-info-line"><MapPin size={17} /><span><strong>{event.venue}</strong><small>{event.mode}</small></span></div><div className="detail-info-line"><Users size={17} /><span><strong>{event.registered} people are in</strong><small>{spots ? `${spots} places left` : "At capacity"}</small></span></div><div className="detail-capacity"><i style={{ width: `${Math.min(100, event.registered / event.capacity * 100)}%` }} /></div>
              {canRegister && <button className={`button detail-register-button ${registered ? "button-registered" : ""}`} onClick={onRegister} disabled={registered || ["Draft", "Cancelled", "Registration closed", "Completed"].includes(event.status)}>{registered ? <><Check size={17} />You’re on the list</> : waitlisted ? "Leave the waitlist" : spots ? "Save me a place" : "Join the waitlist"}</button>}
              {event.registrationLink && <a className="button detail-save-button" href={event.registrationLink} target="_blank" rel="noopener noreferrer">External registration</a>}
              <button className={`button detail-save-button ${saved ? "saved" : ""}`} onClick={onSave}><Bookmark size={16} fill={saved ? "currentColor" : "none"} />{saved ? "Saved for later" : "Save for later"}</button>
              {registered && <p className="registration-confirmation"><Check size={14} />You’re registered. We’ll remind you before it starts.</p>}
              <a className="button detail-save-button" href={`https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in ${event.title}. Could you share more details?`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />WhatsApp organizer</a>
              <a className="detail-organizer-link" href={`mailto:events@campussignal.edu?subject=${encodeURIComponent(event.title)}`}>Questions for the organizer <ExternalLink size={13} /></a>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
