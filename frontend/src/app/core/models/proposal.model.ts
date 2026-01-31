import { UserSummary } from './user.model';

export enum ProposalStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Conflicted = 'Conflicted'
}

export enum VoteType {
  Approve = 'Approve',
  Reject = 'Reject'
}

export interface Proposal {
  id: string;
  documentId: string;
  authorId: string;
  author: UserSummary;
  baseVersion: number;
  status: ProposalStatus;
  operations?: any;
  description?: string;
  approveCount: number;
  rejectCount: number;
  commentCount: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface ProposalSummary {
  id: string;
  author: UserSummary;
  status: ProposalStatus;
  description?: string;
  approveCount: number;
  rejectCount: number;
  createdAt: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  user: UserSummary;
  voteType: VoteType;
  comments: VoteComment[];
  createdAt: string;
  updatedAt: string;
}

export interface VoteComment {
  id: string;
  content: string;
  createdAt: string;
}

export interface VotingSummary {
  proposalId: string;
  totalEligibleVoters: number;
  approveCount: number;
  rejectCount: number;
  pendingCount: number;
  thresholdRequired: number;
  majorityReached: boolean;
  majorityResult?: VoteType;
}

export interface Comment {
  id: string;
  proposalId: string;
  userId: string;
  user: UserSummary;
  content: string;
  createdAt: string;
}

export interface CastVoteRequest {
  vote: VoteType;
  comment?: string;
}

export interface CreateCommentRequest {
  content: string;
}
