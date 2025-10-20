import {
  users,
  stories,
  timelines,
  versions,
  collaborators,
  comments,
  stars,
  follows,
  storyTags,
  type User,
  type InsertUser,
  type Story,
  type InsertStory,
  type Timeline,
  type InsertTimeline,
  type Version,
  type InsertVersion,
  type Collaborator,
  type InsertCollaborator,
  type Comment,
  type InsertComment,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Story operations
  getStory(id: number): Promise<Story | undefined>;
  getStoriesByOwner(ownerId: number): Promise<Story[]>;
  getPublicStories(limit?: number): Promise<Story[]>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: number): Promise<boolean>;

  // Timeline operations
  getTimeline(id: number): Promise<Timeline | undefined>;
  getTimelinesByStory(storyId: number): Promise<Timeline[]>;
  createTimeline(timeline: InsertTimeline): Promise<Timeline>;
  deleteTimeline(id: number): Promise<boolean>;

  // Version operations
  getVersion(id: number): Promise<Version | undefined>;
  getVersionsByTimeline(timelineId: number): Promise<Version[]>;
  getLatestVersion(timelineId: number): Promise<Version | undefined>;
  createVersion(version: InsertVersion): Promise<Version>;

  // Collaborator operations
  getCollaborators(storyId: number): Promise<Collaborator[]>;
  addCollaborator(collaborator: InsertCollaborator): Promise<Collaborator>;
  removeCollaborator(storyId: number, userId: number): Promise<boolean>;

  // Comment operations
  getCommentsByVersion(versionId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
}

