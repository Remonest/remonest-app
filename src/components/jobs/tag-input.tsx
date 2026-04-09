"use client";

import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Add a skill...",
  maxTags = 20,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (tags.length >= maxTags) return;
      
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onChange?.([...tags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange?.(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="px-3 py-1.5 gap-1.5 bg-secondary text-secondary-foreground border border-border"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 hover:text-destructive transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10"
      />
      <p className="text-xs text-muted-foreground">
        Press Enter to add
      </p>
    </div>
  );
}
