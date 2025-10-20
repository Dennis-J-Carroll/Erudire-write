import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertStorySchema,
  insertTimelineSchema,
  insertVersionSchema,
  insertCollaboratorSchema,
  insertCommentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Story routes
  app.get("/api/stories", async (req, res) => {
    try {
      const ownerId = req.query.ownerId ? parseInt(req.query.ownerId as string) : null;

      if (ownerId) {
        const stories = await storage.getStoriesByOwner(ownerId);
        res.json(stories);
      } else {
        const stories = await storage.getPublicStories();
        res.json(stories);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getStory(id);

      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      res.json(story);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch story" });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const validatedData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(validatedData);
      res.status(201).json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid story data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create story" });
    }
  });

  app.patch("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStorySchema.partial().parse(req.body);
      const story = await storage.updateStory(id, validatedData);

      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      res.json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid story data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update story" });
    }
  });

  app.delete("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStory(id);

      if (!success) {
        return res.status(404).json({ error: "Story not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete story" });
    }
  });

  // Timeline routes
  app.get("/api/stories/:storyId/timelines", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const timelines = await storage.getTimelinesByStory(storyId);
      res.json(timelines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timelines" });
    }
  });

  app.get("/api/timelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timeline = await storage.getTimeline(id);

      if (!timeline) {
        return res.status(404).json({ error: "Timeline not found" });
      }

      res.json(timeline);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline" });
    }
  });

  app.post("/api/timelines", async (req, res) => {
    try {
      const validatedData = insertTimelineSchema.parse(req.body);
      const timeline = await storage.createTimeline(validatedData);
      res.status(201).json(timeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid timeline data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create timeline" });
    }
  });

  app.delete("/api/timelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTimeline(id);

      if (!success) {
        return res.status(404).json({ error: "Timeline not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete timeline" });
    }
  });

  // Version routes
  app.get("/api/timelines/:timelineId/versions", async (req, res) => {
    try {
      const timelineId = parseInt(req.params.timelineId);
      const versions = await storage.getVersionsByTimeline(timelineId);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch versions" });
    }
  });

  app.get("/api/timelines/:timelineId/versions/latest", async (req, res) => {
    try {
      const timelineId = parseInt(req.params.timelineId);
      const version = await storage.getLatestVersion(timelineId);

      if (!version) {
        return res.status(404).json({ error: "No versions found" });
      }

      res.json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest version" });
    }
  });

  app.get("/api/versions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const version = await storage.getVersion(id);

      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }

      res.json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch version" });
    }
  });

  app.post("/api/versions", async (req, res) => {
    try {
      const validatedData = insertVersionSchema.parse(req.body);

      // Calculate word and character count
      const content = validatedData.content;
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      const characterCount = content.length;

      // Get the next version number for this timeline
      const existingVersions = await storage.getVersionsByTimeline(validatedData.timelineId);
      const versionNumber = existingVersions.length + 1;

      const version = await storage.createVersion({
        ...validatedData,
        versionNumber,
        wordCount,
        characterCount,
      });

      res.status(201).json(version);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid version data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create version" });
    }
  });

  // Version diff endpoint
  app.get("/api/versions/diff/:id1/:id2", async (req, res) => {
    try {
      const id1 = parseInt(req.params.id1);
      const id2 = parseInt(req.params.id2);

      const version1 = await storage.getVersion(id1);
      const version2 = await storage.getVersion(id2);

      if (!version1 || !version2) {
        return res.status(404).json({ error: "One or both versions not found" });
      }

      // Return both versions for client-side diffing
      res.json({
        version1,
        version2,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate diff" });
    }
  });

  // Collaborator routes
  app.get("/api/stories/:storyId/collaborators", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const collaborators = await storage.getCollaborators(storyId);
      res.json(collaborators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collaborators" });
    }
  });

  app.post("/api/collaborators", async (req, res) => {
    try {
      const validatedData = insertCollaboratorSchema.parse(req.body);
      const collaborator = await storage.addCollaborator(validatedData);
      res.status(201).json(collaborator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid collaborator data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add collaborator" });
    }
  });

  app.delete("/api/stories/:storyId/collaborators/:userId", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const userId = parseInt(req.params.userId);
      const success = await storage.removeCollaborator(storyId, userId);

      if (!success) {
        return res.status(404).json({ error: "Collaborator not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove collaborator" });
    }
  });

  // Comment routes
  app.get("/api/versions/:versionId/comments", async (req, res) => {
    try {
      const versionId = parseInt(req.params.versionId);
      const comments = await storage.getCommentsByVersion(versionId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid comment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // User route (for demo)
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't send password hash to client
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
