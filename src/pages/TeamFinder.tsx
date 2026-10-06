import { useMemo, useState, type FormEvent } from "react";
import { Check, Plus, UsersRound } from "lucide-react";
import type { CampusEvent, TeamJoinRequest, TeamPost } from "../types";
import { EmptyState, SectionHeading } from "../components/UI";
import { matchScore } from "../services/teams";

interface TeamFinderProps {
  events: CampusEvent[];
  posts: TeamPost[];
  requests: TeamJoinRequest[];
  studentSkills: string[];
  studentInterests: string[];
  onCreate: (post: Omit<TeamPost, "id" | "author" | "created">) => void;
  onRequest: (postId: string) => void;
}

export default function TeamFinder({ events, posts, requests, studentSkills, studentInterests, onCreate, onRequest }: TeamFinderProps) {
  const availableEvents = events.filter((event) => event.status !== "Cancelled" && event.status !== "Completed");
  const [eventId, setEventId] = useState(availableEvents[0]?.id ?? "");
  const [teamName, setTeamName] = useState("");
  const [note, setNote] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [openSlots, setOpenSlots] = useState("1");
  const skills = [...studentSkills, ...studentInterests];
  const eventById = new Map(events.map((event) => [event.id, event]));
  const openPosts = useMemo(
    () => posts.filter((post) => post.openSlots > 0).slice().sort((a, b) => matchScore(b, skills) - matchScore(a, skills)),
    [posts, skills.join("|")],
  );

  const submit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const event = eventById.get(eventId);
    if (!event) return;
    const neededSkills = skillsInput.split(",").map((item) => item.trim()).filter(Boolean);
    onCreate({
      eventId: event.id,
      eventTitle: event.title,
      teamName: teamName.trim(),
      lookingFor: neededSkills.length ? `Looking for ${neededSkills.join(", ")}` : "Open to all skills",
      skills: neededSkills,
      note: note.trim(),
      openSlots: Number(openSlots),
    });
    setTeamName("");
    setNote("");
    setSkillsInput("");
    setOpenSlots("1");
  };

  return (
    <div className="page-content">
      <header className="page-title-row">
        <div><p className="welcome-date">Build something together</p><h1>Team Finder.</h1><p className="welcome-subtitle">Find a crew for your next campus challenge, or make room for one more.</p></div>
      </header>
      <section className="team-create-panel">
        <SectionHeading title="Start a team" detail="Share the event, what you’re building, and who you need." />
        <form className="team-create-form" onSubmit={submit}>
          <label className="form-label">Event or hackathon
            <select required value={eventId} onChange={(event) => setEventId(event.target.value)}>
              {availableEvents.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
          </label>
          <label className="form-label">Team name<input required maxLength={60} value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="e.g. Campus Compass" /></label>
          <label className="form-label team-description-field">Short description<textarea required maxLength={240} rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What are you making, and what kind of teammate would fit?" /></label>
          <label className="form-label">Skills needed<input value={skillsInput} onChange={(event) => setSkillsInput(event.target.value)} placeholder="React, research, Figma" /></label>
          <label className="form-label">Open slots<input type="number" min="1" max="20" required value={openSlots} onChange={(event) => setOpenSlots(event.target.value)} /></label>
          <button className="button button-primary team-create-submit" type="submit" disabled={!availableEvents.length}><Plus size={16} />Post your team</button>
        </form>
      </section>

      <section className="team-posts-section">
        <SectionHeading title="Teams looking for people" detail="Posts with skills that match yours appear first." />
        {openPosts.length ? <div className="team-post-grid">{openPosts.map((post) => {
          const score = matchScore(post, skills);
          const requested = requests.some((request) => request.postId === post.id);
          return <article className="team-post-card" key={post.id}>
            <div className="team-post-topline"><span className="category-pill">{post.eventTitle}</span>{score > 0 && <span className="team-match"><Check size={13} />{score}% match</span>}</div>
            <h3>{post.teamName}</h3>
            <p className="team-post-event">Hosted by {post.author}</p>
            <p className="team-post-description">{post.note}</p>
            <div className="team-skill-list">{post.skills.length ? post.skills.map((skill) => <span className="filter-chip" key={skill}>{skill}</span>) : <span className="team-any-skill">All skills welcome</span>}</div>
            <div className="team-post-footer"><span><UsersRound size={15} />{post.openSlots} {post.openSlots === 1 ? "spot" : "spots"} open</span><button className={`button ${requested ? "button-subtle" : "button-primary"}`} disabled={requested} onClick={() => onRequest(post.id)}>{requested ? <><Check size={15} />Request sent</> : "Request to join"}</button></div>
          </article>;
        })}</div> : <EmptyState title="No teams open right now" detail="Post your own team and invite people to join." />}
      </section>
    </div>
  );
}
