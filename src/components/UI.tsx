import { ArrowUpRight, Bookmark, CalendarDays, Clock3, MapPin, Sparkles, Users } from "lucide-react";
import type { CampusEvent } from "../types";

export function SectionHeading({ title, detail, action }: { title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Sparkles size={21} /></span>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}

export function eventImageUrl(image: string, width = 720, quality = 78) {
  return image.startsWith("http") ? image : `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

export function EventCard({
  event,
  saved,
  registered,
  onOpen,
  onSave,
}: {
  event: CampusEvent;
  saved: boolean;
  registered: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  const date = new Date(event.date);
  const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  return (
    <article className="event-card">
      <button className="event-image-button" onClick={onOpen} aria-label={`View ${event.title}`}>
        <img src={eventImageUrl(event.image)} alt="" loading="lazy" />
        <span className="category-pill">{event.category}</span>
        <span className="date-stamp"><strong>{day}</strong><small>{month}</small></span>
      </button>
      <div className="event-card-content">
        <div className="event-organizer">
          <span className="organizer-avatar">{event.organizerInitials}</span>
          <span>{event.organizer}</span>
        </div>
        <button className="event-title-button" onClick={onOpen}><h3>{event.title}</h3></button>
        <p className="event-summary">{event.shortDescription}</p>
        <div className="event-meta">
          <span><Clock3 size={14} />{event.startTime}</span>
          <span><MapPin size={14} />{event.venue.split(",")[0]}</span>
          <span>{event.mode}</span>
        </div>
        <div className="event-card-footer">
          <span className={`registration-note ${registered ? "is-registered" : ""}`}>
            {registered ? "You’re going" : <><Users size={14} />{event.registered} going</>}
          </span>
          <span className={`event-listing-status ${event.status === "Registration open" || event.status === "Published" ? "open" : ""}`}>{event.status === "Registration open" || event.status === "Published" ? event.registered >= event.capacity ? "Full" : "Open" : event.status}</span>
          <button className={`icon-button bookmark-button ${saved ? "is-saved" : ""}`} aria-label={saved ? "Remove saved event" : "Save event"} onClick={onSave}>
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          </button>
          <button className="card-view-link" onClick={onOpen} aria-label={`View details for ${event.title}`}><ArrowUpRight size={16} /></button>
        </div>
      </div>
    </article>
  );
}

export function EventRow({ event, onOpen }: { event: CampusEvent; onOpen: () => void }) {
  const date = new Date(event.date);
  return (
    <button className="event-row" onClick={onOpen}>
      <span className="row-date"><strong>{new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date)}</strong><small>{new Intl.DateTimeFormat("en", { month: "short" }).format(date)}</small></span>
      <span className="row-event-copy"><strong>{event.title}</strong><small>{event.organizer}</small></span>
      <span className="row-event-time"><CalendarDays size={14} />{event.startTime}</span>
    </button>
  );
}
