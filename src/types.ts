export type UserRole = "student" | "organizer" | "admin";
export type AppPage = "home" | "discover" | "saved" | "calendar" | "notifications" | "organizer" | "admin" | "settings";
export type EventStatus = "Published" | "Registration open" | "Registration closed" | "Completed" | "Cancelled";

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
  audience?: string;
  targetAudience?: AudienceTarget;
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
}
