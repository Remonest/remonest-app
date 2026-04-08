import { PostJobForm } from '@/components/jobs';

export default function AdminNewJobPage() {
  return (
    <div className="container mx-auto py-8">
      <PostJobForm isAdmin />
    </div>
  );
}
