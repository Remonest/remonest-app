import { getApplications } from "@/lib/dashboard/actions";
import { ApplicationsClient } from "./applications-client";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return <ApplicationsClient applications={applications} />;
}
