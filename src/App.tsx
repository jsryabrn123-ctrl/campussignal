import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, Bell, CalendarDays, ChevronDown, Compass, Home, Layers3, Menu, Plus, Search, Settings,
  ShieldCheck, Sparkles, Bookmark, X, UsersRound, Check,
} from "lucide-react";
import { seedEvents, seedNotifications } from "./data/events";
import type { AppPage, AppState, CampusEvent, UserRole } from "./types";
import { recommendEvents } from "./services/recommendations";
import { getRegistrationDecision } from "./services/registrations";
import { matchesAudience } from "./services/notificationTargeting";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Organizer from "./pages/Organizer";
import Admin from "./pages/Admin";
import CreateEvent from "./pages/CreateEvent";
import EventDetailDialog from "./pages/EventDetailDialog";
import { CalendarPage, NotificationsPage, SavedPage, SettingsPage } from "./pages/OtherPages";

const storageKey = "campus-signal-workspace";
const demoStudent = { id: "maya", department: "Computer Science", year: 2, interests: ["AI & ML", "Design", "Career", "Robotics", "Technology"], skills: ["Python", "React"], participatedCategories: ["AI & ML"] };
const defaultState: AppState = {
  role: "student",
  page: "home",
  events: seedEvents,
  savedIds: ["design-systems", "campus-hack", "resume-clinic"],
  registeredIds: ["ai-lab"],
  waitlistedIds: [],
  featuredIds: ["campus-hack"],
  studentInterests: ["AI & ML", "Design", "Career", "Robotics", "Technology"],
  notificationPreferences: { reminders: true, recommendations: true, announcements: true },
  notifications: seedNotifications,
};
function loadState(): AppState {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return defaultState;
    const parsed = JSON.parse(saved) as Partial<AppState>;
    return {
      ...defaultState,
      ...parsed,
      events: Array.isArray(parsed.events) && parsed.events.length ? parsed.events : defaultState.events,
      studentInterests: Array.isArray(parsed.studentInterests) ? parsed.studentInterests : defaultState.studentInterests,
      notificationPreferences: { ...defaultState.notificationPreferences, ...parsed.notificationPreferences },
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : defaultState.notifications,
    };
  } catch (error) {
    console.warn("Campus Signal saved workspace could not be restored.", error);
    return defaultState;
  }
}

const navigation: Record<UserRole, { label: string; page: AppPage; icon: typeof Home }[]> = {
  student: [
    { label: "Home", page: "home", icon: Home },
    { label: "Discover", page: "discover", icon: Compass },
    { label: "Saved", page: "saved", icon: Bookmark },
    { label: "Calendar", page: "calendar", icon: CalendarDays },
    { label: "Notifications", page: "notifications", icon: Bell },
  ],
  organizer: [
    { label: "Organizer home", page: "organizer", icon: Activity },
    { label: "Discover", page: "discover", icon: Compass },
    { label: "My events", page: "organizer", icon: CalendarDays },
    { label: "Participants", page: "organizer", icon: UsersRound },
    { label: "Notifications", page: "notifications", icon: Bell },
  ],
  admin: [
    { label: "Overview", page: "admin", icon: Activity },
    { label: "Events", page: "admin", icon: CalendarDays },
    { label: "Organizers", page: "admin", icon: ShieldCheck },
    { label: "People", page: "admin", icon: UsersRound },
    { label: "Reports", page: "admin", icon: Layers3 },
  ],
};

