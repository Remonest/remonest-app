"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface JobActionsProps {
  jobId: string;
  jobTitle: string;
  currentStatus: "pending" | "approved" | "rejected";
  onStatusChange?: (jobId: string, newStatus: "approved" | "rejected") => void;
}

export function JobActions({ jobId, jobTitle, currentStatus, onStatusChange }: JobActionsProps) {
  const isPending = currentStatus === "pending";

  const handleApprove = () => {
    toast.success(`"${jobTitle}" has been approved`, {
      description: "The job listing is now visible to users.",
    });
    onStatusChange?.(jobId, "approved");
  };

  const handleReject = () => {
    toast.success(`"${jobTitle}" has been rejected`, {
      description: "The job listing has been removed from the platform.",
    });
    onStatusChange?.(jobId, "rejected");
  };

  if (!isPending) {
    return (
      <span className="text-sm text-muted-foreground">
        {currentStatus === "approved" ? "Approved" : "Rejected"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleApprove}
        className="h-8 gap-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:text-green-500 dark:hover:bg-green-950/50 dark:hover:border-green-800"
      >
        <Check className="h-3.5 w-3.5" />
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReject}
        className="h-8 gap-1.5 text-destructive hover:bg-destructive/10"
      >
        <X className="h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  );
}
