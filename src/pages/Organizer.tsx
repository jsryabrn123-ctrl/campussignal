import { ArrowUpRight, CalendarDays, ChevronDown, Download, Plus, Users, Eye, Bookmark, BellRing } from "lucide-react";
import type { CampusEvent } from "../types";
import { SectionHeading } from "../components/UI";

interface OrganizerProps {
  events: CampusEvent[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function Organizer({ events, onCreate, onOpen, onCancel }: OrganizerProps) {
  const totalSignups = events.reduce((sum, event) => sum + event.registered, 0);
  const upcoming = events.filter((event) => new Date(event.date) > new Date() && event.status !== "Cancelled");
  const stats = [
    { label: "Events this term", value: events.length.toString().padStart(2, "0"), change: "+3 this month", icon: CalendarDays, tint: "blue" },
    { label: "Student sign-ups", value: totalSignups.toLocaleString(), change: "+18.4%", icon: Users, tint: "green" },
    { label: "Avg. attendance", value: "78%", change: "+6.2%", icon: ArrowUpRight, tint: "yellow" },
    { label: "People reached", value: "2.4k", change: "+12.8%", icon: BellRing, tint: "lavender" },
  ];
  const bars = [34, 46, 40, 61, 54, 72, 60, 82, 67, 94, 76, 100];

  return (
    <div className="page-content organizer-page">
      <header className="organizer-header">
        <div><p className="welcome-date">Organizer workspace</p><h1>Your events, in motion.</h1><p className="welcome-subtitle">A clear view of the things your community is making happen.</p></div>
        <button className="button button-primary" onClick={onCreate}><Plus size={17} />Create an event</button>
      </header>
      <div className="metric-grid">{stats.map(({ label, value, change, icon: Icon, tint }) => <article className="metric-card" key={label}><div className="metric-card-top"><span className={`metric-icon ${tint}`}><Icon size={18} /></span><span className="metric-change"><ArrowUpRight size={13} />{change}</span></div><strong>{value}</strong><span className="metric-label">{label}</span></article>)}</div>
      <section className="organizer-analytics-grid">
        <article className="analytics-card">
          <div className="chart-title"><div><h2>Sign-ups over time</h2><p>People are finding what you put out there.</p></div><button className="period-select">This semester <ChevronDown size={14} /></button></div>
          <div className="chart-summary"><strong>1,284</strong><span><ArrowUpRight size={14} /> 18.4% <small>from last semester</small></span></div>
          <div className="bar-chart" aria-label="Monthly signups chart">{bars.map((height, index) => <div className="bar-column" key={index}><span className={`bar ${index === 9 ? "highlight" : ""}`} style={{ height: `${height}%` }} /><small>{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][index]}</small></div>)}</div>
        </article>
        <article className="engagement-card">
          <div className="chart-title"><div><h2>What students do</h2><p>From seeing it to showing up.</p></div><button className="icon-button" aria-label="View engagement details"><ArrowUpRight size={17} /></button></div>
          <div className="engagement-ring"><div><strong>64%</strong><small>show up rate</small></div></div>
          <div className="engagement-legend"><span><i className="legend-blue" />Registered <strong>82%</strong></span><span><i className="legend-lime" />Attended <strong>64%</strong></span></div>
          <div className="reach-note"><BellRing size={15} /><span>Audience targeting helped reach <strong>312 students</strong> this week.</span></div>
        </article>
      </section>
      <section className="organizer-events-section">
        <SectionHeading title="Your event board" detail={`${upcoming.length} events coming up`} action={<button className="button button-subtle"><Download size={15} />Export list</button>} />
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Event</th><th>Date</th><th>Sign-ups</th><th>Capacity</th><th>Status</th><th aria-label="Actions" /></tr></thead>
          <tbody>{events.slice(0, 8).map((event) => <tr key={event.id}><td><button className="table-event" onClick={() => onOpen(event.id)}><span className="table-event-icon" style={{ background: event.accent }}><CalendarDays size={17} /></span><span><strong>{event.title}</strong><small>{event.organizer}</small></span></button></td><td>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(event.date))}</td><td><span className="table-signups"><Users size={14} />{event.registered}</span></td><td><span>{event.registered} / {event.capacity}</span></td><td><span className={`status-badge ${event.status === "Cancelled" ? "status-cancelled" : "status-open"}`}>{event.status === "Cancelled" ? "Cancelled" : event.registered >= event.capacity ? "Full" : "Open"}</span></td><td><button className="table-action" onClick={() => event.status === "Cancelled" ? onOpen(event.id) : onCancel(event.id)}>{event.status === "Cancelled" ? "View" : "Manage"}</button></td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="organizer-insights"><div className="insight-icon"><Eye size={18} /></div><div><strong>Make the next one easier to find.</strong><p>Targeted announcements reach students who care, without adding another campus-wide ping.</p></div><span className="insight-proof"><Bookmark size={14} /> 2.6× more saves</span></section>
      <span className="sr-only">{upcoming.length} upcoming events</span>
    </div>
  );
}
