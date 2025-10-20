import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Timeline {
  id: number;
  storyId: number;
  name: string;
  description: string;
  createdFrom: number | null;
  createdAt: string;
}

interface Version {
  id: number;
  timelineId: number;
  versionNumber: number;
  title: string;
  content: string;
  message: string;
  wordCount: number;
  characterCount: number;
  authorId: number;
  parentVersionId: number | null;
  createdAt: string;
}

export default function TimelinePage() {
  const [, params] = useRoute("/timeline/:id");
  const timelineId = params?.id;
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const { data: timeline, isLoading: timelineLoading } = useQuery<Timeline>({
    queryKey: [`/api/timelines/${timelineId}`],
  });

  const { data: versions, isLoading: versionsLoading } = useQuery<Version[]>({
    queryKey: [`/api/timelines/${timelineId}/versions`],
    enabled: !!timelineId,
  });

  if (timelineLoading || versionsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!timeline) {
    return <div className="text-center py-8">Timeline not found</div>;
  }

  const latestVersion = versions?.[versions.length - 1];
  const displayVersion = selectedVersion || latestVersion;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Version History Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Version History</h2>
          <div className="space-y-2">
            {versions?.slice().reverse().map((version) => (
              <button
                key={version.id}
                onClick={() => setSelectedVersion(version)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  displayVersion?.id === version.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    v{version.versionNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">{version.title || "Untitled"}</p>
                {version.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {version.message}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{version.wordCount} words</span>
                  <span>•</span>
                  <span>{version.characterCount} chars</span>
                </div>
              </button>
            ))}
          </div>

          {versions?.length === 0 && (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-sm text-muted-foreground">No versions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Viewer */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{timeline.name}</h1>
              {timeline.description && (
                <p className="text-muted-foreground">{timeline.description}</p>
              )}
            </div>
            {displayVersion && (
              <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded font-mono">
                v{displayVersion.versionNumber}
              </span>
            )}
          </div>

          {displayVersion && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {formatDistanceToNow(new Date(displayVersion.createdAt), { addSuffix: true })}
                </span>
              </div>
              <span>•</span>
              <span>{displayVersion.wordCount} words</span>
              <span>•</span>
              <span>{displayVersion.characterCount} characters</span>
            </div>
          )}

          {displayVersion?.message && (
            <div className="p-4 bg-secondary/50 rounded-lg mb-6">
              <p className="text-sm font-medium mb-1">Commit Message:</p>
              <p className="text-sm text-muted-foreground">{displayVersion.message}</p>
            </div>
          )}
        </div>

        {displayVersion ? (
          <div className="prose prose-lg max-w-none">
            <div className="p-8 border rounded-lg bg-card">
              <h2 className="text-2xl font-bold mb-6">{displayVersion.title}</h2>
              <div className="whitespace-pre-wrap leading-relaxed">
                {displayVersion.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No content to display</p>
          </div>
        )}
      </div>
    </div>
  );
}
