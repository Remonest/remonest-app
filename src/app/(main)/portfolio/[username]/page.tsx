import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, Mail, MapPin, ExternalLink, Award, Trophy, FolderOpen, Share2, FileText } from "lucide-react";
import { getPublishedPortfolioItems, getUserProfilePublic } from "@/features/portfolio/actions/portfolio";
import { getPublicCV } from "@/features/portfolio/actions/cv";

interface PortfolioUserPageProps {
  params: Promise<{ username: string }>;
}

export const dynamic = "force-dynamic";

const typeConfig: Record<string, { icon: typeof FolderOpen; color: string; label: string }> = {
  certificate: { icon: Award, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Certificate" },
  project: { icon: FolderOpen, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Project" },
  achievement: { icon: Trophy, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Achievement" },
  other: { icon: FolderOpen, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", label: "Other" },
};

export default async function PublicPortfolioPage({ params }: PortfolioUserPageProps) {
  const { username } = await params;

  // We decode the username parameter just in case
  const decodedUsername = decodeURIComponent(username);

  const profile = await getUserProfilePublic(decodedUsername);
  if (!profile) return notFound();

  const items = await getPublishedPortfolioItems(decodedUsername);
  const cv = await getPublicCV(profile.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b border-border">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? "User"}
                  className="h-16 w-16 rounded-full border object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                  <Mail className="h-7 w-7 text-secondary-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {profile.full_name ?? "User"}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  {profile.headline ?? "Member on Remonest"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {cv && (
                <Link href={`/cv/${profile.id}`}>
                  <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <FileText className="size-4" />
                    View CV
                  </button>
                </Link>
              )}
              <button className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                <Share2 className="size-4" />
                Share
              </button>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-[640px]">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-4 mt-6 flex-wrap">
            {profile.location && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="size-4" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Items */}
      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-8 py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Portfolio {items.length > 0 && `(${items.length})`}
        </h2>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-card">
            <FolderOpen className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
              This user hasn't added any public items to their portfolio yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => {
              const config = typeConfig[item.item_type] ?? typeConfig.other;
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className="group flex flex-col border border-border rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-colors"
                >
                  {item.cover_image_url ? (
                    <img
                      src={item.cover_image_url}
                      alt={item.title}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Icon className="size-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      {item.external_url && (
                        <a
                          href={item.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {item.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back link */}
        <div className="mt-16 text-center">
          <Link
            href="/learning"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            ← Back to Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
