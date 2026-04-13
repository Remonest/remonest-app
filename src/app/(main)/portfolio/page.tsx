import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/guards";
import PortfolioClient from "./portfolio-client";

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <PortfolioClient userId={user.id} />;
}
