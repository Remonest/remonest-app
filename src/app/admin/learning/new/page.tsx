"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { saveLearningModule } from "@/lib/learning/actions";
import type { LearningModuleResult } from "@/lib/learning/schemas";
import { LEARNING_CATEGORIES, LEARNING_LEVELS } from "@/lib/learning/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CATEGORY_LABELS: Record<string, string> = {
  "Remote Working Basics": "Remote Working Basics",
  "Skill Freelance": "Skill Freelance",
  "Keuangan Freelancer": "Keuangan Freelancer",
  "Growth & Branding": "Growth & Branding",
  "Tools & Produktivitas": "Tools & Produktivitas",
  "CV & Personal Branding": "CV & Personal Branding",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const initialState: LearningModuleResult = { success: false };

function NewLearningModuleForm() {
  const [state, formAction, pending] = useActionState(
    saveLearningModule,
    initialState
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>New Learning Module</CardTitle>
        <CardDescription>
          Create a new learning module for Remonest users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Async Communication Basics"
              required
            />
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {LEARNING_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select name="level" required>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEARNING_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief summary of what learners will gain from this module..."
              className="min-h-[100px] resize-y"
              required
            />
            <p className="text-xs text-muted-foreground">
              A short overview visible to users browsing the catalog.
            </p>
          </div>

          {/* Passing Score */}
          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input
              id="passingScore"
              name="passingScore"
              type="number"
              min="0"
              max="100"
              defaultValue="70"
              placeholder="70"
            />
            <p className="text-xs text-muted-foreground">
              Minimum quiz score required to pass. Defaults to 70%.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save Module
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/learning">
                <ArrowLeft className="mr-2 size-4" />
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function NewLearningModulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/admin/learning">
            <ArrowLeft className="size-4" />
            Back to Learning
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Learning Module
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new module to the Remonest learning catalog.
        </p>
      </div>

      <NewLearningModuleForm />
    </div>
  );
}
