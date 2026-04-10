export interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  posted_at: string;
  created_at: string;
  author_name?: string;
  [key: string]: unknown;
}
