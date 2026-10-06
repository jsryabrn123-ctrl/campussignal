import { ArrowRight, ArrowUpRight, Award, Bell, CalendarDays, ChevronRight, Clock3, MapPin, Sparkles, TrendingUp } from "lucide-react";
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
          <h1>{greeting}, JSR <span aria-hidden="true">✳</span></h1>
          <p className="welcome-subtitle">{recommended.length} things worth your time, picked from around campus.</p>
        </div>
        <div className="dashboard-quick-actions">
          <button className="quiet-action" onClick={() => onNavigate("passport")}><Award size={17} />My Passport</button>
          <button className="quiet-action" onClick={() => onNavigate("notifications")}><Bell size={17} />{notifications.filter((note) => !note.read).length} new</button>
        </div>
      </header>

      <section className="dashboard-top-grid">
        <article className="feature-event" style={{ "--feature-accent": firstEvent.accent } as React.CSSProperties}>
          <img src={`https://images.unsplash.com/${firstEvent.image}?auto=format&fit=crop&w=1400&q=85`} alt="" />
          <div className="feature-shade" />
          <div className="feature-copy">
            <span className="feature-eyebrow"><span className="live-dot" /> Campus pick</span>
            <h2>{firstEvent.title}</h2>
            <p>{firstEvent.shortDescription}</p>
            <div className="feature-meta"><span><CalendarDays size={15} />{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date(firstEvent.date))}</span><span><MapPin size={15} />{firstEvent.venue.split(",")[0]}</span></div>
            <button className="feature-button" onClick={() => onOpen(firstEvent.id)}>See what it’s about <ArrowRight size={16} /></button>
          </div>
          <div className="feature-side-note"><Sparkles size={15} /> Made for curious minds</div>
        </article>

        <aside className="up-next-panel">
          <div className="up-next-heading">
            <div><span className="section-kicker">Your calendar</span><h2>Up next</h2></div>
            <button className="icon-button" aria-label="Open calendar" onClick={() => onNavigate("calendar")}><ArrowUpRight size={18} /></button>
          </div>
          {upcoming.length ? upcoming.slice(0, 3).map((event) => <EventRow key={event.id} event={event} onOpen={() => onOpen(event.id)} />) : (
            <div className="calendar-empty"><CalendarDays size={21} /><p>Your calendar’s ready for a first plan.</p><button onClick={() => onNavigate("discover")}>Find an event <ChevronRight size={14} /></button></div>
          )}
          <button className="text-link calendar-link" onClick={() => onNavigate("calendar")}>Open calendar <ArrowRight size={15} /></button>
        </aside>
      </section>

      <section className="section-block">
        <SectionHeading title="Picked for you" detail="A little more signal, a little less noise." action={<button className="text-link" onClick={() => onNavigate("discover")}>See all <ArrowRight size={15} /></button>} />
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
