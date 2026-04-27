"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function UserAvatar({ src, name, size = "default", className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={name || "User"} />}
      <AvatarFallback>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
