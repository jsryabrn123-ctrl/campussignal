import { ArrowRight, ArrowUpRight, Award, Bell, Bookmark, CalendarDays, ChevronRight, Clock3, MapPin, TrendingUp, Users } from "lucide-react";
import type { CampusEvent, CampusNotification, AppPage } from "../types";
import { EventCard, EventRow, SectionHeading } from "../components/UI";
import OpportunityCard, { recommendedOpportunities } from "../components/OpportunityCard";
import type { Opportunity } from "../types";

interface DashboardProps {
  events: CampusEvent[];
  savedIds: string[];
  registeredIds: string[];
  notifications: CampusNotification[];
  opportunities: Opportunity[];
  studentSkills: string[];
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
  onNavigate: (page: AppPage) => void;
}

export default function Dashboard({ events, savedIds, registeredIds, notifications, opportunities, studentSkills, onOpen, onSave, onNavigate }: DashboardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const upcoming = events.filter((event) => registeredIds.includes(event.id)).sort((a, b) => a.date.localeCompare(b.date));
  const firstEvent = events.find((event) => event.id === "campus-hack") ?? events[0];
  const recommended = events.filter((event) => !registeredIds.includes(event.id)).slice(0, 3);
  const deadlineSoon = [...events].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);
  const opportunityPicks = recommendedOpportunities(opportunities, studentSkills);

  return (
    <div className="page-content dashboard-page">
      <header className="welcome-header">
        <div>
          <p className="welcome-date">{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p>
          <h1>Your campus, <em>in motion.</em></h1>
          <p className="welcome-subtitle">{greeting}, JSR. {recommended.length} thoughtful picks from around campus.</p>
        </div>
        <div className="dashboard-quick-actions">
          <button className="button button-ghost" onClick={() => onNavigate("passport")}><Award size={16} />My Passport</button>
          <button className="button button-primary" onClick={() => onNavigate("discover")}>Explore campus <ArrowRight size={15} /></button>
          <button className="dashboard-notification-link" onClick={() => onNavigate("notifications")}><Bell size={15} />{notifications.filter((note) => !note.read).length} new</button>
        </div>
      </header>

      <section className="dashboard-feature-grid">
        <article className="dashboard-feature">
          <div className="dashboard-feature-heading"><span>Campus pick</span><button className={`feature-save ${savedIds.includes(firstEvent.id) ? "is-saved" : ""}`} onClick={() => onSave(firstEvent.id)} aria-label={savedIds.includes(firstEvent.id) ? "Remove saved event" : "Save event"}><Bookmark size={17} fill={savedIds.includes(firstEvent.id) ? "currentColor" : "none"} /></button></div>
          <p className="dashboard-feature-kicker">{firstEvent.category} <span>·</span> A campus pick</p>
          <button className="dashboard-feature-title" onClick={() => onOpen(firstEvent.id)}><h2>{firstEvent.title}</h2></button>
          <p className="dashboard-feature-description">{firstEvent.shortDescription}</p>
          <div className="dashboard-feature-meta"><span><CalendarDays size={15} />{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date(firstEvent.date))}</span><span><MapPin size={15} />{firstEvent.venue.split(",")[0]}</span><span><Users size={15} />{firstEvent.registered} going</span></div>
          <button className="text-link dashboard-feature-link" onClick={() => onOpen(firstEvent.id)}>Read the event details <ArrowRight size={15} /></button>
        </article>

        <aside className="up-next-panel">
          <div className="up-next-heading">
            <div><span className="section-kicker">ON YOUR CALENDAR</span><h2>Up next</h2></div>
            <button className="text-link" aria-label="Open calendar" onClick={() => onNavigate("calendar")}><ArrowUpRight size={18} /></button>
          </div>
          {upcoming.length ? upcoming.slice(0, 3).map((event) => <EventRow key={event.id} event={event} onOpen={() => onOpen(event.id)} />) : (
            <div className="calendar-empty"><CalendarDays size={21} /><p>Your calendar’s ready for a first plan.</p><button onClick={() => onNavigate("discover")}>Find an event <ChevronRight size={14} /></button></div>
          )}
          <button className="text-link calendar-link" onClick={() => onNavigate("calendar")}>Open calendar <ArrowRight size={15} /></button>
        </aside>
      </section>

      <section className="section-block">
        <SectionHeading title="Worth your time" detail="A little more signal, a little less noise." action={<button className="text-link" onClick={() => onNavigate("discover")}>All events <ArrowRight size={15} /></button>} />
        <div className="event-card-grid">
          {recommended.map((event) => <EventCard key={event.id} event={event} saved={savedIds.includes(event.id)} registered={registeredIds.includes(event.id)} onOpen={() => onOpen(event.id)} onSave={() => onSave(event.id)} />)}
        </div>
      </section>

      <section className="section-block recommended-opportunities">
        <SectionHeading title="Recommended opportunities" detail="Sample internships, challenges, and learning picks matched to your skills." action={<button className="text-link" onClick={() => onNavigate("opportunities")}>Explore all <ArrowRight size={15} /></button>} />
        <div className="opportunity-grid dashboard-opportunity-grid">{opportunityPicks.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} studentSkills={studentSkills} onOpen={() => onNavigate("opportunities")} />)}</div>
      </section>

      <section className="bottom-discovery-grid">
        <div className="pulse-panel">
          <div className="pulse-panel-title"><span className="pulse-icon"><TrendingUp size={18} /></span><div><h2>Campus pulse</h2><p>What students are showing up for</p></div></div>
          <button className="pulse-feature" onClick={() => onOpen(events.find((event) => event.id === "drone-flight")?.id ?? events[0].id)}>
            <span className="pulse-number">01</span><span><strong>Hands-on building</strong><small>Robotics, AI and maker nights</small></span><span className="pulse-bar"><i style={{ width: "88%" }} /></span>
          </button>
          <button className="pulse-feature" onClick={() => onOpen(events.find((event) => event.id === "resume-clinic")?.id ?? events[0].id)}>
            <span className="pulse-number">02</span><span><strong>Career, but human</strong><small>Small-group feedback is in</small></span><span className="pulse-bar"><i style={{ width: "66%" }} /></span>
          </button>
          <button className="pulse-feature" onClick={() => onOpen(events.find((event) => event.id === "type-and-motion")?.id ?? events[0].id)}>
            <span className="pulse-number">03</span><span><strong>Creative crossover</strong><small>Make things with new people</small></span><span className="pulse-bar"><i style={{ width: "48%" }} /></span>
          </button>
        </div>
        <div className="deadline-panel">
          <SectionHeading title="Closing soon" detail="Good things don’t wait around." />
          {deadlineSoon.map((event) => (
            <button className="deadline-row" key={event.id} onClick={() => onOpen(event.id)}>
              <span className="deadline-symbol"><Clock3 size={17} /></span>
              <span><strong>{event.title}</strong><small>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(event.deadline))} · registration closes</small></span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