// In-memory storage for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stories: Map<number, Story>;
  private timelines: Map<number, Timeline>;
  private versions: Map<number, Version>;
  private collaborators: Map<number, Collaborator>;
  private comments: Map<number, Comment>;

  private currentUserId: number;
  private currentStoryId: number;
  private currentTimelineId: number;
  private currentVersionId: number;
  private currentCollaboratorId: number;
  private currentCommentId: number;

  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.timelines = new Map();
    this.versions = new Map();
    this.collaborators = new Map();
    this.comments = new Map();

    this.currentUserId = 1;
    this.currentStoryId = 1;
    this.currentTimelineId = 1;
    this.currentVersionId = 1;
    this.currentCollaboratorId = 1;
    this.currentCommentId = 1;

    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const user: User = {
      id: this.currentUserId++,
      username: "demo_writer",
      email: "demo@writeline.com",
      passwordHash: "$2b$10$demo", // In real app, properly hash passwords
      displayName: "Demo Writer",
      avatarUrl: null,
      bio: "A passionate storyteller exploring different timelines",
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Create sample story
    const story: Story = {
      id: this.currentStoryId++,
      title: "The Multiverse Chronicles",
      description: "A tale of parallel universes where every choice creates a new timeline",
      genre: "Science Fiction",
      isPublic: true,
      ownerId: user.id,
      forkedFrom: null,
      defaultTimeline: "main",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.stories.set(story.id, story);

    // Create main timeline
    const mainTimeline: Timeline = {
      id: this.currentTimelineId++,
      storyId: story.id,
      name: "main",
      description: "The original storyline",
      createdFrom: null,
      createdAt: new Date(),
    };
    this.timelines.set(mainTimeline.id, mainTimeline);

    // Create alternate timeline
    const altTimeline: Timeline = {
      id: this.currentTimelineId++,
      storyId: story.id,
      name: "dark-ending",
      description: "An alternate timeline where the protagonist makes different choices",
      createdFrom: mainTimeline.id,
      createdAt: new Date(),
    };
    this.timelines.set(altTimeline.id, altTimeline);

    // Create initial version on main timeline
    const version1: Version = {
      id: this.currentVersionId++,
      timelineId: mainTimeline.id,
      versionNumber: 1,
      title: "Chapter 1: The Discovery",
      content: `Dr. Sarah Chen stood before the shimmering portal, her hands trembling as she held the quantum stabilizer. Years of research had led to this moment—the first confirmed gateway to a parallel universe.

"Are you sure about this?" her colleague Marcus asked, his voice tight with concern.

Sarah nodded, though uncertainty gnawed at her. "We've run the simulations a thousand times. The math is solid."

What she didn't know was that opening this portal would set off a chain reaction across the multiverse, creating countless branching timelines with each decision she made.

She took a deep breath and activated the device.`,
      message: "Initial chapter - introducing the multiverse concept",
      wordCount: 95,
      characterCount: 567,
      authorId: user.id,
      parentVersionId: null,
      createdAt: new Date(),
    };
    this.versions.set(version1.id, version1);

    // Create second version showing story progression
    const version2: Version = {
      id: this.currentVersionId++,
      timelineId: mainTimeline.id,
      versionNumber: 2,
      title: "Chapter 1: The Discovery",
      content: `Dr. Sarah Chen stood before the shimmering portal, her hands trembling as she held the quantum stabilizer. Years of research had led to this moment—the first confirmed gateway to a parallel universe.

"Are you sure about this?" her colleague Marcus asked, his voice tight with concern.

Sarah nodded, though uncertainty gnawed at her. "We've run the simulations a thousand times. The math is solid."

What she didn't know was that opening this portal would set off a chain reaction across the multiverse, creating countless branching timelines with each decision she made.

She took a deep breath and activated the device.

The portal erupted with brilliant light, and Sarah felt herself being pulled forward. In that instant, she saw them—infinite versions of herself, each making different choices, each living different lives. Some were happy, others filled with regret.

And in the distance, something dark was watching.`,
      message: "Added portal activation scene and foreshadowing",
      wordCount: 154,
      characterCount: 891,
      authorId: user.id,
      parentVersionId: version1.id,
      createdAt: new Date(),
    };
    this.versions.set(version2.id, version2);

    // Create version on alternate timeline
    const altVersion: Version = {
      id: this.currentVersionId++,
      timelineId: altTimeline.id,
      versionNumber: 1,
      title: "Chapter 1: The Discovery (Dark Path)",
      content: `Dr. Sarah Chen stood before the shimmering portal, her hands trembling as she held the quantum stabilizer. Years of research had led to this moment—the first confirmed gateway to a parallel universe.

"Are you sure about this?" her colleague Marcus asked, his voice tight with concern.

Sarah didn't respond. The voices had been growing louder, more insistent. They promised her knowledge beyond imagination, power beyond measure. All she had to do was step through.

"Sarah?" Marcus stepped closer. "Your eyes... they're different."

She smiled, but it wasn't her smile anymore. "The math isn't just solid, Marcus. It's beautiful. And it's hungry."

Without hesitation, she activated the device and stepped into the portal, leaving Marcus's screams behind as the gateway consumed everything in its path.`,
      message: "Alternate timeline where Sarah is corrupted by the multiverse",
      wordCount: 135,
      characterCount: 789,
      authorId: user.id,
      parentVersionId: null,
      createdAt: new Date(),
    };
    this.versions.set(altVersion.id, altVersion);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      displayName: insertUser.displayName || null,
      avatarUrl: insertUser.avatarUrl || null,
      bio: insertUser.bio || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Story operations
  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getStoriesByOwner(ownerId: number): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(s => s.ownerId === ownerId);
  }

  async getPublicStories(limit = 50): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(s => s.isPublic)
      .slice(0, limit);
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const now = new Date();
    const story: Story = {
      ...insertStory,
      id: this.currentStoryId++,
      description: insertStory.description || null,
      genre: insertStory.genre || null,
      isPublic: insertStory.isPublic ?? false,
      ownerId: insertStory.ownerId!,
      forkedFrom: insertStory.forkedFrom || null,
      defaultTimeline: insertStory.defaultTimeline || "main",
      createdAt: now,
      updatedAt: now,
    };
    this.stories.set(story.id, story);

    // Auto-create main timeline
    await this.createTimeline({
      storyId: story.id,
      name: story.defaultTimeline,
      description: "Main storyline",
      createdFrom: null,
    });

    return story;
  }

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const updatedStory: Story = {
      ...story,
      ...updates,
      updatedAt: new Date(),
    };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteStory(id: number): Promise<boolean> {
    return this.stories.delete(id);
  }

  // Timeline operations
  async getTimeline(id: number): Promise<Timeline | undefined> {
    return this.timelines.get(id);
  }

  async getTimelinesByStory(storyId: number): Promise<Timeline[]> {
    return Array.from(this.timelines.values()).filter(t => t.storyId === storyId);
  }

  async createTimeline(insertTimeline: InsertTimeline): Promise<Timeline> {
    const timeline: Timeline = {
      ...insertTimeline,
      id: this.currentTimelineId++,
      description: insertTimeline.description || null,
      createdFrom: insertTimeline.createdFrom || null,
      createdAt: new Date(),
    };
    this.timelines.set(timeline.id, timeline);
    return timeline;
  }

  async deleteTimeline(id: number): Promise<boolean> {
    return this.timelines.delete(id);
  }

  // Version operations
  async getVersion(id: number): Promise<Version | undefined> {
    return this.versions.get(id);
  }

  async getVersionsByTimeline(timelineId: number): Promise<Version[]> {
    return Array.from(this.versions.values())
      .filter(v => v.timelineId === timelineId)
      .sort((a, b) => a.versionNumber - b.versionNumber);
  }

  async getLatestVersion(timelineId: number): Promise<Version | undefined> {
    const versions = await this.getVersionsByTimeline(timelineId);
    return versions[versions.length - 1];
  }

  async createVersion(insertVersion: InsertVersion): Promise<Version> {
    const version: Version = {
      ...insertVersion,
      id: this.currentVersionId++,
      title: insertVersion.title || null,
      message: insertVersion.message || null,
      wordCount: insertVersion.wordCount || 0,
      characterCount: insertVersion.characterCount || 0,
      authorId: insertVersion.authorId || null,
      parentVersionId: insertVersion.parentVersionId || null,
      createdAt: new Date(),
    };
    this.versions.set(version.id, version);
    return version;
  }

  // Collaborator operations
  async getCollaborators(storyId: number): Promise<Collaborator[]> {
    return Array.from(this.collaborators.values()).filter(c => c.storyId === storyId);
  }

  async addCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const collaborator: Collaborator = {
      ...insertCollaborator,
      id: this.currentCollaboratorId++,
      invitedBy: insertCollaborator.invitedBy || null,
      invitedAt: new Date(),
      acceptedAt: insertCollaborator.acceptedAt || null,
    };
    this.collaborators.set(collaborator.id, collaborator);
    return collaborator;
  }

  async removeCollaborator(storyId: number, userId: number): Promise<boolean> {
    const collaborator = Array.from(this.collaborators.values())
      .find(c => c.storyId === storyId && c.userId === userId);
    if (!collaborator) return false;
    return this.collaborators.delete(collaborator.id);
  }

  // Comment operations
  async getCommentsByVersion(versionId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.versionId === versionId);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const now = new Date();
    const comment: Comment = {
      ...insertComment,
      id: this.currentCommentId++,
      position: insertComment.position || null,
      isResolved: insertComment.isResolved ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.comments.set(comment.id, comment);
    return comment;
  }
}

export const storage = new MemStorage();
