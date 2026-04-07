export type JobStatus = "pending" | "approved" | "rejected";
export type JobType = "full-time" | "part-time" | "contract" | "freelance" | "internship";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  status: JobStatus;
  salary_range?: string;
  posted_at: string;
  description?: string;
  apply_url?: string;
}

export const jobTypeLabels: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

export const statusLabels: Record<JobStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

// Mock data for admin job approvals
export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Ltd.",
    location: "London, UK (Remote)",
    type: "full-time",
    status: "pending",
    salary_range: "£65,000 - £85,000",
    posted_at: "2026-04-05T10:00:00Z",
    description: "We're looking for an experienced React developer to join our team...",
  },
  {
    id: "2",
    title: "UX Designer",
    company: "DesignHub",
    location: "Manchester, UK",
    type: "full-time",
    status: "pending",
    salary_range: "£45,000 - £60,000",
    posted_at: "2026-04-04T14:30:00Z",
  },
  {
    id: "3",
    title: "Backend Engineer",
    company: "DataFlow Systems",
    location: "Remote",
    type: "contract",
    status: "approved",
    salary_range: "£500 - £650/day",
    posted_at: "2026-04-03T09:15:00Z",
  },
  {
    id: "4",
    title: "Marketing Intern",
    company: "StartupXYZ",
    location: "Edinburgh, UK",
    type: "internship",
    status: "rejected",
    salary_range: "£1,200/month",
    posted_at: "2026-04-02T16:45:00Z",
  },
  {
    id: "5",
    title: "Full Stack Developer",
    company: "InnovateTech",
    location: "Bristol, UK (Hybrid)",
    type: "full-time",
    status: "pending",
    salary_range: "£55,000 - £75,000",
    posted_at: "2026-04-01T11:20:00Z",
  },
  {
    id: "6",
    title: "DevOps Engineer",
    company: "CloudScale",
    location: "Remote",
    type: "freelance",
    status: "pending",
    salary_range: "£450 - £550/day",
    posted_at: "2026-03-31T08:00:00Z",
  },
  {
    id: "7",
    title: "Product Manager",
    company: "FinTech Solutions",
    location: "London, UK",
    type: "full-time",
    status: "approved",
    salary_range: "£70,000 - £90,000",
    posted_at: "2026-03-30T13:10:00Z",
  },
  {
    id: "8",
    title: "QA Tester",
    company: "QualityFirst",
    location: "Leeds, UK (Remote)",
    type: "part-time",
    status: "pending",
    salary_range: "£28,000 - £35,000 (pro rata)",
    posted_at: "2026-03-29T15:30:00Z",
  },
];
