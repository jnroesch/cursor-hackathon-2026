import { UserSummary } from './user.model';

export enum ProjectRole {
  Owner = 'Owner',
  CoAuthor = 'CoAuthor',
  Editor = 'Editor',
  Contributor = 'Contributor',
  Viewer = 'Viewer'
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  ownerId: string;
  owner: UserSummary;
  memberCount: number;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  coverImageUrl?: string;
  memberCount: number;
  wordCount: number;
  updatedAt: string;
}

export interface ProjectMember {
  userId: string;
  user: UserSummary;
  role: ProjectRole;
  joinedAt: string;
  editCount: number;
  suggestionCount: number;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: ProjectRole | string;
}
