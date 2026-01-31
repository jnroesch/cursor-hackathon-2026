export type DocumentType = 'Manuscript' | 'Notes';

export interface Document {
  id: string;
  projectId: string;
  documentType: DocumentType;
  title: string;
  liveContent?: any; // TipTap JSON content
  version: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSummary {
  id: string;
  documentType: DocumentType;
  title: string;
  version: number;
  wordCount: number;
  updatedAt: string;
}

export interface UserDraft {
  id: string;
  documentId: string;
  userId: string;
  baseVersion: number;
  draftContent?: any; // TipTap JSON content
  lastEditedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  initialContent?: any;
}

export interface SaveDraftRequest {
  content: any;
}
