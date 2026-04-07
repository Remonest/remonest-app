"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        await logoutAction();
      }}
    >
      <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </form>
  );
}
