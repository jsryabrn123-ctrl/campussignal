import type { CampusEvent, CampusNotification } from "../types";

const daysFromNow = (days: number, time: string) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const event = (
  id: string,
  title: string,
  shortDescription: string,
  category: string,
  organizer: string,
  department: string,
  day: number,
  startTime: string,
  duration: number,
  venue: string,
  tags: string[],
  image: string,
  accent: string,
  trending: number,
  registered: number,
  capacity = 120,
  mode: CampusEvent["mode"] = "In person",
): CampusEvent => {
  const [hour, minute] = startTime.split(":").map(Number);
  const end = new Date(2000, 0, 1, hour + duration, minute);
  return {
    id,
    title,
    shortDescription,
    description: `${shortDescription} Join a welcoming, hands-on session led by people doing the work right here on campus. You'll leave with practical takeaways, new connections, and a clear next step.`,
    category,
    organizer,
    organizerInitials: organizer.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    department,
    date: daysFromNow(day, startTime),
    startTime,
    endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
    venue,
    mode,
    deadline: daysFromNow(Math.max(0, day - 1), "18:00"),
    capacity,
    registered,
    status: "Registration open",
    eligibility: "Open to all students",
    skills: tags.slice(0, 2),
    tags,
    image,
    accent,
    trending,
    free: true,
  };
};

export const seedEvents: CampusEvent[] = [
  event("ai-lab", "Build with AI: a hands-on lab", "Make a tiny AI tool that solves a real campus problem.", "AI & ML", "Computer Science Club", "Computer Science", 1, "14:00", 2, "Innovation Lab, Block C", ["AI & ML", "Python", "Technology"], "photo-1677442136019-21780ecad995", "#e8f178", 96, 84, 100),
  event("design-systems", "Design systems, without the drama", "A practical workshop on building interfaces that feel like one product.", "Design", "Design Society", "Design", 2, "16:00", 1.5, "Studio 204", ["Design", "Figma", "Web Development"], "photo-1558655146-9f40138edfeb", "#c7d2ff", 81, 52),
  event("drone-flight", "Drone flight school", "Get behind the controls and learn the basics of safe drone flight.", "Robotics", "Aero & Robotics Club", "Mechanical Engineering", 4, "11:00", 2, "North Field", ["Robotics", "Technology", "Engineering"], "photo-1473968512647-3e447244af8f", "#d2f0e2", 89, 96, 110),
  event("web-bootcamp", "Ship your first web app", "From a blank screen to a live page in one focused afternoon.", "Technology", "Code Collective", "Computer Science", 5, "13:30", 3, "Digital Studio, Library", ["Web Development", "Technology", "React"], "photo-1498050108023-c5249f4df085", "#dbe4ff", 92, 66),
  event("campus-hack", "Makeathon: build for better campus", "A friendly 24-hour team sprint. Bring a sketch, leave with a prototype.", "Hackathon", "Innovation Cell", "Computer Science", 7, "09:00", 24, "Main Innovation Hub", ["AI & ML", "Web Development", "Entrepreneurship"], "photo-1504384308090-c894fdcc538d", "#f1e0ff", 99, 184, 220),
  event("robotics-arena", "RoboRumble: campus challenge", "Put your bot to the test in a fast-paced obstacle course.", "Competition", "Aero & Robotics Club", "Mechanical Engineering", 9, "10:00", 4, "Engineering Atrium", ["Robotics", "Engineering", "Technology"], "photo-1485827404703-89b55fcc595e", "#d2f0e2", 88, 75, 100),
  event("photo-walk", "The campus after light", "A golden-hour photo walk for curious eyes and any camera.", "Creative", "Lens Club", "Arts & Humanities", 10, "16:30", 2, "Meet at the Old Clocktower", ["Photography", "Design", "Creative"], "photo-1452587925148-ce544e77e70d", "#ffe1c5", 72, 38),
  event("founder-stories", "Small ideas, real businesses", "Three student founders share what worked, what didn't, and why.", "Business", "Entrepreneurship Cell", "Business", 12, "15:00", 1.5, "Seminar Room 2", ["Entrepreneurship", "Business", "Career"], "photo-1556761175-b413da4baf72", "#ffefba", 78, 61),
  event("resume-clinic", "Make your resume make sense", "Get kind, specific feedback from people who read applications every day.", "Career", "Career Development Centre", "Career Services", 13, "12:00", 2, "Career Studio, Student Centre", ["Career", "Design", "Business"], "photo-1454165804606-c3d57bc86b40", "#dbe4ff", 94, 109, 140),
  event("cyber-sprint", "Cybersecurity: break it to fix it", "Learn threat thinking through a beginner-friendly capture-the-flag.", "Technology", "ByteSec Society", "Computer Science", 15, "14:00", 2.5, "Computer Lab 4", ["Cybersecurity", "Technology", "Python"], "photo-1550751827-4bd374c3f58b", "#e4d8ff", 91, 70),
  event("code-relay", "Code Relay", "A team coding competition where clear thinking beats quick typing.", "Competition", "Computer Science Club", "Computer Science", 16, "10:00", 3, "Lecture Theatre 1", ["Technology", "Python", "Competition"], "photo-1518770660439-4636190af475", "#dbe4ff", 86, 102, 140),
  event("future-of-learning", "Who gets to build the future?", "A guest lecture on responsible technology and the people it serves.", "Talk", "School of Computing", "Computer Science", 18, "17:00", 1, "Auditorium West", ["AI & ML", "Research", "Technology"], "photo-1475721027785-f74eccf877e2", "#f1e0ff", 68, 130, 250, "Hybrid"),
  event("type-and-motion", "Type that moves", "Explore kinetic typography and bring a few letters to life.", "Design", "Design Society", "Design", 20, "14:30", 2, "Studio 204", ["Design", "Creative", "Photography"], "photo-1507238691740-187a5b1d37b8", "#ffe1c5", 77, 45),
  event("research-open", "Research, out in the open", "Meet student researchers and find a question worth chasing.", "Research", "Undergraduate Research Office", "Science", 21, "11:00", 2, "Science Courtyard", ["Research", "AI & ML", "Career"], "photo-1532094349884-543bc11b234d", "#d2f0e2", 73, 88, 150),
  event("debate-exchange", "Across the aisle: inter-college debate", "A lively exchange of ideas with teams from five neighboring colleges.", "Culture", "Debate Union", "Arts & Humanities", 23, "13:00", 3, "Main Auditorium", ["Public speaking", "Culture", "Competition"], "photo-1475721027785-f74eccf877e2", "#ffe1c5", 82, 155, 300, "Hybrid"),
];

export const seedNotifications: CampusNotification[] = [
  { id: "n1", title: "Tomorrow: Build with AI", body: "Your workshop starts at 2:00 PM in the Innovation Lab.", time: "12 min ago", priority: "important", read: false, eventId: "ai-lab" },
  { id: "n2", title: "A good fit for you", body: "Design systems, without the drama matches your Design interest.", time: "2 hours ago", priority: "normal", read: false, eventId: "design-systems" },
  { id: "n3", title: "Makeathon places are filling up", body: "Only 36 spots remain for the 24-hour campus build.", time: "Yesterday", priority: "urgent", read: true, eventId: "campus-hack" },
];

export const categoryOptions = ["All events", "AI & ML", "Technology", "Design", "Robotics", "Hackathon", "Career", "Competition", "Business", "Research", "Creative", "Talk", "Culture"];
