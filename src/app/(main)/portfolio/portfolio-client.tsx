"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImagePlus, Plus, Trash2, Save, Eye, Check } from "lucide-react";
import {
  getPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "@/features/portfolio/actions/portfolio";
import type { PortfolioItem, PortfolioItemType } from "@/features/portfolio/types/portfolio";
import { toast } from "sonner";

interface PortfolioClientProps {
  userId: string;
}

export default function PortfolioClient({ userId }: PortfolioClientProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New item form state
  const [newType, setNewType] = useState<PortfolioItemType>("project");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const fetched = await getPortfolioItems();
      setItems(fetched);
    } catch {
      toast.error("Failed to load portfolio items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const result = await createPortfolioItem({
        item_type: newType,
        title: newTitle,
        description: newDescription || undefined,
        external_url: newUrl || undefined,
        tags: newTags
          ? newTags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      });
      if (result.success && result.item) {
        setItems((prev) => [...prev, result.item!]);
        setNewTitle("");
        setNewDescription("");
        setNewUrl("");
        setNewTags("");
        setNewType("project");
        setShowAddForm(false);
        toast.success("Item added to portfolio");
      } else {
        toast.error(result.error || "Failed to add item");
      }
    } catch {
      toast.error("Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setSaving(true);
    try {
      const result = await deletePortfolioItem(id);
      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Item removed from portfolio");
      } else {
        toast.error(result.error || "Failed to delete item");
      }
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (id: string, current: boolean) => {
    try {
      const result = await updatePortfolioItem({ id, is_published: !current });
      if (result.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_published: !current } : item
          )
        );
        toast.success(!current ? "Item published" : "Item unpublished");
      } else {
        toast.error(result.error || "Failed to update item");
      }
    } catch {
      toast.error("Failed to update item");
    }
  };

  const typeLabels: Record<PortfolioItemType, string> = {
    certificate: "Certificate",
    project: "Project",
    achievement: "Achievement",
    other: "Other",
  };

  const typeColors: Record<PortfolioItemType, string> = {
    certificate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    project: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    achievement: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Portfolio Builder
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Showcase your best work with a polished, professional portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/portfolio/${userId}`}>
              <button className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap hover:bg-accent hover:text-accent-foreground transition-colors">
                <Eye className="size-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Add Item Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Add Item
          </button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="p-5 border border-border rounded-xl bg-card mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              New Portfolio Item
            </h2>
            <div className="space-y-4">
              {/* Type selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(typeLabels) as PortfolioItemType[]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setNewType(type)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          newType === type
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {typeLabels[type]}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Project or certificate name"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of what this is about..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>

              {/* URL */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">External URL (optional)</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="React, TypeScript, Tailwind"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleAddItem}
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="size-4" />
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium whitespace-nowrap hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Loading portfolio items…
          </div>
        ) : items.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-xl bg-card">
            <ImagePlus className="size-10 mb-3" />
            <p className="text-base font-medium">No portfolio items yet</p>
            <p className="text-sm mt-1">
              Click "Add Item" to start building your portfolio
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 border border-border rounded-xl bg-card group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${typeColors[item.item_type]}`}
                      >
                        {typeLabels[item.item_type]}
                      </span>
                      {item.is_published ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Check className="size-3" />
                          Published
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        handleTogglePublished(item.id, item.is_published)
                      }
                      className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      title={item.is_published ? "Unpublish" : "Publish"}
                    >
                      {item.is_published ? (
                        <Check className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={saving}
                      className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {item.external_url && (
                  <a
                    href={item.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block truncate max-w-full"
                  >
                    {item.external_url}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
