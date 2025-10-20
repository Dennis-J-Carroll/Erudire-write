import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertFolderSchema, insertAiSuggestionSchema } from "@shared/schema";
import { generateWritingAssistance, generateDocumentOutline, lookupWordDefinition } from "./services/openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : null;
      if (folderId !== null) {
        const documents = await storage.getDocumentsByFolder(folderId);
        res.json(documents);
      } else {
        const documents = await storage.getAllDocuments();
        res.json(documents);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const documents = await storage.searchDocuments(query);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to search documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid document data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDocumentSchema.partial().parse(req.body);
      
      // Calculate word and character count if content is updated
      if (validatedData.content !== undefined) {
        validatedData.wordCount = validatedData.content.split(/\s+/).filter(word => word.length > 0).length;
        validatedData.characterCount = validatedData.content.length;
      }
      
      const document = await storage.updateDocument(id, validatedData);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid document data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Folder routes
  app.get("/api/folders", async (req, res) => {
    try {
      const folders = await storage.getAllFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const validatedData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(validatedData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid folder data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create folder" });
    }
  });

  app.patch("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFolderSchema.partial().parse(req.body);
      const folder = await storage.updateFolder(id, validatedData);
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid folder data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update folder" });
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFolder(id);
      if (!success) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });

  // AI assistance routes
  app.post("/api/ai/writing-assistance", async (req, res) => {
    try {
      const requestSchema = z.object({
        content: z.string(),
        outline: z.string().optional(),
        context: z.string().optional(),
        pausePosition: z.number(),
      });
      
      const validatedData = requestSchema.parse(req.body);
      const assistance = await generateWritingAssistance(validatedData);
      res.json(assistance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate writing assistance" });
    }
  });

  app.post("/api/ai/generate-outline", async (req, res) => {
    try {
      const requestSchema = z.object({
        title: z.string(),
        description: z.string(),
      });
      
      const { title, description } = requestSchema.parse(req.body);
      const outline = await generateDocumentOutline(title, description);
      res.json({ outline });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate outline" });
    }
  });

  app.post("/api/dictionary/lookup", async (req, res) => {
    try {
      const requestSchema = z.object({
        word: z.string(),
      });
      
      const { word } = requestSchema.parse(req.body);
      const definition = await lookupWordDefinition(word);
      res.json(definition);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to lookup word" });
    }
  });

  // AI suggestion routes
  app.get("/api/ai/suggestions/:documentId", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const suggestions = await storage.getAiSuggestionsByDocument(documentId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI suggestions" });
    }
  });

  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const validatedData = insertAiSuggestionSchema.parse(req.body);
      const suggestion = await storage.createAiSuggestion(validatedData);
      res.status(201).json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid suggestion data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create AI suggestion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
