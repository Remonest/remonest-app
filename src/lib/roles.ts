import { getUserRole } from "@/lib/supabase/server";

export type UserRole = "admin" | "user" | "client" | null;

export const roleLabels: Record<NonNullable<UserRole>, string> = {
  admin: "Admin",
  user: "User",
  client: "Client",
};

export const roleColors: Record<NonNullable<UserRole>, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  client: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

/**
 * Get user role with formatted label and color
 * Returns null if user is not authenticated
 */
export async function getUserRoleInfo() {
  const role = await getUserRole();
  
  if (!role) return null;
  
  return {
    role,
    label: roleLabels[role],
    color: roleColors[role],
  };
}
