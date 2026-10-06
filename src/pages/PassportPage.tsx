import { Download, Sparkles } from "lucide-react";
import type { CampusEvent } from "../types";
import { EmptyState, SectionHeading } from "../components/UI";
import { buildPassport, exportPassportText, passportSkills } from "../services/passport";

export default function PassportPage({ events, attendedIds, registeredIds }: { events: CampusEvent[]; attendedIds: string[]; registeredIds: string[] }) {
  const stamps = buildPassport(events, attendedIds, registeredIds);
  const skills = passportSkills(stamps);
  const attended = stamps.filter((stamp) => stamp.verified);
  const joined = stamps.filter((stamp) => {
    const event = events.find((item) => item.id === stamp.eventId);
    return event ? /workshop|hackathon|hands-on lab/i.test(`${event.category} ${event.title} ${event.shortDescription}`) : false;
  });

  const exportPassport = () => {
    const file = new Blob([exportPassportText("JSR", stamps)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "campus-signal-passport.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return <div className="page-content">
    <header className="page-title-row">
      <div><p className="welcome-date">A record of what you’ve been part of</p><h1>My Passport.</h1><p className="welcome-subtitle">Your campus experiences, skills, and next steps in one place.</p></div>
      <button className="button button-primary" onClick={exportPassport}><Download size={16} />Export Passport</button>
    </header>
    <section className="passport-stat-grid" aria-label="Participation statistics">
      <article className="passport-stat"><span>Events attended</span><strong>{attended.length}</strong></article>
      <article className="passport-stat"><span>Skills earned</span><strong>{skills.length}</strong></article>
      <article className="passport-stat"><span>Workshops & hackathons joined</span><strong>{joined.length}</strong></article>
    </section>
    <section className="passport-skills-panel">
      <SectionHeading title="Skills in your passport" detail="Skills from events you’ve attended." />
      <div className="passport-skill-list">{skills.length ? skills.map(({ skill, count }) => <span className="passport-skill" key={skill}><Sparkles size={14} />{skill}<small>{count}</small></span>) : <span className="passport-muted">Your earned skills will appear as you take part.</span>}</div>
    </section>
    <section className="passport-events-section">
      <SectionHeading title="Your events" detail="Past attendance is marked separately from upcoming registrations." />
      {stamps.length ? <div className="passport-event-list">{stamps.map((stamp) => <article className="passport-event-row" key={stamp.eventId}>
        <span className="passport-event-date">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(stamp.date))}</span>
        <div className="passport-event-copy"><h3>{stamp.title}</h3><p>{stamp.organizer}</p><div className="team-skill-list">{(stamp.verified ? [stamp.category, ...stamp.skills] : [stamp.category]).map((skill) => <span className="filter-chip" key={skill}>{skill}</span>)}{!stamp.verified && <span className="passport-muted">Skills unlock after attendance</span>}</div></div>
        <span className={`passport-status ${stamp.verified ? "attended" : ""}`}>{stamp.verified ? "Attended" : "Registered"}</span>
      </article>)}</div> : <EmptyState title="Your passport starts here" detail="Register for an event and your participation will show up here." />}
    </section>
  </div>;
}
