import { useQuery } from "@tanstack/react-query";

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

export default function HomePage() {
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading stories...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Discover Stories</h1>
        <p className="text-muted-foreground">
          Explore timelines, collaborate with writers, and create your own multiverse
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories?.map((story) => (
          <a
            key={story.id}
            href={`/story/${story.id}`}
            className="block p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold">{story.title}</h3>
              {story.genre && (
                <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">
                  {story.genre}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {story.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
          </a>
        ))}
      </div>

      {stories?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No public stories yet. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
}
