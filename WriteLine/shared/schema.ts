import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stories (repositories)
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  isPublic: boolean("is_public").default(false),
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "cascade" }),
  forkedFrom: integer("forked_from").references(() => stories.id, { onDelete: "set null" }),
  defaultTimeline: varchar("default_timeline", { length: 100 }).default("main"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timelines (branches)
export const timelines = pgTable("timelines", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdFrom: integer("created_from").references(() => timelines.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Versions (commits)
export const versions = pgTable("versions", {
  id: serial("id").primaryKey(),
  timelineId: integer("timeline_id").references(() => timelines.id, { onDelete: "cascade" }).notNull(),
  versionNumber: integer("version_number").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  message: text("message"),
  wordCount: integer("word_count").default(0),
  characterCount: integer("character_count").default(0),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  parentVersionId: integer("parent_version_id").references(() => versions.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collaborators
export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // owner, co-author, editor, reader
  invitedBy: integer("invited_by").references(() => users.id, { onDelete: "set null" }),
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").references(() => versions.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  position: integer("position"), // character position in document
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stars
export const stars = pgTable("stars", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follows
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  followingId: integer("following_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Story tags
export const storyTags = pgTable("story_tags", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  tag: varchar("tag", { length: 50 }).notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimelineSchema = createInsertSchema(timelines).omit({
  id: true,
  createdAt: true,
});

export const insertVersionSchema = createInsertSchema(versions).omit({
  id: true,
  createdAt: true,
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).omit({
  id: true,
  invitedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStarSchema = createInsertSchema(stars).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertStoryTagSchema = createInsertSchema(storyTags).omit({
  id: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Timeline = typeof timelines.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;

export type Version = typeof versions.$inferSelect;
export type InsertVersion = z.infer<typeof insertVersionSchema>;

export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Star = typeof stars.$inferSelect;
export type InsertStar = z.infer<typeof insertStarSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type StoryTag = typeof storyTags.$inferSelect;
export type InsertStoryTag = z.infer<typeof insertStoryTagSchema>;
