import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";

interface Story {
  id: number;
  title: string;
  description: string;
  genre: string;
  isPublic: boolean;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

interface Timeline {
  id: number;
  storyId: number;
  name: string;
  description: string;
  createdFrom: number | null;
  createdAt: string;
}

export default function StoryPage() {
  const [, params] = useRoute("/story/:id");
  const storyId = params?.id;

  const { data: story, isLoading: storyLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${storyId}`],
  });

  const { data: timelines, isLoading: timelinesLoading } = useQuery<Timeline[]>({
    queryKey: [`/api/stories/${storyId}/timelines`],
  });

  if (storyLoading || timelinesLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!story) {
    return <div className="text-center py-8">Story not found</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">{story.title}</h1>
          {story.genre && (
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded">
              {story.genre}
            </span>
          )}
        </div>
        <p className="text-lg text-muted-foreground mb-6">{story.description}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Timelines</h2>
        <p className="text-muted-foreground mb-6">
          Each timeline represents a different version or branch of the story.
          Explore alternate endings, fan fiction, or collaborative variations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timelines?.map((timeline) => (
            <a
              key={timeline.id}
              href={`/timeline/${timeline.id}`}
              className="block p-6 border rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xl font-semibold">{timeline.name}</h3>
              </div>
              {timeline.description && (
                <p className="text-sm text-muted-foreground mb-3">{timeline.description}</p>
              )}
              {timeline.createdFrom && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>Branched from another timeline</span>
                </div>
              )}
            </a>
          ))}
        </div>

        {timelines?.length === 0 && (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No timelines yet. Create the first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
