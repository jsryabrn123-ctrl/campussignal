import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { categoryOptions } from "../data/events";
import { EventCard, EmptyState } from "../components/UI";
import type { CampusEvent } from "../types";

interface DiscoverProps {
  events: CampusEvent[];
  savedIds: string[];
  registeredIds: string[];
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
}

export default function Discover({ events, savedIds, registeredIds, onOpen, onSave }: DiscoverProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All events");
  const [mode, setMode] = useState("Any format");
  const [sort, setSort] = useState("Recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filteredEvents = useMemo(() => {
    const search = query.trim().toLowerCase();
    const list = events.filter((event) => {
      const matchesSearch = !search || [event.title, event.organizer, event.category, event.department, event.shortDescription, ...event.tags].join(" ").toLowerCase().includes(search);
      const matchesCategory = category === "All events" || event.category === category || (category === "Technology" && event.tags.includes("Technology"));
      const matchesMode = mode === "Any format" || event.mode === mode;
      return matchesSearch && matchesCategory && matchesMode && event.status !== "Cancelled";
    });
    if (sort === "Most popular") list.sort((a, b) => b.trending - a.trending);
    if (sort === "Date") list.sort((a, b) => a.date.localeCompare(b.date));
    if (sort === "Deadline soon") list.sort((a, b) => a.deadline.localeCompare(b.deadline));
    if (sort === "Newest") list.reverse();
    return list;
  }, [events, query, category, mode, sort]);

  return (
    <div className="page-content">
      <header className="page-title-row">
        <div><p className="welcome-date">There’s more happening here</p><h1>Find your next thing.</h1><p className="welcome-subtitle">Good events, good people, and a reason to leave your room.</p></div>
      </header>
      <div className="discover-toolbar">
        <label className="search-field"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “robotics”, “career” or a club name" aria-label="Search events" />{query && <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}</label>
        <button className={`filter-toggle ${filtersOpen ? "active" : ""}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><SlidersHorizontal size={17} />Filters</button>
        <label className="sort-select"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Recommended</option><option>Newest</option><option>Most popular</option><option>Deadline soon</option><option>Date</option></select></label>
      </div>
      {filtersOpen && <div className="filter-drawer">
        <div><span className="filter-label">Format</span><div className="filter-options">{["Any format", "In person", "Online", "Hybrid"].map((item) => <button key={item} className={`filter-chip ${mode === item ? "selected" : ""}`} onClick={() => setMode(item)}>{item}</button>)}</div></div>
        <div><span className="filter-label">Category</span><div className="filter-options">{categoryOptions.map((item) => <button key={item} className={`filter-chip ${category === item ? "selected" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
      </div>}
      <div className="discover-results-header"><p><strong>{filteredEvents.length}</strong> events to explore</p><span>Updated just now</span></div>
      {filteredEvents.length ? <div className="event-card-grid discover-grid">{filteredEvents.map((event) => <EventCard key={event.id} event={event} saved={savedIds.includes(event.id)} registered={registeredIds.includes(event.id)} onOpen={() => onOpen(event.id)} onSave={() => onSave(event.id)} />)}</div> : <EmptyState title="No events in this corner yet" detail="Try another search, or clear a filter to see what’s happening around campus." action={<button className="button button-primary" onClick={() => { setQuery(""); setCategory("All events"); setMode("Any format"); }}>Clear filters</button>} />}
    </div>
  );
}
