import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document, DocumentSummary, UserDraft, CreateDocumentRequest, SaveDraftRequest } from '../models';
import { ConsistencyCheckResult } from '../models/proposal.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getProjectDocuments(projectId: string): Observable<DocumentSummary[]> {
    return this.http.get<DocumentSummary[]>(`${this.baseUrl}/projects/${projectId}/documents`);
  }

  getDocument(documentId: string): Observable<Document> {
    return this.http.get<Document>(`${this.baseUrl}/documents/${documentId}`);
  }

  createDocument(projectId: string, request: CreateDocumentRequest): Observable<Document> {
    return this.http.post<Document>(`${this.baseUrl}/projects/${projectId}/documents`, request);
  }

  updateDocument(documentId: string, request: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.baseUrl}/documents/${documentId}`, request);
  }

  deleteDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/documents/${documentId}`);
  }

  getDraft(documentId: string): Observable<UserDraft> {
    return this.http.get<UserDraft>(`${this.baseUrl}/documents/${documentId}/draft`);
  }

  saveDraft(documentId: string, request: SaveDraftRequest): Observable<UserDraft> {
    return this.http.put<UserDraft>(`${this.baseUrl}/documents/${documentId}/draft`, request);
  }

  /**
   * Runs an AI consistency check on the user's draft for the specified document.
   * Analyzes the draft against existing book content and notes to identify inconsistencies.
   */
  checkConsistency(documentId: string): Observable<ConsistencyCheckResult> {
    return this.http.post<ConsistencyCheckResult>(
      `${this.baseUrl}/documents/${documentId}/ai/consistency-check`,
      {}
    );
  }
}
