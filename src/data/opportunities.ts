import type { Opportunity, OpportunityType } from "../types";

function deadline(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const sample = (id: string, title: string, organization: string, type: OpportunityType, description: string, location: string, days: number, skills: string[], eligibility: string, tags: string[]): Opportunity => ({
  id,
  title,
  organization: `${organization} (Demo listing)`,
  type,
  description,
  details: `${description} This sample listing demonstrates how Campus Signal can bring opportunities beyond campus events into one searchable student feed. Verify dates and application details with the organization before applying.`,
  location,
  deadline: deadline(days),
  skills,
  eligibility,
  applyUrl: `https://example.com/demo/${id}`,
  tags,
});

export const sampleOpportunities: Opportunity[] = [
  sample("ai-intern", "Applied AI Engineering Intern", "Northstar Labs", "Internship", "Prototype small language-model tools with a product engineering team.", "Remote", 12, ["Python", "AI & ML", "APIs"], "Undergraduate students with Python experience.", ["Software", "AI"]),
  sample("web-intern", "Frontend Developer Intern", "Brightside Studio", "Internship", "Build accessible web experiences and ship features with a design-led team.", "Hybrid · Bengaluru", 18, ["React", "TypeScript", "Design"], "Students comfortable with JavaScript fundamentals.", ["Web", "Design"]),
  sample("startup-intern", "Founding Product Intern", "Seedling (Demo startup)", "Internship", "Work across product research, prototypes, and early customer feedback.", "Remote", 21, ["Product", "Research", "Figma"], "Curious builders available for 8–10 weeks.", ["Startup", "Product"]),
  sample("makeathon", "Build for Good Makeathon", "Open Campus Collective", "Hackathon", "A weekend sprint to prototype practical tools for your community.", "Online", 9, ["React", "Python", "Teamwork"], "Student teams of 2–5; all experience levels.", ["Team event", "Civic tech"]),
  sample("code-cup", "Inter-University Code Cup", "Student Computing League", "Competition", "Solve algorithmic challenges in a friendly campus-to-campus contest.", "Online", 15, ["Algorithms", "Java", "Python"], "Currently enrolled students.", ["Programming", "Contest"]),
  sample("future-makers", "Future Makers Student Scholarship", "Learning Futures Fund", "Scholarship", "A sample need-and-merit award for students building positive campus impact.", "India", 28, ["Leadership", "Community"], "Undergraduate students; sample eligibility only.", ["Funding", "Student support"]),
  sample("ml-workshop", "Practical Machine Learning Lab", "Open Learning Lab", "Workshop", "Train and evaluate a small model in a beginner-friendly guided session.", "Hybrid · Online", 7, ["Python", "AI & ML", "Data"], "Beginner friendly; bring a laptop.", ["Hands-on", "AI"]),
  sample("cloud-cert", "Cloud Foundations Certificate", "Cloud Skills Academy", "Course", "A self-paced introduction to cloud infrastructure with a completion certificate.", "Remote", 35, ["Cloud", "Linux", "Networking"], "Open to learners; sample course listing.", ["Certification", "Self-paced"]),
  sample("research-fellow", "Responsible Tech Research Fellowship", "Civic Futures Network", "Other", "Join a short student fellowship exploring responsible technology in public life.", "Hybrid · Delhi", 24, ["Research", "Writing", "AI & ML"], "Undergraduate students interested in technology and society.", ["Fellowship", "Research"]),
  sample("community-volunteer", "Digital Skills Volunteer Crew", "Neighborhood Learning Hub", "Other", "Help local learners practice digital basics in small weekly sessions.", "Bengaluru", 16, ["Communication", "Teaching", "Web"], "No prior teaching experience required.", ["Volunteering", "Community"]),
];
