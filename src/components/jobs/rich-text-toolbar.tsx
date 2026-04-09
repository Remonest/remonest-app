"use client";

import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  Link2,
} from "lucide-react";

interface RichTextToolbarProps {
  onInsert?: (html: string) => void;
}

export function RichTextToolbar({ onInsert }: RichTextToolbarProps) {
  const insertFormat = (html: string) => {
    onInsert?.(html);
  };

  return (
    <div className="flex items-center gap-1 p-2 border border-b-0 rounded-t-lg bg-muted/50">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => insertFormat("<strong></strong>")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => insertFormat("<em></em>")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => insertFormat("<u></u>")}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => insertFormat("<s></s>")}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => insertFormat("<blockquote></blockquote>")}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => insertFormat("<ul><li></li></ul>")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => insertFormat("<ol><li></li></ol>")}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => insertFormat('<a href=""></a>')}
        title="Link"
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
