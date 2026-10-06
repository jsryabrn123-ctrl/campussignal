export type UserRole = "student" | "organizer" | "admin";
export type AppPage = "home" | "discover" | "opportunities" | "saved" | "calendar" | "notifications" | "organizer" | "admin" | "settings" | "teams" | "passport";
export type EventStatus = "Draft" | "Published" | "Registration open" | "Registration closed" | "Completed" | "Cancelled";

export interface AudienceTarget {
  departments?: string[];
  years?: number[];
  interests?: string[];
  skills?: string[];
  participatedCategories?: string[];
}

export interface CampusEvent {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  organizer: string;
  organizerInitials: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  mode: "In person" | "Online" | "Hybrid";
  deadline: string;
  capacity: number;
  registered: number;
  status: EventStatus;
  eligibility: string;
  skills: string[];
  tags: string[];
  image: string;
  accent: string;
  trending: number;
  free: boolean;
  ownerId?: string;
  registrationLink?: string;
  contactInfo?: string;
  audience?: string;
  targetAudience?: AudienceTarget;
}

export type OpportunityType = "Internship" | "Hackathon" | "Competition" | "Scholarship" | "Workshop" | "Course" | "Other";

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  description: string;
  details: string;
  location: string;
  deadline: string;
  skills: string[];
  eligibility: string;
  applyUrl: string;
  tags: string[];
}

export interface CampusNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  priority: "normal" | "important" | "urgent";
  read: boolean;
  eventId?: string;
}

export interface NotificationPreferences {
  reminders: boolean;
  recommendations: boolean;
  announcements: boolean;
}

export interface TimetableBlock {
  id: string;
  title: string;
  weekday: number;
  startTime: string;
  endTime: string;
  kind: "class" | "lab" | "exam";
  date?: string;
}

export interface TeamPost {
  id: string;
  eventId: string;
  eventTitle: string;
  teamName: string;
  author: string;
  lookingFor: string;
  skills: string[];
  note: string;
  openSlots: number;
  created: string;
}

export interface TeamJoinRequest {
  id: string;
  postId: string;
  studentName: string;
  created: string;
}

export interface PassportStamp {
  eventId: string;
  title: string;
  organizer: string;
  date: string;
  category: string;
  skills: string[];
  verified: boolean;
}

export interface AppState {
  role: UserRole;
  page: AppPage;
  events: CampusEvent[];
  savedIds: string[];
  registeredIds: string[];
  waitlistedIds: string[];
  featuredIds: string[];
  studentInterests: string[];
  notificationPreferences: NotificationPreferences;
  notifications: CampusNotification[];
  timetable: TimetableBlock[];
  teamPosts: TeamPost[];
  teamRequests: TeamJoinRequest[];
  attendedIds: string[];
  studentSkills: string[];
  reachUsed: number;
  reachWeekId: string;
  studentPingsThisWeek: number;
  sendAnnouncement: boolean;
}
