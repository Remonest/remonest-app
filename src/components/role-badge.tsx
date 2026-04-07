import { getUserRoleInfo } from "@/lib/roles";

interface RoleBadgeProps {
  className?: string;
}

export async function RoleBadge({ className }: RoleBadgeProps) {
  const roleInfo = await getUserRoleInfo();

  if (!roleInfo) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleInfo.color} ${className || ""}`}
    >
      {roleInfo.label}
    </span>
  );
}
