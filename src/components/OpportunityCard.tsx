import { ArrowUpRight, Clock3, MapPin, Sparkles } from "lucide-react";
import type { Opportunity } from "../types";

export function opportunityMatches(opportunity: Opportunity, studentSkills: string[]) {
  const skills = new Set(studentSkills.map((skill) => skill.trim().toLowerCase()));
  return opportunity.skills.some((skill) => skills.has(skill.toLowerCase()));
}

export function recommendedOpportunities(opportunities: Opportunity[], studentSkills: string[]) {
  return opportunities
    .map((opportunity, index) => ({ opportunity, index, matched: opportunityMatches(opportunity, studentSkills) }))
    .sort((left, right) => Number(right.matched) - Number(left.matched) || left.index - right.index)
    .slice(0, 3)
    .map(({ opportunity }) => opportunity);
}

export default function OpportunityCard({ opportunity, studentSkills, onOpen }: { opportunity: Opportunity; studentSkills: string[]; onOpen: () => void }) {
  const matched = opportunityMatches(opportunity, studentSkills);
  return (
    <article className="opportunity-card">
      <div className="opportunity-card-top">
        <span className={`opportunity-type type-${opportunity.type.toLowerCase()}`}>{opportunity.type}</span>
        {matched && <span className="opportunity-match"><Sparkles size={13} />Good match</span>}
      </div>
      <h2>{opportunity.title}</h2>
      <p className="opportunity-organization">{opportunity.organization}</p>
      <p className="opportunity-description">{opportunity.description}</p>
      <div className="opportunity-meta"><span><MapPin size={14} />{opportunity.location}</span><span><Clock3 size={14} />Due {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(opportunity.deadline))}</span></div>
      <div className="opportunity-tags">{opportunity.skills.slice(0, 3).map((skill) => <span className="filter-chip" key={skill}>{skill}</span>)}</div>
      <button className="opportunity-open" onClick={onOpen}>View details <ArrowUpRight size={15} /></button>
    </article>
  );
}
