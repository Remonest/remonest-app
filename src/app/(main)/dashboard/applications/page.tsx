import { getApplications } from "@/features/dashboard/actions/applications";
import { ApplicationsClient } from "./applications-client";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return <ApplicationsClient applications={applications} />;
}
