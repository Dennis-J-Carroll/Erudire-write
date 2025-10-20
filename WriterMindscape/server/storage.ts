import {
  documents,
  folders,
  aiSuggestions,
  type Document,
  type InsertDocument,
  type Folder,
  type InsertFolder,
  type AiSuggestion,
  type InsertAiSuggestion,
} from "@shared/schema";

export interface IStorage {
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentsByFolder(folderId: number | null): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  searchDocuments(query: string): Promise<Document[]>;

  // Folder operations
  getFolder(id: number): Promise<Folder | undefined>;
  getAllFolders(): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, updates: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;

  // AI Suggestion operations
  getAiSuggestion(id: number): Promise<AiSuggestion | undefined>;
  getAiSuggestionsByDocument(documentId: number): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  updateAiSuggestion(id: number, updates: Partial<InsertAiSuggestion>): Promise<AiSuggestion | undefined>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private folders: Map<number, Folder>;
  private aiSuggestions: Map<number, AiSuggestion>;
  private currentDocumentId: number;
  private currentFolderId: number;
  private currentSuggestionId: number;

  constructor() {
    this.documents = new Map();
    this.folders = new Map();
    this.aiSuggestions = new Map();
    this.currentDocumentId = 1;
    this.currentFolderId = 1;
    this.currentSuggestionId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample folder
    const sampleFolder: Folder = {
      id: this.currentFolderId++,
      name: "My Stories",
      color: "#8B5CF6",
      parentId: null,
      createdAt: new Date(),
    };
    this.folders.set(sampleFolder.id, sampleFolder);

    // Create sample document
    const sampleDoc: Document = {
      id: this.currentDocumentId++,
      title: "The Wanderer's Tale",
      content: `The ancient forest whispered secrets that only the wind could understand. Sarah stepped carefully through the undergrowth, her boots crunching softly on the carpet of fallen leaves. Each step forward felt like a journey deeper into a world that existed between reality and dreams.

She had been walking for what felt like hours, though the perpetual twilight of the forest made it impossible to track time. The canopy above was so thick that only scattered beams of golden light managed to pierce through, creating dancing patterns on the forest floor.

Something rustled in the bushes ahead. Sarah froze, her heart pounding in her chest. The sound came again, closer this time. She reached for the pendant around her neck—the one her grandmother had given her before she passed away—and felt its familiar warmth against her palm.

As she stood there, waiting and listening, a peculiar thought crossed her mind. What if the stories her grandmother used to tell weren't just fairy tales after all? What if the magic was real, and she was finally ready to`,
      outline: "Chapter 1: Introduction to Sarah and the mysterious forest. Setting up the magical elements and family history connection.",
      tags: ["fantasy", "adventure", "family", "magic"],
      folderId: sampleFolder.id,
      wordCount: 247,
      characterCount: 1247,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(sampleDoc.id, sampleDoc);
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByFolder(folderId: number | null): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.folderId === folderId);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      content: insertDocument.content || "",
      outline: insertDocument.outline || null,
      tags: insertDocument.tags || null,
      folderId: insertDocument.folderId || null,
      wordCount: insertDocument.wordCount || null,
      characterCount: insertDocument.characterCount || null,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updatedDocument: Document = {
      ...document,
      ...updates,
      updatedAt: new Date(),
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(doc =>
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.content.toLowerCase().includes(lowercaseQuery) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Folder operations
  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async getAllFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values());
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.currentFolderId++;
    const folder: Folder = {
      ...insertFolder,
      id,
      color: insertFolder.color || null,
      parentId: insertFolder.parentId || null,
      createdAt: new Date(),
    };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: number, updates: Partial<InsertFolder>): Promise<Folder | undefined> {
    const folder = this.folders.get(id);
    if (!folder) return undefined;

    const updatedFolder: Folder = {
      ...folder,
      ...updates,
    };
    this.folders.set(id, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(id: number): Promise<boolean> {
    return this.folders.delete(id);
  }

  // AI Suggestion operations
  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    return this.aiSuggestions.get(id);
  }

  async getAiSuggestionsByDocument(documentId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values()).filter(suggestion => suggestion.documentId === documentId);
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.currentSuggestionId++;
    const suggestion: AiSuggestion = {
      id,
      documentId: insertSuggestion.documentId,
      suggestion: insertSuggestion.suggestion,
      context: insertSuggestion.context ?? null,
      position: insertSuggestion.position ?? null,
      accepted: insertSuggestion.accepted ?? null,
      createdAt: new Date(),
    };
    this.aiSuggestions.set(id, suggestion);
    return suggestion;
  }

  async updateAiSuggestion(id: number, updates: Partial<InsertAiSuggestion>): Promise<AiSuggestion | undefined> {
    const suggestion = this.aiSuggestions.get(id);
    if (!suggestion) return undefined;

    const updatedSuggestion: AiSuggestion = {
      ...suggestion,
      ...updates,
    };
    this.aiSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
}

export const storage = new MemStorage();
