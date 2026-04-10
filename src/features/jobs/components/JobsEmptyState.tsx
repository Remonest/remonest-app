import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JobsEmptyState() {
  return (
    <div className="p-8 sm:p-12 md:p-16 lg:p-20 border border-border rounded-2xl bg-gradient-to-b from-card to-secondary text-center">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full bg-accent text-accent-foreground flex items-center justify-center mb-4 sm:mb-5">
        <BriefcaseBusiness className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary border border-border text-secondary-foreground mb-3 sm:mb-4">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Empty state ready
      </div>

      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
        No archived jobs yet
      </h2>

      <p className="text-sm sm:text-base text-muted-foreground max-w-md sm:max-w-lg lg:max-w-xl mx-auto mb-4 sm:mb-5 px-2">
        When you move older listings out of active view, they will appear here
        with same polished management card style.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button className="min-h-10 px-4 text-sm sm:text-base">Create new job</Button>
        <Button variant="outline" className="min-h-10 px-4 text-sm sm:text-base">
          Import existing listing
        </Button>
      </div>

      <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-muted-foreground px-2">
        This keeps page useful now while still showing a clear empty-state
        pattern.
      </p>
    </div>
  );
}
