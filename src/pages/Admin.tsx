import { BadgeCheck, CalendarDays, ChevronRight, CircleAlert, CircleCheck, Eye, ShieldCheck, Users } from "lucide-react";
import type { CampusEvent } from "../types";
import { SectionHeading } from "../components/UI";

interface AdminProps {
  events: CampusEvent[];
  featuredIds: string[];
  onFeature: (id: string) => void;
  onCancel: (id: string) => void;
  onOpen: (id: string) => void;
}

export default function Admin({ events, featuredIds, onFeature, onCancel, onOpen }: AdminProps) {
  const metrics = [
    { name: "People on campus", value: "8,492", note: "Students", icon: Users },
    { name: "Active events", value: String(events.filter((item) => item.status !== "Cancelled").length), note: "Across 12 departments", icon: CalendarDays },
    { name: "Sign-ups", value: events.reduce((sum, item) => sum + item.registered, 0).toLocaleString(), note: "This semester", icon: BadgeCheck },
    { name: "Needs a look", value: "04", note: "Organizer requests", icon: CircleAlert },
  ];
  return (
    <div className="page-content admin-page">
      <header className="organizer-header"><div><p className="welcome-date">Platform overview</p><h1>A healthier campus feed.</h1><p className="welcome-subtitle">Keep the good opportunities visible and the noise down.</p></div><span className="admin-shield"><ShieldCheck size={17} />Admin access</span></header>
      <div className="metric-grid admin-metric-grid">{metrics.map(({ name, value, note, icon: Icon }) => <article className="metric-card" key={name}><div className="metric-card-top"><span className="metric-icon blue"><Icon size={18} /></span><span className="metric-change"><ArrowTrend /></span></div><strong>{value}</strong><span className="metric-label">{name}</span><small className="metric-note">{note}</small></article>)}</div>
      <section className="admin-review-panel"><div className="review-heading"><span className="review-icon"><CircleAlert size={18} /></span><div><h2>Organizer requests</h2><p>A quick check keeps the campus feed useful and trustworthy.</p></div><span className="review-count">4 to review</span></div>
        <div className="review-request"><span className="review-avatar">EC</span><span className="review-copy"><strong>Entrepreneurship Cell</strong><small>Student organization · requested 2 hours ago</small></span><button className="text-link review-action" onClick={(event) => event.currentTarget.textContent = "Approved"}>Approve <ChevronRight size={15} /></button></div>
        <div className="review-request"><span className="review-avatar lavender-avatar">DS</span><span className="review-copy"><strong>Data Science Society</strong><small>Student organization · requested yesterday</small></span><button className="text-link review-action" onClick={(event) => event.currentTarget.textContent = "Approved"}>Approve <ChevronRight size={15} /></button></div>
        <button className="review-all">Review all requests <ChevronRight size={15} /></button>
      </section>
      <section className="admin-event-section"><SectionHeading title="Event moderation" detail="Feature the campus standouts, or take down an event that needs attention." />
        <div className="admin-event-list">{events.slice(0, 6).map((item) => <article className="admin-event-row" key={item.id}><span className="table-event-icon" style={{ background: item.accent }}><CalendarDays size={17} /></span><span className="admin-event-copy"><strong>{item.title}</strong><small>{item.organizer} · {item.category}</small></span><span className="admin-event-count"><Users size={14} />{item.registered}</span><button className={`feature-toggle ${featuredIds.includes(item.id) ? "featured" : ""}`} onClick={() => onFeature(item.id)} aria-label={featuredIds.includes(item.id) ? `Unfeature ${item.title}` : `Feature ${item.title}`}>{featuredIds.includes(item.id) ? <CircleCheck size={15} /> : <Eye size={15} />}{featuredIds.includes(item.id) ? "Featured" : "Feature"}</button><button className="table-action" onClick={() => item.status === "Cancelled" ? onOpen(item.id) : onCancel(item.id)}>{item.status === "Cancelled" ? "Review" : "Remove"}</button></article>)}</div>
      </section>
    </div>
  );
}

function ArrowTrend() {
  return <span className="admin-trend"><CircleCheck size={13} />Live</span>;
}
