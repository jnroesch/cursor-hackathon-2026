import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Proposal, 
  ProposalSummary, 
  ProposalStatus,
  Vote,
  VotingSummary,
  Comment,
  CastVoteRequest,
  CreateCommentRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProposalService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // Proposal operations
  getProposals(documentId: string, status?: ProposalStatus): Observable<ProposalSummary[]> {
    let url = `${this.baseUrl}/documents/${documentId}/proposals`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<ProposalSummary[]>(url);
  }

  getProposal(proposalId: string): Observable<Proposal> {
    return this.http.get<Proposal>(`${this.baseUrl}/proposals/${proposalId}`);
  }

  createProposal(documentId: string, description?: string): Observable<Proposal> {
    return this.http.post<Proposal>(`${this.baseUrl}/documents/${documentId}/proposals`, { 
      documentId,
      description 
    });
  }

  rebaseProposal(proposalId: string): Observable<Proposal> {
    return this.http.post<Proposal>(`${this.baseUrl}/proposals/${proposalId}/rebase`, {});
  }

  // Voting operations
  getVotes(proposalId: string): Observable<Vote[]> {
    return this.http.get<Vote[]>(`${this.baseUrl}/proposals/${proposalId}/votes`);
  }

  castVote(proposalId: string, request: CastVoteRequest): Observable<Vote> {
    return this.http.post<Vote>(`${this.baseUrl}/proposals/${proposalId}/votes`, request);
  }

  getVotingSummary(proposalId: string): Observable<VotingSummary> {
    return this.http.get<VotingSummary>(`${this.baseUrl}/proposals/${proposalId}/votes/summary`);
  }

  // Comment operations
  getComments(proposalId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/proposals/${proposalId}/comments`);
  }

  addComment(proposalId: string, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/proposals/${proposalId}/comments`, request);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/proposals/comments/${commentId}`);
  }
}
