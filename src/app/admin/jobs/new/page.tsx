import { PostJobForm } from '@/features/jobs/components/PostJobForm';

export default function AdminNewJobPage() {
  return (
    <div className="container mx-auto py-8">
      <PostJobForm isAdmin />
    </div>
  );
}
