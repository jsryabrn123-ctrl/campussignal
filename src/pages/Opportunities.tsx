import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { EmptyState } from "../components/UI";
import OpportunityCard from "../components/OpportunityCard";
import type { Opportunity, OpportunityType } from "../types";

const filters: { label: string; type?: OpportunityType }[] = [
  { label: "All" },
  { label: "Internships", type: "Internship" },
  { label: "Hackathons", type: "Hackathon" },
  { label: "Competitions", type: "Competition" },
  { label: "Scholarships", type: "Scholarship" },
  { label: "Workshops", type: "Workshop" },
  { label: "Courses", type: "Course" },
  { label: "Other", type: "Other" },
];

export default function Opportunities({ opportunities, studentSkills }: { opportunities: Opportunity[]; studentSkills: string[] }) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<OpportunityType | undefined>();
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return opportunities.filter((item) => {
      const categoryMatches = !activeType || item.type === activeType;
      const searchMatches = !search || [item.title, item.organization, item.type, item.description, ...item.skills, ...item.tags].join(" ").toLowerCase().includes(search);
      return categoryMatches && searchMatches;
    });
  }, [opportunities, query, activeType]);

  return (
    <div className="page-content opportunities-page">
      <header className="page-title-row">
        <div><p className="welcome-date">Beyond the campus calendar</p><h1>Opportunities.</h1><p className="welcome-subtitle">Internships, learning, and experiences worth your time.</p></div>
      </header>
      <aside className="opportunity-demo-note"><span>Sample listings</span><p>These are demo opportunities, not verified openings. Check the organization before applying.</p></aside>
      <div className="discover-toolbar opportunity-toolbar">
        <label className="search-field"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, organizations, or skills" aria-label="Search opportunities" />{query && <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}</label>
      </div>
      <div className="opportunity-filters" aria-label="Opportunity categories">
        {filters.map((filter) => <button key={filter.label} className={`filter-chip ${activeType === filter.type ? "selected" : ""}`} aria-pressed={activeType === filter.type} onClick={() => setActiveType(filter.type)}>{filter.label}</button>)}
      </div>
      <div className="discover-results-header"><p><strong>{filtered.length}</strong> sample opportunities</p><span>Check details before applying</span></div>
      {filtered.length ? <div className="opportunity-grid">{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} studentSkills={studentSkills} onOpen={() => setSelected(opportunity)} />)}</div> : <EmptyState title="No matches this time" detail="Try another search or choose a different category." action={<button className="button button-primary" onClick={() => { setQuery(""); setActiveType(undefined); }}>Clear filters</button>} />}
      {selected && <div className="modal-backdrop detail-backdrop opportunity-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <article className="opportunity-detail-modal" role="dialog" aria-modal="true" aria-labelledby="opportunity-title">
          <button className="detail-close icon-button" onClick={() => setSelected(null)} aria-label="Close opportunity details"><X size={18} /><span>Close</span></button>
          <span className={`opportunity-type type-${selected.type.toLowerCase()}`}>{selected.type} · Demo listing</span>
          <h2 id="opportunity-title">{selected.title}</h2>
          <p className="opportunity-organization">{selected.organization}</p>
          <p>{selected.details}</p>
          <dl className="opportunity-detail-facts"><div><dt>Location</dt><dd>{selected.location}</dd></div><div><dt>Deadline</dt><dd>{new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(selected.deadline))}</dd></div><div><dt>Eligibility</dt><dd>{selected.eligibility}</dd></div></dl>
          <h3>Skills and tags</h3><div className="opportunity-tags">{[...selected.skills, ...selected.tags].map((tag) => <span className="filter-chip" key={tag}>{tag}</span>)}</div>
          <a className="button button-primary opportunity-apply" href={selected.applyUrl} target="_blank" rel="noopener noreferrer">View sample link <ArrowUpRight size={16} /></a>
          <small className="opportunity-demo-footnote">Demo link only; no application is submitted.</small>
        </article>
      </div>}
    </div>
  );
}