const pageNames: Record<AppPage, string> = {
  home: "Your campus, in the loop",
  discover: "Find your next thing",
  saved: "Saved for later",
  calendar: "Your calendar",
  notifications: "Notifications",
  organizer: "Organizer workspace",
  admin: "Platform overview",
  settings: "Settings",
};

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const unreadCount = state.notifications.filter((item) => !item.read).length;
  const selectedEvent = state.events.find((event) => event.id === selectedEventId);
  const visibleEvents = useMemo(() => recommendEvents(state.events, { interests: state.studentInterests, department: "Computer Science", year: 2 }, [], new Date()), [state.events, state.studentInterests]);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(state)); }, [state]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const update = (change: Partial<AppState>) => setState((current) => ({ ...current, ...change }));
  const notify = (message: string) => setToast(message);
  const toggleSaved = (id: string) => {
    const isSaved = state.savedIds.includes(id);
    update({ savedIds: isSaved ? state.savedIds.filter((item) => item !== id) : [...state.savedIds, id] });
    notify(isSaved ? "Removed from your saved events." : "Saved for later.");
  };
  const register = (event: CampusEvent) => {
    const decision = getRegistrationDecision(event, state.registeredIds, state.waitlistedIds);
    if (decision === "already-registered") { notify("You’re already registered for this event."); return; }
    if (decision === "closed") { notify("Registration is closed for this event."); return; }
    if (decision === "already-waitlisted") {
      update({ waitlistedIds: state.waitlistedIds.filter((id) => id !== event.id) });
      notify("You left the waitlist.");
      return;
    }
    if (decision === "waitlist") {
      update({ waitlistedIds: [...state.waitlistedIds, event.id] });
      notify("You’re on the waitlist. We’ll let you know if a spot opens.");
      return;
    }
    update({
      registeredIds: [...state.registeredIds, event.id],
      events: state.events.map((item) => item.id === event.id ? { ...item, registered: item.registered + 1 } : item),
      notifications: [{ id: `registration-${Date.now()}`, title: "You’re on the list", body: `You’re registered for ${event.title}. We’ll remind you before it starts.`, time: "Just now", priority: "important", read: false, eventId: event.id }, ...state.notifications],
    });
    notify("You’re registered. It’s in your calendar.");
  };
  const cancelEvent = (id: string) => {
    const event = state.events.find((item) => item.id === id);
    if (!event) return;
    if (!window.confirm(`Cancel “${event.title}”? Students will no longer be able to register.`)) return;
    update({ events: state.events.map((item) => item.id === id ? { ...item, status: "Cancelled" } : item) });
    notify("Event cancelled.");
  };
  const changeRole = (role: UserRole) => {
    update({ role, page: role === "student" ? "home" : role });
    setRoleMenuOpen(false);
    notify(`Demo view changed to ${role}.`);
  };
  const publishEvent = (event: CampusEvent) => {
    update({
      events: [event, ...state.events],
      notifications: state.notificationPreferences.announcements && matchesAudience(demoStudent, event.targetAudience ?? {})
        ? [{ id: `announcement-${Date.now()}`, title: "A new campus event", body: `${event.title} is now open for registration.`, time: "Just now", priority: "normal", read: false, eventId: event.id }, ...state.notifications]
        : state.notifications,
    });
    setCreateOpen(false);
    setSelectedEventId(event.id);
    notify("Event published. It’s live on the campus feed.");
  };
  const toggleFeatured = (id: string) => {
    const featured = state.featuredIds.includes(id);
    update({ featuredIds: featured ? state.featuredIds.filter((item) => item !== id) : [...state.featuredIds, id] });
    notify(featured ? "Removed from featured events." : "Featured on the campus feed.");
  };
  const setNotificationPreference = (key: keyof AppState["notificationPreferences"], value: boolean) => {
    update({ notificationPreferences: { ...state.notificationPreferences, [key]: value } });
  };
  const markRead = (id: string) => update({ notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item) });
  const openPage = (page: AppPage) => {
    update({ page });
    setMobileMenuOpen(false);
    setRoleMenuOpen(false);
  };
  const resetWorkspace = () => {
    localStorage.removeItem(storageKey);
    setState(defaultState);
    notify("Demo workspace reset.");
  };
  const openEvent = useCallback((id: string) => setSelectedEventId(id), []);

  let pageContent;
  switch (state.page) {
    case "home": pageContent = <Dashboard events={visibleEvents} savedIds={state.savedIds} registeredIds={state.registeredIds} notifications={state.notifications} onOpen={openEvent} onSave={toggleSaved} onNavigate={openPage} />; break;
    case "discover": pageContent = <Discover events={visibleEvents} savedIds={state.savedIds} registeredIds={state.registeredIds} onOpen={openEvent} onSave={toggleSaved} />; break;
    case "saved": pageContent = <SavedPage events={visibleEvents} savedIds={state.savedIds} registeredIds={state.registeredIds} onOpen={openEvent} onSave={toggleSaved} onDiscover={() => openPage("discover")} />; break;
    case "calendar": pageContent = <CalendarPage events={state.events} registeredIds={state.registeredIds} savedIds={state.savedIds} onOpen={openEvent} />; break;
    case "notifications": pageContent = <NotificationsPage notifications={state.notifications} onRead={markRead} onReadAll={() => update({ notifications: state.notifications.map((item) => ({ ...item, read: true })) })} onOpen={openEvent} />; break;
    case "organizer": pageContent = <Organizer events={state.events} onCreate={() => setCreateOpen(true)} onOpen={openEvent} onCancel={cancelEvent} />; break;
    case "admin": pageContent = <Admin events={state.events} featuredIds={state.featuredIds} onFeature={toggleFeatured} onCancel={cancelEvent} onOpen={openEvent} />; break;
    case "settings": pageContent = <SettingsPage role={state.role} interests={state.studentInterests} notificationPreferences={state.notificationPreferences} onInterestsChange={(studentInterests) => update({ studentInterests })} onPreferenceChange={setNotificationPreference} onReset={resetWorkspace} />; break;
  }

  const roles: { value: UserRole; label: string; initials: string }[] = [
    { value: "student", label: "Maya Chen · Student", initials: "MC" },
    { value: "organizer", label: "Computer Science Club", initials: "CS" },
    { value: "admin", label: "Campus administrator", initials: "AD" },
  ];
  const activeIdentity = roles.find((item) => item.value === state.role)!;
  const sidebar = (mobile = false) => <div className={mobile ? "mobile-nav-inner" : "sidebar-inner"}>
    <button className="brand-lockup" onClick={() => openPage(state.role === "student" ? "home" : state.role)} aria-label="Campus Signal home"><span className="brand-mark"><span /><span /><span /></span><span className="brand-name">campus<span>signal</span></span></button>
    <div className="sidebar-context"><span className="context-dot" />{state.role === "student" ? "Student space" : state.role === "organizer" ? "Organizer space" : "Admin space"}</div>
    <nav className="primary-nav" aria-label="Main navigation"><span className="nav-group-label">Your space</span>{navigation[state.role].map(({ label, page, icon: Icon }, index) => { const active = state.page === page && (page !== "organizer" || index === 0) && (page !== "admin" || index === 0); return <button key={`${label}-${index}`} className={`nav-item ${active ? "active" : ""}`} onClick={() => openPage(page)}><Icon size={18} strokeWidth={active ? 2.2 : 1.8} /><span>{label}</span>{label === "Notifications" && unreadCount > 0 && <i className="nav-unread">{unreadCount}</i>}</button>; })}</nav>
    {state.role === "student" && <div className="sidebar-note"><span className="sidebar-note-icon"><Sparkles size={16} /></span><strong>Better finds, less noise.</strong><p>Your feed learns what you like as you go.</p><button onClick={() => openPage("settings")}>Tune your interests <ChevronDown size={14} /></button></div>}
    {state.role === "organizer" && <button className="sidebar-create-button" onClick={() => setCreateOpen(true)}><Plus size={17} />Create an event</button>}
    <div className="sidebar-bottom"><button className={`nav-item ${state.page === "settings" ? "active" : ""}`} onClick={() => openPage("settings")}><Settings size={18} /><span>Settings</span></button><div className="sidebar-user-wrap"><button className="sidebar-user" onClick={() => mobile ? setRoleMenuOpen(!roleMenuOpen) : openPage("settings")} aria-expanded={mobile && roleMenuOpen}><span className={`profile-avatar avatar-${state.role}`}>{activeIdentity.initials}</span><span className="sidebar-user-copy"><strong>{activeIdentity.label.split(" · ")[0]}</strong><small>{state.role === "student" ? "Computer Science · Year 2" : state.role === "organizer" ? "Verified organizer" : "Platform team"}</small></span><ChevronDown size={16} /></button>{mobile && roleMenuOpen && <div className="role-popover role-popover-mobile"><span>Demo workspace</span>{roles.map((role) => <button key={role.value} className={state.role === role.value ? "current-role" : ""} onClick={() => changeRole(role.value)}><span className={`profile-avatar avatar-${role.value}`}>{role.initials}</span><span>{role.label}</span>{state.role === role.value && <Check size={15} />}</button>)}</div>}</div></div>
  </div>;

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">{sidebar()}</aside>
      <header className="mobile-topbar"><button className="brand-lockup" onClick={() => openPage(state.role === "student" ? "home" : state.role)}><span className="brand-mark"><span /><span /><span /></span><span className="brand-name">campus<span>signal</span></span></button><div><button className="icon-button" onClick={() => openPage("discover")} aria-label="Search events"><Search size={19} /></button><button className="icon-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button></div></header>
      {mobileMenuOpen && <div className="mobile-menu-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}>{sidebar(true)}</div>}
      <main className="main-area">
        <div className="topbar"><div className="breadcrumb"><span>Campus</span><span>/</span><strong>{pageNames[state.page]}</strong></div><div className="topbar-actions"><button className="top-search" onClick={() => openPage("discover")}><Search size={16} /><span>Search events</span><kbd>/</kbd></button><button className="topbar-notification" aria-label={`${unreadCount} unread notifications`} onClick={() => openPage("notifications")}><Bell size={18} />{unreadCount > 0 && <i />}</button><span className="topbar-divider" /><div className="topbar-role"><span className="demo-label">Viewing as</span><button onClick={() => setRoleMenuOpen(!roleMenuOpen)} aria-expanded={roleMenuOpen}><span className={`profile-avatar avatar-${state.role}`}>{activeIdentity.initials}</span><span>{state.role === "student" ? "Student" : state.role === "organizer" ? "Organizer" : "Admin"}</span><ChevronDown size={14} /></button>{roleMenuOpen && <div className="role-popover topbar-role-popover"><span>Demo workspace</span>{roles.map((role) => <button key={role.value} className={state.role === role.value ? "current-role" : ""} onClick={() => changeRole(role.value)}><span className={`profile-avatar avatar-${role.value}`}>{role.initials}</span><span>{role.label}</span>{state.role === role.value && <Check size={15} />}</button>)}</div>}</div></div></div>
        {pageContent}
      </main>
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">{(state.role === "student" ? [{ page: "home" as const, icon: Home, label: "Home" }, { page: "discover" as const, icon: Compass, label: "Discover" }, { page: "saved" as const, icon: Bookmark, label: "Saved" }, { page: "calendar" as const, icon: CalendarDays, label: "Calendar" }]: state.role === "organizer" ? [{ page: "organizer" as const, icon: Activity, label: "Home" }, { page: "discover" as const, icon: Compass, label: "Discover" }, { page: "notifications" as const, icon: Bell, label: "Inbox" }, { page: "settings" as const, icon: Settings, label: "Settings" }] : [{ page: "admin" as const, icon: Activity, label: "Overview" }, { page: "discover" as const, icon: Compass, label: "Events" }, { page: "notifications" as const, icon: Bell, label: "Inbox" }, { page: "settings" as const, icon: Settings, label: "Settings" }]).map(({ page, icon: Icon, label }) => <button key={page} className={state.page === page ? "active" : ""} onClick={() => openPage(page)}><Icon size={19} /><span>{label}</span></button>)}</nav>
      {selectedEvent && <EventDetailDialog event={selectedEvent} registered={state.registeredIds.includes(selectedEvent.id)} saved={state.savedIds.includes(selectedEvent.id)} waitlisted={state.waitlistedIds.includes(selectedEvent.id)} canRegister={state.role === "student"} relatedEvents={state.events.filter((item) => item.id !== selectedEvent.id && item.category === selectedEvent.category)} onClose={() => setSelectedEventId(null)} onRegister={() => register(selectedEvent)} onSave={() => toggleSaved(selectedEvent.id)} onOpenRelated={setSelectedEventId} />}
      {createOpen && <CreateEvent onClose={() => setCreateOpen(false)} onPublish={publishEvent} />}
      {toast && <div className="toast-message" role="status"><span><Check size={16} /></span>{toast}<button onClick={() => setToast("")} aria-label="Dismiss message"><X size={15} /></button></div>}
    </div>
  );
}
